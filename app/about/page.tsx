import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import FinalCTA from "@/components/FinalCTA";
import { absoluteUrl } from "@/lib/site";
import { ArrowUpRight, Instagram, Linkedin, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Ahmed Abdulsalam",
  description:
    "Ahmed Abdulsalam is a web developer creating premium websites that combine exceptional design, performance, and business impact.",
  ...(absoluteUrl("/about") ? { alternates: { canonical: absoluteUrl("/about") } } : {}),
  openGraph: {
    title: "About Elevantra Studios",
    description:
      "Meet the founder behind Elevantra Studios and the principles that guide our work.",
    ...(absoluteUrl("/about") ? { url: absoluteUrl("/about") } : {}),
  },
};

const founderLinks = [
  {
    label: "Personal email",
    detail: "ahmednickoliver@gmail.com",
    href: "mailto:ahmednickoliver@gmail.com",
    icon: Mail,
    external: false,
  },
  {
    label: "Personal Instagram",
    detail: "@datguylazywings",
    href: "https://www.instagram.com/datguylazywings/",
    icon: Instagram,
    external: true,
  },
  {
    label: "LinkedIn",
    detail: "Ahmed Abdulsalam",
    href: "https://www.linkedin.com/in/ahmed-abdulsalam-a91449366",
    icon: Linkedin,
    external: true,
  },
] as const;

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
      "We consider loading speed, accessibility, search foundations, and the path to an enquiry throughout the build.",
  },
  {
    title: "Partnership",
    description:
      "We agree on the handover and support each project needs, with clear responsibilities beyond launch.",
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
              <div className="mt-10 border-t border-white/10 pt-8">
                <p className="text-xs uppercase tracking-[0.24em] text-gold">
                  Connect with the founder
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Personal channels. For projects and official enquiries, please
                  use Elevantra Studios&apos; contact page.
                </p>
                <ul className="mt-5 space-y-2">
                  {founderLinks.map(({ label, detail, href, icon: Icon, external }) => (
                    <li key={label}>
                      <a
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-gold/40 hover:bg-gold/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                        aria-label={`${label}: ${detail}`}
                      >
                        <Icon size={17} className="shrink-0 text-gold" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs text-white/45">{label}</span>
                          <span className="block break-all text-sm text-white/85">{detail}</span>
                        </span>
                        <ArrowUpRight size={15} className="shrink-0 text-white/35 transition-colors group-hover:text-gold" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
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
