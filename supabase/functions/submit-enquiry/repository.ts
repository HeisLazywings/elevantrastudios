import type { ClaimResult, EmailPayload, EnquiryRepository, IntakeResult, StoredEnquiry } from "./core.ts";
import type { EnquiryInput } from "../_shared/enquiry-contract.ts";

/** Uses only server-side project credentials supplied to the Edge runtime. */
export function createRepository(url: string, key: string, request: typeof fetch = fetch): EnquiryRepository {
  const base = new URL("/rest/v1/rpc/", url).href;
  async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await request(base + name, {
        method: "POST", headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: controller.signal,
      });
      if (!response.ok) throw new Error("enquiry_database_unavailable");
      return await response.json() as T;
    } finally { clearTimeout(timeout); }
  }
  return {
    accept(input: EnquiryInput, payloadHash: string, networkHash: string, emailHash: string) {
      const { submissionId, ...payload } = input;
      return rpc<IntakeResult>("accept_enquiry", { p_submission_id: submissionId, p_payload: payload, p_payload_hash: payloadHash, p_network_hash: networkHash, p_email_hash: emailHash });
    },
    read(id: string) { return rpc<StoredEnquiry | null>("read_enquiry_notification", { p_submission_id: id }); },
    claim(id: string, payload: EmailPayload, token: string) { return rpc<ClaimResult>("claim_enquiry_notification", { p_submission_id: id, p_payload: payload, p_claim_token: token }); },
    finish(id: string, token: string, state: "accepted" | "failed", providerId: string | null, code: string | null) { return rpc<boolean>("finish_enquiry_notification", { p_submission_id: id, p_claim_token: token, p_state: state, p_provider_message_id: providerId, p_error_code: code }); },
    async configurationFailure(id: string, code: string) { await rpc("fail_enquiry_configuration", { p_submission_id: id, p_error_code: code }); },
  };
}
