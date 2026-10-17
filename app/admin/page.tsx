import AdminShell from "@/components/admin/AdminShell";
import Dashboard from "@/components/admin/Dashboard";
import { requireAdminPage } from "@/lib/cms/auth";
import type { CmsEntry } from "@/lib/cms/types";

export default async function AdminPage() {
  const { supabase, user } = await requireAdminPage("/admin");
  const { data, error } = await supabase.from("cms_entries").select("*").order("updated_at", { ascending: false });
  return <AdminShell email={user.email}>
    {process.env.CMS_CONTENT_ENABLED !== "true" && <p className="cms-alert">The public website is still using its original local content. After importing and reviewing your drafts, enable CMS_CONTENT_ENABLED in the hosting settings to activate live publishing. See the CMS setup guide.</p>}
    {error ? <><h1 className="cms-title">Content desk.</h1><p className="cms-alert" role="alert">Content could not be loaded. Check that the CMS database migration has been applied and try again.</p></> : <Dashboard entries={(data || []) as CmsEntry[]} />}
  </AdminShell>;
}
