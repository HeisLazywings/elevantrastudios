import { ImageResponse } from "next/og";
import { getSiteArticle } from "@/lib/content";
import { siteName } from "@/lib/site";

export const alt = "Insights — Elevantra Studios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getSiteArticle(slug);
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "#12130e", color: "#eee6d7", padding: 65, borderLeft: "10px solid #c8a45d" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, letterSpacing: 3, color: "#c8a45d", textTransform: "uppercase" }}><span>{siteName} / Insights</span><span>{article?.issue ?? ""}</span></div>
      <div style={{ display: "flex", fontSize: 64, lineHeight: 1.15, letterSpacing: -2, maxWidth: 1040 }}>{article?.title ?? "Ideas with business in mind."}</div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid #49402d", fontSize: 22, color: "#b6b2a8" }}><span>{article?.category ?? "Studio thinking"}</span><span>Editorial analysis</span></div>
    </div>,
    size,
  );
}
