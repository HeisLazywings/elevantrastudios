import type { Metadata } from "next";
import WorkClient from "@/components/WorkClient";
import FinalCTA from "@/components/FinalCTA";
import { absoluteUrl, siteName } from "@/lib/site";

const canonical = absoluteUrl("/work");

export const metadata: Metadata = {
  title: "Work & Design Studies",
  description:
    "Explore Elevantra Studios’ selected work and clearly labelled concept demonstrations, with the business context and design thinking behind each study.",
  ...(canonical ? { alternates: { canonical } } : {}),
  ...(process.env.CONTENT_PREVIEW === "true" ? { robots: { index: false, follow: false } } : {}),
  openGraph: {
    title: `Work & Design Studies — ${siteName}`,
    description:
      "Selected work, clear context, and the thinking behind a considered digital experience.",
    ...(canonical ? { url: canonical } : {}),
  },
};

export default function WorkPage() {
  return (
    <>
      <WorkClient />
      <FinalCTA />
    </>
  );
}
