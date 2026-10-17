import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { articles, getArticle, getReadingTime, toArticleSummary } from "@/lib/insights";
import { absoluteUrl, siteName } from "@/lib/site";
import InsightVisual from "@/components/InsightVisual";
import ArticleCard from "@/components/ArticleCard";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Insight not found", robots: { index: false, follow: false } };
  const canonical = absoluteUrl(`/insights/${article.slug}`);

  return {
    title: article.title,
    description: article.summary,
    ...(canonical && { alternates: { canonical } }),
    authors: [{ name: siteName }],
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      ...(canonical && { url: canonical }),
      authors: [siteName],
      section: article.category,
      siteName,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.summary },
  };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = articles.filter((entry) => entry.slug !== article.slug).slice(0, 2);
  const url = absoluteUrl(`/insights/${article.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    articleSection: article.category,
    inLanguage: "en",
    author: { "@type": "Organization", name: siteName },
    publisher: { "@type": "Organization", name: siteName },
    ...(url && { url, mainEntityOfPage: { "@type": "WebPage", "@id": url } }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article>
        <header className="container-x pb-14 pt-36 md:pb-20 md:pt-44">
          <Link href="/insights" className="text-link"><ArrowLeft size={16} aria-hidden="true" /> All insights</Link>
          <div className="section-rule mt-8 flex flex-wrap justify-between gap-4 pt-5">
            <p className="eyebrow">{article.category}</p>
            <p className="text-xs text-white/55">Studio note {article.issue} <span aria-hidden="true" className="mx-2">/</span> {getReadingTime(article)} min read</p>
          </div>
          <h1 className="editorial-title mt-10 max-w-5xl text-[clamp(2.6rem,6.2vw,6rem)]">{article.title}</h1>
          <div className="editorial-grid mt-8 md:mt-12">
            <p className="max-w-2xl font-display text-xl leading-relaxed text-white/75 md:text-2xl lg:col-span-8">{article.deck}</p>
            <div className="text-xs leading-relaxed text-white/50 lg:col-span-3 lg:col-start-10 lg:pt-2">
              <p className="text-white/85">By {siteName}</p>
              <p className="mt-2">Editorial analysis · Business & the web</p>
            </div>
          </div>
        </header>

        <div className="container-x">
          <div className="editorial-grid items-center border-y border-gold/20 bg-[#0e0e0b] px-5 py-8 md:px-10 md:py-12">
            <blockquote className="lg:col-span-6">
              <p className="eyebrow mb-6">The central idea</p>
              <p className="font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.2] tracking-tight text-[#eee6d7]">“{article.pullQuote}”</p>
            </blockquote>
            <InsightVisual article={article} className="mx-auto w-full max-w-lg lg:col-span-5 lg:col-start-8" />
          </div>
        </div>

        <div className="container-x editorial-grid py-16 md:py-24">
          <aside className="lg:col-span-3">
            <nav aria-label="In this article" className="border-t border-white/15 pt-5 lg:sticky lg:top-32">
              <p className="eyebrow mb-4">On this page</p>
              <ol className="space-y-1">
                {article.sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="flex min-h-11 gap-3 py-2 text-xs leading-relaxed text-white/60 transition-colors hover:text-gold-light">
                      <span className="text-gold/70" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
          <div className="min-w-0 lg:col-span-7 lg:col-start-5">
            {article.sections.map((section, index) => (
              <section key={section.id} id={section.id} className={index > 0 ? "mt-14 border-t border-white/10 pt-12" : ""}>
                <h2 className="font-display text-3xl leading-tight tracking-tight md:text-4xl">{section.title}</h2>
                <div className="reading-copy mt-6">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
                </div>
              </section>
            ))}
            <aside className="mt-14 border-l-2 border-gold bg-gold/[0.05] p-6 md:p-8" aria-label="A practical next step">
              <p className="eyebrow mb-4">A practical next step</p>
              <p className="font-display text-xl leading-relaxed text-[#eee6d7]">{article.takeaway}</p>
            </aside>
            <div className="section-rule mt-12 flex flex-wrap items-center justify-between gap-6 pt-8">
              <p className="max-w-sm text-sm leading-relaxed text-white/60">Thinking about the journey your own customers take? Start with the questions they need answered.</p>
              <Link href="/contact" className="text-link">Discuss your website <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </article>

      <section className="section-rule bg-bg-secondary/40 py-16 md:py-24" aria-labelledby="related-insights-heading">
        <div className="container-x">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 id="related-insights-heading" className="heading-display text-4xl md:text-5xl">Continue reading.</h2>
            <Link href="/insights" className="text-link">All insights <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">{related.map((entry) => <ArticleCard key={entry.slug} article={toArticleSummary(entry)} />)}</div>
        </div>
      </section>
    </>
  );
}
