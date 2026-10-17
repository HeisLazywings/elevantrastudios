import { requireAdmin } from "@/lib/cms/auth";
import { importInitialDrafts } from "@/lib/cms/seed";
import { cmsErrorResponse, cmsJson, revalidateCmsContent } from "@/lib/cms/publishing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    // Import is explicitly invoked, idempotent, and always creates private drafts.
    const result = await importInitialDrafts(supabase);
    revalidateCmsContent();
    return cmsJson(result);
  } catch (error) {
    return cmsErrorResponse(error);
  }
}
