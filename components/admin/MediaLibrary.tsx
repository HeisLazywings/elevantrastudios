"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, LoaderCircle, Upload } from "lucide-react";
import Link from "next/link";
import { CMS_MAX_UPLOAD_BYTES, type CmsMedia } from "@/lib/cms/types";

export type MediaItem = Pick<CmsMedia,
  "id" | "entry_id" | "storage_path" | "filename" | "mime_type" | "size_bytes" | "alt" | "created_at"
>;

type MediaLibraryProps = {
  entryId?: string;
  onSelect?: (media: MediaItem) => void;
  refreshKey?: number;
};

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

async function responseData(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || (response.status === 401
      ? "Your session has expired. Sign in again to manage media."
      : "The media request could not be completed. Please try again."));
  }
  return data;
}

function fileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary({ entryId, onSelect, refreshKey = 0 }: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setNotice("");
    setDeleteId(null);
    const query = entryId ? `?entry_id=${encodeURIComponent(entryId)}` : "";
    fetch(`/api/admin/media${query}`, { cache: "no-store", signal: controller.signal })
      .then(responseData)
      .then((data) => {
        const items = (data?.media ?? []) as MediaItem[];
        setMedia(items);
        setAltDrafts(Object.fromEntries(items.map((item) => [item.id, item.alt || ""])));
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load media.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [entryId, refreshKey]);

  async function upload() {
    if (!entryId || !file || uploading) return;
    setError("");
    setNotice("");
    if (!allowedTypes.has(file.type)) {
      setError("Choose a JPEG, PNG, WebP, GIF, or PDF file. SVG files are not supported.");
      return;
    }
    if (file.size > CMS_MAX_UPLOAD_BYTES || file.size === 0) {
      setError("Choose a non-empty file no larger than 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.set("entry_id", entryId);
      body.set("file", file);
      body.set("alt", uploadAlt.trim());
      const data = await responseData(await fetch("/api/admin/media", { method: "POST", body }));
      const uploaded = data?.media as MediaItem | undefined;
      if (!uploaded?.id) throw new Error("The upload response was incomplete. Refresh the library to check your file.");
      setMedia((items) => [uploaded, ...items]);
      setAltDrafts((values) => ({ ...values, [uploaded.id]: uploaded.alt || "" }));
      setFile(null);
      setUploadAlt("");
      if (fileInput.current) fileInput.current.value = "";
      setNotice("File uploaded. It inherits the publication visibility of its content entry.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The file could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function saveAlt(item: MediaItem) {
    if (busyId) return;
    setBusyId(item.id);
    setError("");
    setNotice("");
    const alt = (altDrafts[item.id] || "").trim();
    try {
      await responseData(await fetch(`/api/admin/media/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt }),
      }));
      setMedia((items) => items.map((current) => current.id === item.id ? { ...current, alt } : current));
      setAltDrafts((values) => ({ ...values, [item.id]: alt }));
      setNotice(`Description saved for ${item.filename}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The description could not be saved.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMedia(item: MediaItem) {
    if (busyId) return;
    setBusyId(item.id);
    setError("");
    setNotice("");
    try {
      await responseData(await fetch(`/api/admin/media/${encodeURIComponent(item.id)}`, { method: "DELETE" }));
      setMedia((items) => items.filter((current) => current.id !== item.id));
      setDeleteId(null);
      setNotice(`${item.filename} deleted.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The file could not be deleted.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-label="Media library" className="space-y-6">
      {entryId ? (
        <div className="cms-panel space-y-5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Upload aria-hidden="true" size={20} className="mt-1 shrink-0 text-gold-light" />
            <div>
              <h3 className="text-lg font-medium">Upload to this entry</h3>
              <p id="media-upload-help" className="cms-note mt-1">JPEG, PNG, WebP, GIF, or PDF. Up to 10 MB each. Draft media stays private until its entry is published.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="cms-field">
              <span className="cms-label">Choose a file</span>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" disabled={uploading} aria-describedby="media-upload-help" className="cms-input block w-full max-w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }} />
            </label>
            <label className="cms-field">
              <span className="cms-label">Image description / file description</span>
              <input type="text" maxLength={500} value={uploadAlt} disabled={uploading} onChange={(event) => setUploadAlt(event.target.value)} className="cms-input" placeholder="Describe what the image communicates" />
            </label>
          </div>
          <button type="button" className="cms-button" disabled={!file || uploading} onClick={upload}>
            {uploading ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Upload size={16} aria-hidden="true" />}
            {uploading ? "Uploading…" : "Upload file"}
          </button>
        </div>
      ) : (
        <p className="cms-note">Open a content entry to upload files. Media belongs to an entry so its draft and publication visibility stays consistent.</p>
      )}

      {error && <p className="cms-alert" role="alert">{error}</p>}
      <div role="status" aria-live="polite" aria-atomic="true">
        {notice && <p className="cms-status">{notice}</p>}
        {loading && <p className="cms-note flex items-center gap-2"><LoaderCircle aria-hidden="true" size={16} className="animate-spin motion-reduce:animate-none" />Loading media…</p>}
        {!loading && !error && media.length === 0 && <p className="cms-panel p-8 text-center text-sm text-white/60">No files uploaded{entryId ? " for this entry" : " yet"}.</p>}
      </div>

      {!loading && media.length > 0 && (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Uploaded files">
          {media.map((item) => {
            const isImage = item.mime_type.startsWith("image/");
            const pending = busyId === item.id;
            const previewUrl = `/api/media/${encodeURIComponent(item.id)}`;
            return (
              <li key={item.id} className="cms-panel min-w-0 overflow-hidden">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-white/10 bg-black/30" aria-label={`Open ${item.filename} in a new tab`}>
                  {isImage ? (
                    // These authenticated media routes are deliberately not passed through the public image optimiser.
                    <img src={previewUrl} alt={item.alt || ""} loading="lazy" width={480} height={360} className="h-full w-full object-contain" />
                  ) : (
                    <span className="flex flex-col items-center gap-3 text-white/50"><FileText size={42} strokeWidth={1} aria-hidden="true" /><span className="text-xs uppercase tracking-widest">PDF document</span></span>
                  )}
                </a>
                <div className="space-y-4 p-4">
                  <div>
                    <p className="break-all text-sm font-medium">{item.filename}</p>
                    <p className="cms-note mt-1 flex items-center gap-2">{isImage && <ImageIcon size={12} aria-hidden="true" />}{fileSize(item.size_bytes)} <span aria-hidden="true">·</span> {item.mime_type.replace("image/", "").replace("application/", "").toUpperCase()}</p>
                  </div>
                  <label className="cms-field">
                    <span className="cms-label">{isImage ? "Image description (alt text)" : "File description"}</span>
                    <input type="text" maxLength={500} className="cms-input" value={altDrafts[item.id] ?? item.alt ?? ""} disabled={pending} onChange={(event) => setAltDrafts((values) => ({ ...values, [item.id]: event.target.value }))} />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="cms-button-secondary" disabled={Boolean(busyId) || (altDrafts[item.id] ?? "") === (item.alt || "")} onClick={() => saveAlt(item)}>{pending ? "Saving…" : "Save description"}</button>
                    {onSelect && <button type="button" className="cms-button" disabled={Boolean(busyId)} onClick={() => onSelect(item)}>Use file</button>}
                    {!entryId && <Link href={`/admin/entries/${encodeURIComponent(item.entry_id)}`} className="cms-button-secondary">Open content entry</Link>}
                  </div>
                  {deleteId === item.id ? (
                    <div className="space-y-3 border-t border-white/10 pt-4">
                      <p className="cms-note">Permanently delete this file? Remove any references from saved content entries first. Deletion cannot be undone.</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="cms-button-danger" disabled={Boolean(busyId)} onClick={() => deleteMedia(item)}>{pending ? "Deleting…" : "Delete permanently"}</button>
                        <button type="button" className="cms-button-secondary" disabled={Boolean(busyId)} onClick={() => setDeleteId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : <button type="button" className="cms-button-danger" disabled={Boolean(busyId)} onClick={() => setDeleteId(item.id)}>Delete file</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
