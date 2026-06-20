"use client";

import { testimonials } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const next = () => setI((v) => (v + 1) % testimonials.length);
  const prev = () =>
    setI((v) => (v - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[i];

  return (
    <section className="relative py-32">
      <div className="container-x max-w-5xl">
        <Reveal>
          <p className="mb-4 text-center text-xs uppercase tracking-[0.35em] text-gold">
            Testimonials
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="heading-display mb-16 text-center text-[clamp(2rem,4vw,3.5rem)]">
            Trusted by ambitious teams.
          </h2>
        </Reveal>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-10 md:p-16">
          <Quote
            className="absolute -left-4 -top-4 text-gold/15"
            size={140}
            aria-hidden
          />
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <p className="font-display text-2xl leading-snug text-white md:text-4xl">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-8 text-sm uppercase tracking-[0.25em] text-white/50">
                  {t.name} · {t.role}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? "w-8 bg-gold" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Previous testimonial"
                onClick={prev}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition-colors hover:border-gold/40 hover:bg-gold/10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Next testimonial"
                onClick={next}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition-colors hover:border-gold/40 hover:bg-gold/10"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
