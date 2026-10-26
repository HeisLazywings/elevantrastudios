import Link from "next/link";
import { services } from "@/lib/data";
import Reveal from "./Reveal";
import { ArrowUpRight } from "lucide-react";

export default function Services() {
  return (
    <section aria-labelledby="services-preview-title" className="border-y border-white/10 bg-bg-secondary/40 py-20 md:py-28">
      <div className="container-x">
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow mb-5">Practical implementation</p>
            <h2 id="services-preview-title" className="heading-display max-w-[20ch] text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.1]">The objective shapes the deliverable.</h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:self-end">
            <p className="text-base leading-relaxed text-white/65">Clearer customer information, better enquiry handling and more organised workflows are useful starting objectives. Websites, showrooms and tools are possible ways to address them.</p>
            <Link href="/services" className="text-link mt-5">Explore our capabilities <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </Reveal>
        </div>
        <div className="border-t border-white/15">
          {services.map((service, index) => (
            <Reveal key={service.id}>
              <article className="group grid gap-5 border-b border-white/15 py-7 transition-colors md:grid-cols-12 md:gap-8 md:py-9">
                <span aria-hidden="true" className="text-[11px] tracking-[0.15em] text-gold md:col-span-1">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-2xl leading-tight md:col-span-5 md:text-3xl"><Link href={"/services#" + service.id} className="transition-colors hover:text-gold-light">{service.title}</Link></h3>
                <p className="max-w-xl text-sm leading-[1.8] text-white/65 md:col-span-6">{service.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
