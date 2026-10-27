import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getReadingTime } from "@/lib/insights";
import { getSiteArticles } from "@/lib/content";
import Reveal from "@/components/Reveal";
import InsightVisual from "@/components/InsightVisual";

export default async function InsightsPreview() {
  const [lead, ...rest] = (await getSiteArticles()).filter((article) => article.featured).slice(0, 3);
  if (!lead) return null;

  return (
    <section className="relative border-y border-white/10 bg-[#0c0c09] py-24 md:py-32" aria-labelledby="insights-heading">
      <div className="container-x">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow mb-5">The studio journal</p>
            <h2 id="insights-heading" className="heading-display text-[clamp(2.5rem,5vw,4.5rem)]">A considered <span className="italic text-gold-light">perspective.</span></h2>
          </Reveal>
          <Link href="/insights" className="text-link">Explore insights <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="editorial-grid">
          <Reveal className="lg:col-span-6">
            <article className="group">
              <Link href={`/insights/${lead.slug}`} className="block">
                {lead.coverMediaId
                  ? <img src={`/api/media/${lead.coverMediaId}`} alt={lead.coverAlt ?? ""} loading="lazy" decoding="async" className="aspect-[16/10] w-full border border-white/10 object-cover" />
                  : <InsightVisual article={lead} className="aspect-[16/10]" />}
                <p className="eyebrow mt-6">{lead.category} <span className="ml-3 text-white/50">{getReadingTime(lead)} min read</span></p>
                <h3 className="mt-4 font-display text-3xl leading-[1.12] tracking-tight transition-colors group-hover:text-gold-light sm:text-4xl">{lead.title}</h3>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">{lead.summary}</p>
                <span className="text-link mt-4">Read the insight <ArrowUpRight size={16} aria-hidden="true" /></span>
              </Link>
            </article>
          </Reveal>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="mb-6 max-w-sm text-base leading-relaxed text-white/60">Practical thinking on customer information, enquiry journeys and the decisions behind useful digital systems.</p>
            {rest.map((article) => (
              <article key={article.slug} className="section-rule group py-8">
                <Link href={`/insights/${article.slug}`} className="block">
                  <div className="flex justify-between gap-4">
                    <p className="eyebrow">{article.category}</p>
                    <span className="font-display text-sm italic text-white/60">{article.issue}</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl leading-tight transition-colors group-hover:text-gold-light sm:text-3xl">{article.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/60">{article.summary}</p>
                  <span className="text-link mt-3">{getReadingTime(article)} min read <ArrowUpRight size={16} aria-hidden="true" /></span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
