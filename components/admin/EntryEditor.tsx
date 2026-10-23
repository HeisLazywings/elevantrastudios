"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, Check, Eye, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import type { CaseStudySection, CmsEntry, EntryInput } from "@/lib/cms/types";
import { caseStudyChapterGuides, evidenceChapterIds, newCaseStudyChapter } from "@/lib/cms/case-study-guides";
import MediaLibrary, { type MediaItem } from "./MediaLibrary";
import RichTextEditor from "./RichTextEditor";
import { apiResult, dateLabel, emptyEntry, entryUrl, inputFromEntry, kindLabels, slugify } from "./model";

type MediaTarget = "body" | "cover" | "download" | "logo" | "library";

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return <label className="cms-field"><span className="cms-label">{label}</span>{children}{help && <span className="cms-field-help">{help}</span>}</label>;
}

function CaseSections({ sections, onChange }: { sections: CaseStudySection[]; onChange: (sections: CaseStudySection[]) => void }) {
  function change(index: number, update: Partial<CaseStudySection>) {
    onChange(sections.map((section, current) => current === index ? { ...section, ...update } : section));
  }

  function addSection() {
    if (sections.length >= 20) return;
    const nextGuide = caseStudyChapterGuides.find((guide) => !sections.some((section) => section.id === guide.id));
    const fallbackId = `section-${sections.length + 1}`;
    const id = nextGuide?.id || fallbackId;
    if (sections.some((section) => section.id === id)) return;
    onChange([...sections, newCaseStudyChapter(id)]);
  }

  function addEvidenceChapters() {
    const missing = evidenceChapterIds.filter((id) => !sections.some((section) => section.id === id));
    if (!missing.length || sections.length + missing.length > 20) return;
    onChange([...sections, ...missing.map(newCaseStudyChapter)]);
  }

  const missingEvidence = evidenceChapterIds.filter((id) => !sections.some((section) => section.id === id));

  return (
    <div className="cms-panel-section">
      <h3 className="cms-panel-title">Case-study chapters</h3>
      <p className="cms-note" style={{ marginTop: 8, marginBottom: 20 }}>
        Record decisions, evidence and limits alongside the work. These prompts do not
        insert results or client information. Keep unapproved details private.
      </p>
      {sections.map((section, index) => {
        const guidance = caseStudyChapterGuides.find((guide) => guide.id === section.id)?.prompt;
        return (
          <div key={section.id} className="cms-panel" style={{ marginBottom: 16 }}>
            <div className="cms-actions" style={{ justifyContent: "space-between", marginBottom: 20 }}>
              <span className="cms-eyebrow">Chapter {String(index + 1).padStart(2, "0")}</span>
              <div className="cms-actions">
                <button type="button" className="cms-button cms-button-secondary cms-button-small" disabled={index === 0} onClick={() => {
                  const next = [...sections];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onChange(next);
                }} aria-label={`Move chapter ${index + 1} up`}>Move up</button>
                <button type="button" className="cms-button cms-button-danger cms-button-small" onClick={() => onChange(sections.filter((_, current) => index !== current))}>Remove</button>
              </div>
            </div>
            {guidance && <p className="cms-note" style={{ marginBottom: 18 }}>{guidance}</p>}
            <div className="cms-field-row">
              <Field label="Navigation label"><input className="cms-input" maxLength={100} value={section.label} onChange={(event) => change(index, { label: event.target.value })} /></Field>
              <Field label="Section anchor" help="Unique lowercase words separated by hyphens."><input className="cms-input" maxLength={100} value={section.id} onChange={(event) => change(index, { id: event.target.value })} /></Field>
            </div>
            <Field label="Chapter heading"><input className="cms-input" maxLength={300} value={section.title} onChange={(event) => change(index, { title: event.target.value })} /></Field>
            <Field label="Paragraphs" help="Separate paragraphs with a blank line."><textarea className="cms-input" rows={5} value={section.paragraphs.join("\n\n")} onChange={(event) => change(index, { paragraphs: event.target.value.split(/\n\s*\n/).filter(Boolean) })} /></Field>
            <Field label="Supporting points (optional)" help="One point per line."><textarea className="cms-input" rows={3} value={(section.points || []).join("\n")} onChange={(event) => change(index, { points: event.target.value.split("\n").filter(Boolean) })} /></Field>
          </div>
        );
      })}
      <div className="cms-actions">
        <button type="button" className="cms-button cms-button-secondary" onClick={addSection} disabled={sections.length >= 20}>
          <Plus size={15} aria-hidden="true" /> Add guided chapter
        </button>
        <button type="button" className="cms-button cms-button-secondary" onClick={addEvidenceChapters} disabled={!missingEvidence.length || sections.length + missingEvidence.length > 20}>
          <Plus size={15} aria-hidden="true" /> Add missing evidence chapters
        </button>
      </div>
      <p className="cms-field-help">Fill in a heading for every chapter you add before saving. No database migration is required.</p>
    </div>
  );
}

export default function EntryEditor({ initialEntry, kind = "article" }: { initialEntry?: CmsEntry; kind?: EntryInput["kind"] }) {
  const router = useRouter();
  const [record, setRecord] = useState(initialEntry);
  const [entry, setEntry] = useState<EntryInput>(() => initialEntry ? inputFromEntry(initialEntry) : emptyEntry(kind));
  const [saved, setSaved] = useState(() => JSON.stringify(initialEntry ? inputFromEntry(initialEntry) : emptyEntry(kind)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);
  const [insertImage, setInsertImage] = useState<{ id: string; alt: string; nonce: number }>();
  const [slugManual, setSlugManual] = useState(Boolean(initialEntry));
  const [tagsText, setTagsText] = useState(initialEntry?.tags.join(", ") || "");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalTriggerRef = useRef<HTMLElement | null>(null);
  const dirty = JSON.stringify(entry) !== saved;
  const requiresApproval = entry.kind === "client" || (entry.kind === "case-study" && entry.details.designation === "Client engagement");

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) { if (dirty) { event.preventDefault(); event.returnValue = ""; } }
    function beforeNavigation(event: MouseEvent) {
      if (!dirty || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const next = new URL(link.href, window.location.href);
      if (next.origin === window.location.origin && next.pathname === window.location.pathname && next.search === window.location.search) return;
      if (!window.confirm("Leave this entry? Unsaved changes will be lost.")) { event.preventDefault(); event.stopPropagation(); }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeNavigation, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", beforeNavigation, true); };
  }, [dirty]);

  useEffect(() => {
    if (!mediaTarget) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalTriggerRef.current = document.activeElement as HTMLElement;
    modalRef.current?.querySelector<HTMLElement>("button")?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setMediaTarget(null); }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]'));
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keydown); modalTriggerRef.current?.focus(); };
  }, [mediaTarget]);

  function update(field: string, value: unknown) { setEntry((current) => ({ ...current, [field]: value } as EntryInput)); }
  function detail(field: string, value: unknown) { setEntry((current) => ({ ...current, details: { ...current.details, [field]: value } } as EntryInput)); }

  function requestMedia(target: MediaTarget) {
    if (!record) { setError("Save this entry as a private draft first. You can then upload and select its media."); return; }
    setError("");
    setMediaTarget(target);
  }

  function selectMedia(media: MediaItem) {
    if ((mediaTarget === "cover" || mediaTarget === "body" || mediaTarget === "logo") && !media.mime_type.startsWith("image/")) { setError("Choose an image for this field. PDF files can be attached as resource downloads."); return; }
    if (mediaTarget === "body") setInsertImage({ id: media.id, alt: media.alt || "", nonce: Date.now() });
    if (mediaTarget === "cover") update("cover_media_id", media.id);
    if (mediaTarget === "download") detail("downloadMediaId", media.id);
    if (mediaTarget === "logo") detail("logoMediaId", media.id);
    setMediaTarget(null); setError("");
  }

  async function save(status: EntryInput["status"]) {
    if (busy) return;
    setError(""); setNotice("");
    if (!entry.title.trim() || !entry.slug.trim()) { setError("Add a title and a URL slug before saving."); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) { setError("Use lowercase words separated by hyphens for the URL slug."); return; }
    if (status === "published" && requiresApproval && !entry.publication_approved) { setError("Confirm publication permission for this client name, project details and assets before publishing."); return; }
    if (status === "published" && record?.status !== "published" && !window.confirm("Publish this entry? Its text and attached media will be visible to public visitors.")) return;
    setBusy(true);
    const payload = { ...entry, status } as EntryInput;
    try {
      const response = await fetch(record ? `/api/admin/entries/${record.id}` : "/api/admin/entries", { method: record ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record ? { entry: payload, expected_updated_at: record.updated_at } : payload) });
      const data = await apiResult<{ entry: CmsEntry }>(response);
      const input = inputFromEntry(data.entry);
      setRecord(data.entry); setEntry(input); setSaved(JSON.stringify(input)); setTagsText(input.tags.join(", "));
      setNotice(status === "published" ? "Published changes are saved and the public website cache has been refreshed." : "Private draft saved. It is visible only to approved administrators.");
      if (!record) { window.history.replaceState(null, "", `/admin/entries/${data.entry.id}`); router.refresh(); }
      else router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save the entry."); }
    finally { setBusy(false); }
  }

  async function deleteEntry() {
    if (!record || busy) return;
    setBusy(true); setError("");
    try {
      await apiResult(await fetch(`/api/admin/entries/${record.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expected_updated_at: record.updated_at }) }));
      setSaved(JSON.stringify(entry)); router.push("/admin"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not delete the entry."); setBusy(false); }
  }

  return <>
    <Link href="/admin" className="cms-back-link"><ArrowLeft size={14} aria-hidden="true" /> Content desk</Link>
    <div className="cms-page-heading">
      <div><p className="cms-eyebrow">{record ? "Refine & review" : "A new studio story"}</p><h1 className="cms-title">{record ? "Edit" : "New"} {kindLabels[entry.kind].toLowerCase()}.</h1><p className="cms-intro">{record ? `Last saved ${dateLabel(record.updated_at)}. ` : "Start privately, refine thoughtfully, publish when ready. "}{dirty ? "You have unsaved changes." : record ? "All changes saved." : ""}</p></div>
      <div className="cms-actions">
        {record && <Link href={`/admin/preview/${record.id}`} target="_blank" rel="noopener noreferrer" className="cms-button cms-button-secondary"><Eye size={15} aria-hidden="true" /> Preview saved entry<span className="sr-only"> (opens in a new tab)</span></Link>}
        <button type="button" className="cms-button" onClick={() => save(entry.status)} disabled={busy}><Save size={15} aria-hidden="true" />{busy ? "Saving…" : entry.status === "published" ? "Save changes" : "Save draft"}</button>
      </div>
    </div>
    {error && <p role="alert" className="cms-alert">{error}</p>}
    {notice && <p role="status" className="cms-status">{notice}</p>}
    <div className="cms-editor-grid">
      <div className="cms-editor-stack">
        <section className="cms-panel" aria-labelledby="entry-content-heading">
          <h2 id="entry-content-heading" className="cms-details-title">The story</h2>
          <Field label="Title" help="A clear, specific title. Used as the page heading and default SEO title."><input className="cms-input cms-title-input" maxLength={300} value={entry.title} placeholder={entry.kind === "article" ? "An idea worth sharing…" : "Project or resource title…"} onChange={(event) => { const title = event.target.value; setEntry((current) => ({ ...current, title, ...(!slugManual ? { slug: slugify(title).slice(0, 120) } : {}) })); }} required /></Field>
          <Field label="URL slug" help={`Public path when published: ${entryUrl(entry) || "Add a slug"}`}><input className="cms-input" maxLength={120} value={entry.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(event) => { setSlugManual(true); update("slug", event.target.value); }} required /></Field>
          <Field label="Summary" help="A concise introduction for publication cards and the default search description."><textarea className="cms-input" rows={3} maxLength={1000} value={entry.summary} onChange={(event) => update("summary", event.target.value)} /></Field>
          <div className="cms-field-row"><Field label="Category"><input className="cms-input" maxLength={100} value={entry.category} placeholder="e.g. Digital strategy" onChange={(event) => update("category", event.target.value)} /></Field><Field label="Tags" help="Separate tags with commas (up to 20)."><input className="cms-input" value={tagsText} onChange={(event) => { setTagsText(event.target.value); update("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)); }} /></Field></div>
          <h3 className="cms-label" id="entry-body-heading">{entry.kind === "case-study" ? "Additional narrative & screenshots" : "Main content"}</h3>
          <div aria-labelledby="entry-body-heading"><RichTextEditor value={entry.body} onChange={(body) => update("body", body)} onRequestImage={() => requestMedia("body")} insertImage={insertImage} /></div>
          <p className="cms-field-help">Use meaningful headings and descriptive links. Images are uploaded through this entry’s private media library.</p>
        </section>
        <section className="cms-panel" aria-labelledby="entry-details-heading"><h2 id="entry-details-heading" className="cms-details-title">{kindLabels[entry.kind]} details</h2>
          {entry.kind === "article" && <>
            <Field label="Deck / opening introduction"><textarea className="cms-input" rows={3} maxLength={1000} value={entry.details.deck} onChange={(event) => detail("deck", event.target.value)} /></Field>
            <Field label="Issue number (optional)"><input className="cms-input" maxLength={30} value={entry.details.issue} onChange={(event) => detail("issue", event.target.value)} /></Field>
            <Field label="Pull quote (optional)"><textarea className="cms-input" rows={3} maxLength={2000} value={entry.details.pullQuote} onChange={(event) => detail("pullQuote", event.target.value)} /></Field>
            <Field label="Practical takeaway (optional)"><textarea className="cms-input" rows={3} maxLength={2000} value={entry.details.takeaway} onChange={(event) => detail("takeaway", event.target.value)} /></Field>
          </>}
          {entry.kind === "case-study" && <>
            <Field label="Project designation" help="Concept demonstrations must stay explicitly labelled."><select className="cms-input" value={entry.details.designation} onChange={(event) => { detail("designation", event.target.value); update("publication_approved", false); }}><option>Concept Demonstration</option><option>Client engagement</option><option>Studio project</option></select></Field>
            <Field label="Project headline"><input className="cms-input" maxLength={500} value={entry.details.headline} onChange={(event) => detail("headline", event.target.value)} /></Field>
            <Field label="Focus areas" help="One area per line."><textarea className="cms-input" rows={3} value={entry.details.focus.join("\n")} onChange={(event) => detail("focus", event.target.value.split("\n"))} /></Field>
            <Field label="Confirmed project status"><input className="cms-input" maxLength={200} value={entry.details.projectStatus} placeholder="Describe only the status you can confirm" onChange={(event) => detail("projectStatus", event.target.value)} /></Field>
            <Field label="Status context / limitations"><textarea className="cms-input" rows={3} maxLength={3000} value={entry.details.statusDetail} onChange={(event) => detail("statusDetail", event.target.value)} /></Field>
            <Field label="Demo or project URL (optional)"><input type="url" className="cms-input" value={entry.details.demoUrl || ""} placeholder="https://" onChange={(event) => detail("demoUrl", event.target.value)} /></Field>
            <CaseSections sections={entry.details.sections || []} onChange={(sections) => detail("sections", sections)} />
          </>}
          {entry.kind === "resource" && <>
            <Field label="Resource format"><select className="cms-input" value={entry.details.resourceType} onChange={(event) => detail("resourceType", event.target.value)}><option>Guide</option><option>Checklist</option><option>Template</option><option>Reference</option></select></Field>
            <Field label="External resource URL (optional)"><input type="url" className="cms-input" value={entry.details.externalUrl || ""} placeholder="https://" onChange={(event) => detail("externalUrl", event.target.value)} /></Field>
            <div className="cms-actions"><button type="button" className="cms-button cms-button-secondary" onClick={() => requestMedia("download")}><Plus size={14} aria-hidden="true" />{entry.details.downloadMediaId ? "Change download" : "Attach downloadable file"}</button>{entry.details.downloadMediaId && <><a className="cms-button cms-button-secondary" href={`/api/media/${entry.details.downloadMediaId}`} target="_blank" rel="noopener noreferrer">View file<ArrowUpRight size={13} aria-hidden="true" /></a><button type="button" className="cms-button cms-button-secondary" onClick={() => detail("downloadMediaId", undefined)}>Remove file</button></>}</div>
          </>}
          {entry.kind === "client" && <>
            <p className="cms-privacy" style={{ marginBottom: 22 }}>A paying engagement does not imply permission to name a client publicly. Keep unapproved profiles and project details as private drafts.</p>
            <Field label="Client website (optional)"><input type="url" className="cms-input" value={entry.details.websiteUrl || ""} placeholder="https://" onChange={(event) => detail("websiteUrl", event.target.value)} /></Field>
            <Field label="Approved engagement summary"><textarea className="cms-input" rows={5} maxLength={3000} value={entry.details.engagementSummary} onChange={(event) => detail("engagementSummary", event.target.value)} /></Field>
            <div className="cms-actions"><button type="button" className="cms-button cms-button-secondary" onClick={() => requestMedia("logo")}><ImagePlus size={14} aria-hidden="true" />{entry.details.logoMediaId ? "Change logo" : "Choose approved logo"}</button>{entry.details.logoMediaId && <button type="button" className="cms-button cms-button-secondary" onClick={() => detail("logoMediaId", undefined)}>Remove logo</button>}</div>
            {entry.details.logoMediaId && <img src={`/api/media/${entry.details.logoMediaId}`} alt="Selected client logo" width={160} height={100} style={{ marginTop: 20, maxHeight: 100, objectFit: "contain" }} />}
          </>}
        </section>
        <section className="cms-panel" aria-labelledby="entry-seo-heading"><h2 id="entry-seo-heading" className="cms-details-title">Search & sharing</h2><Field label="SEO title (optional)" help="Leave blank to use the entry title."><input className="cms-input" value={entry.seo_title} maxLength={300} onChange={(event) => update("seo_title", event.target.value)} /></Field><Field label="SEO description (optional)" help="Leave blank to use the summary. Aim for a clear, natural description of about 150–160 characters."><textarea className="cms-input" rows={3} maxLength={500} value={entry.seo_description} onChange={(event) => update("seo_description", event.target.value)} /></Field><p className="cms-note">Canonical URLs and Open Graph metadata are generated from the configured production URL and this entry’s public path. Drafts have no public page.</p></section>
      </div>
      <aside className="cms-editor-aside" aria-label="Entry settings">
        <section className="cms-panel"><h2 className="cms-panel-title">Publication</h2><p style={{ marginTop: 15 }}><span className={`cms-badge cms-badge-${entry.status}`}>{entry.status === "published" ? "Published" : "Private draft"}</span></p><p className="cms-note" style={{ marginTop: 14 }}>{entry.status === "published" ? "This entry and its media are publicly accessible. Saving changes updates the live page." : "Only approved administrators can view this entry or its attached media."}</p>
          {requiresApproval && <label className="cms-checkbox" style={{ marginTop: 20 }}><input type="checkbox" checked={entry.publication_approved} onChange={(event) => update("publication_approved", event.target.checked)} /><span>I have permission to publish this client’s name, project information and assets.</span></label>}
          <div className="cms-panel-section cms-actions">
            {entry.status === "draft" ? <button type="button" className="cms-button" disabled={busy || (requiresApproval && !entry.publication_approved)} onClick={() => save("published")}><Check size={14} aria-hidden="true" /> Publish entry</button> : <button type="button" className="cms-button cms-button-secondary" disabled={busy} onClick={() => { if (window.confirm("Unpublish this entry? The public page and its media will become private.")) void save("draft"); }}>Unpublish</button>}
            {record?.status === "published" && <Link href={entryUrl(record)} target="_blank" rel="noopener noreferrer" className="cms-button cms-button-secondary">Public page <ArrowUpRight size={13} aria-hidden="true" /></Link>}
          </div>
          <label className="cms-checkbox" style={{ marginTop: 24 }}><input type="checkbox" checked={entry.featured} onChange={(event) => update("featured", event.target.checked)} /><span>Feature this entry in the website’s curated previews.</span></label>
        </section>
        <section className="cms-panel"><h2 className="cms-panel-title">Cover image</h2><p className="cms-note" style={{ marginTop: 12 }}>Choose an image you own or have permission to publish. Its description is managed in the media library.</p>{entry.cover_media_id && <figure className="cms-cover"><img src={`/api/media/${entry.cover_media_id}`} alt="Selected entry cover" width={640} height={400} /></figure>}<div className="cms-actions" style={{ marginTop: 18 }}><button type="button" className="cms-button cms-button-secondary" onClick={() => requestMedia("cover")}><ImagePlus size={14} aria-hidden="true" />{entry.cover_media_id ? "Change image" : "Choose image"}</button>{entry.cover_media_id && <button type="button" className="cms-button cms-button-secondary" onClick={() => update("cover_media_id", null)}>Remove</button>}</div></section>
        <section className="cms-panel"><h2 className="cms-panel-title">Entry media</h2><p className="cms-note" style={{ marginTop: 12, marginBottom: 18 }}>Upload screenshots, editorial images and resource files. All files belong to this entry and follow its publication status.</p><button type="button" className="cms-button cms-button-secondary" onClick={() => requestMedia("library")}>Manage files</button></section>
        {record && <section className="cms-panel"><h2 className="cms-panel-title">Delete entry</h2><p className="cms-note" style={{ marginTop: 12, marginBottom: 18 }}>Permanently remove this entry. Unpublish first if you only want to hide it. Remove attached media before deletion.</p>{deleteConfirm ? <><p className="cms-alert">Delete “{entry.title}” permanently? This cannot be undone.</p><div className="cms-actions"><button type="button" className="cms-button cms-button-danger" onClick={deleteEntry} disabled={busy}>{busy ? "Deleting…" : "Confirm deletion"}</button><button type="button" className="cms-button cms-button-secondary" onClick={() => setDeleteConfirm(false)} disabled={busy}>Cancel</button></div></> : <button type="button" className="cms-button cms-button-danger" onClick={() => setDeleteConfirm(true)}><Trash2 size={14} aria-hidden="true" /> Delete entry</button>}</section>}
      </aside>
    </div>
    {mediaTarget && record && <div className="cms-modal" onMouseDown={(event) => { if (event.target === event.currentTarget) setMediaTarget(null); }}><div className="cms-modal-panel" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="media-picker-heading"><div className="cms-modal-heading"><div><p className="cms-eyebrow">Files for this entry</p><h2 id="media-picker-heading">{mediaTarget === "library" ? "Media library" : "Choose your media"}</h2></div><button type="button" className="cms-button cms-button-secondary" aria-label="Close media library" onClick={() => setMediaTarget(null)}><X size={18} aria-hidden="true" /></button></div>{error && <p role="alert" className="cms-alert">{error}</p>}<MediaLibrary entryId={record.id} onSelect={mediaTarget === "library" ? undefined : selectMedia} /></div></div>}
  </>;
}
