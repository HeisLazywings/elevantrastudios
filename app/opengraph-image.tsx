import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const alt = "Elevantra Studios — Considered websites. Clearer journeys.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "#090a08", color: "#eee6d7", padding: 70, borderLeft: "10px solid #c8a45d" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: "#c8a45d", textTransform: "uppercase" }}><span>{siteName}</span><span>Digital studio / Nigeria</span></div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.12, letterSpacing: -3 }}><span>Considered websites.</span><span style={{ color: "#e4c585" }}>Clearer journeys.</span></div>
      <div style={{ display: "flex", paddingTop: 24, borderTop: "1px solid #49402d", fontSize: 23, color: "#b6b2a8" }}>Strategy, design & development.</div>
    </div>,
    size,
  );
}
