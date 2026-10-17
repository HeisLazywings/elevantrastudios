import type { MetadataRoute } from "next";
import { articles } from "@/lib/insights";
import { publicProjects } from "@/lib/projects";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Do not publish a placeholder or development origin as the canonical domain.
  if (!siteUrl) return [];
  const routes = [
    "", "/about", "/services", "/work", "/contact", "/insights",
    ...articles.map(({ slug }) => `/insights/${slug}`),
    ...publicProjects.map(({ slug }) => `/work/${slug}`),
  ];
  return routes.map((r) => ({
    url: absoluteUrl(r || "/")!,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
