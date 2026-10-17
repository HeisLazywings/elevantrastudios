import Reveal from "./Reveal";

export default function AboutSection() {
  return (
    <section className="relative py-32">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-gold">
              About Elevantra Studios
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-display text-[clamp(2.25rem,4.5vw,4rem)]">
              Designed for businesses that refuse to look{" "}
              <span className="italic text-gold-gradient">ordinary.</span>
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal delay={0.2}>
            <p className="text-lg leading-relaxed text-white/70">
              Elevantra Studios creates digital experiences that blend design,
              performance, and strategy. Every website is crafted to help
              businesses build credibility, attract customers, and stand
              apart in competitive markets.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
              <Capability title="Strategy" detail="A clear purpose for every page" />
              <Capability title="Design" detail="A considered visual language" />
              <Capability title="Development" detail="Responsive, accessible foundations" />
              <Capability title="Care" detail="Room to maintain and evolve" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Capability({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <div className="font-display text-2xl text-gold-light">
        {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-white/60">{detail}</div>
    </div>
  );
}
