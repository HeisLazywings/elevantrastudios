import { ImageResponse } from "next/og";
import { keystonePaths } from "@/components/BrandLogo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "Elevantra Studios Keystone symbol";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#F3EFE6" }}>
      <svg width="135" height="112.5" viewBox="0 0 216 180" fill="#172329">
        {keystonePaths.map((path) => <path key={path} d={path} />)}
      </svg>
    </div>,
    size,
  );
}
