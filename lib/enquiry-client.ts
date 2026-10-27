/** Public intake transport. Only the project's public key belongs in this client. */
import type { EnquiryInput } from "./enquiry-contract";

export type EnquiryPayload = EnquiryInput & { website: string };

export type EnquiryReceipt = { receiptId: string; receivedAt: string };

export class EnquirySubmissionError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = "EnquirySubmissionError";
  }
}

export function enquiryEndpoint(url: string | undefined, publishableKey: string | undefined) {
  if (!url?.trim() || !publishableKey?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return null;
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") return null;
    return `${parsed.origin}/functions/v1/submit-enquiry`;
  } catch {
    return null;
  }
}

/** A timeout is uncertain receipt, so the caller retains the submission ID for retry. */
export async function submitEnquiry(
  endpoint: string,
  publishableKey: string,
  payload: EnquiryPayload,
  fetcher: typeof fetch = fetch,
  timeoutMs = 20000,
): Promise<EnquiryReceipt> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: publishableKey.trim() },
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new EnquirySubmissionError(response.status === 429 ? "rate_limited" : response.status === 409 ? "conflict" : "unconfirmed");
    }
    if (!body || typeof body !== "object") throw new EnquirySubmissionError("unconfirmed");
    const value = body as Record<string, unknown>;
    if (value.ok !== true || typeof value.receiptId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.receiptId) ||
        value.receiptId.toLowerCase() !== payload.submissionId.toLowerCase() ||
        typeof value.receivedAt !== "string" || !Number.isFinite(Date.parse(value.receivedAt))) {
      throw new EnquirySubmissionError("unconfirmed");
    }
    return { receiptId: value.receiptId, receivedAt: value.receivedAt };
  } catch (error) {
    if (error instanceof EnquirySubmissionError) throw error;
    throw new EnquirySubmissionError("unconfirmed");
  } finally {
    clearTimeout(timeout);
  }
}
