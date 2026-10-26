"use client";

import { Analytics } from "@vercel/analytics/next";
import { filterPublicAnalyticsEvent } from "@/lib/analytics";

export default function PublicAnalytics({ enabled = true }: { enabled?: boolean }) {
  if (!enabled) return null;
  return <Analytics beforeSend={filterPublicAnalyticsEvent} />;
}
