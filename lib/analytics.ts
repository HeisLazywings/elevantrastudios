const privateQueryKeys = new Set(["preview", "draft", "token", "secret", "access_token", "refresh_token", "code"]);

/** Only public page URLs reach analytics; private routes and credentials never do. */
export function filterPublicAnalyticsEvent<T extends { url: string }>(event: T): T | null {
  try {
    const url = new URL(event.url);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    const pathname = decodeURIComponent(url.pathname).replace(/\\/g, "/").toLowerCase();
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "admin" || segments[0] === "api" || segments.some((segment) => segment === "preview" || segment === "draft")) return null;
    if (Array.from(url.searchParams.keys()).some((key) => privateQueryKeys.has(key.toLowerCase()))) return null;
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return null;
  }
}
