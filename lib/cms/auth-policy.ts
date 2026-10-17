export class AdminAuthError extends Error {
  readonly status: 401 | 403 | 503;

  constructor(status: 401 | 403 | 503, message?: string) {
    super(message || ({
      401: "Please sign in to continue.",
      403: "This account is not authorised for studio administration.",
      503: "Studio administration is not configured or is temporarily unavailable.",
    })[status]);
    this.status = status;
    this.name = "AdminAuthError";
  }
}

export function assertSameOrigin(request: Request): void {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return;
  const origin = request.headers.get("origin");
  const internalUrl = new URL(request.url);
  // Next can use an internal hostname in request.url behind a reverse proxy.
  // Browsers set Host themselves; cross-site JavaScript cannot forge it.
  const host = request.headers.get("host") || internalUrl.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? `${forwardedProtocol}:` : internalUrl.protocol;
  let expectedOrigin: string | undefined;
  try {
    // Construct a new origin so an internal server port cannot survive a host change.
    const externalUrl = new URL(`${protocol}//${host}`);
    if (!externalUrl.username && !externalUrl.password) expectedOrigin = externalUrl.origin;
  } catch { /* A malformed host cannot establish a same-origin request. */ }
  if (!origin || origin !== expectedOrigin) {
    throw new AdminAuthError(403, "This request must originate from the studio administration site.");
  }
}

export function safeAdminPath(value: unknown, fallback = "/admin"): string {
  if (typeof value !== "string" || value.length > 2048 || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://admin.invalid");
    if (url.origin !== "https://admin.invalid" || !value.startsWith("/")) return fallback;
    if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) return fallback;
    if (url.pathname === "/admin/login" || url.pathname.startsWith("/admin/login/")) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}


type LoginJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; error: string };

/** Bound both declared and chunked request sizes before decoding credentials. */
export async function readLoginJson(request: Request): Promise<LoginJsonResult> {
  const maxBytes = 4096;
  const invalid = (): LoginJsonResult => ({ ok: false, status: 400, error: "Send a valid sign-in request." });
  const oversized = (): LoginJsonResult => ({ ok: false, status: 413, error: "The sign-in request is too large." });
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    if (!/^\d+$/.test(declaredLength)) return invalid();
    if (Number(declaredLength) > maxBytes) return oversized();
  }
  if (!request.body) return invalid();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        try { await reader.cancel(); } catch { /* The size limit still applies if cancellation fails. */ }
        return oversized();
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(json) };
  } catch {
    return invalid();
  } finally {
    reader.releaseLock();
  }
}
