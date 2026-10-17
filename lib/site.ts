export const siteName = "Elevantra Studios";

export const siteDescription =
  "Elevantra Studios is an independent digital studio in Nigeria, creating considered websites and sharing practical thinking on trust, customer journeys, and business on the web.";

function configuredSiteUrl(): URL | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://elevantrastudios.vercel.app";

  try {
    const url = new URL(configured);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      return undefined;
    }
    return new URL(url.origin);
  } catch {
    return undefined;
  }
}

// The studio's confirmed public origin; an environment override supports future domains.
export const siteUrl = configuredSiteUrl();

export function absoluteUrl(path: string): string | undefined {
  return siteUrl ? new URL(path, siteUrl).toString() : undefined;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
