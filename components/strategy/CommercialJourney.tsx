import type { CSSProperties } from "react";

/** A process illustration, rather than a forecast of funnel performance. */
export default function CommercialJourney({
  steps,
  label = "An illustrative customer journey",
}: {
  steps: readonly { title: string; detail?: string }[];
  label?: string;
}) {
  return (
    <ol
      aria-label={label}
      style={{ "--journey-count": steps.length } as CSSProperties}
      className="grid min-w-0 grid-cols-1 border-y border-white/15 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--journey-count),minmax(0,1fr))]"
    >
      {steps.map((step, index) => (
        <li key={step.title} className="min-w-0 border-b border-white/10 px-1 py-7 last:border-b-0 sm:px-5 sm:py-8 lg:border-b-0 lg:border-r lg:last:border-r-0">
          <span aria-hidden="true" className="text-[10px] tracking-[0.2em] text-gold">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="mt-4 text-base font-medium leading-snug text-white/90">{step.title}</h3>
          {step.detail && <p className="mt-3 text-sm leading-relaxed text-white/60">{step.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
