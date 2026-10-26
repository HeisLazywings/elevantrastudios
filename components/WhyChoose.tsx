import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { whyChoose } from "@/lib/data";
import Reveal from "./Reveal";

export default function WhyChoose() {
  return (
    <section className="border-t border-white/10 py-20 md:py-24" aria-labelledby="working-standards-title">
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow mb-5">Standards for the work</p>
          <h2 id="working-standards-title" className="heading-display max-w-[16ch] text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.12]">Clear decisions. Visible responsibilities.</h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-white/65">Trust is earned through the work itself: a defined scope, honest reporting and an understandable path from first conversation to handover.</p>
          <Link href="/who-we-work-with" className="text-link mt-6">Who we work with <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </Reveal>
        <div className="lg:col-span-7">
          {whyChoose.map((principle, index) => (
            <Reveal key={principle.title} delay={index * 0.04}>
              <div className="grid gap-3 border-t border-white/15 py-6 sm:grid-cols-12 sm:gap-5">
                <span aria-hidden="true" className="text-xs text-gold sm:col-span-1">{String(index + 1).padStart(2, "0")}</span>
                <div className="sm:col-span-11">
                  <h3 className="font-display text-2xl">{principle.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">{principle.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
