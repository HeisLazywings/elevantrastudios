"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import MagneticButton from "./MagneticButton";

export default function Hero() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="home-title" className="relative isolate border-b border-white/10 pb-16 pt-40 md:pb-20 md:pt-48 lg:pb-24">
      <div className="container-x">
        <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow mb-8">
          Commercial systems & digital growth studio
        </motion.p>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <motion.h1 id="home-title" initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 }} className="heading-display max-w-[15ch] text-[clamp(3.1rem,7vw,7rem)] leading-[1.04]">
              Find the friction.<br /><span className="italic text-gold-light">Build what matters.</span>
            </motion.h1>
            <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-9 max-w-xl text-base leading-[1.85] text-white/70 md:text-lg">
              Elevantra Studios works with established businesses to understand commercial challenges and develop purposeful digital experiences, websites and systems around what actually matters.
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton href="/contact">Discuss your business</MagneticButton>
              <MagneticButton href="/work" variant="ghost">Explore our work</MagneticButton>
            </motion.div>
          </div>
          <motion.aside initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} aria-label="Where our work begins" className="border-t border-gold/40 pt-6 lg:col-span-4 lg:mt-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">The point of intervention</p>
            <p className="mt-6 font-display text-3xl leading-[1.2] text-white/90 md:text-4xl">A useful system starts with a clear reason to exist.</p>
            <dl className="mt-8 divide-y divide-white/10 text-sm">
              <div className="py-5"><dt className="text-gold-light">The objective</dt><dd className="mt-2 leading-relaxed text-white/60">What does the business need to improve?</dd></div>
              <div className="py-5"><dt className="text-gold-light">The evidence</dt><dd className="mt-2 leading-relaxed text-white/60">Where does the current process lose its way?</dd></div>
              <div className="py-5"><dt className="text-gold-light">The response</dt><dd className="mt-2 leading-relaxed text-white/60">What is proportionate, practical and worth building?</dd></div>
            </dl>
            <Link href="/approach" className="text-link mt-4">Explore our approach <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </motion.aside>
        </div>
        <a href="#business-first" className="mt-14 inline-flex min-h-11 items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-gold-light md:mt-20">
          Begin with the business <ArrowDown size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
