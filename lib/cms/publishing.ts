import "server-only";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { adminErrorResponse } from "@/lib/cms/auth";
import type { CmsEntry } from "@/lib/cms/types";

export const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export class CmsRequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "CmsRequestError";
  }
}

export function cmsJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: privateHeaders });
}

export function cmsErrorResponse(error: unknown) {
  if (error instanceof CmsRequestError) return cmsJson({ error: error.message }, error.status);
  return adminErrorResponse(error);
}

/** Never return database messages, which can contain private content or SQL details. */
export function assertDatabaseSuccess(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new CmsRequestError(409, "That slug is already in use for this content type. Choose a unique slug.");
  if (error.code === "23503") throw new CmsRequestError(409, "This media is referenced by content, or the selected media is no longer available. Save the content without that reference before deleting media.");
  if (["23514", "22023", "22P02"].includes(error.code || "")) throw new CmsRequestError(400, "Check the content and media references. Media must belong to this entry, and published client work requires permission.");
  if (error.code === "42501") throw new CmsRequestError(403, "This operation is not authorised for your account.");
  throw new CmsRequestError(503, "Content storage is temporarily unavailable. Please try again.");
}

export function requireUuid(value: string | null | undefined): string {
  if (!value || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new CmsRequestError(400, "A valid content or media ID is required.");
  }
  return value.toLowerCase();
}

export function requireRevision(value: unknown): string {
  if (typeof value !== "string" || value.length > 40 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new CmsRequestError(400, "The saved revision is required. Reload this entry before saving.");
  }
  return value;
}

/** Bound streamed bodies as well as Content-Length; chunked uploads get the same limit. */
export async function readLimitedBody(request: Request, maxBytes: number): Promise<Uint8Array<ArrayBuffer>> {
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) {
    throw new CmsRequestError(413, "This request is too large.");
  }
  if (!request.body) throw new CmsRequestError(400, "A request body is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new CmsRequestError(413, "This request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function readJsonBody(request: Request, maxBytes = 1_000_000): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new CmsRequestError(415, "Send the content as JSON.");
  }
  const bytes = await readLimitedBody(request, maxBytes);
  try {
    const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new CmsRequestError(400, "Send a valid JSON object.");
  }
}

const prefixes = { article: "/insights", "case-study": "/work", resource: "/resources", client: "/clients" } as const;

/** Public reads are uncached; invalidation also refreshes previously generated routes. */
export function revalidateCmsContent(...entries: Pick<CmsEntry, "kind" | "slug">[]) {
  for (const path of ["/", "/insights", "/work", "/resources", "/clients", "/sitemap.xml"]) revalidatePath(path);
  for (const entry of entries) revalidatePath(`${prefixes[entry.kind]}/${entry.slug}`);
}
