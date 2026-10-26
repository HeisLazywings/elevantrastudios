import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { services, processSteps } from "@/lib/data";
import Reveal from "@/components/Reveal";
import PageIntro from "@/components/strategy/PageIntro";
import StrategyCTA from "@/components/strategy/StrategyCTA";
import { absoluteUrl } from "@/lib/site";

const description = "Websites, enquiry flows and practical business tools built around a clear objective. Explore Elevantra Studios’ capabilities and optional support.";

export const metadata: Metadata = {
  title: "Services — Commercial Systems & Digital Experiences",
  description,
  ...(absoluteUrl("/services") ? { alternates: { canonical: absoluteUrl("/services") } } : {}),
  openGraph: {
    title: "Services — Elevantra Studios",
    description,
    type: "website",
    ...(absoluteUrl("/services") ? { url: absoluteUrl("/services") } : {}),
  },
};

const investmentQuestions = [
  { label: "Objective", question: "What is the business trying to improve?" },
  { label: "Evidence", question: "Where does the friction occur, and what is known about its impact?" },
  { label: "Proportion", question: "Would a simpler process or a smaller intervention be sufficient?" },
  { label: "Feasibility", question: "Can the work be delivered within the available budget, access and responsibilities?" },
];

const faqs = [
  { q: "Do we need to know which service to ask for?", a: "Start with the objective and the process you want to improve. We can discuss what is known, what needs investigation and whether the work fits our capabilities before proposing a particular deliverable." },
  { q: "Can you work with our existing website or brand?", a: "Yes. We can work within an existing brand system, refine a current experience or scope a specific improvement. The recommendation depends on the condition of the current system and the objective; a complete rebuild needs a clear reason." },
  { q: "How long does a project take, and how is it priced?", a: "Timing and pricing depend on the agreed scope, content readiness, integrations and review process. A project proposal sets out the deliverables, responsibilities, milestones and payment terms before work begins." },
  { q: "Is ongoing support required?", a: "Support is optional and agreed separately. Some projects conclude with a complete handover; others need defined maintenance, monitoring or later improvements. You can review those arrangements before committing to them." },
  { q: "Will a new system guarantee more sales?", a: "We define the intended improvement and, where appropriate, agree how to evaluate it. Sales also depend on the offer, demand, pricing and the way the business operates. We report what the evidence supports and make those limits clear." },
];

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Our capabilities"
        title={<>The objective determines<br /><span className="italic text-gold-light">what we build.</span></>}
        description="Websites and digital experiences remain our foundation. We connect that capability to the information, enquiry journeys and practical business processes a customer or team needs to use."
        primary={{ href: "/contact", label: "Discuss a business objective" }}
        secondary={{ href: "/commercial-challenges", label: "Explore commercial challenges" }}
      />

      <section className="container-x py-20 md:py-28" aria-labelledby="capabilities-heading">
        <div className="grid gap-8 border-t border-white/15 pt-8 lg:grid-cols-12 lg:gap-16 lg:pt-10">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">What we can deliver</p>
            <h2 id="capabilities-heading" className="heading-display mt-6 max-w-[17ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.1]">Practical capability.<br /><span className="text-white/60">A clear reason to use it.</span></h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <div className="reading-copy"><p>Corporate websites, focused landing pages, portfolios, digital catalogues, e-commerce and content systems are part of our delivery foundation.</p><p>Enquiry flows and lightweight business tools can extend that work where the need is clear. The proposed scope depends on the process, the technical requirements and what we can responsibly deliver. We establish those boundaries before recommending an investment.</p></div>
          </Reveal>
        </div>
        <nav aria-label="Explore our capabilities" className="mt-12 grid border-y border-white/15 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {services.map((service, index) => (
            <a key={service.id} href={`#${service.id}`} className="group flex min-h-28 items-start justify-between gap-5 border-b border-white/10 py-5 sm:px-5 sm:even:border-l lg:border-b-0 lg:border-l lg:first:border-l-0 lg:first:pl-0">
              <span><span className="block text-[10px] text-gold-light">0{index + 1}</span><span className="mt-3 block max-w-[22ch] text-sm leading-relaxed text-white/75 transition-colors group-hover:text-gold-light">{service.title}</span></span>
              <ArrowDown size={15} className="mt-1 shrink-0 text-white/40 transition-colors group-hover:text-gold-light" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </section>

      <div className="container-x pb-20 md:pb-28">
        {services.map((service, index) => (
          <section key={service.id} id={service.id} aria-labelledby={`${service.id}-heading`} className="scroll-mt-28 border-t border-white/15 py-12 md:py-16">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-5"><p className="eyebrow">Capability 0{index + 1}</p><h2 id={`${service.id}-heading`} className="heading-display mt-6 max-w-[16ch] text-[clamp(2.2rem,4vw,3.7rem)] leading-[1.1]">{service.title}</h2><p className="mt-7 max-w-lg text-base leading-[1.85] text-white/65">{service.description}</p></Reveal>
              <Reveal delay={0.06} className="lg:col-span-6 lg:col-start-7">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/55">Delivery can include</h3>
                <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">{service.deliverables.map((deliverable) => <li key={deliverable} className="flex gap-4 py-4 text-sm leading-relaxed text-white/75"><span aria-hidden="true" className="mt-[0.65em] h-px w-3 shrink-0 bg-gold/70" /><span>{deliverable}</span></li>)}</ul>
                <p className="mt-6 border-l border-gold/40 pl-5 text-xs leading-[1.9] text-white/55">{service.scopeNote}</p>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      <section className="border-y border-white/10 bg-bg-secondary/40 py-20 md:py-28" aria-labelledby="investment-heading">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5"><p className="eyebrow">How we determine the need</p><h2 id="investment-heading" className="heading-display mt-6 max-w-[16ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.1]">Capability alone is not a reason to build.</h2><p className="mt-8 max-w-lg text-base leading-[1.9] text-white/65">A useful recommendation connects a recognized problem to a proportionate response. We begin with the objective, examine the current process and identify the information needed to make a responsible decision.</p><p className="mt-6 max-w-lg text-sm leading-[1.9] text-white/55">The result may be a scoped build, an improvement to an existing system, a workflow adjustment or a referral where specialist expertise is required.</p><Link href="/approach" className="text-link mt-8">Explore our approach <ArrowUpRight size={16} aria-hidden="true" /></Link></Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <dl className="divide-y divide-white/15 border-y border-white/15">{investmentQuestions.map((question, index) => <div key={question.label} className="grid gap-3 py-7 sm:grid-cols-[6rem_1fr] sm:gap-6"><dt className="text-[10px] uppercase tracking-[0.18em] text-gold-light"><span className="mr-2 text-white/55">0{index + 1}</span>{question.label}</dt><dd className="font-display text-2xl leading-snug text-white/85 sm:text-[1.7rem]">{question.question}</dd></div>)}</dl>
          </Reveal>
        </div>
      </section>

      <section className="container-x py-20 md:py-28" aria-labelledby="delivery-heading">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-3"><p className="eyebrow">A considered delivery rhythm</p></Reveal>
          <Reveal className="lg:col-span-8 lg:col-start-5"><h2 id="delivery-heading" className="heading-display max-w-[20ch] text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[1.1]">From agreed scope to a responsible handover.</h2><p className="mt-8 max-w-2xl text-base leading-[1.9] text-white/65">These six stages describe our usual delivery rhythm for digital projects. Your proposal defines the actual deliverables, dependencies and approval points. Any further support or improvement work is a separate agreement.</p></Reveal>
        </div>
        <ol className="mt-12 divide-y divide-white/15 border-y border-white/15 md:mt-16">
          {processSteps.map((step) => (
            <li key={step.n} className="py-8 md:py-10">
              <Reveal className="grid gap-7 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-2"><p className="text-[10px] tracking-[0.2em] text-gold-light">{step.n}</p><h3 className="mt-3 font-display text-2xl leading-tight">{step.title}</h3></div>
                <p className="text-sm leading-[1.85] text-white/65 md:col-span-4">{step.description}</p>
                <dl className="grid gap-5 sm:grid-cols-2 md:col-span-6 md:gap-7"><div><dt className="text-[10px] uppercase tracking-[0.18em] text-gold-light">Typical output</dt><dd className="mt-3 text-sm leading-relaxed text-white/75">{step.output}</dd></div><div><dt className="text-[10px] uppercase tracking-[0.18em] text-white/55">Review checkpoint</dt><dd className="mt-3 text-sm leading-relaxed text-white/60">{step.checkpoint}</dd></div></dl>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x pb-20 md:pb-28" aria-labelledby="services-questions-heading">
        <div className="grid gap-10 border-t border-white/15 pt-8 lg:grid-cols-12 lg:gap-16 lg:pt-10">
          <Reveal className="lg:col-span-4"><p className="eyebrow">Before we begin</p><h2 id="services-questions-heading" className="heading-display mt-6 text-4xl leading-[1.1] md:text-5xl">A few practical questions.</h2></Reveal>
          <Reveal delay={0.06} className="lg:col-span-7 lg:col-start-6"><dl className="divide-y divide-white/10">{faqs.map((faq, index) => <div key={faq.q} className={index === 0 ? "pb-7" : "py-7"}><dt className="font-display text-xl leading-snug text-white/90 md:text-2xl">{faq.q}</dt><dd className="mt-4 text-sm leading-[1.9] text-white/60">{faq.a}</dd></div>)}</dl></Reveal>
        </div>
      </section>

      <StrategyCTA eyebrow="Start with the objective" title="What is worth improving?" description="Bring us the business context and the friction you see. We can discuss the need, the fit and a sensible next step." label="Discuss a business objective" secondary={{ href: "/who-we-work-with", label: "See who we work with" }} />
    </>
  );
}
