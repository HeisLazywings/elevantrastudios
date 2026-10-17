import AdminShell from "@/components/admin/AdminShell";
import EntryEditor from "@/components/admin/EntryEditor";
import { requireAdminPage } from "@/lib/cms/auth";
import { cmsKinds, type CmsKind } from "@/lib/cms/types";

export default async function NewEntryPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { user } = await requireAdminPage("/admin/entries/new");
  const query = await searchParams;
  const kind = cmsKinds.includes(query.kind as CmsKind) ? query.kind as CmsKind : "article";
  return <AdminShell email={user.email}><EntryEditor kind={kind} /></AdminShell>;
}
