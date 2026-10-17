"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowUpRight, Download, Plus } from "lucide-react";
import type { CmsEntry, EntryInput } from "@/lib/cms/types";
import { apiResult, dateLabel, entryUrl, kindLabels } from "./model";

export default function Dashboard({ entries }: { entries: CmsEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newKind, setNewKind] = useState<EntryInput["kind"]>("article");
  const filtered = useMemo(() => entries.filter((entry) => (kind === "all" || kind === entry.kind) && (status === "all" || status === entry.status) && `${entry.title} ${entry.slug} ${entry.category}`.toLowerCase().includes(query.toLowerCase())), [entries, query, kind, status]);

  async function importDrafts() {
    if (!window.confirm("Import the curated website content as private drafts? Existing entries will be preserved. Nothing will be published.")) return;
    setImporting(true); setError(""); setNotice("");
    try {
      await apiResult(await fetch("/api/admin/import", { method: "POST" }));
      setNotice("Website content imported as private drafts. Review each entry before publishing.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Import failed."); }
    finally { setImporting(false); }
  }

  return (
    <>
      <div className="cms-page-heading">
        <div><p className="cms-eyebrow">The studio, in your words</p><h1 className="cms-title">Content desk.</h1><p className="cms-intro">Shape the work, ideas and resources your visitors see. Drafts stay private until you choose to publish.</p></div>
        <div className="cms-actions">
          <label className="sr-only" htmlFor="new-content-kind">New content type</label>
          <select id="new-content-kind" className="cms-input" style={{ width: "auto" }} value={newKind} onChange={(event) => setNewKind(event.target.value as EntryInput["kind"])}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <Link className="cms-button" href={`/admin/entries/new?kind=${newKind}`}><Plus size={15} aria-hidden="true" /> New {kindLabels[newKind].toLowerCase()}</Link>
        </div>
      </div>
      <div className="cms-counts" aria-label="Content overview">
        <div className="cms-count"><strong>{entries.length}</strong><span>Total entries</span></div>
        <div className="cms-count"><strong>{entries.filter((entry) => entry.status === "published").length}</strong><span>Published</span></div>
        <div className="cms-count"><strong>{entries.filter((entry) => entry.status === "draft").length}</strong><span>Private drafts</span></div>
        <div className="cms-count"><strong>{entries.filter((entry) => entry.featured && entry.status === "published").length}</strong><span>Featured & published</span></div>
      </div>
      {error && <p role="alert" className="cms-alert">{error}</p>}
      {notice && <p role="status" className="cms-status">{notice}</p>}
      <div className="cms-filters">
        <label className="cms-field"><span className="cms-label">Find an entry</span><input type="search" className="cms-input" placeholder="Search by title, slug or category…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="cms-field"><span className="cms-label">Content type</span><select className="cms-input" value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">All types</option>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}s</option>)}</select></label>
        <label className="cms-field"><span className="cms-label">Publication</span><select className="cms-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="draft">Private drafts</option><option value="published">Published</option></select></label>
      </div>
      {filtered.length ? <div className="cms-table-wrap"><table className="cms-table"><caption className="sr-only">{filtered.length} content entries</caption><thead><tr><th scope="col">Entry</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((entry) => <tr key={entry.id}><td><Link className="cms-entry-title" href={`/admin/entries/${entry.id}`}>{entry.title}</Link><p className="cms-slug">{entryUrl(entry)}</p></td><td>{kindLabels[entry.kind]}</td><td><span className={`cms-badge cms-badge-${entry.status}`}>{entry.status === "published" ? "Published" : "Private draft"}</span></td><td className="cms-note">{dateLabel(entry.updated_at)}</td><td><Link className="cms-button cms-button-secondary cms-button-small" href={`/admin/entries/${entry.id}`}>Edit <ArrowUpRight size={13} aria-hidden="true" /></Link></td></tr>)}</tbody></table></div>
        : <div className="cms-empty"><h2>{entries.length ? "No entries match." : "A considered place to begin."}</h2><p className="cms-note">{entries.length ? "Try a different search or clear your filters." : "Start a fresh entry, or bring the existing website content into the desk as private drafts."}</p></div>}
      <div className="cms-panel cms-import"><div><h2 className="cms-panel-title">Bring your existing content.</h2><p className="cms-note" style={{ marginTop: 10 }}>Import the approved local editorial and concept demonstration as drafts. Review the copy, images and publication permissions before publishing each entry. Existing entries are preserved.</p></div><button type="button" className="cms-button cms-button-secondary" onClick={importDrafts} disabled={importing}><Download size={15} aria-hidden="true" />{importing ? "Importing…" : "Import website drafts"}</button></div>
    </>
  );
}
