import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import PageIntro from "@/components/strategy/PageIntro";
import StrategyCTA from "@/components/strategy/StrategyCTA";
import { getSiteArticles } from "@/lib/content";
import { absoluteUrl, siteName } from "@/lib/site";

export const dynamic = "force-dynamic";

const canonical = absoluteUrl("/commercial-challenges");
const description =
  "Explore where enquiries, follow-up, appointments and operational handoffs can create commercial friction, and how to decide whether an improvement is justified.";

export const metadata: Metadata = {
  title: "Commercial Challenges — Enquiries, Follow-up & Business Processes",
  description,
  ...(canonical ? { alternates: { canonical } } : {}),
  openGraph: {
    title: `Commercial Challenges | ${siteName}`,
    description,
    type: "website",
    siteName,
    ...(canonical ? { url: canonical } : {}),
  },
};

const distinctions = [
  {
    activity: "Attention",
    value: "Serious demand",
    question: "Are the people showing interest a realistic fit for the offer?",
  },
  {
    activity: "Enquiries",
    value: "Qualified opportunities",
    question: "Is there a relevant need, the ability to buy and a reason to proceed?",
  },
  {
    activity: "Sales activity",
    value: "Completed transactions",
    question: "Have conversations and quotations progressed to an agreed, completed purchase?",
  },
  {
    activity: "Recorded revenue",
    value: "Collected cash",
    question: "Has payment arrived under the agreed terms, or is an amount still outstanding?",
  },
  {
    activity: "Business growth",
    value: "Sustainable profitability",
    question: "Does the additional business contribute after the relevant costs are considered?",
  },
];

const breakdowns = [
  {
    id: "discovery",
    title: "Discovery without sufficient conversion.",
    description:
      "A business may attract visibility and enquiries while too few lead to purchases that justify the cost of acquiring and serving them. More attention alone may leave the same gap in place.",
    questions: [
      "Which sources bring people with a relevant need and realistic buying intent?",
      "Can a prospective customer understand the offer, its limits and the next step?",
      "Where do suitable enquiries stop progressing toward a purchase decision?",
    ],
    firstStep:
      "Review a manageable sample of enquiries against their sources and eventual outcomes. Establish what is known before changing the acquisition or website experience.",
  },
  {
    id: "follow-up",
    title: "Enquiries without effective follow-up.",
    description:
      "Questions and quotation requests can remain open for different reasons. The customer may be considering options, the timing may be wrong, or the next action may have no clear owner.",
    questions: [
      "Who owns the enquiry, and when should the next action happen?",
      "Can the team see what was discussed, promised and already sent?",
      "Does the follow-up reflect the customer's readiness and preferences?",
    ],
    firstStep:
      "Clarify ownership, record the next action and agree an appropriate follow-up rhythm. A shared record may be sufficient before a dedicated system is considered.",
  },
  {
    id: "confirmed-action",
    title: "Interest without confirmed action.",
    description:
      "Interest does not always become an attended inspection, appointment or consultation. A missed visit can reflect buyer intent, incomplete information, availability or an unclear confirmation process.",
    questions: [
      "Is the person ready for the proposed next step?",
      "Are availability, location and preparation requirements clear?",
      "How are requests confirmed, changed or cancelled?",
    ],
    firstStep:
      "Trace the route from a request to an attended visit. For a dealership, this could mean examining inspection information and confirmation before recommending a booking tool.",
  },
  {
    id: "coordination",
    title: "Orders without efficient coordination.",
    description:
      "Repeated questions, uncertain availability and manual handoffs can make an otherwise straightforward order harder to coordinate. The relevant issue may be how information is maintained or shared.",
    questions: [
      "Which information is repeatedly requested or copied between people?",
      "Who maintains availability, order details and customer instructions?",
      "Where does a handoff create uncertainty or unnecessary work?",
    ],
    firstStep:
      "Agree a dependable information source and responsibility for updates. Consider a catalogue, form or operational tool where the recurring process warrants one.",
  },
  {
    id: "completion",
    title: "Transactions without timely completion.",
    description:
      "A transaction can wait on an approval, missing documentation or an outstanding payment. These are different operational questions, each requiring its own context and responsible owner.",
    questions: [
      "What is outstanding, and who has the authority to resolve it?",
      "Are required records, approvals and agreed terms accessible?",
      "Does the delay come from a process gap or a specialist financial or legal matter?",
    ],
    firstStep:
      "Make the pending step and its owner visible. Accounting, credit policy, legal advice and debt recovery need appropriately qualified specialists where relevant.",
  },
];

const hypotheses = [
  {
    symptom: "“We need more customers.”",
    possibility:
      "Existing enquiries may not be becoming commercially worthwhile sales. Source quality, buying readiness or the cost of serving an order could matter.",
    question: "What happens to the enquiries already arriving?",
  },
  {
    symptom: "“We need a website.”",
    possibility:
      "Buyers may struggle to find dependable product information or reach the right person. An improved information process, an existing page or a new website could each be relevant.",
    question: "Which customer question or handoff needs to work better?",
  },
  {
    symptom: "“Our salespeople are not closing.”",
    possibility:
      "Qualification, follow-up ownership or the information available to the team may be unclear. A process issue can look like an individual performance issue.",
    question: "Does the team have a clear, workable route from enquiry to decision?",
  },
];

const criteria = [
  {
    title: "Evidence",
    question: "Does the problem actually occur?",
    detail:
      "Look for relevant records, repeated observations and the people involved. Separate a documented pattern from a single incident or an assumption.",
  },
  {
    title: "Impact",
    question: "What are the measurable consequences?",
    detail:
      "Consider time, avoidable work, missed opportunities or delayed completion. Use an appropriate baseline and acknowledge what cannot yet be measured.",
  },
  {
    title: "Priority",
    question: "Is this important enough to address now?",
    detail:
      "Management should recognise the objective and weigh it against other demands. A plausible improvement still needs a reason to take priority.",
  },
  {
    title: "Feasibility",
    question: "Can an intervention be implemented responsibly?",
    detail:
      "Check cost, access, ownership, adoption and technical scope. The proposed work must be practical for the business and within our competence.",
  },
];

const interventions = [
  {
    title: "A workflow adjustment",
    detail:
      "A named owner, a clearer handoff or a consistent confirmation step may address the immediate friction.",
  },
  {
    title: "Better customer information",
    detail:
      "Accurate product details, useful preparation guidance or a maintained source of availability information may be the missing piece.",
  },
  {
    title: "An appropriate digital tool",
    detail:
      "A website, digital showroom, enquiry flow or custom tool may be justified when the process, users and responsibilities are understood.",
  },
  {
    title: "Specialist assistance",
    detail:
      "Some issues call for an accountant, legal adviser or another specialist. The right recommendation should respect the limits of the engagement.",
  },
];

export default async function CommercialChallengesPage() {
  const relatedInsight = (await getSiteArticles()).find((article) =>
    /enquir|customer journey|discovery|credib|whatsapp/i.test(`${article.title} ${article.summary} ${article.category}`),
  );

  return (
    <>
      <PageIntro
        eyebrow="What we examine"
        title={<>The problem is not always a lack of <span className="italic text-gold-light">customers.</span></>}
        description="A business can attract attention, receive enquiries and make sales while still losing valuable opportunities through the way those interactions are handled. We examine where commercial processes create unnecessary friction, and whether a practical improvement is justified."
        primary={{ href: "/contact", label: "Discuss a commercial challenge" }}
        secondary={{ href: "/approach", label: "Explore our approach" }}
      />

      <section className="container-x pb-20 pt-8 md:pb-28 md:pt-12" aria-labelledby="activity-heading">
        <div className="editorial-grid border-t border-white/15 pt-8 md:pt-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-5">Activity & value</p>
            <h2 id="activity-heading" className="font-display text-4xl leading-[1.12] tracking-tight md:text-5xl">Activity does not always equal value.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
              Each stage tells you something different. A busy pipeline can be useful, but its volume alone cannot explain whether the business is moving toward the outcome it needs.
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
              These distinctions inform the commercial approach we are developing. They are questions to investigate with a business, rather than conclusions about its performance.
            </p>
          </Reveal>

          <Reveal className="min-w-0 lg:col-span-7 lg:col-start-6">
            <figure aria-labelledby="distinctions-caption">
              <div className="mb-4 grid grid-cols-[1fr_1.4fr] gap-6 text-[10px] uppercase tracking-[0.18em] text-white/50">
                <p>Visible activity</p>
                <p>What needs to be established</p>
              </div>
              <ol className="border-t border-white/15">
                {distinctions.map((item) => (
                  <li key={item.activity} className="grid grid-cols-[1fr_1.4fr] gap-6 border-b border-white/15 py-6 md:py-7">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-lg leading-snug text-white/90 md:text-xl">{item.activity}</p>
                      <ArrowRight size={16} aria-hidden="true" className="mt-1 shrink-0 text-gold/70" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gold-light">{item.value}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">{item.question}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <figcaption id="distinctions-caption" className="mt-6 border-l border-gold/50 pl-5 text-sm leading-relaxed text-white/60">
                Revenue, cash and profit answer different questions. A recorded sale may be unpaid; cash received may relate to earlier work; profit depends on the relevant costs and accounting period.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/10 bg-bg-secondary/40 py-20 md:py-28" aria-labelledby="breakdowns-heading">
        <div className="container-x">
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-5">Five points to examine</p>
              <h2 id="breakdowns-heading" className="font-display text-4xl leading-[1.1] tracking-tight md:text-5xl">Where opportunities<br className="hidden md:block" /> can break down.</h2>
            </div>
            <p className="max-w-xl self-end text-base leading-relaxed text-white/65 lg:col-span-5 lg:col-start-8">
              A process can work well in some places and create friction in others. These are possible areas for investigation; their relevance depends on the business, the evidence and the objective.
            </p>
          </Reveal>

          <ol className="border-b border-white/15">
            {breakdowns.map((item, index) => (
              <li key={item.id} id={item.id}>
                <Reveal>
                  <article className="grid gap-6 border-t border-white/15 py-10 md:py-12 lg:grid-cols-12 lg:gap-10" aria-labelledby={`${item.id}-heading`}>
                    <p className="font-display text-sm text-gold-light lg:col-span-1" aria-hidden="true">{String(index + 1).padStart(2, "0")}</p>
                    <div className="lg:col-span-4">
                      <h3 id={`${item.id}-heading`} className="max-w-sm font-display text-3xl leading-[1.15] tracking-tight md:text-4xl">{item.title}</h3>
                      <p className="mt-5 max-w-md text-sm leading-[1.85] text-white/65">{item.description}</p>
                    </div>
                    <div className="lg:col-span-6 lg:col-start-7">
                      <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">Questions worth examining</p>
                      <ul className="space-y-3">
                        {item.questions.map((question) => (
                          <li key={question} className="flex gap-3 text-sm leading-relaxed text-white/80">
                            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-gold" />
                            {question}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 border-l border-gold/35 pl-5">
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gold-light">A possible first step</p>
                        <p className="text-sm leading-relaxed text-white/65">{item.firstStep}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-20 md:py-28" aria-labelledby="symptoms-heading">
        <Reveal className="editorial-grid">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5">A starting point for enquiry</p>
            <h2 id="symptoms-heading" className="font-display text-4xl leading-[1.1] tracking-tight md:text-5xl">Symptoms are not<br /> root causes.</h2>
          </div>
          <div className="max-w-xl lg:col-span-6 lg:col-start-7">
            <p className="font-display text-xl leading-relaxed text-white/85 md:text-2xl">The first description of a problem is a place to begin, rather than a diagnosis.</p>
            <p className="mt-5 text-sm leading-relaxed text-white/65">The examples below are hypothetical. A company's internal reality can only be understood through a conversation, relevant evidence and the people involved in the work.</p>
          </div>
        </Reveal>

        <div className="mt-12 border-y border-gold/25 bg-[#10100c] px-5 md:px-10">
          <p className="eyebrow border-b border-gold/20 py-5">Hypothetical examples · Not client diagnoses</p>
          <ol className="divide-y divide-white/10">
            {hypotheses.map((item) => (
              <li key={item.symptom}>
                <Reveal className="grid gap-7 py-9 md:py-11 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-5">
                    <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/50">The stated symptom</p>
                    <blockquote className="max-w-md font-display text-2xl leading-snug tracking-tight text-[#eee6d7] md:text-3xl">{item.symptom}</blockquote>
                  </div>
                  <div className="lg:col-span-6 lg:col-start-7">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-gold-light">A possible underlying issue</p>
                    <p className="text-sm leading-relaxed text-white/70">{item.possibility}</p>
                    <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/90">{item.question}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-white/10 py-20 md:py-28" aria-labelledby="criteria-heading">
        <div className="container-x editorial-grid">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-5">The case for action</p>
            <h2 id="criteria-heading" className="font-display text-4xl leading-[1.12] tracking-tight md:text-5xl">Does the problem justify an intervention?</h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65">A proposed engagement should pass four practical checks. The decision includes whether an improvement is worth doing now, and what would be needed to do it responsibly.</p>
          </Reveal>
          <div className="grid gap-x-10 md:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {criteria.map((item, index) => (
              <Reveal key={item.title} className="border-t border-white/15 pb-10 pt-5">
                <p className="mb-5 text-xs text-gold-light" aria-hidden="true">0{index + 1}</p>
                <h3 className="font-display text-3xl tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-white/90">{item.question}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{item.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 md:py-28" aria-labelledby="proportionate-heading">
        <div className="editorial-grid">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-5">Proportionate by design</p>
            <h2 id="proportionate-heading" className="max-w-lg font-display text-4xl leading-[1.12] tracking-tight md:text-5xl">The right solution might be simpler than expected.</h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65">The complexity of the intervention should match the problem. Our technical capabilities are part of the answer when a digital implementation is justified.</p>
            <Link href="/services" className="text-link mt-5">Explore our capabilities <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </Reveal>
          <dl className="divide-y divide-white/15 border-y border-white/15 lg:col-span-6 lg:col-start-7">
            {interventions.map((item) => (
              <Reveal key={item.title} className="py-6 md:py-7">
                <dt className="font-display text-2xl tracking-tight">{item.title}</dt>
                <dd className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">{item.detail}</dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {relatedInsight && (
          <Reveal className="mt-16 border-t border-white/15 pt-7 md:mt-20">
            <div className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-10">
              <p className="eyebrow">Related thinking</p>
              <Link href={`/insights/${relatedInsight.slug}`} className="text-link items-start justify-between gap-6 font-display text-xl leading-relaxed md:text-2xl">
                {relatedInsight.title}
                <ArrowUpRight size={20} aria-hidden="true" className="mt-1.5 shrink-0" />
              </Link>
            </div>
          </Reveal>
        )}
      </section>

      <nav className="container-x grid gap-8 pb-20 md:grid-cols-2 md:gap-16 md:pb-28" aria-label="Explore working with Elevantra">
        <Reveal className="border-t border-white/15 pt-6">
          <p className="mb-3 text-xs text-white/55">From the question to the work</p>
          <Link href="/approach" className="text-link font-display text-2xl">Explore our approach <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </Reveal>
        <Reveal className="border-t border-white/15 pt-6">
          <p className="mb-3 text-xs text-white/55">Commercial relevance & readiness</p>
          <Link href="/who-we-work-with" className="text-link font-display text-2xl">See who we work with <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </Reveal>
      </nav>

      <StrategyCTA
        eyebrow="Begin with the objective"
        title="A better solution begins with a better understanding of the problem."
        description="Tell us what your business is trying to improve, what is getting in the way and what you have already tried. The first conversation helps establish whether there is a relevant next step."
        label="Tell us what you're trying to improve"
        href="/contact"
        secondary={{ href: "/approach", label: "How we approach the work" }}
      />
    </>
  );
}
