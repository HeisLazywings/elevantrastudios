import CmsEntryPage from "@/components/CmsEntryPage";
import { cmsPageMetadata } from "@/lib/cms/metadata";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) { return cmsPageMetadata("client", (await params).slug); }
export default async function ClientPage({ params }: Props) { return <CmsEntryPage kind="client" slug={(await params).slug} />; }
