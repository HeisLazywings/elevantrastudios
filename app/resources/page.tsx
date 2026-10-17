import type { Metadata } from "next";
import CmsCollection from "@/components/CmsCollection";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resources", description: "Guides and practical resources from Elevantra Studios.", alternates: { canonical: absoluteUrl("/resources") } };
export default function ResourcesPage() { return <CmsCollection kind="resource" />; }
