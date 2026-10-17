export interface CmsConfig {
  url: string;
  publishableKey: string;
}

// These are public project credentials. Never use a service-role key here.
export function getCmsConfig(): CmsConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !publishableKey) return null;

  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) return null;
    return { url: parsed.origin, publishableKey };
  } catch {
    return null;
  }
}
