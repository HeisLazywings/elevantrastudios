import AdminShell from "@/components/admin/AdminShell";
import MediaLibrary from "@/components/admin/MediaLibrary";
import { requireAdminPage } from "@/lib/cms/auth";

export default async function AdminMediaPage() {
  const { user } = await requireAdminPage("/admin/media");
  return <AdminShell email={user.email}><div className="cms-page-heading"><div><p className="cms-eyebrow">A studio image archive</p><h1 className="cms-title">Media library.</h1><p className="cms-intro">Screenshots, imagery and downloadable resources, connected to the stories they belong to. Draft files remain private.</p></div></div><MediaLibrary /></AdminShell>;
}
