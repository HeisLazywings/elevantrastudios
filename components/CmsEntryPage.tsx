import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { getPublishedEntry, getPublishedMedia } from "@/lib/cms/queries";
import { isCmsContentEnabled } from "@/lib/content";
import CmsBody from "@/components/CmsBody";

export default async function CmsEntryPage({ kind, slug }: { kind: "resource" | "client"; slug: string }) {
  const entry = isCmsContentEnabled() ? await getPublishedEntry(kind, slug) : null;
  if (!entry) notFound();
  const logo = entry.kind === "client" && entry.details.logoMediaId ? await getPublishedMedia(entry.details.logoMediaId) : null;
  const resource = kind === "resource";
  return <article className="container-x pb-24 pt-36 md:pt-44">
    <Link href={resource ? "/resources" : "/clients"} className="text-link"><ArrowLeft size={16} aria-hidden="true" /> {resource ? "All resources" : "Client profiles"}</Link>
    <header className="section-rule mt-8 pb-12 pt-7">
      <p className="eyebrow">{entry.category || (resource ? "Studio resource" : "Client profile")}</p>
      <h1 className="editorial-title mt-8 max-w-5xl">{entry.title}</h1>
      <p className="mt-8 max-w-2xl font-display text-xl leading-relaxed text-white/70 md:text-2xl">{entry.summary}</p>
    </header>
    {entry.cover_media_id && <img src={`/api/media/${entry.cover_media_id}`} alt={entry.cover_alt ?? ""} className="mb-12 h-auto w-full border border-white/10" />}
    {logo && <img src={`/api/media/${logo.id}`} alt={logo.alt || `${entry.title} logo`} className="mb-10 max-h-40 w-auto max-w-full object-contain" />}
    <div className="mx-auto max-w-3xl">
      {entry.kind === "client" && <div className="mb-10 border-l border-gold/40 pl-6"><p className="eyebrow mb-4">The engagement</p><p className="reading-copy">{entry.details.engagementSummary}</p>{entry.details.websiteUrl && <a href={entry.details.websiteUrl} className="text-link mt-4" rel="noopener noreferrer">Visit website <ArrowUpRight size={16} aria-hidden="true" /></a>}</div>}
      <CmsBody document={entry.body} />
      {entry.kind === "resource" && <div className="section-rule mt-12 flex flex-wrap gap-6 pt-8">
        {entry.details.downloadMediaId && <a href={`/api/media/${entry.details.downloadMediaId}`} className="text-link"><Download size={18} aria-hidden="true" /> Download {entry.title}</a>}
        {entry.details.externalUrl && <a href={entry.details.externalUrl} className="text-link" rel="noopener noreferrer">Open resource <ArrowUpRight size={17} aria-hidden="true" /></a>}
      </div>}
    </div>
  </article>;
}
