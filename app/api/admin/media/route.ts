import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/cms/auth";
import { CMS_MAX_UPLOAD_BYTES, CMS_MEDIA_BUCKET, type CmsEntry, type CmsMedia } from "@/lib/cms/types";
import { assertDatabaseSuccess, CmsRequestError, cmsErrorResponse, cmsJson, readLimitedBody, requireUuid, revalidateCmsContent } from "@/lib/cms/publishing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Format = { mime: CmsMedia["mime_type"]; extension: string; extensions: string[] };

function detectFormat(bytes: Uint8Array): Format | null {
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (starts(0xff, 0xd8, 0xff)) return { mime: "image/jpeg", extension: "jpg", extensions: ["jpg", "jpeg"] };
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { mime: "image/png", extension: "png", extensions: ["png"] };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", extension: "webp", extensions: ["webp"] };
  if (["GIF87a", "GIF89a"].includes(ascii(0, 6))) return { mime: "image/gif", extension: "gif", extensions: ["gif"] };
  if (ascii(0, 5) === "%PDF-") return { mime: "application/pdf", extension: "pdf", extensions: ["pdf"] };
  return null;
}

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const entryParam = new URL(request.url).searchParams.get("entry_id");
    const entryId = entryParam === null ? null : requireUuid(entryParam);
    const media: CmsMedia[] = [];
    for (let offset = 0; ; offset += 100) {
      let query = supabase.from("cms_media").select("*").order("created_at", { ascending: false }).order("id").range(offset, offset + 99);
      if (entryId) query = query.eq("entry_id", entryId);
      const { data, error } = await query;
      assertDatabaseSuccess(error);
      media.push(...(data || []) as CmsMedia[]);
      if (!data || data.length < 100) break;
      if (offset >= 9_900) throw new CmsRequestError(413, "Open a single entry to browse its media.");
    }
    return cmsJson({ media });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdmin(request);
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data;")) throw new CmsRequestError(415, "Upload a file using multipart form data.");
    const bytes = await readLimitedBody(request, CMS_MAX_UPLOAD_BYTES + 64 * 1024);
    let form: FormData;
    try {
      form = await new Response(bytes, { headers: { "Content-Type": contentType } }).formData();
    } catch {
      throw new CmsRequestError(400, "This upload could not be read. Choose the file again.");
    }
    const entryId = requireUuid(typeof form.get("entry_id") === "string" ? form.get("entry_id") as string : null);
    const file = form.get("file");
    const altValue = form.get("alt");
    const alt = typeof altValue === "string" ? altValue.trim() : "";
    if (!(file instanceof File) || !file.size) throw new CmsRequestError(400, "Choose a file to upload.");
    if (file.size > CMS_MAX_UPLOAD_BYTES) throw new CmsRequestError(413, "Files must be 4 MiB or smaller.");
    if (alt.length > 500) throw new CmsRequestError(400, "Alternative text must be 500 characters or fewer.");
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const format = detectFormat(fileBytes);
    const filename = (file.name.split(/[\\/]/).pop() || "upload").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200);
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    if (!format || !format.extensions.includes(extension) || file.type.toLowerCase() !== format.mime) {
      throw new CmsRequestError(415, "Upload a genuine JPEG, PNG, WebP, GIF or PDF with its matching filename and file type. SVG and HTML files are not supported.");
    }
    const { data: entry, error: entryError } = await supabase.from("cms_entries").select("id,kind,slug").eq("id", entryId).maybeSingle();
    assertDatabaseSuccess(entryError);
    if (!entry) throw new CmsRequestError(404, "Save an entry before uploading its media.");
    const id = randomUUID();
    const storagePath = `${entryId}/${id}.${format.extension}`;
    // Storage INSERT policy requires this owned metadata row to exist first.
    const { data: media, error: metadataError } = await supabase.from("cms_media").insert({
      id,
      entry_id: entryId,
      storage_path: storagePath,
      filename,
      mime_type: format.mime,
      size_bytes: file.size,
      alt,
      created_by: user.id,
    }).select("*").single();
    assertDatabaseSuccess(metadataError);
    if (!media) throw new CmsRequestError(503, "The file metadata could not be saved.");
    const { error: uploadError } = await supabase.storage.from(CMS_MEDIA_BUCKET).upload(storagePath, fileBytes, {
      contentType: format.mime,
      cacheControl: "0",
      upsert: false,
    });
    if (uploadError) {
      // Remove metadata before any object: a concurrent editor may have referenced it.
      const { error: cleanupError } = await supabase.from("cms_media").delete().eq("id", id);
      if (!cleanupError) await supabase.storage.from(CMS_MEDIA_BUCKET).remove([storagePath]);
      throw new CmsRequestError(503, "The file could not be uploaded. Refresh the media library and try again.");
    }
    revalidateCmsContent(entry as CmsEntry);
    return cmsJson({ media }, 201);
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
