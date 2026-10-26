import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import PageIntro from "@/components/strategy/PageIntro";
import StrategyCTA from "@/components/strategy/StrategyCTA";
import { processSteps } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/site";

const description =
  "How Elevantra Studios connects business understanding, disciplined implementation and honest evaluation, with clear scope, review points and handover.";
const canonical = absoluteUrl("/approach");

export const metadata: Metadata = {
  title: "Our Approach — Understand, Implement, Measure & Improve",
  description,
  ...(canonical && { alternates: { canonical } }),
  openGraph: {
    type: "website",
    title: `Our Approach | ${siteName}`,
    description,
    siteName,
    ...(canonical && { url: canonical }),
  },
  twitter: {
    card: "summary_large_image",
    title: `Our Approach | ${siteName}`,
    description,
  },
};

const stages = [
  {
    number: "01",
    id: "understand-and-diagnose",
    title: "Understand & Diagnose",
    question: "What is happening, and why does it matter?",
    paragraphs: [
      "Start with the business objective. Map the current process, the people involved and the points where an enquiry, decision or handoff becomes difficult. Examine available records, recurring questions and previous attempts to improve the situation. Discuss the consequences of leaving it unchanged, identifying estimates as estimates.",
      "A client's account, an observed fact and an explanation we want to test are different kinds of information. Keep them separate. Where evidence is missing, record the gap and agree what would help resolve it before recommending an intervention.",
    ],
    output:
      "A documented understanding of the agreed problem, relevant constraints and evidence gaps.",
    checkpoint:
      "Confirm the objective and what is known. Decide whether there is enough evidence to recommend work or whether further investigation is needed.",
  },
  {
    number: "02",
    id: "design-and-implement",
    title: "Design & Implement",
    question: "What is justified, and what will it take to deliver?",
    paragraphs: [
      "Choose an intervention that fits the problem and our capabilities. It might be a website, a digital showroom, a clearer enquiry process or an improvement to an existing workflow. Consider how it will fit the people, information and tools already in use.",
      "Before production, agree the scope, exclusions, responsibilities, technical requirements, milestones, payment terms and acceptance criteria. Use working previews and relevant tests to review the implementation. Changes to scope need an agreed effect on cost and timing before additional work begins.",
    ],
    output:
      "A tested deliverable addressing the agreed scope, with the documentation and access needed for its handover.",
    checkpoint:
      "Review against the agreed criteria. Record approval, resolve in-scope issues and confirm the payment and launch conditions before going live.",
  },
  {
    number: "03",
    id: "measure-and-evaluate",
    title: "Measure & Evaluate",
    question: "What changed, and what can the evidence support?",
    paragraphs: [
      "Define success before describing something as an improvement. Where measurement is appropriate and agreed, establish the indicator, its definition, the source and the observation period. A qualified enquiry, a substantive reply, an attended inspection and a completed process each tell a different story.",
      "Use a baseline where one exists and report its limits. Changes in stock, pricing, campaigns, seasonality or staff availability may also affect the result. A contact-button click does not establish a sale. When evidence is qualitative, client-reported or insufficient, identify it clearly.",
    ],
    output:
      "An evidence-based assessment of the agreed outcomes, including what remains uncertain or has not been measured.",
    checkpoint:
      "Review the evidence together. Separate observed changes from assumptions about their cause before deciding what deserves attention next.",
  },
  {
    number: "04",
    id: "improve-and-evolve",
    title: "Improve & Evolve",
    question: "Is another intervention worth making?",
    paragraphs: [
      "Use what has been learned to decide whether further work is justified. Prioritise an opportunity by its likely value, evidence, effort and operational demands. A useful next step may be a small adjustment, a separate project or allowing more time to observe the existing change.",
      "Some engagements end with a complete handover. Others may warrant continued support or a focused round of improvement, agreed separately. Confirm ownership, access, responsibilities and any support limits so the client understands how to operate the system after delivery.",
    ],
    output:
      "A prioritised, commercially justified next step where needed, or a clear handover when the agreed work is complete.",
    checkpoint:
      "Choose whether to hand over, observe or commission further work. Ongoing support is an option, not a condition of a successful engagement.",
  },
] as const;

const recommendationCriteria = [
  {
    title: "A problem the client recognises.",
    description:
      "Management agrees that the issue occurs and deserves attention. An interesting technical possibility alone is not a reason to begin a project.",
  },
  {
    title: "Commercially meaningful value.",
    description:
      "The likely benefit should justify the cost, time and disruption involved. Where that value is uncertain, make the uncertainty part of the decision.",
  },
  {
    title: "A proportionate solution.",
    description:
      "Consider a process adjustment, clearer information and better use of existing tools alongside new software. The complexity needs a business reason.",
  },
  {
    title: "A feasible implementation.",
    description:
      "Technical feasibility sits alongside staff capacity, content, access, maintenance and ownership. The business needs to be able to use what is delivered.",
  },
  {
    title: "An appropriate standard of evaluation.",
    description:
      "Agree what can be observed, over which period and with what limitations. The available evidence should support the claims made about the work.",
  },
  {
    title: "The competence to deliver.",
    description:
      "Check that the agreed work fits our capabilities and capacity. Identify where specialist advice or a different provider is needed before committing.",
  },
] as const;

const standards = [
  {
    title: "Honest commercial expectations",
    description:
      "Agree the objective and the work we can take responsibility for. Arbitrary percentage increases in sales are not something we guarantee.",
  },
  {
    title: "Technology with a reason",
    description:
      "A new system needs to serve the agreed problem. Technical novelty is not, on its own, a recommendation.",
  },
  {
    title: "Clear professional boundaries",
    description:
      "We do not claim expertise in every part of a company. Questions beyond our remit need the appropriate specialist.",
  },
  {
    title: "A handover that stands on its own",
    description:
      "Clarify ownership and ongoing responsibilities. A clean handover is a valid endpoint; a long-term retainer is not compulsory.",
  },
  {
    title: "Evidence before claims",
    description:
      "Distinguish observations, client reports and working assumptions. A proposed benefit becomes a reported result only when evidence supports it.",
  },
] as const;

const engagement = [
  {
    title: "Initial conversation",
    description:
      "Describe the business objective, the current situation and the change you are considering. Establish whether there is a useful conversation to continue.",
  },
  {
    title: "Qualification",
    description:
      "Clarify the problem, decision-maker, fit, likely budget, timing and practical constraints before committing to custom work.",
  },
  {
    title: "Agreed scope",
    description:
      "Set the proposed boundaries: what is included, what is excluded, the dependencies and how the work will be reviewed.",
  },
  {
    title: "Proposal",
    description:
      "Document fees, responsibilities, milestones and payment terms. Production begins after written agreement, the agreed initial payment and the necessary inputs.",
  },
  {
    title: "Implementation",
    description:
      "Work through the agreed milestones with previews, concise progress updates and review points. Record decisions and agree scope changes in writing.",
  },
  {
    title: "Acceptance",
    description:
      "Check the deliverable against the agreed criteria, record approval and complete the payment and handover arrangements. Distinguish an in-scope fix from a new request.",
  },
  {
    title: "Optional further improvement",
    description:
      "Use the available evidence to decide whether separate support or another focused intervention makes sense. The engagement can also end with handover.",
  },
] as const;

const relatedPages = [
  {
    href: "/commercial-challenges",
    eyebrow: "What we examine",
    title: "Recognise the friction.",
    description:
      "Explore the commercial questions that can sit behind a request for a new website or system.",
  },
  {
    href: "/services",
    eyebrow: "What we can implement",
    title: "Explore our capabilities.",
    description:
      "See how websites, digital experiences and practical systems can support an agreed objective.",
  },
  {
    href: "/work",
    eyebrow: "How we document the work",
    title: "Read the context.",
    description:
      "Look at selected work and clearly labelled studies, with their decisions, status and limitations.",
  },
] as const;

export default function ApproachPage() {
  return (
    <>
      <PageIntro
        eyebrow="Our approach"
        title={<>We don&apos;t start with what to build. <span className="italic text-gold-light">We start with what matters.</span></>}
        description="Our approach connects business understanding with practical implementation. Before recommending a system, we seek to understand the objective, examine the current process and establish what a successful improvement would actually mean."
        primary={{ href: "/contact", label: "Start a Conversation" }}
        secondary={{ href: "#framework", label: "Explore the approach" }}
      />

      <nav aria-label="The four stages of our approach" className="container-x pb-16 md:pb-24">
        <ol className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-gold/30 pt-6 lg:grid-cols-4 lg:gap-x-10">
          {stages.map((stage) => (
            <li key={stage.id}>
              <a href={`#${stage.id}`} className="group flex min-h-24 flex-col items-start justify-between gap-4 py-2">
                <span className="flex w-full items-center justify-between text-xs text-gold">
                  <span>{stage.number}</span>
                  <ArrowDownRight size={17} aria-hidden="true" className="text-white/40 transition-colors group-hover:text-gold-light" />
                </span>
                <span className="max-w-[12ch] font-display text-xl leading-tight text-white/75 transition-colors group-hover:text-gold-light sm:text-2xl">{stage.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="framework" aria-labelledby="framework-title" className="container-x pb-24 md:pb-32">
        <Reveal className="editorial-grid pb-12 md:pb-16">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">The framework</p>
            <h2 id="framework-title" className="heading-display max-w-[18ch] text-[clamp(2.4rem,4.5vw,4.25rem)] leading-[1.08]">Understanding is part of the work.</h2>
          </div>
          <p className="max-w-md self-end text-base leading-relaxed text-white/65 lg:col-span-4 lg:col-start-9">Four connected stages describe how we intend to join commercial reasoning with delivery. The depth of each stage, its outputs and its review points are agreed for the particular engagement.</p>
        </Reveal>

        <div className="border-t border-white/15">
          {stages.map((stage) => (
            <section key={stage.id} id={stage.id} aria-labelledby={`${stage.id}-title`} className="editorial-grid border-b border-white/15 py-12 md:py-16 lg:py-20">
              <Reveal className="lg:col-span-3">
                <span aria-hidden="true" className="font-display text-6xl leading-none tracking-tight text-gold/70 md:text-8xl">{stage.number}</span>
                <p className="mt-6 max-w-[20ch] text-sm leading-relaxed text-white/50">{stage.question}</p>
              </Reveal>
              <Reveal delay={0.05} className="min-w-0 lg:col-span-8 lg:col-start-5">
                <h3 id={`${stage.id}-title`} className="font-display text-[clamp(2rem,3.8vw,3.6rem)] leading-[1.1] tracking-tight"><span className="sr-only">Stage {stage.number}: </span>{stage.title}</h3>
                <div className="reading-copy mt-7 max-w-3xl">
                  {stage.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <dl className="mt-8 grid gap-7 border-t border-gold/20 pt-6 sm:grid-cols-2 sm:gap-9">
                  <div>
                    <dt className="eyebrow">Potential output</dt>
                    <dd className="mt-3 text-sm leading-relaxed text-white/80">{stage.output}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/50">Decision point</dt>
                    <dd className="mt-3 text-sm leading-relaxed text-white/65">{stage.checkpoint}</dd>
                  </div>
                </dl>
              </Reveal>
            </section>
          ))}
        </div>

        <aside aria-labelledby="delivery-title" className="editorial-grid border-b border-white/15 py-8 md:py-10">
          <p id="delivery-title" className="eyebrow lg:col-span-3">For website delivery</p>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="font-display text-xl leading-relaxed text-white/85 md:text-2xl">{processSteps.map((step) => step.title).join(" → ")}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">For website projects, these are the practical milestones: an agreed brief, reviewed direction, a working preview, testing, launch approval and handover. The project scope determines which outputs and checkpoints apply.</p>
          </div>
        </aside>
      </section>

      <section aria-labelledby="recommendation-title" className="border-y border-white/10 bg-[#0c0c09] py-20 md:py-28">
        <div className="container-x editorial-grid">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-5">The decision criteria</p>
            <h2 id="recommendation-title" className="heading-display max-w-[15ch] text-[clamp(2.4rem,4.2vw,4rem)] leading-[1.08]">A recommendation has to <span className="italic text-gold-light">earn its place.</span></h2>
            <p className="mt-7 max-w-sm text-base leading-relaxed text-white/60">These are the questions we intend to hold a recommendation against. A proposal should explain the reason to act as clearly as the work itself.</p>
          </Reveal>
          <ol className="divide-y divide-white/15 border-y border-white/15 lg:col-span-7 lg:col-start-6">
            {recommendationCriteria.map((criterion, index) => (
              <li key={criterion.title} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-4 py-7 sm:gap-6 md:py-8">
                <span aria-hidden="true" className="pt-1 font-display text-sm text-gold">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-2xl leading-tight tracking-tight text-white/90">{criterion.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{criterion.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="standards-title" className="container-x py-24 md:py-32">
        <div className="editorial-grid">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-5">Professional discipline</p>
            <h2 id="standards-title" className="heading-display max-w-[15ch] text-[clamp(2.4rem,4.2vw,4rem)] leading-[1.08]">Clear standards. <span className="italic text-gold-light">Credible promises.</span></h2>
            <p className="mt-8 max-w-sm border-l border-gold/40 pl-6 font-display text-xl leading-relaxed text-white/75 md:text-2xl">Confidence in the work begins with being precise about what we can take responsibility for.</p>
          </Reveal>
          <dl className="space-y-7 lg:col-span-6 lg:col-start-7">
            {standards.map((standard) => (
              <div key={standard.title} className="border-t border-white/15 pt-5">
                <dt className="text-base font-medium text-white/90">{standard.title}</dt>
                <dd className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{standard.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="engagement-title" className="border-y border-white/10 py-24 md:py-32">
        <div className="container-x editorial-grid">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-5">How clients work with us</p>
            <h2 id="engagement-title" className="heading-display max-w-[15ch] text-[clamp(2.4rem,4.2vw,4rem)] leading-[1.08]">A clear route from conversation to handover.</h2>
            <p className="mt-7 max-w-sm text-base leading-relaxed text-white/60">The agreement makes the work concrete. Scope, dates, review responsibilities, payment terms and support are established for the engagement.</p>
          </Reveal>
          <ol className="lg:col-span-7 lg:col-start-6">
            {engagement.map((step, index) => (
              <li key={step.title} className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-4 border-t border-white/15 py-7 sm:gap-6">
                <span aria-hidden="true" className="pt-1 font-display text-sm text-gold">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-2xl leading-tight text-white/90">{step.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{step.description}</p>
                  {index === engagement.length - 1 && <p className="mt-4 text-[0.65rem] uppercase tracking-[0.16em] text-gold-light">Separately agreed, where justified</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="learning-title" className="container-x py-24 md:py-32">
        <Reveal className="editorial-grid">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5">The value of learning</p>
            <h2 id="learning-title" className="heading-display max-w-[17ch] text-[clamp(2.4rem,4.2vw,4rem)] leading-[1.08]">A method that should get better <span className="italic text-gold-light">with the work.</span></h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="reading-copy">
              <p>We are building the habit of documenting the problem, the alternatives considered, the reasons for a decision and what the evidence later shows. The aim is to improve our judgement and delivery methods as experience accumulates.</p>
              <p>Over time, we want that discipline to become institutional knowledge: practical lessons that help us recognise recurring problems and make better decisions in future engagements. That expertise has to be earned through the work.</p>
            </div>
            <p className="mt-7 border-t border-white/15 pt-5 text-sm leading-relaxed text-white/55">Client information stays private. Public names, screenshots and outcome claims require separate permission. Learning from an engagement should respect those boundaries.</p>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="related-title" className="container-x pb-24 md:pb-32">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-t border-gold/25 pt-5">
          <h2 id="related-title" className="eyebrow">Explore the thinking in context</h2>
          <Link href="/who-we-work-with" className="text-link text-xs">See where we fit <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {relatedPages.map((page) => (
            <Link key={page.href} href={page.href} className="group min-w-0 border-t border-white/15 py-6">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/50">{page.eyebrow}</p>
              <h3 className="mt-5 flex items-start justify-between gap-4 font-display text-2xl leading-tight text-white/85 transition-colors group-hover:text-gold-light">{page.title}<ArrowUpRight size={18} aria-hidden="true" className="mt-1 shrink-0 text-gold" /></h3>
              <p className="mt-4 text-sm leading-relaxed text-white/55">{page.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <StrategyCTA
        eyebrow="Begin with the objective"
        title="The objective comes first. The solution follows."
        description="Tell us what your business is trying to improve, how the process works today and where the uncertainty lies. That is a useful place to start."
        label="Discuss a Business Objective"
        href="/contact"
        secondary={{ href: "/commercial-challenges", label: "Explore commercial challenges" }}
      />
    </>
  );
}
