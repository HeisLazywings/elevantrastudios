import type { Metadata } from "next";
import WorkClient from "@/components/WorkClient";
import FinalCTA from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "Work — Selected Projects by Elevanta Studio",
  description:
    "A curated portfolio of premium websites for hospitality, real estate, personal brands, and technology startups.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Work — Elevanta Studio",
    description:
      "Selected projects: cinematic websites engineered for performance and brand impact.",
    url: "/work",
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
