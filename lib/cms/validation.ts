import { z } from "zod";
import type { EntryInput, RichTextDocument, RichTextNode } from "./types";

const MAX_NODES = 2_000;
const MAX_NODE_DEPTH = 12;
const MAX_TEXT_LENGTH = 120_000;
const MAX_DOCUMENT_BYTES = 500_000;
const nodeTypes = new Set(["doc", "paragraph", "heading", "blockquote", "bulletList", "orderedList", "listItem", "text", "image"]);

export function isSafeContentUrl(value: string, allowContact = true): boolean {
  if (value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    const allowed = allowContact ? ["https:", "http:", "mailto:", "tel:"] : ["https:", "http:"];
    return allowed.includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

const linkUrl = z.string().max(2_000).refine((value) => isSafeContentUrl(value), "Use an absolute http, https, mailto or tel URL.");
const webUrl = z.string().max(2_000).refine((value) => isSafeContentUrl(value, false), "Use an absolute http or https URL.");
const optionalWebUrl = z.union([webUrl, z.literal("")]).optional().transform((value) => value || undefined);
const uuid = z.uuid();
const optionalUuid = z.union([uuid, z.literal("")]).optional().transform((value) => value || undefined);
const text = z.string().max(20_000);

const markSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("link"), attrs: z.object({ href: linkUrl }) }),
]);

// Unknown attributes are stripped. In particular, uploaded image `src` URLs are
// never trusted or persisted; renderers resolve the retained mediaId themselves.
const nodeSchema: z.ZodType<RichTextNode> = z.lazy(() => z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: text.min(1), marks: z.array(markSchema).max(3).refine((marks) => new Set(marks.map((mark) => mark.type)).size === marks.length, "A text mark can only occur once.").optional() }),
  z.object({ type: z.literal("paragraph"), content: z.array(nodeSchema).max(MAX_NODES).optional() }),
  z.object({ type: z.literal("heading"), attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }), content: z.array(nodeSchema).max(MAX_NODES).optional() }),
  z.object({ type: z.literal("blockquote"), content: z.array(nodeSchema).min(1).max(MAX_NODES) }),
  z.object({ type: z.literal("bulletList"), content: z.array(nodeSchema).min(1).max(MAX_NODES) }),
  z.object({ type: z.literal("orderedList"), attrs: z.object({ start: z.number().int().min(1).max(10_000) }).optional(), content: z.array(nodeSchema).min(1).max(MAX_NODES) }),
  z.object({ type: z.literal("listItem"), content: z.array(nodeSchema).min(1).max(MAX_NODES) }),
  z.object({ type: z.literal("image"), attrs: z.object({ mediaId: uuid, alt: z.string().max(500).default(""), caption: z.string().max(1_000).default("") }) }),
]));

function documentPreflight(value: unknown): string | null {
  const pending: { value: unknown; depth: number; nodeDepth: number }[] = [{ value, depth: 0, nodeDepth: 0 }];
  const seen = new WeakSet<object>();
  let nodes = 0;
  let textLength = 0;
  let objects = 0;

  while (pending.length) {
    const item = pending.pop()!;
    if (item.depth > 40) return "Document nesting is too deep.";
    if (typeof item.value === "string") {
      if (item.value.length > 20_000) return "An individual text value is too long.";
      continue;
    }
    if (item.value === null || typeof item.value !== "object") continue;
    if (seen.has(item.value)) return "Document must contain plain JSON without cycles.";
    seen.add(item.value);
    if (++objects > 12_000) return "Document is too complex.";
    const record = item.value as Record<string, unknown>;
    const isNode = typeof record.type === "string" && nodeTypes.has(record.type);
    const nodeDepth = item.nodeDepth + (isNode ? 1 : 0);
    if (nodeDepth > MAX_NODE_DEPTH) return "Document nesting is too deep.";
    if (isNode && ++nodes > MAX_NODES) return "Document contains too many nodes.";
    if (record.type === "text" && typeof record.text === "string") {
      textLength += record.text.length;
      if (textLength > MAX_TEXT_LENGTH) return "Document text is too long.";
    }
    for (const child of Object.values(record)) {
      pending.push({ value: child, depth: item.depth + 1, nodeDepth });
    }
  }

  try {
    if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_DOCUMENT_BYTES) return "Document is too large.";
  } catch {
    return "Document must contain valid JSON.";
  }
  return null;
}

const documentStructure = z.object({ type: z.literal("doc"), content: z.array(nodeSchema).max(MAX_NODES) }).superRefine((document, ctx) => {
  function checkChildren(parent: "doc" | RichTextNode["type"], children: RichTextNode[], path: (string | number)[]) {
    for (const [index, child] of children.entries()) {
      const allowed = parent === "paragraph" || parent === "heading"
        ? child.type === "text"
        : parent === "bulletList" || parent === "orderedList"
          ? child.type === "listItem"
          : parent === "listItem"
            ? ["paragraph", "bulletList", "orderedList", "blockquote"].includes(child.type)
            : !["text", "listItem"].includes(child.type);
      if (!allowed) ctx.addIssue({ code: "custom", path: [...path, index], message: `Invalid ${child.type} inside ${parent}.` });
      if (child.type === "listItem" && child.content[0]?.type !== "paragraph") {
        ctx.addIssue({ code: "custom", path: [...path, index], message: "A list item must begin with a paragraph." });
      }
      if ("content" in child && child.content) checkChildren(child.type, child.content, [...path, index, "content"]);
    }
  }
  checkChildren("doc", document.content, ["content"]);
});

export const documentSchema = z.unknown().transform((value, ctx) => {
  const problem = documentPreflight(value);
  if (problem) {
    ctx.addIssue({ code: "custom", message: problem });
    return z.NEVER;
  }
  return value;
}).pipe(documentStructure) as z.ZodType<RichTextDocument>;

const sectionSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(300),
  paragraphs: z.array(text).max(30),
  points: z.array(z.string().max(2_000)).max(30).optional(),
});

const baseShape = {
  status: z.enum(["draft", "published"]).default("draft"),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().max(1_000).default(""),
  seo_title: z.string().trim().max(300).default(""),
  seo_description: z.string().trim().max(500).default(""),
  category: z.string().trim().max(100).default(""),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]).transform((tags) => [...new Set(tags)]),
  featured: z.boolean().default(false),
  publication_approved: z.boolean().default(false),
  cover_media_id: z.union([uuid, z.literal("")]).nullable().default(null).transform((value) => value || null),
  body: documentSchema,
};

export const entryInputSchema = z.discriminatedUnion("kind", [
  z.object({ ...baseShape, kind: z.literal("article"), details: z.object({ deck: z.string().max(1_000).default(""), issue: z.string().max(30).default(""), pullQuote: z.string().max(2_000).default(""), takeaway: z.string().max(2_000).default("") }) }),
  z.object({ ...baseShape, kind: z.literal("case-study"), details: z.object({ designation: z.enum(["Concept Demonstration", "Client engagement", "Studio project"]), headline: z.string().max(500).default(""), focus: z.array(z.string().max(100)).max(20).default([]), projectStatus: z.string().max(200).default("Status not confirmed"), statusDetail: z.string().max(3_000).default(""), demoUrl: optionalWebUrl, sections: z.array(sectionSchema).max(20).optional() }) }),
  z.object({ ...baseShape, kind: z.literal("resource"), details: z.object({ resourceType: z.enum(["Guide", "Checklist", "Template", "Reference"]).default("Guide"), downloadMediaId: optionalUuid, externalUrl: optionalWebUrl }) }),
  z.object({ ...baseShape, kind: z.literal("client"), details: z.object({ websiteUrl: optionalWebUrl, engagementSummary: z.string().max(3_000).default(""), logoMediaId: optionalUuid }) }),
]).superRefine((entry, ctx) => {
  if (entry.status === "published" && !entry.publication_approved && (entry.kind === "client" || (entry.kind === "case-study" && entry.details.designation === "Client engagement"))) {
    ctx.addIssue({ code: "custom", path: ["publication_approved"], message: "Confirm permission to publish this client name, project details and assets before publishing." });
  }
  if (entry.kind === "case-study" && entry.details.sections) {
    const ids = entry.details.sections.map((section) => section.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", path: ["details", "sections"], message: "Section IDs must be unique." });
  }
}) as z.ZodType<EntryInput>;

export function getDocumentMediaIds(document: RichTextDocument): string[] {
  const ids = new Set<string>();
  const pending = [...document.content];
  while (pending.length) {
    const node = pending.pop()!;
    if (node.type === "image") ids.add(node.attrs.mediaId);
    if ("content" in node && node.content) pending.push(...node.content);
  }
  return [...ids];
}
