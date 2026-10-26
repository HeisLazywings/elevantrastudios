import { siteName } from "@/lib/site";

export const keystonePaths = [
  "M36 27H73L42 180H0Z",
  "M78 0H139L127 134H90Z",
  "M143 27H180L216 180H174Z",
] as const;

const variants = {
  horizontal: { src: "/brand/keystone-horizontal-ink.svg", width: 1460, height: 352, classes: "w-[200px] min-[360px]:w-[216px] sm:w-[228px] lg:w-[248px]" },
  stacked: { src: "/brand/keystone-stacked-ink.svg", width: 1000, height: 540, classes: "w-[300px]" },
  symbol: { src: "/brand/keystone-symbol-ink.svg", width: 288, height: 288, classes: "w-11" },
};

/** Original ink artwork sits on a quiet light plate; no colour filters or redrawing. */
export default function BrandLogo({ variant = "horizontal", decorative = false, className = "" }: {
  variant?: keyof typeof variants;
  decorative?: boolean;
  className?: string;
}) {
  const asset = variants[variant];
  return (
    <span className={`inline-flex max-w-full shrink-0 overflow-hidden rounded-sm bg-[#F3EFE6] ${className}`}>
      <img src={asset.src} width={asset.width} height={asset.height} alt={decorative ? "" : siteName} className={`block h-auto max-w-full ${asset.classes}`} />
    </span>
  );
}
