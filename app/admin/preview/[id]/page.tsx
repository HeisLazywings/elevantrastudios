import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import CmsBody from "@/components/CmsBody";
import AdminShell from "@/components/admin/AdminShell";
import { entryUrl, kindLabels } from "@/components/admin/model";
import { requireAdminPage } from "@/lib/cms/auth";
import type { CmsEntry } from "@/lib/cms/types";

export default async function AdminPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireAdminPage(`/admin/preview/${encodeURIComponent(id)}`);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { data, error } = await supabase.from("cms_entries").select("*").eq("id", id).maybeSingle();
  if (error) return <AdminShell email={user.email}><p className="cms-alert" role="alert">Preview could not be loaded. Please return to the content desk and try again.</p></AdminShell>;
  if (!data) notFound();
  const entry = data as CmsEntry;
  const cover = entry.cover_media_id ? await supabase.from("cms_media").select("alt").eq("id", entry.cover_media_id).maybeSingle() : null;
  return <AdminShell email={user.email}>
    <div className="cms-actions" style={{ justifyContent: "space-between", marginBottom: 25 }}><Link href={`/admin/entries/${entry.id}`} className="cms-back-link"><ArrowLeft size={14} aria-hidden="true" /> Back to editor</Link><span className={`cms-badge cms-badge-${entry.status}`}>{entry.status === "draft" ? "Private draft" : "Published entry"}</span></div>
    <p className="cms-privacy" style={{ marginBottom: 40 }}>Private editorial preview. Only approved administrators can access this URL. This view shows the last saved content. Save changes in the editor to refresh it.</p>
    <article className="cms-preview">
      <header><p className="cms-eyebrow">{entry.category || kindLabels[entry.kind]}{entry.kind === "case-study" ? ` / ${entry.details.designation}` : ""}</p><h1>{entry.title}</h1>{entry.kind === "article" && entry.details.deck && <p className="cms-preview-summary">{entry.details.deck}</p>}{entry.kind === "case-study" && entry.details.headline && <p className="cms-preview-summary">{entry.details.headline}</p>}<p className="cms-preview-summary">{entry.summary}</p></header>
      {entry.cover_media_id && <img src={`/api/media/${entry.cover_media_id}`} alt={cover?.data?.alt || ""} width={1200} height={750} className="mb-12 h-auto w-full border border-white/10" />}
      {entry.kind === "case-study" && <><dl className="grid gap-6 border-y border-white/10 py-6 sm:grid-cols-2"><div><dt className="cms-eyebrow">Focus</dt><dd className="cms-note mt-3">{entry.details.focus.join(" / ")}</dd></div><div><dt className="cms-eyebrow">Project status</dt><dd className="cms-note mt-3">{entry.details.projectStatus}</dd></div></dl><p className="cms-note my-6">{entry.details.statusDetail}</p>{entry.details.sections?.map((section) => <section key={section.id} className="cms-prose border-t border-white/10 pb-10 pt-6"><p className="cms-eyebrow">{section.label}</p><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{Boolean(section.points?.length) && <ul>{section.points?.map((point, index) => <li key={index}>{point}</li>)}</ul>}</section>)}</>}
      <div className="cms-prose"><CmsBody document={entry.body} /></div>
      {entry.kind === "article" && entry.details.pullQuote && <blockquote className="mt-10 border-l-2 border-gold/40 pl-6 font-display text-3xl leading-relaxed text-gold-light">{entry.details.pullQuote}</blockquote>}
      {entry.kind === "article" && entry.details.takeaway && <aside className="cms-panel mt-10"><p className="cms-eyebrow">A practical takeaway</p><p className="cms-note mt-4">{entry.details.takeaway}</p></aside>}
      {entry.kind === "client" && <div className="cms-panel mt-10"><h2 className="cms-panel-title">Engagement</h2><p className="cms-note mt-4">{entry.details.engagementSummary}</p><p className="cms-note mt-4">Publication permission: {entry.publication_approved ? "Confirmed by an administrator" : "Not confirmed — keep private"}</p></div>}
      {entry.kind === "resource" && (entry.details.downloadMediaId || entry.details.externalUrl) && <div className="cms-actions mt-10">{entry.details.downloadMediaId && <a href={`/api/media/${entry.details.downloadMediaId}`} className="cms-button cms-button-secondary" target="_blank" rel="noopener noreferrer">Preview download <ArrowUpRight size={14} aria-hidden="true" /></a>}{entry.details.externalUrl && <a href={entry.details.externalUrl} className="cms-button cms-button-secondary" target="_blank" rel="noopener noreferrer">External resource <ArrowUpRight size={14} aria-hidden="true" /></a>}</div>}
      <footer className="cms-panel-section"><p className="cms-note">Proposed public URL: {entryUrl(entry)}</p><p className="cms-note">SEO title: {entry.seo_title || entry.title}</p><p className="cms-note">SEO description: {entry.seo_description || entry.summary}</p></footer>
    </article>
  </AdminShell>;
}
