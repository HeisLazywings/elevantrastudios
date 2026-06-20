"use client";

import { services } from "@/lib/data";
import Reveal from "./Reveal";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Services() {
  return (
    <section className="relative py-32">
      <div className="container-x">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
                Services
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="heading-display max-w-[14ch] text-[clamp(2.25rem,4.5vw,4rem)]">
                Crafted services for ambitious brands.
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: (i % 3) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative bg-bg p-10 transition-colors duration-500 hover:bg-bg-secondary"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="font-display text-sm text-white/40">
                  0{i + 1}
                </span>
                <ArrowUpRight
                  size={20}
                  className="text-white/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                />
              </div>
              <h3 className="heading-display mb-4 text-2xl md:text-3xl">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {s.description}
              </p>
              <div className="mt-10 h-px w-full origin-left scale-x-0 bg-gold-gradient transition-transform duration-700 group-hover:scale-x-100" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
