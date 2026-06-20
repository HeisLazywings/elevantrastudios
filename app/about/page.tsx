import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import FinalCTA from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "About — Ahmed Abdulsalam, Founder of Elevanta Studio",
  description:
    "Ahmed Abdulsalam is a web developer creating premium websites that combine exceptional design, performance, and business impact.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Elevanta Studio",
    description:
      "Meet the founder behind Elevanta Studio and the principles that guide our work.",
    url: "/about",
  },
};

const values = [
  {
    title: "Craft",
    description:
      "Every detail considered. Every interaction intentional. We do not ship generic work.",
  },
  {
    title: "Clarity",
    description:
      "Honest scopes, clear timelines, and a shared understanding of what success means.",
  },
  {
    title: "Performance",
    description:
      "Beautiful is not enough. Our work loads fast, ranks well, and converts.",
  },
  {
    title: "Partnership",
    description:
      "We stay engaged after launch — your growth is the real measure of our work.",
  },
];

const expertise = [
  "Next.js & React",
  "TypeScript",
  "Tailwind CSS",
  "WordPress",
  "Technical SEO",
  "Performance Engineering",
  "Design Systems",
  "Conversion Strategy",
];

export default function AboutPage() {
  return (
    <>
      <section className="relative pt-40">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-gold">
                About
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="heading-display text-[clamp(2.5rem,6vw,6rem)]">
                A studio built around{" "}
                <span className="italic text-gold-gradient">craft.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-10 max-w-xl text-lg text-white/70">
                Ahmed Abdulsalam is a web developer and digital experience
                builder focused on creating premium websites that combine
                exceptional design, performance, and business impact.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-xl text-lg text-white/60">
                Currently studying at Ahmadu Bello University while helping
                businesses build stronger digital presences through
                thoughtful web experiences.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:col-span-5">
            <div className="glass relative overflow-hidden rounded-3xl p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
              <p className="text-xs uppercase tracking-[0.3em] text-gold">
                Founder
              </p>
              <h2 className="heading-display mt-6 text-4xl">
                Ahmed Abdulsalam
              </h2>
              <p className="mt-4 text-sm text-white/60">
                Web Developer · Digital Experience Builder
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                <Stat n="Ahmadu Bello" l="University" />
                <Stat n="Nigeria" l="Based in" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-32">
        <div className="container-x grid gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Mission
            </p>
            <h3 className="heading-display text-4xl md:text-5xl">
              To make premium digital design accessible to ambitious businesses.
            </h3>
            <p className="mt-8 text-white/70">
              We believe ambitious businesses deserve websites that match their
              ambition — beautifully crafted, fast, and engineered to grow with
              them. We exist to bring that level of craft to every client we
              work with.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-4">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
                Expertise
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {expertise.map((e) => (
                  <li
                    key={e}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 py-32">
        <div className="container-x">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Values
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-display mb-16 max-w-3xl text-[clamp(2.25rem,4.5vw,4rem)]">
              The principles that guide every project.
            </h2>
          </Reveal>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] md:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 0.08}>
                <div className="h-full bg-bg p-10">
                  <span className="font-display text-sm text-gold">
                    0{i + 1}
                  </span>
                  <h3 className="heading-display mt-4 text-2xl md:text-3xl">
                    {v.title}
                  </h3>
                  <p className="mt-4 text-sm text-white/60">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-xl text-white">{n}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
        {l}
      </div>
    </div>
  );
}
