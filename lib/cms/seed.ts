import type { SupabaseClient } from "@supabase/supabase-js";
import { articles } from "../insights";
import { publicProjects } from "../projects";
import type { EntryInput, RichTextNode } from "./types";
import { entryInputSchema } from "./validation";

function paragraph(text: string): RichTextNode {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

/** Existing local content is imported only on an administrator's explicit action. */
export function getInitialDrafts(): EntryInput[] {
  const drafts: unknown[] = articles.map((article) => ({
    kind: "article",
    status: "draft",
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: article.category,
    featured: article.featured,
    body: {
      type: "doc",
      content: article.sections.flatMap((section): RichTextNode[] => [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: section.title }] },
        ...section.paragraphs.map(paragraph),
        ...(section.points?.length ? [{ type: "bulletList" as const, content: section.points.map((point): RichTextNode => ({ type: "listItem", content: [paragraph(point)] })) }] : []),
      ]),
    },
    details: { deck: article.deck, issue: article.issue, pullQuote: article.pullQuote, takeaway: article.takeaway },
  }));

  for (const project of publicProjects) {
    drafts.push({
      kind: "case-study",
      status: "draft",
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      category: project.category,
      featured: true,
      body: {
        type: "doc",
        content: project.sections.flatMap((section): RichTextNode[] => [
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: section.title }] },
          ...section.paragraphs.map(paragraph),
          ...(section.points?.length ? [{ type: "bulletList" as const, content: section.points.map((point): RichTextNode => ({ type: "listItem", content: [paragraph(point)] })) }] : []),
        ]),
      },
      details: {
        designation: project.designation,
        headline: project.headline,
        focus: [...project.focus],
        projectStatus: project.status,
        statusDetail: project.statusDetail,
        ...(project.demoUrl ? { demoUrl: project.demoUrl } : {}),
      },
    });
  }

  // Validation also removes internal editorial reviewNotes and unknown fields.
  return drafts.map((draft) => entryInputSchema.parse(draft));
}

export async function importInitialDrafts(supabase: SupabaseClient): Promise<{ inserted: number; skipped: number }> {
  const drafts = getInitialDrafts();
  const { data, error } = await supabase.from("cms_entries").upsert(drafts, { onConflict: "kind,slug", ignoreDuplicates: true }).select("id");
  if (error) throw new Error("Could not import the starter drafts. Confirm the CMS migration and administrator access.");
  const inserted = data?.length ?? 0;
  return { inserted, skipped: drafts.length - inserted };
}
