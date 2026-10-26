import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import PageIntro from "@/components/strategy/PageIntro";
import StrategyCTA from "@/components/strategy/StrategyCTA";
import CommercialJourney from "@/components/strategy/CommercialJourney";
import { getSiteArticles, getSiteProjects } from "@/lib/content";
import { absoluteUrl, siteName } from "@/lib/site";

const canonical = absoluteUrl("/who-we-work-with");
const description =
  "Who Elevantra Studios is for: established businesses with active customer journeys, a meaningful commercial objective, and the readiness to implement a practical improvement.";

export const metadata: Metadata = {
  title: "Who We Work With — Established Businesses & Commercial Fit",
  description,
  ...(canonical ? { alternates: { canonical } } : {}),
  openGraph: {
    title: `Who We Work With | ${siteName}`,
    description,
    type: "website",
    ...(canonical ? { url: canonical } : {}),
  },
};

export const dynamic = "force-dynamic";

const fitCharacteristics = [
  {
    title: "Existing paying customers",
    detail: "There is real commercial activity to understand, with customers already buying from the business.",
  },
  {
    title: "An offer with established demand",
    detail: "The starting point is a product or service people already want, with a reason to improve how it reaches them.",
  },
  {
    title: "A process we can examine",
    detail: "Enquiries, quotations, visits, orders or another recurring journey make the question concrete.",
  },
  {
    title: "A specific management objective",
    detail: "The people responsible are willing to discuss what they want to change and why it matters.",
  },
  {
    title: "A problem worth investing in",
    detail: "Its consequences are important enough to consider the time, attention and cost of addressing it.",
  },
  {
    title: "Readiness to put changes into practice",
    detail: "The business can provide the information, staff involvement and resources an agreed intervention needs.",
  },
  {
    title: "A decision-maker who can authorise work",
    detail: "Someone can agree the scope, resolve priorities and take responsibility for the client side of delivery.",
  },
] as const;

const dealershipJourney = [
  { title: "Vehicle discovery", detail: "A prospective buyer finds a vehicle or dealership." },
  { title: "Buyer enquiry", detail: "Interest becomes a question for the team." },
  { title: "Qualification", detail: "Needs, readiness and practical constraints become clearer." },
  { title: "Inspection request", detail: "The buyer asks about a suitable viewing." },
  { title: "Attended inspection", detail: "A requested visit becomes an actual inspection." },
  { title: "Purchase decision", detail: "The buyer weighs the vehicle, terms and suitability." },
] as const;

const dealershipQuestions = [
  {
    title: "Accurate vehicle information",
    detail: "Can buyers find relevant specifications, location and availability, with a clear owner for checking and updating those details?",
  },
  {
    title: "Enquiries with useful context",
    detail: "Does an enquiry identify the vehicle and the buyer’s question, and reach the person responsible for responding?",
  },
  {
    title: "Proportionate buyer qualification",
    detail: "What would help the team understand readiness and needs without collecting unnecessary sensitive information?",
  },
  {
    title: "Inspection arrangements",
    detail: "Who confirms the vehicle, time and location, and how are changes or unanswered requests handled?",
  },
  {
    title: "Follow-up ownership",
    detail: "Is the next action clear, with enough context for the responsible person to continue the conversation?",
  },
  {
    title: "A useful digital showroom",
    detail: "Which parts of the buying journey would benefit from clearer product information or a better digital handoff?",
  },
] as const;

const businessContexts = [
  {
    title: "Distribution & product businesses",
    detail: "Where customers need dependable product information, a clearer route to quotations, or better coordination between an enquiry and the team handling supply. A catalogue or a lightweight operational tool may be appropriate when the process supports it.",
    question: "Can the right product information reach the right person at the right stage?",
  },
  {
    title: "Hospitality & venues",
    detail: "Where availability questions, booking requests and customer preparation create an identifiable workflow. The opportunity may involve clearer information and a more useful handoff to staff, with availability still confirmed through the business’s actual process.",
    question: "What should a guest understand before the booking conversation begins?",
  },
  {
    title: "Schools & education providers",
    detail: "Where prospective parents need to understand an institution, find admissions information and know what happens next. Clear communication and a manageable enquiry route can be relevant when they support the school’s real administrative responsibilities.",
    question: "Can a parent find trustworthy information and understand the next step?",
  },
  {
    title: "Other established service businesses",
    detail: "Where a specific customer journey matters commercially: understanding a service, requesting a quotation, arranging an appointment, or continuing a conversation. Fit depends on a defined objective and work we are competent to deliver.",
    question: "Which customer decision or handoff would be worth making clearer?",
  },
] as const;

const engagementLimits = [
  {
    title: "Sales guarantees without shared execution",
    detail: "We can agree a deliverable and how to assess it. Commercial results also depend on the offer, market conditions and follow-through by the business.",
  },
  {
    title: "Expertise outside our current scope",
    detail: "Where an objective needs capabilities we do not have, a narrower engagement or a suitable specialist may be the responsible next step.",
  },
  {
    title: "A system without a clear business purpose",
    detail: "A technology preference alone is not enough to justify building. The proposed work needs an understandable purpose and a proportionate scope.",
  },
  {
    title: "An engagement the business is not ready to support",
    detail: "If the necessary time, resources or internal ownership are unavailable, it may be better to resolve those conditions before committing to implementation.",
  },
  {
    title: "Expectations larger than the agreed work",
    detail: "A focused development project should have focused acceptance criteria. It cannot responsibly stand in for a company-wide transformation programme.",
  },
] as const;

const conversationPrompts = [
  { title: "What does your business do?", detail: "Your offer, customers and where you operate." },
  { title: "What are you working toward?", detail: "The commercial objective or decision that matters." },
  { title: "What is getting in the way?", detail: "What you observe, and what is still uncertain." },
  { title: "What have you already tried?", detail: "Any changes made and what you noticed afterwards." },
] as const;

export default async function WhoWeWorkWithPage() {
  // These readers return public content only, including publication approval
  // checks for client engagements. Never use local drafts or admin queries here.
  const [projects, articles] = await Promise.all([getSiteProjects(), getSiteArticles()]);
  const automotiveConcept = projects.find(
    (project) => project.slug === "dbc-automobiles" && project.designation === "Concept Demonstration",
  );
  const publishedClientProject = projects.find(
    (project) => project.designation === "Client engagement" && project.cmsEntry?.publication_approved === true,
  );
  const journeyArticle = articles.find((article) => article.slug === "discovery-to-enquiry");

  return (
    <>
      <PageIntro
        eyebrow="Who we work with"
        title={<>For businesses already in <span className="italic text-gold-light">motion.</span></>}
        description="We focus on established, revenue-generating businesses with real customers, active commercial processes, and a meaningful reason to make those processes work better."
        primary={{ href: "#fit-conversation", label: "Explore whether we’re a fit" }}
        secondary={{ href: "/approach", label: "Explore our approach" }}
      />

      <section className="container-x pb-24 md:pb-32" aria-labelledby="fit-characteristics-title">
        <div className="grid gap-10 border-t border-white/15 pt-8 lg:grid-cols-12 lg:gap-16 lg:pt-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-6">01 / Conditions for useful work</p>
            <h2 id="fit-characteristics-title" className="heading-display max-w-[15ch] text-4xl leading-[1.1] md:text-5xl">
              A working business. A reason to improve.
            </h2>
            <p className="mt-7 text-base leading-relaxed text-white/65">
              Fit begins with the business situation: who is buying, what happens today, and what management wants to change. We look at those characteristics before discussing a tool or setting a project scope.
            </p>
            <p className="mt-6 border-l border-gold/40 pl-5 text-sm leading-relaxed text-white/55">
              Meeting these conditions does not automatically mean you need Elevantra. The first question is whether there is an important problem that we can responsibly help address.
            </p>
          </Reveal>
          <div className="lg:col-span-8">
            <ul>
              {fitCharacteristics.map(({ title, detail }, index) => (
                <li key={title} className="grid gap-3 border-b border-white/10 py-6 first:pt-0 sm:grid-cols-[1.1rem_minmax(0,1fr)] sm:gap-x-5">
                  <span aria-hidden="true" className="pt-1 text-[10px] tabular-nums text-gold/70">{String(index + 1).padStart(2, "0")}</span>
                  <div className="grid gap-2 xl:grid-cols-2 xl:gap-7">
                    <h3 className="text-base font-medium leading-relaxed text-white/90">{title}</h3>
                    <p className="text-sm leading-relaxed text-white/60">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="automotive-focus" className="border-y border-gold/20 bg-[#0b0c0b] py-20 md:py-28" aria-labelledby="automotive-focus-title">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow mb-6">02 / Our initial commercial focus</p>
              <h2 id="automotive-focus-title" className="heading-display max-w-[17ch] text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08]">
                Independent automotive dealerships.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:self-end">
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                A vehicle purchase connects information, conversation, qualification and a physical inspection. That makes the journey a concrete place to investigate how a digital experience and the process around it work together.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-white/55">
                We are actively exploring these workflows and developing our expertise. Each dealership needs to be understood on its own terms.
              </p>
            </Reveal>
          </div>

          <div className="my-12 md:my-16">
            <CommercialJourney label="A possible dealership buying journey" steps={dealershipJourney} />
          </div>

          <div className="grid gap-9 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h3 className="heading-display text-3xl leading-[1.15] md:text-4xl">Questions worth investigating.</h3>
              <p className="mt-5 text-sm leading-relaxed text-white/60">
                The stages frame a conversation. They do not establish where any particular dealership has a problem. The relevant question is what the evidence shows, and whether an improvement would be justified.
              </p>
            </div>
            <dl className="grid gap-x-9 gap-y-8 sm:grid-cols-2 lg:col-span-8">
              {dealershipQuestions.map(({ title, detail }) => (
                <div key={title} className="border-t border-white/15 pt-5">
                  <dt className="text-sm font-medium leading-relaxed text-white/85">{title}</dt>
                  <dd className="mt-3 text-sm leading-relaxed text-white/55">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-12 max-w-4xl border-l border-gold/40 pl-5 text-sm leading-relaxed text-white/60 md:mt-16">
            A digital showroom may support the buying journey. Sales also depend on the vehicle, price, buyer circumstances and how the business carries the conversation forward. A recommendation would need to account for that wider process.
          </p>

          {(automotiveConcept || journeyArticle) && (
            <div className="mt-12 grid gap-8 border-t border-white/15 pt-7 md:grid-cols-2 md:gap-12">
              {automotiveConcept && (
                <div>
                  <p className="eyebrow mb-2">{automotiveConcept.designation}</p>
                  <Link href={`/work/${automotiveConcept.slug}`} className="text-link">
                    Explore {automotiveConcept.title} <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/50">A design study of vehicle discovery and inspection enquiries, with its concept status made explicit.</p>
                </div>
              )}
              {journeyArticle && (
                <div>
                  <p className="eyebrow mb-2">Related studio thinking</p>
                  <Link href={`/insights/${journeyArticle.slug}`} className="text-link max-w-lg leading-relaxed">
                    {journeyArticle.title} <ArrowUpRight size={16} aria-hidden="true" className="shrink-0" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="container-x py-24 md:py-32" aria-labelledby="other-contexts-title">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow mb-6">03 / Beyond our initial focus</p>
            <h2 id="other-contexts-title" className="heading-display max-w-[18ch] text-4xl leading-[1.1] md:text-5xl">
              The business question matters more than the sector label.
            </h2>
          </Reveal>
          <div className="lg:col-span-5 lg:self-end">
            <p className="text-base leading-relaxed text-white/65">
              Other commercial environments may be a fit when there is a specific objective and a customer or operational process we can competently improve. These are potential contexts to assess individually.
            </p>
            <Link href="/services" className="text-link mt-4">Explore what we can deliver <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          {businessContexts.map(({ title, detail, question }, index) => (
            <article key={title} className="grid gap-6 border-t border-white/15 py-9 md:py-11 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="mb-3 text-[10px] tabular-nums text-gold/70">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="heading-display max-w-[17ch] text-3xl leading-[1.15]">{title}</h3>
              </div>
              <p className="text-base leading-relaxed text-white/60 lg:col-span-5">{detail}</p>
              <p className="border-l border-gold/30 pl-5 text-sm leading-relaxed text-white/75 lg:col-span-3 lg:self-start">{question}</p>
            </article>
          ))}
        </div>

        {publishedClientProject && (
          <aside className="mt-6 grid gap-5 border-y border-white/15 py-7 md:grid-cols-12 md:gap-10" aria-label="Published client work">
            <div className="md:col-span-4"><p className="eyebrow">Published client work</p></div>
            <div className="md:col-span-8">
              <Link href={`/work/${publishedClientProject.slug}`} className="text-link text-base">{publishedClientProject.title} <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{publishedClientProject.summary}</p>
            </div>
          </aside>
        )}
      </section>

      <section className="container-x pb-24 md:pb-32" aria-labelledby="engagement-limits-title">
        <div className="grid gap-10 border-t border-white/15 pt-8 lg:grid-cols-12 lg:gap-16 lg:pt-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-6">04 / Clear expectations</p>
            <h2 id="engagement-limits-title" className="heading-display max-w-[17ch] text-4xl leading-[1.1] md:text-5xl">A useful fit includes clear limits.</h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65">
              Sometimes the responsible next step is to narrow the brief, resolve an internal constraint, or bring in another specialist. These situations need an honest discussion before a commitment.
            </p>
            <div className="mt-9 max-w-lg border-l border-gold/40 pl-5">
              <h3 className="text-base font-medium text-white/85">Room for a well-scoped early-stage project.</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                We may still work with an early-stage company where a development project has a clear commercial purpose, realistic scope and the resources to implement it. Established businesses remain the focus of our evolving commercial approach.
              </p>
            </div>
          </Reveal>
          <dl className="space-y-7 lg:col-span-7">
            {engagementLimits.map(({ title, detail }) => (
              <div key={title} className="border-b border-white/10 pb-7">
                <dt className="text-base font-medium leading-relaxed text-white/85">{title}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-white/60">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Link href="/commercial-challenges" className="text-link mt-8">See the questions we examine <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </section>

      <section id="fit-conversation" className="container-x pb-24 md:pb-32" aria-labelledby="fit-conversation-title">
        <div className="border-t border-white/15 pt-8 md:pt-12">
          <Reveal className="max-w-3xl">
            <p className="eyebrow mb-6">05 / Start with a short outline</p>
            <h2 id="fit-conversation-title" className="heading-display text-4xl leading-[1.1] md:text-5xl">Four useful starting points.</h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">
              You do not need a polished brief to get in touch. A short account of the business and the question you are working on gives us somewhere practical to begin. Keep commercially sensitive information out of the initial message.
            </p>
          </Reveal>
          <ol className="mt-10 grid gap-x-9 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {conversationPrompts.map(({ title, detail }, index) => (
              <li key={title} className="border-t border-gold/30 pt-5">
                <p aria-hidden="true" className="mb-5 text-[10px] tabular-nums text-gold/70">0{index + 1}</p>
                <h3 className="text-base font-medium leading-relaxed text-white/90">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-col items-start gap-4 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="max-w-2xl text-sm leading-relaxed text-white/55">The first conversation establishes relevance. Any investigation or implementation is separately scoped and agreed.</p>
            <Link href="/contact" className="text-link shrink-0">Start a conversation <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <StrategyCTA
        eyebrow="A practical next step"
        title="If the problem is important, the first conversation should be too."
        description="Tell us what you’re trying to achieve and what is getting in the way. We’ll begin by exploring whether there is a useful, properly scoped next step."
        label="Tell us what you’re working on"
        href="/contact"
        secondary={{ href: "/approach", label: "See how we approach the work" }}
      />
    </>
  );
}
