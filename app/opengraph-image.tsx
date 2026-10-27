import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteName, sitePositioning } from "@/lib/site";

export const alt = `${siteName} — ${sitePositioning}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/keystone-horizontal-light.svg"));
  const logoData = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "#101411", color: "#F3EFE6", padding: 64 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex" }}>
          <img src={logoData} width={440} height={106.08} alt={siteName} />
        </div>
        <span style={{ fontSize: 15, letterSpacing: 2, color: "#bcb8ad", textTransform: "uppercase" }}>Independent studio / Nigeria</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.08, letterSpacing: -3 }}>
        <span>Commercial systems.</span>
        <span style={{ color: "#d8bd83" }}>Digital growth.</span>
      </div>
      <div style={{ display: "flex", paddingTop: 24, borderTop: "1px solid #4c4d40", fontSize: 22, color: "#c6c5bb" }}>
        Understand the business. Build what is justified.
      </div>
    </div>,
    size,
  );
}
