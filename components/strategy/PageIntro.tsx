import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";
import Reveal from "@/components/Reveal";

type Action = { href: string; label: string };

export default function PageIntro({
  eyebrow,
  title,
  description,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primary?: Action;
  secondary?: Action;
}) {
  return (
    <header className="container-x pb-16 pt-40 md:pb-20 md:pt-48">
      <Reveal>
        <p className="eyebrow mb-7">{eyebrow}</p>
        <h1 className="editorial-title max-w-[20ch] text-[clamp(2.75rem,6vw,6rem)]">{title}</h1>
      </Reveal>
      <div className="mt-9 grid gap-8 border-t border-white/15 pt-8 lg:grid-cols-12 lg:gap-14">
        <Reveal delay={0.1} className="lg:col-span-7">
          <p className="max-w-2xl text-base leading-[1.85] text-white/70 md:text-lg">{description}</p>
        </Reveal>
        {(primary || secondary) && (
          <Reveal delay={0.15} className="flex flex-wrap items-start gap-x-6 gap-y-4 lg:col-span-5 lg:justify-end">
            {primary && <MagneticButton href={primary.href}>{primary.label}</MagneticButton>}
            {secondary && <Link href={secondary.href} className="text-link">{secondary.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
          </Reveal>
        )}
      </div>
    </header>
  );
}
