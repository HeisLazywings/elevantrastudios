import { getSiteProjects } from "@/lib/content";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";

// Only approved entries belong in a portfolio listing, including review builds.
export default async function WorkClient() {
  const projects = await getSiteProjects();

  return (
    <>
      <section className="container-x pb-14 pt-36 md:pb-20 md:pt-44">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow mb-6">The work / Selected studies</p>
            <h1 className="editorial-title max-w-[12ch]">Good design has a <span className="italic text-gold">reason.</span></h1>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:self-end lg:pb-2">
            <p className="max-w-sm text-base leading-relaxed text-white/65 md:text-lg">
              A closer look at the decisions behind a digital experience: the business question, the proposed approach, and what still needs to be proven.
            </p>
            <p className="mt-6 border-t border-white/15 pt-4 text-xs leading-relaxed text-white/45">
              Concept demonstrations are explicitly labelled. Results appear only when there is evidence to support them.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="container-x space-y-20 pb-24 md:space-y-28 md:pb-32" aria-label="Selected projects">
        {!projects.length && <p className="section-rule pt-8 text-white/60">Project studies will appear here as they are published.</p>}
        {projects.map((project, index) => (
          <Reveal key={project.slug}>
            <ProjectCard project={project} index={index} headingAs="h2" />
          </Reveal>
        ))}
      </section>
    </>
  );
}
