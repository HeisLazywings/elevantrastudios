import type { MetadataRoute } from "next";
import { getSiteArticles, getSiteProjects, isCmsContentEnabled } from "@/lib/content";
import { getPublishedEntries } from "@/lib/cms/queries";
import { absoluteUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Do not publish a placeholder or development origin as the canonical domain.
  if (!siteUrl) return [];
  const [articles, projects, additional] = await Promise.all([
    getSiteArticles(), getSiteProjects(), isCmsContentEnabled() ? getPublishedEntries() : Promise.resolve([]),
  ]);
  const routes = [
    "", "/about", "/services", "/work", "/contact", "/insights", "/resources", "/clients",
    "/commercial-challenges", "/approach", "/who-we-work-with",
    ...articles.map(({ slug }) => `/insights/${slug}`),
    ...projects.map(({ slug }) => `/work/${slug}`),
    ...additional.filter((entry) => entry.kind === "resource" || entry.kind === "client").map((entry) => `/${entry.kind === "resource" ? "resources" : "clients"}/${entry.slug}`),
  ];
  return routes.map((r) => ({
    url: absoluteUrl(r || "/")!,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
