import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Instagram, Linkedin, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";
import PageIntro from "@/components/strategy/PageIntro";
import StrategyCTA from "@/components/strategy/StrategyCTA";
import { absoluteUrl } from "@/lib/site";

const description = "Meet Elevantra Studios, a founder-led studio connecting business understanding, considered design and practical engineering with a long-term ambition.";

export const metadata: Metadata = {
  title: "About — The Studio We’re Building",
  description,
  ...(absoluteUrl("/about") ? { alternates: { canonical: absoluteUrl("/about") } } : {}),
  openGraph: {
    title: "About Elevantra Studios — The Studio We’re Building",
    description,
    type: "website",
    ...(absoluteUrl("/about") ? { url: absoluteUrl("/about") } : {}),
  },
};

const founderLinks = [
  { label: "Personal email", detail: "ahmednickoliver@gmail.com", href: "mailto:ahmednickoliver@gmail.com", icon: Mail, external: false },
  { label: "Personal Instagram", detail: "@datguylazywings", href: "https://www.instagram.com/datguylazywings/", icon: Instagram, external: true },
  { label: "LinkedIn", detail: "Ahmed Abdulsalam", href: "https://www.linkedin.com/in/ahmed-abdulsalam-a91449366", icon: Linkedin, external: true },
] as const;

const principles = [
  { title: "Analytical thinking", description: "Understand the commercial objective, examine the current process and distinguish what is known from what still needs to be investigated." },
  { title: "Considered design", description: "Use clear information, purposeful interactions and a distinctive visual language to make the experience useful to the people who rely on it." },
  { title: "Practical engineering", description: "Build maintainable systems with attention to loading speed, accessibility, search foundations and the agreed customer journey." },
  { title: "Responsible delivery", description: "Agree scope, responsibilities and review points. Make ownership, acceptance and any support arrangements clear before handover." },
];

const ambitions = [
  { title: "Institutional memory", description: "Document recurring problems, the decisions behind an intervention and what the available evidence shows afterwards." },
  { title: "Better methods", description: "Develop repeatable practices and reusable components as experience demonstrates where they are useful." },
  { title: "Earned trust", description: "Build a record of careful delivery, clear reporting and accountability, one engagement at a time." },
  { title: "Lasting relationships", description: "Give clients a reason to return through demonstrated value, with a complete handover when that is the right outcome." },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About Elevantra Studios"
        title={<>The work today.<br /><span className="italic text-gold-light">The institution ahead.</span></>}
        description="Elevantra Studios is a founder-led studio in Nigeria, developing from a web and digital-experience practice into a Commercial Systems & Digital Growth Studio. The ambition is long term. The work begins with the business in front of us."
        primary={{ href: "/approach", label: "Explore our approach" }}
        secondary={{ href: "/services", label: "What we can deliver" }}
      />

      <section className="container-x py-20 md:py-28" aria-labelledby="our-beginning-heading">
        <div className="grid gap-10 border-t border-white/15 pt-8 lg:grid-cols-12 lg:gap-16 lg:pt-10">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow">01 / Our beginning</p>
            <p className="mt-5 max-w-[22ch] text-sm leading-relaxed text-white/50">From building for the web to asking what the business needs.</p>
          </Reveal>
          <div className="lg:col-span-8 lg:col-start-5">
            <Reveal><h2 id="our-beginning-heading" className="heading-display max-w-[20ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.1]">We began with the ability to make things for the web.</h2></Reveal>
            <Reveal delay={0.08}>
              <div className="reading-copy mt-8 max-w-3xl">
                <p>Websites, digital catalogues and customer-facing experiences are the foundation of Elevantra’s work. They remain useful capabilities: a considered website can explain an offer, give buyers confidence and make the next step easier to take.</p>
                <p>Conversations with businesses have also brought a broader question into focus. What happens before and after someone reaches the website? A clearer page may help, but it cannot resolve every delay in an enquiry, an unclear handoff or a process nobody owns.</p>
                <p>That is shaping our direction. We want to understand the commercial objective and the friction around it before deciding what deserves to be built. Sometimes the useful intervention will be a digital experience. Sometimes it may be a simpler change to the way information or work moves through the business.</p>
              </div>
            </Reveal>
            <Reveal delay={0.12}><Link href="/commercial-challenges" className="text-link mt-8">The commercial questions we examine <ArrowUpRight size={16} aria-hidden="true" /></Link></Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-bg-secondary/40 py-20 md:py-28" aria-labelledby="our-principles-heading">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-3"><p className="eyebrow">02 / What we believe</p></Reveal>
            <Reveal className="lg:col-span-8 lg:col-start-5">
              <h2 id="our-principles-heading" className="heading-display max-w-[20ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.1]">The objective gives the work its purpose.</h2>
              <p className="mt-8 max-w-2xl text-base leading-[1.9] text-white/65 md:text-lg">Understand the business. Identify what matters. Build what is justified. Measure what changes. This is the operating philosophy we are developing, and the standard we want each engagement to meet.</p>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {principles.map((principle, index) => (
              <Reveal key={principle.title} delay={(index % 2) * 0.06}>
                <div className="border-t border-gold/30 pt-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold-light">0{index + 1}</p>
                  <h3 className="mt-5 font-display text-2xl leading-tight">{principle.title}</h3>
                  <p className="mt-4 text-sm leading-[1.85] text-white/60">{principle.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 md:py-28" aria-labelledby="founder-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow">03 / The founder</p>
            <h2 id="founder-heading" className="heading-display mt-6 max-w-[18ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.1]">A founder-led practice.<br /><span className="italic text-gold-light">A deliberate direction.</span></h2>
            <div className="reading-copy mt-8">
              <p>Elevantra Studios was founded by Ahmed Abdulsalam, a web developer and digital experience builder based in Nigeria. He is currently studying at Ahmadu Bello University while developing the studio’s work and its wider commercial direction.</p>
              <p>The current focus is practical: build on a foundation in web development, learn from business conversations and take on work with clear objectives and a responsible scope.</p>
              <p>Independent automotive dealerships are our near-term commercial focus. The wider ambition is to work with established businesses where a meaningful problem and an appropriate intervention can be demonstrated.</p>
            </div>
            <Link href="/who-we-work-with" className="text-link mt-8">Who we work with <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8">
            <aside className="border border-white/15 bg-white/[0.02] p-6 sm:p-8" aria-labelledby="founder-contact-heading">
              <p className="eyebrow">Founder</p>
              <p className="mt-5 font-display text-3xl leading-tight sm:text-4xl">Ahmed Abdulsalam</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">Web developer & digital experience builder</p>
              <dl className="mt-8 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div><dt className="text-[10px] uppercase tracking-[0.18em] text-white/55">University</dt><dd className="mt-2 text-sm leading-relaxed text-white/80">Ahmadu Bello University</dd></div>
                <div><dt className="text-[10px] uppercase tracking-[0.18em] text-white/55">Based in</dt><dd className="mt-2 text-sm text-white/80">Nigeria</dd></div>
              </dl>
              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 id="founder-contact-heading" className="text-[10px] uppercase tracking-[0.2em] text-gold-light">Connect with the founder</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">These are personal channels. For projects and official enquiries, please use the <Link href="/contact" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:text-gold-light">Elevantra Studios contact page</Link>.</p>
                <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
                  {founderLinks.map(({ label, detail, href, icon: Icon, external }) => (
                    <li key={label}>
                      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex min-h-16 items-center gap-3 py-4 text-white/85 transition-colors hover:text-gold-light">
                        <Icon size={17} aria-hidden="true" className="shrink-0 text-gold" />
                        <span className="min-w-0 flex-1"><span className="block text-[10px] uppercase tracking-[0.12em] text-white/55">{label}</span><span className="mt-1 block break-words text-sm [overflow-wrap:anywhere]">{detail}</span></span>
                        <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-white/35 transition-colors group-hover:text-gold-light" />{external && <span className="sr-only"> (opens in a new tab)</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 md:py-28" aria-labelledby="long-term-heading">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-3"><p className="eyebrow">04 / The long view</p><p className="mt-5 text-sm leading-relaxed text-white/50">A 20-year perspective.<br />An ambition for the future.</p></Reveal>
            <Reveal className="lg:col-span-8 lg:col-start-5">
              <h2 id="long-term-heading" className="heading-display max-w-[22ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.1]">Built to become more valuable with every problem we understand.</h2>
              <p className="reading-copy mt-8">Our long-term ambition is to develop the expertise, methods and institutional memory required to help established organizations address increasingly significant commercial challenges. That future will be earned through the quality of the work we deliver today.</p>
              <p className="mt-6 max-w-2xl text-sm leading-[1.85] text-white/55">This is the institution we intend to build over the coming decades. Each of the commitments below is a direction for our development, with progress to be demonstrated through actual work.</p>
            </Reveal>
          </div>
          <ol className="mt-14 border-t border-white/15 lg:ml-[33.333%]">
            {ambitions.map((ambition, index) => (
              <li key={ambition.title} className="border-b border-white/15 py-7 sm:py-8">
                <Reveal className="grid gap-4 sm:grid-cols-[2rem_1fr] sm:gap-6">
                  <span className="text-xs text-gold-light">0{index + 1}</span>
                  <div className="grid gap-3 xl:grid-cols-[1fr_1.4fr] xl:gap-8"><h3 className="font-display text-2xl leading-tight">{ambition.title}</h3><p className="text-sm leading-[1.85] text-white/60">{ambition.description}</p></div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <StrategyCTA eyebrow="Begin with what matters" title="What should work better in your business?" description="Tell us the objective, the current process and where you see friction. We can begin by understanding whether there is a useful piece of work to do." label="Discuss a business objective" secondary={{ href: "/approach", label: "How we approach the work" }} />
    </>
  );
}
