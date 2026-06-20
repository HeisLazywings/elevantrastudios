"use client";

import { processSteps } from "@/lib/data";
import Reveal from "./Reveal";
import { motion } from "framer-motion";

export default function Process() {
  return (
    <section className="relative overflow-hidden bg-bg-secondary/40 py-32">
      <div className="container-x">
        <div className="mb-20 max-w-3xl">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Process
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-display text-[clamp(2.25rem,4.5vw,4rem)]">
              A refined <span className="italic text-gold-gradient">process.</span>
            </h2>
          </Reveal>
        </div>

        <div className="relative">
          <div
            className="absolute left-[26px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/40 via-white/10 to-transparent md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />
          <ol className="space-y-16">
            {processSteps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative grid items-center gap-6 md:grid-cols-2 ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-5 md:px-10 ${
                    i % 2 === 1 ? "md:justify-start" : "md:justify-end md:text-right"
                  }`}
                >
                  <div className="hidden md:block">
                    <div className="font-display text-sm text-gold">{s.n}</div>
                    <h3 className="heading-display mt-1 text-3xl">{s.title}</h3>
                  </div>
                </div>

                <div className="relative pl-16 md:px-10 md:pl-10">
                  <span
                    className="absolute left-0 top-1 grid h-[52px] w-[52px] place-items-center rounded-full border border-gold/40 bg-bg text-sm text-gold md:left-1/2 md:-translate-x-1/2"
                    aria-hidden
                  >
                    {s.n}
                  </span>
                  <div className="md:hidden">
                    <h3 className="heading-display text-2xl">{s.title}</h3>
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65 md:mt-0">
                    {s.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
