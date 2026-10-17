import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import ProjectVisual from "@/components/ProjectVisual";

export default function ProjectCard({
  project,
  index = 0,
  headingAs: Heading = "h3",
}: {
  project: Project;
  index?: number;
  headingAs?: "h2" | "h3";
}) {
  return (
    <article className="grid gap-8 border-t border-white/15 pt-8 md:gap-10 lg:grid-cols-12 lg:gap-14 lg:pt-10">
      <div className="lg:col-span-7">
        <Link
          href={`/work/${project.slug}`}
          aria-label={`Read the ${project.title} ${project.designation.toLowerCase()}`}
          className="group block transition-opacity duration-300 hover:opacity-90"
        >
          <ProjectVisual project={project} />
        </Link>
      </div>
      <div className="flex flex-col items-start lg:col-span-5 lg:py-6">
        <div className="mb-8 flex w-full items-center justify-between gap-4 text-[10px] uppercase tracking-[0.22em] text-white/45">
          <span>Study {String(index + 1).padStart(2, "0")}</span>
          <span className="border border-gold/30 px-3 py-2 text-right text-gold">{project.designation}</span>
        </div>
        <p className="text-xs text-white/50">{project.category}</p>
        <Heading className="heading-display mt-4 text-4xl sm:text-5xl">
          <Link href={`/work/${project.slug}`} className="transition-colors hover:text-gold">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">{project.summary}</p>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45" aria-label="Project focus">
          {project.focus.map((focus) => <li key={focus}>{focus}</li>)}
        </ul>
        <div className="mt-10 border-t border-white/10 pt-5 lg:mt-auto lg:w-full lg:pt-6">
          <Link href={`/work/${project.slug}`} className="text-link text-sm text-gold">
            {project.visibility === "review" ? "Review draft" : "Explore the design study"}
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
