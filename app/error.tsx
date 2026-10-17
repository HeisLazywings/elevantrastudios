"use client";

export default function PageError({ reset }: { reset: () => void }) {
  return <section className="container-x flex min-h-[70svh] flex-col items-start justify-center gap-6 py-32">
    <p className="eyebrow">Please try again</p>
    <h1 className="heading-display max-w-xl text-4xl md:text-6xl">This page is temporarily unavailable.</h1>
    <p className="max-w-lg leading-relaxed text-white/65">The content could not be loaded. Try again in a moment, or use the contact page to reach the studio.</p>
    <button type="button" onClick={reset} className="rounded-full bg-gold-gradient px-7 py-3 text-sm text-black">Try again</button>
  </section>;
}
