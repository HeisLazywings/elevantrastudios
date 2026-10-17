export const cmsKinds = ["article", "case-study", "resource", "client"] as const;
export type CmsKind = (typeof cmsKinds)[number];
export type CmsStatus = "draft" | "published";

export type RichTextMark =
  | { type: "bold" | "italic" }
  | { type: "link"; attrs: { href: string } };

export type RichTextNode =
  | { type: "text"; text: string; marks?: RichTextMark[] }
  | { type: "paragraph"; content?: RichTextNode[] }
  | { type: "heading"; attrs: { level: 2 | 3 }; content?: RichTextNode[] }
  | { type: "blockquote"; content: RichTextNode[] }
  | { type: "bulletList"; content: RichTextNode[] }
  | { type: "orderedList"; attrs?: { start: number }; content: RichTextNode[] }
  | { type: "listItem"; content: RichTextNode[] }
  | { type: "image"; attrs: { mediaId: string; alt: string; caption: string } };

/** A deliberately restricted, HTML-free subset of the Tiptap document format. */
export type RichTextDocument = { type: "doc"; content: RichTextNode[] };

export type ArticleDetails = {
  deck: string;
  issue: string;
  pullQuote: string;
  takeaway: string;
};

export type CaseStudySection = {
  id: string;
  label: string;
  title: string;
  paragraphs: string[];
  points?: string[];
};

export type CaseStudyDetails = {
  designation: "Concept Demonstration" | "Client engagement" | "Studio project";
  headline: string;
  focus: string[];
  projectStatus: string;
  statusDetail: string;
  demoUrl?: string;
  sections?: CaseStudySection[];
};

export type ResourceDetails = {
  resourceType: "Guide" | "Checklist" | "Template" | "Reference";
  downloadMediaId?: string;
  externalUrl?: string;
};

export type ClientDetails = {
  websiteUrl?: string;
  engagementSummary: string;
  logoMediaId?: string;
};

type EntryFields = {
  status: CmsStatus;
  slug: string;
  title: string;
  summary: string;
  seo_title: string;
  seo_description: string;
  category: string;
  tags: string[];
  featured: boolean;
  publication_approved: boolean;
  cover_media_id: string | null;
  body: RichTextDocument;
};

export type EntryInput = EntryFields &
  (
    | { kind: "article"; details: ArticleDetails }
    | { kind: "case-study"; details: CaseStudyDetails }
    | { kind: "resource"; details: ResourceDetails }
    | { kind: "client"; details: ClientDetails }
  );

export type CmsEntry = EntryInput & {
  /** Read-only media description resolved by the public query, not an editable entry field. */
  cover_alt?: string;
  id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type CmsMedia = {
  id: string;
  entry_id: string;
  storage_path: string;
  filename: string;
  mime_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "application/pdf";
  size_bytes: number;
  alt: string;
  created_by: string | null;
  created_at: string;
};

export const CMS_MEDIA_BUCKET = "cms-media";
export const CMS_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function isPubliclyEligible(entry: Pick<CmsEntry, "kind" | "status" | "publication_approved" | "details">): boolean {
  if (entry.status !== "published") return false;
  if (entry.kind === "client") return entry.publication_approved;
  if (entry.kind === "case-study" && "designation" in entry.details && entry.details.designation === "Client engagement") {
    return entry.publication_approved;
  }
  return true;
}
