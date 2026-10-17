import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArticleSummary } from "@/lib/insights";
import InsightVisual from "@/components/InsightVisual";

export default function ArticleCard({ article, lead = false }: { article: ArticleSummary; lead?: boolean }) {
  return (
    <article className={`group min-w-0 ${lead ? "lg:col-span-7" : ""}`}>
      <Link href={`/insights/${article.slug}`} className="block" aria-labelledby={`article-${article.slug}`}>
        {article.coverMediaId
          ? <img src={`/api/media/${article.coverMediaId}`} alt={article.coverAlt ?? ""} loading="lazy" decoding="async" className="aspect-[4/3] w-full border border-white/10 object-cover transition-opacity group-hover:opacity-90" />
          : <InsightVisual article={article} className="transition-colors duration-500 group-hover:border-gold/50" />}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.65rem] uppercase tracking-[0.18em]">
          <span className="text-gold-light">{article.category}</span>
          <span className="text-white/50">{article.readingTime} min read</span>
        </div>
        <h2 id={`article-${article.slug}`} className={`mt-4 font-display leading-[1.12] tracking-[-0.025em] text-white transition-colors group-hover:text-gold-light ${lead ? "text-3xl sm:text-4xl lg:text-5xl" : "text-3xl"}`}>
          {article.title}
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">{article.summary}</p>
        <span className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm text-gold-light">
          Read the insight <ArrowUpRight size={17} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </article>
  );
}
