import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { documentOutline, getSiteProject } from "@/lib/content";
import CmsBody from "@/components/CmsBody";
import ProjectVisual from "@/components/ProjectVisual";
import Reveal from "@/components/Reveal";
import { absoluteUrl, serializeJsonLd, siteName } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getSiteProject(slug);
  if (!project) return { title: "Study not found", robots: { index: false, follow: false } };
  const canonical = absoluteUrl(`/work/${project.slug}`);

  return {
    title: project.cmsEntry?.seo_title || `${project.title} — ${project.designation}`,
    description: project.cmsEntry?.seo_description || project.summary,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: project.cmsEntry?.seo_title || `${project.title} — ${project.designation} | ${siteName}`,
      description: project.cmsEntry?.seo_description || project.summary,
      ...(canonical ? { url: canonical } : {}),
      type: "article",
    },
    ...(project.visibility === "review" ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getSiteProject(slug);
  if (!project) notFound();
  const outline = [...project.sections, ...(project.cmsEntry ? documentOutline(project.cmsEntry.body).map((section) => ({ ...section, label: section.title })) : [])];
  const studyUrl = absoluteUrl(`/work/${project.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${project.title} — ${project.designation}`,
    description: project.summary,
    creator: { "@type": "Organization", name: siteName },
    ...(studyUrl ? { url: studyUrl } : {}),
  };

  return (
    <>
      {project.visibility === "public" && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      )}
      <header className="container-x pb-12 pt-32 md:pb-16 md:pt-40">
        <Link href="/work" className="text-link mb-10 text-xs text-white/55 hover:text-white">
          <ArrowLeft aria-hidden="true" size={14} /> All work
        </Link>
        {project.visibility === "review" && (
          <aside className="mb-10 border border-gold/30 bg-gold/5 p-5 text-sm leading-relaxed text-gold" aria-label="Review draft notice">
            Review draft — not approved for publication. This page is available only while server-side content preview is enabled and is marked noindex. Scope, delivery, assets, and outcomes require confirmation.
          </aside>
        )}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow mb-6">{project.designation}</p>
            <h1 className="editorial-title">{project.title}</h1>
            <p className="heading-display mt-8 max-w-[20ch] text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.15] text-white/75">{project.headline}</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:self-end">
            <p className="text-base leading-relaxed text-white/65">{project.summary}</p>
            <dl className="mt-8 space-y-5 border-t border-white/15 pt-5">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-white/40">Focus</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/75">{project.focus.join(" / ")}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-white/40">Status</dt>
                <dd className="mt-2 text-sm leading-relaxed text-gold">{project.status}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </header>

      <div className="container-x">
        <ProjectVisual project={project} priority />
        <p className="max-w-3xl border-b border-white/15 py-6 text-xs leading-relaxed text-white/50">{project.statusDetail}</p>
      </div>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:gap-14 lg:py-24">
        <aside className="lg:col-span-3">
          <nav aria-label="In this study" className="border-t border-white/15 pt-5 lg:sticky lg:top-28">
            <p className="eyebrow mb-5">In this study</p>
            <ol className="flex flex-wrap gap-x-6 gap-y-3 lg:flex-col">
              {outline.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="inline-flex min-h-11 items-center gap-3 text-xs leading-relaxed text-white/60 transition-colors hover:text-gold">
                    <span aria-hidden="true" className="text-white/30">{String(index + 1).padStart(2, "0")}</span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        <article className="lg:col-span-8 lg:col-start-5">
          {project.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-white/15 pb-14 pt-6 md:pb-20">
              <Reveal>
                <p className="eyebrow mb-6"><span className="mr-3 text-white/35">{String(index + 1).padStart(2, "0")}</span>{section.label}</p>
                <h2 className="heading-display mb-7 max-w-[24ch] text-[clamp(2rem,3.3vw,3.2rem)] leading-[1.12]">{section.title}</h2>
                <div className="reading-copy space-y-5">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.points && (
                  <ul className="mt-8 space-y-4 border-l border-gold/40 pl-6 text-sm leading-relaxed text-white/65">
                    {section.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                )}
              </Reveal>
            </section>
          ))}
          {project.cmsEntry && <CmsBody document={project.cmsEntry.body} />}
          {project.screenshots?.slice(1).map((screenshot) => (
            <figure key={screenshot.src} className="mb-12 border border-white/10">
              <Image src={screenshot.src} width={screenshot.width} height={screenshot.height} alt={screenshot.alt} sizes="(max-width: 1023px) 100vw, 66vw" className="h-auto w-full" />
              <figcaption className="border-t border-white/10 p-5 text-xs leading-relaxed text-white/55">{screenshot.caption}</figcaption>
            </figure>
          ))}
          {project.demoUrl && (
            <div className="border-y border-white/15 py-8">
              <p className="mb-4 text-xs text-white/50">Explore the concept demonstration</p>
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-link text-base text-gold hover:text-white">
                Explore the {project.title} demo <ArrowUpRight aria-hidden="true" size={18} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          )}
        </article>
      </div>

      <section className="container-x pb-24 md:pb-32">
        <div className="grid gap-8 border-t border-white/15 pt-10 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow mb-5">Your next chapter</p>
            <h2 className="heading-display max-w-[17ch] text-4xl leading-[1.1] md:text-5xl">What should your website make clearer?</h2>
          </div>
          <Link href="/contact" className="text-link justify-self-start text-sm text-gold md:justify-self-end">Start a conversation <ArrowUpRight aria-hidden="true" size={16} /></Link>
        </div>
      </section>
    </>
  );
}
