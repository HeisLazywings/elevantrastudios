import type { CmsEntry, EntryInput } from "@/lib/cms/types";

export const kindLabels = { article: "Article", "case-study": "Case study", resource: "Resource", client: "Client profile" } as const;
export const publicRoots = { article: "/insights", "case-study": "/work", resource: "/resources", client: "/clients" } as const;

export function entryUrl(entry: Pick<EntryInput, "kind" | "slug">) { return `${publicRoots[entry.kind]}/${entry.slug}`; }
export function dateLabel(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(value)); }
export function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export function emptyEntry(kind: EntryInput["kind"]): EntryInput {
  const shared = { kind, title: "", slug: "", summary: "", seo_title: "", seo_description: "", category: "", tags: [], featured: false, publication_approved: false, cover_media_id: null, status: "draft" as const, body: { type: "doc" as const, content: [{ type: "paragraph" }] } };
  const details = kind === "article" ? { deck: "", issue: "", pullQuote: "", takeaway: "" }
    : kind === "case-study" ? { designation: "Concept Demonstration" as const, headline: "", focus: [], projectStatus: "", statusDetail: "", demoUrl: "", sections: [] }
    : kind === "resource" ? { resourceType: "Guide" as const, downloadMediaId: undefined, externalUrl: "" }
    : { websiteUrl: "", engagementSummary: "", logoMediaId: undefined };
  return { ...shared, details } as EntryInput;
}

export function inputFromEntry(entry: CmsEntry): EntryInput {
  const { kind, status, slug, title, summary, seo_title, seo_description, category, tags, featured, publication_approved, cover_media_id, body, details } = entry;
  return { kind, status, slug, title, summary, seo_title, seo_description, category, tags, featured, publication_approved, cover_media_id, body, details } as EntryInput;
}

export async function apiResult<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The request could not be completed. Please try again.");
  return data as T;
}
