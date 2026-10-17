import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EntryEditor from "@/components/admin/EntryEditor";
import { requireAdminPage } from "@/lib/cms/auth";
import type { CmsEntry } from "@/lib/cms/types";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireAdminPage(`/admin/entries/${encodeURIComponent(id)}`);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { data, error } = await supabase.from("cms_entries").select("*").eq("id", id).maybeSingle();
  if (error) return <AdminShell email={user.email}><p className="cms-alert" role="alert">This entry could not be loaded. Please return to the content desk and try again.</p></AdminShell>;
  if (!data) notFound();
  return <AdminShell email={user.email}><EntryEditor initialEntry={data as CmsEntry} /></AdminShell>;
}
