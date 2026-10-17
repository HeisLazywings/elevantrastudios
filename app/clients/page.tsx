import type { Metadata } from "next";
import CmsCollection from "@/components/CmsCollection";
import { absoluteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Client profiles", description: "Approved client profiles shared with permission by Elevantra Studios.", alternates: { canonical: absoluteUrl("/clients") } };
export default function ClientsPage() { return <CmsCollection kind="client" />; }
