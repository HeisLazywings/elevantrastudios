import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import Reveal from "@/components/Reveal";

export default function StrategyCTA({
  eyebrow = "A useful first conversation",
  title,
  description,
  label = "Discuss your business",
  href = "/contact",
  secondary,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  label?: string;
  href?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="container-x py-20 md:py-28">
      <div className="grid gap-10 border-t border-gold/35 pt-9 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-8">
          <p className="eyebrow mb-6">{eyebrow}</p>
          <h2 className="heading-display max-w-[24ch] text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[1.12]">{title}</h2>
          {description && <p className="mt-7 max-w-xl text-base leading-relaxed text-white/65">{description}</p>}
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col items-start gap-5 lg:col-span-4 lg:justify-end lg:justify-self-end">
          <MagneticButton href={href}>{label}</MagneticButton>
          {secondary && <Link href={secondary.href} className="text-link">{secondary.label}<ArrowUpRight aria-hidden="true" size={16} /></Link>}
        </Reveal>
      </div>
    </section>
  );
}
