import { siteName } from "@/lib/site";

export const keystonePaths = [
  "M36 27H73L42 180H0Z",
  "M78 0H139L127 134H90Z",
  "M143 27H180L216 180H174Z",
] as const;

const variants = {
  horizontal: { width: 1460, height: 352, classes: "w-[200px] min-[360px]:w-[216px] sm:w-[228px] lg:w-[248px]" },
  stacked: { width: 1000, height: 540, classes: "w-[300px]" },
  symbol: { width: 288, height: 288, classes: "w-11" },
};

/** Colour-only SVG variants retain the approved artwork and transparent clear space. */
export default function BrandLogo({ variant = "horizontal", tone = "light", decorative = false, className = "" }: {
  variant?: keyof typeof variants;
  tone?: "light" | "ink";
  decorative?: boolean;
  className?: string;
}) {
  const asset = variants[variant];
  return (
    <span className={`inline-flex max-w-full shrink-0 bg-transparent ${className}`}>
      <img src={`/brand/keystone-${variant}-${tone}.svg`} width={asset.width} height={asset.height} alt={decorative ? "" : siteName} className={`block h-auto max-w-full bg-transparent ${asset.classes}`} />
    </span>
  );
}
