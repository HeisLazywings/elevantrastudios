import { ENQUIRY_ID_PATTERN, ENQUIRY_LIMITS, validateEnquiry } from "../_shared/enquiry-contract.ts";
import type { EnquiryFields, EnquiryInput } from "../_shared/enquiry-contract.ts";

export type StoredEnquiry = EnquiryFields & {
  receipt_id: string; received_at: string;
  state: "pending" | "sending" | "failed" | "accepted";
  attempts: number; provider_message_id: string | null;
  request_payload: EmailPayload | null; last_error_code?: string | null;
};
export type EmailPayload = {
  from: string; to: string[]; reply_to: string; subject: string; text: string; html: string;
};
export type IntakeResult = { kind: "created" | "existing" | "conflict" | "limited"; receipt_id?: string; received_at?: string };
export type ClaimResult = { kind: "claimed" | "accepted" | "busy" | "exhausted" | "expired" | "missing"; request_payload?: EmailPayload };
export interface EnquiryRepository {
  accept(input: EnquiryInput, payloadHash: string, networkHash: string, emailHash: string): Promise<IntakeResult>;
  read(id: string): Promise<StoredEnquiry | null>;
  claim(id: string, payload: EmailPayload, token: string): Promise<ClaimResult>;
  finish(id: string, token: string, state: "accepted" | "failed", providerId: string | null, code: string | null): Promise<boolean>;
  configurationFailure(id: string, code: string): Promise<void>;
}
export type EnquiryConfig = {
  resendApiKey?: string; from?: string; to?: string; retrySecret?: string;
  allowedOrigins?: string; hashSecret?: string;
};
export type Dependencies = {
  repository: EnquiryRepository | null; config: EnquiryConfig;
  fetch?: typeof fetch; providerTimeoutMs?: number; bodyTimeoutMs?: number;
};
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const baseOrigins = ["https://www.elevantrastudios.com.ng", "https://elevantrastudios.com.ng"];
const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}
export function buildEmail(enquiry: StoredEnquiry, from: string, to: string): EmailPayload {
  const entries = [["Receipt", enquiry.receipt_id], ["Received (UTC)", enquiry.received_at], ["Name", enquiry.name], ["Email", enquiry.email], ["Company", enquiry.company || "Not supplied"], ["Indicative budget", enquiry.budget || "Not supplied"]];
  return {
    from, to: [to], reply_to: enquiry.email, subject: `New enquiry — ${enquiry.receipt_id}`,
    text: `New Elevantra Studios enquiry\n\n${entries.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nBusiness objective & current challenge\n${enquiry.message}`,
    html: `<h2>New Elevantra Studios enquiry</h2>${entries.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join("")}<h3>Business objective &amp; current challenge</h3><p>${escapeHtml(enquiry.message).replace(/\n/g, "<br>")}</p>`,
  };
}
function configuredEmail(config: EnquiryConfig): { from: string; to: string; key: string } | null {
  const from = config.from?.trim() || "";
  const to = config.to?.trim() || "";
  const key = config.resendApiKey?.trim() || "";
  const senderAddress = /<([^<>]+)>$/.exec(from)?.[1] || from;
  if (!key || key.length > 256 || /\s/.test(key) || !emailPattern.test(to) || to.length > 254 ||
      !emailPattern.test(senderAddress) || from.length > 320 || /[\r\n]/.test(from) || /@(?:[^@]*\.)?resend\.dev$/i.test(senderAddress)) return null;
  return { from, to, key };
}
async function hash(value: string): Promise<string> {
  const result = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(result)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function privateHash(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const result = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(result)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function authorizedOperator(request: Request, secret?: string): Promise<boolean> {
  if (!secret || secret.length < 32 || secret.length > 512) return false;
  const supplied = request.headers.get("authorization")?.match(/^Bearer (.{1,512})$/)?.[1];
  if (!supplied) return false;
  // Compare fixed-size digests without a string comparison that exits on the first byte.
  const [expectedHash, actualHash] = await Promise.all([hash(secret), hash(supplied)]);
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index++) difference |= expectedHash.charCodeAt(index) ^ actualHash.charCodeAt(index);
  return difference === 0;
}
class RequestError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
async function readJson(request: Request, timeoutMs: number): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) throw new RequestError(415, "invalid_content_type", "Please send a valid enquiry.");
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > ENQUIRY_LIMITS.bodyBytes)) throw new RequestError(413, "payload_too_large", "Your enquiry is too long. Please shorten it and try again.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "invalid_json", "Please send a valid enquiry.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => { void reader.cancel().catch(() => {}); reject(new RequestError(408, "request_timeout", "Please try submitting your enquiry again.")); }, timeoutMs); });
  try {
    const body = await Promise.race([(async () => {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > ENQUIRY_LIMITS.bodyBytes) { await reader.cancel(); throw new RequestError(413, "payload_too_large", "Your enquiry is too long. Please shorten it and try again."); }
        chunks.push(value);
      }
      const joined = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.length; }
      return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(joined));
    })(), timeout]);
    return body;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(400, "invalid_json", "Please send a valid enquiry.");
  } finally { clearTimeout(timer); }
}

export async function notifyEnquiry(id: string, dependencies: Dependencies): Promise<string> {
  const repository = dependencies.repository!;
  const enquiry = await repository.read(id);
  if (!enquiry) return "missing";
  if (enquiry.state === "accepted") return "accepted";
  const email = configuredEmail(dependencies.config);
  if (!email) { await repository.configurationFailure(id, "notification_configuration_missing"); return "failed"; }
  const token = crypto.randomUUID();
  // Snapshot all email fields once in Postgres. Retries cannot change the request attached to the idempotency key.
  const claimed = await repository.claim(id, enquiry.request_payload || buildEmail(enquiry, email.from, email.to), token);
  if (claimed.kind !== "claimed") return claimed.kind;
  const payload = claimed.request_payload;
  if (!payload) throw new Error("notification_snapshot_missing");
  const controller = new AbortController();
  const timeoutMs = dependencies.providerTimeoutMs ?? 8000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let providerId: string | null = null;
  let failureCode: string | null = null;
  try {
    const timedOut = new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error("provider_timeout")); }, timeoutMs); });
    const response = await Promise.race([(dependencies.fetch || fetch)("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${email.key}`, "Content-Type": "application/json", "Idempotency-Key": `elevantra-enquiry/${id}` },
      body: JSON.stringify(payload), signal: controller.signal,
    }), timedOut]);
    if (!response.ok) { failureCode = response.status === 429 ? "provider_rate_limited" : "provider_rejected"; }
    else {
      const result = await Promise.race([response.json(), timedOut]) as Record<string, unknown>;
      if (typeof result.id === "string" && result.id.length > 0 && result.id.length <= 200 && !/[\r\n]/.test(result.id)) providerId = result.id;
      else failureCode = "provider_response_invalid";
    }
  } catch (error) {
    failureCode = error instanceof Error && (error.message === "provider_timeout" || error.name === "AbortError") ? "provider_timeout" : "provider_unavailable";
  } finally { clearTimeout(timer); }
  // A provider acceptance is not proof of inbox delivery. If this write fails the lease expires;
  // a protected retry reuses the identical payload and provider idempotency key.
  const recorded = await repository.finish(id, token, providerId ? "accepted" : "failed", providerId, failureCode);
  return recorded ? (providerId ? "accepted" : "failed") : "busy";
}

export function createEnquiryHandler(dependencies: Dependencies): (request: Request) => Promise<Response> {
  const allowed = new Set(baseOrigins);
  for (const candidate of (dependencies.config.allowedOrigins || "").split(",")) {
    const value = candidate.trim();
    if (!value) continue;
    try { if (new URL(value).origin === value && /^https?:\/\//.test(value)) allowed.add(value); } catch { /* Ignore malformed configuration; never create a wildcard policy. */ }
  }
  return async (request: Request) => {
    const origin = request.headers.get("origin");
    const cors: Record<string, string> = { Vary: "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Max-Age": "600" };
    if (origin && allowed.has(origin)) cors["Access-Control-Allow-Origin"] = origin;
    const respond = (body: unknown, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, ...cors, ...extra } });
    if (origin && !allowed.has(origin)) return respond({ ok: false, code: "origin_not_allowed", error: "This request could not be accepted." }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "Cache-Control": "no-store" } });
    if (request.method !== "POST") return respond({ ok: false, code: "method_not_allowed", error: "Please submit your enquiry using the form." }, 405, { Allow: "POST, OPTIONS" });
    try {
      const body = await readJson(request, dependencies.bodyTimeoutMs ?? 3000);
      const action = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).action : undefined;
      if (action === "retry" || action === "status") {
        if (!await authorizedOperator(request, dependencies.config.retrySecret)) return respond({ ok: false, code: "unauthorized", error: "Operator authorization is required." }, 401);
        const data = body as Record<string, unknown>;
        if (Object.keys(data).some((key) => key !== "action" && key !== "submissionId") || typeof data.submissionId !== "string" || !ENQUIRY_ID_PATTERN.test(data.submissionId)) throw new RequestError(400, "invalid_receipt", "A valid receipt ID is required.");
        if (!dependencies.repository) throw new RequestError(503, "unavailable", "The enquiry service is temporarily unavailable.");
        const id = data.submissionId.toLowerCase();
        let outcome: string | undefined;
        if (action === "retry") outcome = await notifyEnquiry(id, dependencies);
        const record = await dependencies.repository.read(id);
        if (!record) return respond({ ok: false, code: "not_found", error: "No enquiry was found for that receipt." }, 404);
        return respond({ ok: true, receiptId: id, receivedAt: record.received_at, notification: { state: record.state, attempts: record.attempts, providerMessageId: record.provider_message_id, lastErrorCode: record.last_error_code || null, ...(outcome ? { outcome } : {}) } });
      }
      const input = validateEnquiry(body);
      if (!input) throw new RequestError(400, "invalid_enquiry", "Please check your name, email address and message, then try again.");
      if (!dependencies.repository || !dependencies.config.hashSecret) throw new RequestError(503, "unavailable", "Your enquiry could not be saved. Please try again or email the studio.");
      const fields = { name: input.name, email: input.email, company: input.company, budget: input.budget, message: input.message };
      // Forwarding headers are not authentication. DB limits also include a global bucket and an email bucket.
      const network = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").slice(0, 128);
      const [payloadHash, networkHash, emailHash] = await Promise.all([hash(JSON.stringify(fields)), privateHash(`network:${network}`, dependencies.config.hashSecret), privateHash(`email:${input.email}`, dependencies.config.hashSecret)]);
      const saved = await dependencies.repository.accept(input, payloadHash, networkHash, emailHash);
      if (saved.kind === "conflict") return respond({ ok: false, code: "receipt_conflict", error: "This enquiry changed while it was being sent. Please try again." }, 409);
      if (saved.kind === "limited") return respond({ ok: false, code: "rate_limited", error: "Please wait a little before trying again, or email the studio." }, 429, { "Retry-After": "900" });
      if (!saved.receipt_id || !saved.received_at) throw new Error("storage_result_invalid");
      if (saved.kind === "created") {
        try { await notifyEnquiry(input.submissionId, dependencies); } catch { /* Receipt remains durable. Operator status/retry handles notification recovery. */ }
      }
      return respond({ ok: true, receiptId: saved.receipt_id, receivedAt: saved.received_at }, saved.kind === "created" ? 201 : 200);
    } catch (error) {
      if (error instanceof RequestError) return respond({ ok: false, code: error.code, error: error.message }, error.status);
      return respond({ ok: false, code: "unavailable", error: "Your enquiry could not be saved. Please try again or email the studio." }, 503);
    }
  };
}
