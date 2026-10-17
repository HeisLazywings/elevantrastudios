import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedEntries } from "@/lib/cms/queries";
import { isCmsContentEnabled } from "@/lib/content";

export default async function CmsCollection({ kind }: { kind: "resource" | "client" }) {
  const entries = isCmsContentEnabled() ? await getPublishedEntries(kind) : [];
  const resource = kind === "resource";
  const base = resource ? "/resources" : "/clients";
  return (
    <section className="container-x pb-24 pt-40 md:pt-48">
      <p className="eyebrow mb-8">Elevantra Studios / {resource ? "Resources" : "Client profiles"}</p>
      <h1 className="editorial-title max-w-4xl">{resource ? <>Useful thinking,<br /><span className="italic text-gold-light">put into practice.</span></> : <>The businesses<br /><span className="italic text-gold-light">behind the work.</span></>}</h1>
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">{resource ? "Guides, references and practical tools from the studio." : "Approved profiles of the businesses we work with, shared with permission."}</p>
      <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
        {entries.map((entry) => <article key={entry.id} className="section-rule py-8">
          {(entry.cover_media_id || (entry.kind === "client" && entry.details.logoMediaId)) && <img src={`/api/media/${entry.cover_media_id || (entry.kind === "client" ? entry.details.logoMediaId : "")}`} alt={entry.cover_media_id ? entry.cover_alt ?? "" : `${entry.title} logo`} loading="lazy" className="mb-7 aspect-[16/10] w-full border border-white/10 object-contain" />}
          <p className="eyebrow">{entry.category || (entry.kind === "resource" ? entry.details.resourceType : "Client profile")}</p>
          <h2 className="mt-5 font-display text-3xl leading-tight md:text-4xl"><Link href={`${base}/${entry.slug}`} className="hover:text-gold-light">{entry.title}</Link></h2>
          <p className="mt-5 text-sm leading-relaxed text-white/65">{entry.summary}</p>
          <Link href={`${base}/${entry.slug}`} className="text-link mt-5">{resource ? "View resource" : "Read profile"} <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </article>)}
        {!entries.length && <p className="section-rule pt-8 text-white/60 md:col-span-2">{resource ? "Resources will appear here when they are published." : "Profiles will appear here once approved for publication."}</p>}
      </div>
    </section>
  );
}
