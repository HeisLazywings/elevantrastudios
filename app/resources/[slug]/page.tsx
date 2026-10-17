import CmsEntryPage from "@/components/CmsEntryPage";
import { cmsPageMetadata } from "@/lib/cms/metadata";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) { return cmsPageMetadata("resource", (await params).slug); }
export default async function ResourcePage({ params }: Props) { return <CmsEntryPage kind="resource" slug={(await params).slug} />; }
