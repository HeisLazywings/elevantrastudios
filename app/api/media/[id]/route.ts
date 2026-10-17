import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/cms/auth";
import { createPublicCmsClient } from "@/lib/cms/supabase-server";
import { CMS_MAX_UPLOAD_BYTES, CMS_MEDIA_BUCKET, type CmsMedia } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};

function unavailable(status = 404) {
  return NextResponse.json({ error: status === 503 ? "This media is temporarily unavailable." : "This media was not found." }, { status, headers });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return unavailable();
    const publicClient = createPublicCmsClient();
    if (!publicClient) return unavailable(503);
    // Always begin with a stateless anonymous client. An editor's cookies must never
    // silently expand the public content query or create a cacheable draft URL.
    const result = await publicClient.from("cms_media").select("*").eq("id", id).maybeSingle();
    if (result.error) return unavailable(503);
    let media = result.data as CmsMedia | null;
    let storageClient = publicClient;
    if (!media) {
      const admin = await getAdminSession();
      if (admin.status !== "authenticated") return unavailable();
      const privateResult = await admin.session.supabase.from("cms_media").select("*").eq("id", id).maybeSingle();
      if (privateResult.error || !privateResult.data) return unavailable();
      media = privateResult.data as CmsMedia;
      storageClient = admin.session.supabase;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(media.mime_type) || media.size_bytes > CMS_MAX_UPLOAD_BYTES) return unavailable();
    // Storage applies RLS again, including publication state at the time of download.
    const { data: blob, error } = await storageClient.storage.from(CMS_MEDIA_BUCKET).download(media.storage_path);
    if (error || !blob || blob.size > CMS_MAX_UPLOAD_BYTES) return unavailable();
    const filename = media.filename.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 200) || "download";
    const disposition = media.mime_type.startsWith("image/") ? "inline" : "attachment";
    return new Response(blob, {
      headers: {
        ...headers,
        "Content-Type": media.mime_type,
        "Content-Length": String(blob.size),
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return unavailable(503);
  }
}
