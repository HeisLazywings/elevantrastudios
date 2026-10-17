import type { Metadata } from "next";
import { getPublishedEntry } from "@/lib/cms/queries";
import { isCmsContentEnabled } from "@/lib/content";
import { absoluteUrl, siteName } from "@/lib/site";

export async function cmsPageMetadata(kind: "resource" | "client", slug: string): Promise<Metadata> {
  const entry = isCmsContentEnabled() ? await getPublishedEntry(kind, slug) : null;
  if (!entry) return { title: "Page not found", robots: { index: false, follow: false } };
  const url = absoluteUrl(`/${kind === "resource" ? "resources" : "clients"}/${slug}`);
  const title = entry.seo_title || entry.title;
  const description = entry.seo_description || entry.summary;
  return {
    title, description, ...(url && { alternates: { canonical: url } }),
    openGraph: { title, description, type: "website", siteName, ...(url && { url }) },
    twitter: { card: "summary_large_image", title, description },
  };
}
