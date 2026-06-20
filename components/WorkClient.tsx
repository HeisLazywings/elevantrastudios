"use client";

import { useState } from "react";
import { projects } from "@/lib/data";
import Reveal from "@/components/Reveal";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

export default function WorkClient() {
  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      <section className="relative pt-40">
        <div className="container-x max-w-5xl">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-gold">
              Work
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="heading-display text-[clamp(2.5rem,6vw,6rem)]">
              Selected{" "}
              <span className="italic text-gold-gradient">projects.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-lg text-white/70">
              A curated selection of recent engagements — premium websites built
              to perform and crafted to make an impression.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <div className="mb-12 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-full border px-5 py-2 text-sm transition-all ${
                  active === c
                    ? "border-gold/60 bg-gold/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid gap-10">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.article
                  layout
                  key={p.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-bg-secondary"
                >
                  <div className="grid lg:grid-cols-2">
                    <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${p.gradient}`}>
                      <div className="absolute inset-6 rounded-xl border border-white/10 bg-[#0a0a0a] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-[1.02]">
                        <div className="mb-4 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-white/10" />
                          <span className="h-2 w-2 rounded-full bg-white/10" />
                          <span className="h-2 w-2 rounded-full bg-white/10" />
                        </div>
                        <div className="mb-3 h-2 w-20 rounded bg-gold/40" />
                        <div className="mb-2 h-5 w-4/5 rounded bg-white/20" />
                        <div className="mb-5 h-3 w-3/5 rounded bg-white/10" />
                        <div className="grid grid-cols-3 gap-2">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <div
                              key={idx}
                              className="aspect-square rounded bg-gradient-to-br from-white/10 to-white/0"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-10 md:p-14">
                      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/40">
                        <span>{p.category}</span>
                        <span>{p.year}</span>
                      </div>
                      <h2 className="heading-display mb-6 text-3xl md:text-4xl">
                        {p.title}
                      </h2>

                      <Block label="Overview" text={p.overview} />
                      <Block label="Challenge" text={p.challenge} />
                      <Block label="Solution" text={p.solution} />

                      <div className="mt-8">
                        <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">
                          Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {p.technologies.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                        {p.results.map((r) => (
                          <div key={r} className="text-sm text-white/80">
                            {r}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-xs uppercase tracking-[0.3em] text-white/40">
        {label}
      </h3>
      <p className="text-sm leading-relaxed text-white/70">{text}</p>
    </div>
  );
}
