"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import MagneticButton from "./MagneticButton";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative grain isolate flex min-h-[100svh] items-center overflow-hidden pt-32"
    >
      {/* Background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/3 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[140px] animate-glow" />
        <div className="absolute left-[15%] top-[70%] h-[320px] w-[320px] rounded-full bg-amber-700/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[20%] h-[260px] w-[260px] rounded-full bg-gold/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="container-x relative">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Digital Studio · Est. 2024
        </motion.p>

        <h1 className="heading-display max-w-[18ch] text-[clamp(2.75rem,7vw,6.5rem)]">
          <Reveal text="Build Digital" delay={0.05} />
          <Reveal text="Experiences That" delay={0.15} />
          <span className="block">
            <Reveal text="Elevate " delay={0.25} inline />
            <span className="text-gold-gradient italic">
              <Reveal text="Businesses." delay={0.32} inline />
            </span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 max-w-xl text-base text-white/70 md:text-lg"
        >
          We design and develop premium websites that help ambitious
          businesses build trust, attract customers, and create lasting
          impressions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="/work" variant="ghost">
            View Work
          </MagneticButton>
          <MagneticButton href="/contact">Start A Project</MagneticButton>
        </motion.div>
      </motion.div>

      {/* Floating mock browser */}
      <FloatingMock />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/40"
      >
        <div className="flex flex-col items-center gap-2">
          <span>Scroll</span>
          <ArrowDown size={14} className="animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}

function Reveal({
  text,
  delay = 0,
  inline = false,
}: {
  text: string;
  delay?: number;
  inline?: boolean;
}) {
  return (
    <span className={inline ? "inline-block overflow-hidden align-bottom" : "block overflow-hidden"}>
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
        className="inline-block"
      >
        {text}{inline ? "\u00A0" : ""}
      </motion.span>
    </span>
  );
}

function FloatingMock() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 lg:block"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -6 }}
        transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="relative w-[440px] animate-float rounded-2xl border border-white/10 bg-bg-secondary/80 p-2 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex items-center gap-1.5 px-2 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a] p-6">
            <div className="mb-4 h-3 w-24 rounded bg-gold/40" />
            <div className="mb-2 h-6 w-3/4 rounded bg-white/20" />
            <div className="mb-2 h-6 w-2/3 rounded bg-white/15" />
            <div className="mb-6 h-3 w-1/2 rounded bg-white/10" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-lg bg-gradient-to-br from-white/10 to-transparent"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
