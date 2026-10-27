import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { MissingConnection } from "./architecture/StructuralMotifs";

export default function AboutSection() {
  return (
    <section id="business-first" aria-labelledby="business-first-title" className="py-20 md:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative lg:col-span-6">
          <p className="eyebrow mb-6">The business comes first</p>
          <h2 id="business-first-title" className="heading-display max-w-[20ch] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.12]">
            A website is one possible answer.
          </h2>
          <p className="mt-5 font-display text-2xl leading-snug text-gold-light md:text-3xl">Understanding the problem comes before choosing the tool.</p>
          <MissingConnection />
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-6">
          <div className="reading-copy">
            <p>A customer may need clearer product information. An enquiry may need a better handoff. A sales team may need a dependable way to organise inspection requests.</p>
            <p>Each calls for a different response. We bring design and development into the discussion after establishing the objective, the constraints and the part of the process worth improving.</p>
            <p>Sometimes that means a new website or a practical business tool. Sometimes a clearer process is the appropriate first step.</p>
          </div>
          <Link href="/commercial-challenges" className="text-link mt-8">Explore commercial challenges <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  );
}
