import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import CommercialJourney from "./CommercialJourney";

const journey = [
  { title: "Discovery", detail: "Finding relevant information" },
  { title: "Enquiry", detail: "Expressing a specific interest" },
  { title: "Qualification", detail: "Understanding readiness and fit" },
  { title: "Transaction", detail: "Completing an agreed purchase" },
  { title: "Follow-up", detail: "Keeping responsibilities clear" },
];

export default function JourneyPreview() {
  return (
    <section aria-labelledby="commercial-journey-title" className="container-x pb-20 md:pb-28">
      <div className="mb-9 grid gap-7 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <p className="eyebrow mb-5">Look between the stages</p>
          <h2 id="commercial-journey-title" className="font-display text-3xl leading-tight tracking-tight md:text-4xl">A customer journey is also a series of handoffs.</h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-6">
          <p className="text-base leading-relaxed text-white/65">Systems and customer experiences can help at specific points along this journey. The first task is to establish where an improvement is needed and which part we can responsibly address.</p>
        </Reveal>
      </div>
      <Reveal><CommercialJourney steps={journey} label="Illustrative commercial journey, not a prediction of results" /></Reveal>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-xs leading-relaxed text-white/50">A useful discussion framework. The sequence and responsibilities differ between businesses.</p>
        <Link href="/commercial-challenges" className="text-link">Where friction can arise <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
