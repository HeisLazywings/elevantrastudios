"use client";

import { useState } from "react";
import type { ArticleSummary } from "@/lib/insights";
import ArticleCard from "@/components/ArticleCard";

export default function InsightsClient({ articles }: { articles: ArticleSummary[] }) {
  const [active, setActive] = useState("All insights");
  const categories = ["All insights", ...new Set(articles.map((article) => article.category))];
  const filtered = active === "All insights" ? articles : articles.filter((article) => article.category === active);

  return (
    <section className="container-x pb-24 md:pb-32" aria-label="Browse insights">
      <div className="section-rule mb-12 flex flex-wrap items-center justify-between gap-5 py-6">
        <div role="group" aria-label="Filter insights by category" className="flex flex-wrap gap-x-6 gap-y-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={category === active}
              aria-controls="insights-results"
              onClick={() => setActive(category)}
              className={`min-h-11 border-b py-2 text-sm transition-colors ${category === active ? "border-gold text-gold-light" : "border-transparent text-white/60 hover:border-white/30 hover:text-white"}`}
            >
              {category}
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className="text-xs text-white/50">
          {filtered.length} {filtered.length === 1 ? "article" : "articles"}
        </p>
      </div>
      <div id="insights-results" className="grid grid-cols-1 items-start gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-12">
        {!filtered.length && <p className="text-white/60 lg:col-span-12">The next studio insight will appear here when it is published.</p>}
        {filtered.map((article, index) => (
          <div key={article.slug} className={index === 0 ? "lg:col-span-7" : "lg:col-span-5 lg:mt-16"}>
            <ArticleCard article={article} lead={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
