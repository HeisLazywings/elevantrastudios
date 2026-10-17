import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/cms/auth";
import { entryInputSchema } from "@/lib/cms/validation";
import { assertDatabaseSuccess, CmsRequestError, cmsErrorResponse, cmsJson, readJsonBody, revalidateCmsContent } from "@/lib/cms/publishing";
import { cmsKinds, type CmsEntry } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const params = new URL(request.url).searchParams;
    const kind = params.get("kind");
    const status = params.get("status");
    if (kind && !cmsKinds.includes(kind as typeof cmsKinds[number])) throw new CmsRequestError(400, "Choose a valid content type.");
    if (status && !["draft", "published"].includes(status)) throw new CmsRequestError(400, "Choose a valid publication status.");
    // Read in bounded pages to avoid PostgREST's default row cap silently hiding entries.
    const entries: CmsEntry[] = [];
    const batchSize = 100;
    let offset = 0;
    while (true) {
      let query = supabase.from("cms_entries").select("*").order("updated_at", { ascending: false }).order("id").range(offset, offset + batchSize - 1);
      if (kind) query = query.eq("kind", kind);
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      assertDatabaseSuccess(error);
      entries.push(...(data || []) as CmsEntry[]);
      if (!data || data.length < batchSize) break;
      offset += batchSize;
      // Keep a misconfigured or exceptionally large content library from exhausting memory.
      if (offset >= 10_000) throw new CmsRequestError(413, "Narrow the library by content type or publication status.");
    }
    return cmsJson({ entries });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdmin(request);
    const body = await readJsonBody(request);
    const parsed = entryInputSchema.safeParse(body);
    if (!parsed.success) throw new CmsRequestError(400, parsed.error.issues[0]?.message || "Check the content fields.");
    const { data, error } = await supabase.from("cms_entries").insert({
      ...parsed.data,
      id: randomUUID(),
      created_by: user.id,
      updated_by: user.id,
    }).select("*").single();
    assertDatabaseSuccess(error);
    if (!data) throw new CmsRequestError(503, "The entry could not be saved. Please try again.");
    revalidateCmsContent(data as CmsEntry);
    return cmsJson({ entry: data }, 201);
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
