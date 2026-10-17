import type { Article } from "@/lib/insights";

/** Original editorial diagrams, deliberately distinct from project screenshots. */
export default function InsightVisual({
  article,
  className = "",
}: {
  article: Pick<Article, "category" | "issue">;
  className?: string;
}) {
  const isHospitality = article.category === "Hospitality";
  const isTrust = article.category === "Trust & credibility";

  return (
    <div
      aria-hidden="true"
      className={`relative isolate flex aspect-[4/3] min-h-[20rem] w-full min-w-0 flex-col justify-between overflow-hidden border border-gold/15 bg-[#16150f] p-6 sm:min-h-[22rem] sm:p-9 ${className}`}
    >
      <div className="absolute -right-20 -top-24 -z-10 h-96 w-96 rounded-full border border-gold/20" />
      <div className="absolute -right-8 -top-12 -z-10 h-72 w-72 rounded-full border border-gold/10" />
      <div className="flex justify-between gap-3 text-[0.6rem] uppercase tracking-[0.2em] text-gold-light/80">
        <span>Notes on digital business</span>
        <span>{article.issue.padStart(2, "0")}</span>
      </div>
      {isHospitality ? (
        <div className="my-4 ml-auto w-[95%] max-w-sm space-y-2">
          <div className="ml-5 rounded-t-xl rounded-bl-xl border border-gold/20 bg-gold/[0.07] px-4 py-2 font-display text-base text-[#e9dfc9] sm:text-lg">Is the room available?</div>
          <div className="mr-5 rounded-t-xl rounded-br-xl border border-white/10 px-4 py-2 font-display text-base text-[#e9dfc9] sm:text-lg">What does the rate include?</div>
          <div className="ml-5 rounded-t-xl rounded-bl-xl border border-gold/20 bg-gold/[0.07] px-4 py-2 font-display text-base text-[#e9dfc9] sm:text-lg">Can I book these dates?</div>
        </div>
      ) : isTrust ? (
        <div className="relative mx-auto my-4 grid aspect-square w-[52%] max-w-56 place-items-center rounded-full border border-gold/40">
          <div className="absolute inset-4 rounded-full border border-dashed border-gold/20" />
          <div className="text-center font-display text-[clamp(1.5rem,3vw,3rem)] leading-tight text-[#e9dfc9]">Clarity.<br />Evidence.<br /><span className="italic text-gold-light">Trust.</span></div>
        </div>
      ) : (
        <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="border-y border-gold/30 py-5 font-display text-[clamp(1.5rem,3vw,3rem)] leading-none text-[#e9dfc9]">Found<br /><span className="italic text-gold-light">you.</span></div>
          <span className="h-px w-6 bg-gold/50 sm:w-12" />
          <div className="border-y border-gold/30 py-5 font-display text-[clamp(1.5rem,3vw,3rem)] leading-none text-[#e9dfc9]">What<br /><span className="italic text-gold-light">next?</span></div>
        </div>
      )}
      <div className="flex items-end justify-between gap-4 border-t border-gold/20 pt-4">
        <span className="font-display text-sm italic text-[#e9dfc9]">The space between interest & action.</span>
        <span className="text-[0.55rem] uppercase tracking-[0.2em] text-gold-light/70">Elevantra<br />Studios</span>
      </div>
    </div>
  );
}
