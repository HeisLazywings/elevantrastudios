import { requireAdmin } from "@/lib/cms/auth";
import { CMS_MEDIA_BUCKET, type CmsEntry, type CmsMedia } from "@/lib/cms/types";
import { assertDatabaseSuccess, CmsRequestError, cmsErrorResponse, cmsJson, readJsonBody, requireUuid, revalidateCmsContent } from "@/lib/cms/publishing";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { supabase } = await requireAdmin(request);
    const id = requireUuid((await context.params).id);
    const body = await readJsonBody(request, 4_000);
    if (typeof body.alt !== "string" || body.alt.trim().length > 500) throw new CmsRequestError(400, "Alternative text must be 500 characters or fewer.");
    const { data, error } = await supabase.from("cms_media").update({ alt: body.alt.trim() }).eq("id", id).select("*").maybeSingle();
    assertDatabaseSuccess(error);
    if (!data) throw new CmsRequestError(404, "This media was not found.");
    const { data: entry, error: entryError } = await supabase.from("cms_entries").select("kind,slug").eq("id", data.entry_id).maybeSingle();
    assertDatabaseSuccess(entryError);
    if (entry) revalidateCmsContent(entry as CmsEntry);
    return cmsJson({ media: data });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { supabase, user } = await requireAdmin(request);
    const id = requireUuid((await context.params).id);
    const { data: media, error: readError } = await supabase.from("cms_media").select("*").eq("id", id).maybeSingle();
    assertDatabaseSuccess(readError);
    if (!media) throw new CmsRequestError(404, "This media was not found.");
    const { data: entry, error: entryError } = await supabase.from("cms_entries").select("kind,slug").eq("id", media.entry_id).maybeSingle();
    assertDatabaseSuccess(entryError);
    // The database serializes this with edits and rejects any cover/body/download/logo references.
    // Delete metadata first so a racing edit cannot reference an object being removed.
    const { data: removed, error: deleteError } = await supabase.from("cms_media").delete().eq("id", id).select("id").maybeSingle();
    assertDatabaseSuccess(deleteError);
    if (!removed) throw new CmsRequestError(409, "This media changed in another session. Refresh the library.");
    const { error: storageError } = await supabase.storage.from(CMS_MEDIA_BUCKET).remove([media.storage_path]);
    if (storageError) {
      // Preserve a retryable library record when possible. An untracked object is private
      // because anonymous Storage reads always require a live published metadata row.
      const restore = { ...(media as CmsMedia), created_by: user.id };
      const { error: restoreError } = await supabase.from("cms_media").insert(restore);
      if (entry) revalidateCmsContent(entry as CmsEntry);
      throw new CmsRequestError(503, restoreError
        ? "The library record was removed, but its private file needs cleanup in Supabase Storage. No public download is available."
        : "The file could not be removed from storage. Its library record was restored; refresh and try deleting it again.");
    }
    if (entry) revalidateCmsContent(entry as CmsEntry);
    return cmsJson({ success: true });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
