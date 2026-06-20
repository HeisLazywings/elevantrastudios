"use client";

import { techStack } from "@/lib/data";

export default function TechStack() {
  const items = [...techStack, ...techStack];
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-bg-secondary/40 py-14">
      <p className="container-x mb-8 text-center text-xs uppercase tracking-[0.35em] text-white/40">
        Trusted technology stack
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
        <div className="flex w-max animate-marquee gap-16 px-6">
          {items.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="font-display text-2xl tracking-tight text-white/60 transition-colors hover:text-white md:text-3xl"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
