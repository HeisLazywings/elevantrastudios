import { articles, type Article } from "@/lib/insights";
import { publicProjects, type Project } from "@/lib/projects";
import { getPublishedEntries, getPublishedEntry } from "@/lib/cms/queries";
import type { CmsEntry, RichTextDocument, RichTextNode } from "@/lib/cms/types";

/** Activate after migrations/import so an empty CMS never resurrects unpublished local content. */
export function isCmsContentEnabled() {
  return process.env.CMS_CONTENT_ENABLED === "true";
}

export function nodeText(node: RichTextNode): string {
  if (node.type === "text") return node.text;
  return "content" in node ? (node.content ?? []).map(nodeText).join(" ") : "";
}

export function documentOutline(document: RichTextDocument) {
  const outline: { id: string; title: string }[] = [];
  function visit(node: RichTextNode) {
    if (node.type === "heading") outline.push({ id: `body-section-${outline.length + 1}`, title: nodeText(node) });
    if ("content" in node) node.content?.forEach(visit);
  }
  document.content.forEach(visit);
  return outline;
}

export type SiteArticle = Article & { cmsEntry?: CmsEntry };
export type SiteProject = Project & { cmsEntry?: CmsEntry };

export function articleFromEntry(entry: CmsEntry): SiteArticle {
  if (entry.kind !== "article") throw new Error("Expected an article.");
  return {
    slug: entry.slug, title: entry.title, summary: entry.summary,
    category: entry.category || "Studio thinking", issue: entry.details.issue,
    deck: entry.details.deck || entry.summary, featured: entry.featured,
    sections: [{ id: "article-content", title: entry.title, paragraphs: entry.body.content.map(nodeText) }],
    pullQuote: entry.details.pullQuote, takeaway: entry.details.takeaway,
    reviewNotes: [], coverMediaId: entry.cover_media_id ?? undefined, coverAlt: entry.cover_alt, cmsEntry: entry,
  };
}

export function projectFromEntry(entry: CmsEntry): SiteProject {
  if (entry.kind !== "case-study") throw new Error("Expected a case study.");
  return {
    slug: entry.slug, title: entry.title, summary: entry.summary,
    category: entry.category, designation: entry.details.designation,
    visibility: "public", headline: entry.details.headline || entry.title,
    focus: entry.details.focus, status: entry.details.projectStatus,
    statusDetail: entry.details.statusDetail, demoUrl: entry.details.demoUrl,
    artwork: { initial: entry.title.slice(0, 12), title: entry.details.headline || entry.title, subtitle: entry.summary, journey: entry.details.focus },
    sections: entry.details.sections ?? [], coverMediaId: entry.cover_media_id ?? undefined, coverAlt: entry.cover_alt,
    cmsEntry: entry,
  };
}

export async function getSiteArticles(): Promise<SiteArticle[]> {
  if (!isCmsContentEnabled()) return articles;
  return (await getPublishedEntries("article")).map(articleFromEntry);
}

export async function getSiteArticle(slug: string): Promise<SiteArticle | undefined> {
  if (!isCmsContentEnabled()) return articles.find((article) => article.slug === slug);
  const entry = await getPublishedEntry("article", slug);
  return entry ? articleFromEntry(entry) : undefined;
}

export async function getSiteProjects(): Promise<SiteProject[]> {
  if (!isCmsContentEnabled()) return [...publicProjects];
  return (await getPublishedEntries("case-study")).map(projectFromEntry);
}

export async function getSiteProject(slug: string): Promise<SiteProject | undefined> {
  if (!isCmsContentEnabled()) return publicProjects.find((project) => project.slug === slug);
  const entry = await getPublishedEntry("case-study", slug);
  return entry ? projectFromEntry(entry) : undefined;
}
