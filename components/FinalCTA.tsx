import Reveal from "./Reveal";
import MagneticButton from "./MagneticButton";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[160px]" />
      </div>
      <div className="container-x max-w-5xl text-center">
        <Reveal>
          <h2 className="heading-display text-[clamp(2.5rem,6vw,5.5rem)]">
            Your website should be your most{" "}
            <span className="italic text-gold-gradient">valuable</span>{" "}
            digital asset.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/70">
            Let&rsquo;s create a digital experience that elevates your business.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <MagneticButton href="/contact">Start A Project</MagneticButton>
            <MagneticButton href="/work" variant="ghost">
              View Work
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
