import { requireAdmin } from "@/lib/cms/auth";
import { entryInputSchema } from "@/lib/cms/validation";
import { assertDatabaseSuccess, CmsRequestError, cmsErrorResponse, cmsJson, readJsonBody, requireRevision, requireUuid, revalidateCmsContent } from "@/lib/cms/publishing";
import type { CmsEntry } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const { supabase } = await requireAdmin(request);
    const id = requireUuid((await context.params).id);
    const { data, error } = await supabase.from("cms_entries").select("*").eq("id", id).maybeSingle();
    assertDatabaseSuccess(error);
    if (!data) throw new CmsRequestError(404, "This entry was not found.");
    return cmsJson({ entry: data });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { supabase, user } = await requireAdmin(request);
    const id = requireUuid((await context.params).id);
    const body = await readJsonBody(request);
    const revision = requireRevision(body.expected_updated_at);
    const parsed = entryInputSchema.safeParse(body.entry);
    if (!parsed.success) throw new CmsRequestError(400, parsed.error.issues[0]?.message || "Check the content fields.");
    const { data: previous, error: readError } = await supabase.from("cms_entries").select("*").eq("id", id).maybeSingle();
    assertDatabaseSuccess(readError);
    if (!previous) throw new CmsRequestError(404, "This entry was not found.");
    const { data, error } = await supabase.from("cms_entries").update({
      ...parsed.data,
      updated_by: user.id,
    }).eq("id", id).eq("updated_at", revision).select("*").maybeSingle();
    assertDatabaseSuccess(error);
    if (!data) throw new CmsRequestError(409, "This entry changed in another session. Copy your edits, reload the latest version, and try again.");
    revalidateCmsContent(previous as CmsEntry, data as CmsEntry);
    return cmsJson({ entry: data });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { supabase } = await requireAdmin(request);
    const id = requireUuid((await context.params).id);
    const body = await readJsonBody(request, 2_000);
    const revision = requireRevision(body.expected_updated_at);
    const { data: previous, error: readError } = await supabase.from("cms_entries").select("*").eq("id", id).maybeSingle();
    assertDatabaseSuccess(readError);
    if (!previous) throw new CmsRequestError(404, "This entry was not found.");
    // Require explicit media removal first: Storage objects cannot join a SQL cascade.
    const { count, error: mediaError } = await supabase.from("cms_media").select("id", { count: "exact", head: true }).eq("entry_id", id);
    assertDatabaseSuccess(mediaError);
    if (count) throw new CmsRequestError(409, "Remove this entry's media from the media library before deleting it. First remove and save any cover, body, logo or download references.");
    const { data, error } = await supabase.from("cms_entries").delete().eq("id", id).eq("updated_at", revision).select("id").maybeSingle();
    assertDatabaseSuccess(error);
    if (!data) throw new CmsRequestError(409, "This entry changed in another session. Reload it before deleting.");
    revalidateCmsContent(previous as CmsEntry);
    return cmsJson({ success: true });
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
