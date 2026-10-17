import { unstable_noStore as noStore } from "next/cache";
import { createPublicCmsClient } from "./supabase-server";
import { entryInputSchema } from "./validation";
import { isPubliclyEligible, type CmsEntry, type CmsKind, type CmsMedia } from "./types";

function parseEntry(row: Record<string, unknown>): CmsEntry {
  const input = entryInputSchema.safeParse(row);
  if (!input.success || typeof row.id !== "string" || typeof row.created_at !== "string" || typeof row.updated_at !== "string") {
    throw new Error("Published CMS content has an invalid format. Review the entry in the CMS.");
  }
  return {
    ...input.data,
    id: row.id,
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: typeof row.created_by === "string" ? row.created_by : null,
    updated_by: typeof row.updated_by === "string" ? row.updated_by : null,
    cover_alt: row.cover && typeof row.cover === "object" && "alt" in row.cover && typeof row.cover.alt === "string" ? row.cover.alt : undefined,
  };
}

/** Public readers never use request cookies: an admin session cannot leak drafts. */
export async function getPublishedEntries(kind?: CmsKind): Promise<CmsEntry[]> {
  noStore();
  const supabase = createPublicCmsClient();
  if (!supabase) return [];
  let query = supabase.from("cms_entries").select("*, cover:cms_media!cms_entries_cover_media_fk(alt)").eq("status", "published");
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query.order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error("Published CMS content is temporarily unavailable.");
  return (data ?? []).map((row) => parseEntry(row)).filter(isPubliclyEligible);
}

export async function getPublishedEntry(kind: CmsKind, slug: string): Promise<CmsEntry | null> {
  noStore();
  const supabase = createPublicCmsClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("cms_entries").select("*, cover:cms_media!cms_entries_cover_media_fk(alt)").eq("kind", kind).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw new Error("Published CMS content is temporarily unavailable.");
  if (!data) return null;
  const entry = parseEntry(data);
  return isPubliclyEligible(entry) ? entry : null;
}

export async function getPublishedMedia(id: string): Promise<CmsMedia | null> {
  noStore();
  const supabase = createPublicCmsClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("cms_media").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Published media is temporarily unavailable.");
  return data as CmsMedia | null;
}
