import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

const stages = [
  { title: "Understand", description: "Agree the objective, examine the current process and separate evidence from assumptions." },
  { title: "Implement", description: "Define a proportionate scope, then design and build the agreed intervention." },
  { title: "Measure", description: "Review the indicators agreed for the work, with clear limits on what can be attributed to it." },
  { title: "Improve", description: "Use what is learned to decide whether a handover, support or further work makes sense." },
];

export default function Process() {
  return (
    <section className="bg-bg-secondary/40 py-20 md:py-28" aria-labelledby="approach-preview-title">
      <div className="container-x">
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow mb-5">Our approach</p>
            <h2 id="approach-preview-title" className="heading-display max-w-[20ch] text-[clamp(2.25rem,4.3vw,4rem)] leading-[1.12]">A considered path from question to implementation.</h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:self-end">
            <p className="text-base leading-relaxed text-white/65">This is the operating philosophy we are developing. The proposal for each engagement defines its actual scope, review points and measures of success.</p>
            <Link href="/approach" className="text-link mt-5">See the full approach <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </Reveal>
        </div>
        <ol className="grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, index) => (
            <li key={stage.title} className="min-w-0 border-b border-white/15 py-7 sm:px-5 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <Reveal delay={index * 0.04}>
                <span aria-hidden="true" className="text-[11px] tracking-[0.15em] text-gold">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-display text-3xl">{stage.title}</h3>
                <p className="mt-4 text-sm leading-[1.8] text-white/65">{stage.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
