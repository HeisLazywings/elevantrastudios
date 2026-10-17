import type { Metadata } from "next";
import { articles, toArticleSummary } from "@/lib/insights";
import { absoluteUrl } from "@/lib/site";
import InsightsClient from "@/components/InsightsClient";

const canonical = absoluteUrl("/insights");

export const metadata: Metadata = {
  title: "Insights — Notes on digital business",
  description: "Editorial perspectives from Elevantra Studios on customer journeys, hospitality workflows, and the foundations of a credible business website.",
  ...(canonical && { alternates: { canonical } }),
  openGraph: {
    title: "Insights | Elevantra Studios",
    description: "Considered perspectives on websites, customer trust, and the path from interest to enquiry.",
    ...(canonical && { url: canonical }),
  },
};

export default function InsightsPage() {
  return (
    <>
      <section className="container-x pb-16 pt-40 md:pb-24 md:pt-48">
        <div className="flex flex-wrap justify-between gap-4 border-t border-gold/30 pt-5">
          <p className="eyebrow">Elevantra Studios / Editorial</p>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50">Independent studio thinking</p>
        </div>
        <div className="editorial-grid mt-12 items-end md:mt-16">
          <div className="lg:col-span-8">
            <h1 className="editorial-title">Ideas with<br /><span className="italic text-gold-light">business in mind.</span></h1>
          </div>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="max-w-sm text-base leading-relaxed text-white/65 md:text-lg">A publication about the space between a first impression and a useful conversation.</p>
            <p className="mt-5 text-xs leading-relaxed text-white/45">Design, decisions and the details in between.</p>
          </div>
        </div>
      </section>
      <InsightsClient articles={articles.map(toArticleSummary)} />
    </>
  );
}
