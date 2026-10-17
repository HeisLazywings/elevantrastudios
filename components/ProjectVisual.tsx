import Image from "next/image";
import type { Project } from "@/lib/projects";

export default function ProjectVisual({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const screenshot = project.screenshots?.[0];

  if (project.coverMediaId) {
    return (
      <figure className="overflow-hidden border border-white/10 bg-bg-secondary">
        <img src={`/api/media/${project.coverMediaId}`} alt={project.coverAlt ?? ""} loading={priority ? "eager" : "lazy"} decoding="async" className="aspect-[16/10] w-full object-contain" />
      </figure>
    );
  }

  if (screenshot) {
    return (
      <figure className="overflow-hidden border border-white/10 bg-bg-secondary">
        <Image
          src={screenshot.src}
          width={screenshot.width}
          height={screenshot.height}
          alt={screenshot.alt}
          priority={priority}
          sizes="(max-width: 1023px) 100vw, 60vw"
          className="h-auto w-full"
        />
        <figcaption className="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-white/60">
          {screenshot.caption}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="relative isolate flex min-h-[25rem] flex-col justify-between overflow-hidden border border-gold/20 bg-[#10100e] p-6 sm:min-h-[32rem] sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_20%,rgba(200,164,93,0.12),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-10 -z-10 h-[26rem] w-[26rem] rounded-full border border-gold/15 after:absolute after:inset-12 after:rounded-full after:border after:border-gold/10"
      />
      <div className="flex items-start justify-between gap-6 text-[10px] uppercase tracking-[0.2em] text-white/50">
        <span className="text-gold">{project.artwork.initial}</span>
        <span className="max-w-[12rem] text-right leading-relaxed">{project.designation}</span>
      </div>
      <div className="relative py-12 sm:py-16">
        <p className="heading-display max-w-[11ch] whitespace-pre-line text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[1.04] text-[#ede7dc]">
          {project.artwork.title}
        </p>
        <p className="mt-6 max-w-[26ch] text-sm leading-relaxed text-white/50">
          {project.artwork.subtitle}
        </p>
      </div>
      <div>
        <ol className="flex flex-wrap gap-x-6 gap-y-3 border-t border-gold/20 pt-5 sm:gap-x-8">
          {project.artwork.journey.map((step, index) => (
            <li key={step} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/65 sm:text-xs">
              <span className="text-gold/70">0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <figcaption className="mt-5 text-[10px] leading-relaxed text-white/45">
          Design study · not a product screenshot
        </figcaption>
      </div>
    </figure>
  );
}
