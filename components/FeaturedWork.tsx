"use client";

import { projects } from "@/lib/data";
import Reveal from "./Reveal";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function FeaturedWork() {
  return (
    <section className="relative py-32">
      <div className="container-x">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
                Featured Work
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="heading-display max-w-[16ch] text-[clamp(2.25rem,4.5vw,4rem)]">
                Selected projects, considered outcomes.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              All projects
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.8,
                delay: (i % 2) * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-bg-secondary"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${p.gradient}`}
              >
                <MockPreview title={p.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent opacity-80" />
              </div>
              <div className="p-8">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/40">
                  <span>{p.category}</span>
                  <span>{p.year}</span>
                </div>
                <h3 className="heading-display mb-3 text-2xl md:text-3xl">
                  {p.title}
                </h3>
                <p className="text-sm text-white/60">{p.overview}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.technologies.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MockPreview({ title }: { title: string }) {
  return (
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
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-square rounded bg-gradient-to-br from-white/10 to-white/0"
          />
        ))}
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
