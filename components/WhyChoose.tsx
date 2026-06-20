import { whyChoose } from "@/lib/data";
import Reveal from "./Reveal";

export default function WhyChoose() {
  return (
    <section className="relative py-32">
      <div className="container-x">
        <div className="mb-16 max-w-3xl">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Why Elevanta
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-display text-[clamp(2.25rem,4.5vw,4rem)]">
              Built to perform. Designed to{" "}
              <span className="italic text-gold-gradient">impress.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] md:grid-cols-2 lg:grid-cols-3">
          {whyChoose.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 0.06}>
              <div className="h-full bg-bg p-10">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-xs text-gold">
                  0{i + 1}
                </div>
                <h3 className="heading-display mb-3 text-xl md:text-2xl">
                  {w.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {w.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
