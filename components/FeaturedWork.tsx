import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteProjects } from "@/lib/content";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";

export default async function FeaturedWork() {
  const projects = await getSiteProjects();
  if (!projects.length) return null;
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="featured-work-title">
      <div className="container-x">
        <div className="mb-12 grid gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow mb-5">Selected work</p>
            <h2 id="featured-work-title" className="heading-display max-w-[17ch] text-[clamp(2.5rem,5vw,4.8rem)] leading-[1.05]">
              Work you can examine.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65">Project context, implementation choices and the boundaries of what can be verified. Each study makes its status clear.</p>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:justify-self-end">
            <Link href="/work" className="text-link text-sm text-white/65 hover:text-white">
              Explore our work <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </Reveal>
        </div>
        {projects.slice(0, 1).map((project) => (
          <Reveal key={project.slug}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
