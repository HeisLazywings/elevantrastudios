import type { Metadata } from "next";
import { services, processSteps } from "@/lib/data";
import Reveal from "@/components/Reveal";
import FinalCTA from "@/components/FinalCTA";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services — Premium Web Design & Development",
  description:
    "Website development, landing pages, e-commerce, maintenance, and performance optimization for ambitious brands.",
  ...(absoluteUrl("/services") ? { alternates: { canonical: absoluteUrl("/services") } } : {}),
  openGraph: {
    title: "Services — Elevantra Studios",
    description:
      "Premium web design, development, and growth services for ambitious brands.",
    ...(absoluteUrl("/services") ? { url: absoluteUrl("/services") } : {}),
  },
};

const faqs = [
  {
    q: "How long does a typical project take?",
    a: "The timeline depends on the scope, content readiness, integrations, and review process. We agree on milestones and responsibilities before work begins.",
  },
  {
    q: "Do you work with existing brands?",
    a: "Yes. We adapt to your existing brand system or help refine it. Either way, the final website is unmistakably yours.",
  },
  {
    q: "What does pricing look like?",
    a: "Pricing is project-based and depends on scope. We share a detailed proposal after a discovery call so you know exactly what you're investing in.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Maintenance, performance reviews, and further improvements can be scoped alongside the build. We agree on the support arrangements your project needs.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative pt-40">
        <div className="container-x max-w-5xl">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-gold">
              Services
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="heading-display text-[clamp(2.5rem,6vw,6rem)]">
              Premium services for{" "}
              <span className="italic text-gold-gradient">ambitious</span>{" "}
              brands.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-lg text-white/70">
              Every engagement is designed around your business outcomes —
              built to perform, scaled to grow with you, and crafted to make a
              lasting impression.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-32">
        <div className="container-x space-y-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          {services.map((s, i) => (
            <Reveal key={s.title}>
              <article className="group grid gap-10 bg-bg p-10 transition-colors duration-500 hover:bg-bg-secondary md:grid-cols-12 md:p-14">
                <div className="md:col-span-5">
                  <div className="font-display text-sm text-gold">
                    0{i + 1}
                  </div>
                  <h2 className="heading-display mt-4 text-3xl md:text-4xl">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-md text-white/65">{s.description}</p>
                </div>
                <div className="md:col-span-7">
                  <h3 className="mb-5 text-xs uppercase tracking-[0.3em] text-white/40">
                    Deliverables
                  </h3>
                  <ul className="grid gap-3">
                    {s.deliverables.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-3 text-sm text-white/80"
                      >
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-gold" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-bg-secondary/40 py-32">
        <div className="container-x">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Benefits
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-display mb-16 max-w-3xl text-[clamp(2.25rem,4.5vw,4rem)]">
              Designed around your business.
            </h2>
          </Reveal>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { t: "Credibility", d: "Present the information and proof a prospective customer needs to consider your business." },
              { t: "Clearer Enquiries", d: "Help visitors understand your offer and reach out with useful context." },
              { t: "Room to Evolve", d: "Use a maintainable structure that can adapt as your content and business needs change." },
            ].map((b) => (
              <Reveal key={b.t}>
                <div className="glass rounded-3xl p-8">
                  <h3 className="heading-display text-2xl">{b.t}</h3>
                  <p className="mt-3 text-sm text-white/65">{b.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container-x">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Process
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-display mb-16 max-w-3xl text-[clamp(2.25rem,4.5vw,4rem)]">
              How we work.
            </h2>
          </Reveal>
          <ol className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] md:grid-cols-3">
            {processSteps.map((s) => (
              <li key={s.n} className="bg-bg p-8">
                <div className="font-display text-sm text-gold">{s.n}</div>
                <h3 className="heading-display mt-3 text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm text-white/65">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/10 py-32">
        <div className="container-x max-w-4xl">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              FAQs
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-display mb-16 text-[clamp(2rem,4vw,3.5rem)]">
              Questions, answered.
            </h2>
          </Reveal>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((f) => (
              <div key={f.q} className="py-8">
                <dt className="heading-display text-xl md:text-2xl">{f.q}</dt>
                <dd className="mt-3 text-white/65">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
