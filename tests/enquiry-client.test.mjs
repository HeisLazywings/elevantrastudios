import assert from "node:assert/strict";
import { test } from "node:test";
import { enquiryEndpoint, EnquirySubmissionError, submitEnquiry } from "../lib/enquiry-client.ts";

const endpoint = "https://example.supabase.co/functions/v1/submit-enquiry";
const payload = {
  submissionId: "e7d6b5a4-57c1-489d-b833-b89865907b89", name: "Test Visitor",
  email: "visitor@example.com", company: "Example", budget: "", message: "A test enquiry.", website: "",
};
const receipt = { ok: true, receiptId: payload.submissionId, receivedAt: "2026-10-27T12:00:00Z" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

test("anonymous intake sends exactly one request with the public apikey and no browser session", async () => {
  const calls = [];
  const fetcher = async (...args) => { calls.push(args); return json(receipt, 201); };
  assert.deepEqual(await submitEnquiry(endpoint, " sb_publishable_example ", payload, fetcher), {
    receiptId: receipt.receiptId, receivedAt: receipt.receivedAt,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], endpoint);
  const request = calls[0][1];
  assert.equal(request.credentials, "omit");
  assert.equal(request.headers.apikey, "sb_publishable_example");
  assert.equal(request.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(request.body), payload);
});

test("receipt requires durable-storage acknowledgement, not a generic successful HTTP response", async () => {
  for (const body of [{ success: true }, { ...receipt, ok: false }, { ...receipt, receiptId: "not-a-receipt" }, { ...receipt, receiptId: "e7d6b5a4-57c1-489d-b833-b89865907b80" }, { ...receipt, receivedAt: "invalid" }, null]) {
    await assert.rejects(submitEnquiry(endpoint, "public", payload, async () => json(body)), { code: "unconfirmed" });
  }
  assert.equal((await submitEnquiry(endpoint, "public", payload, async () => json(receipt))).receiptId, payload.submissionId);
});

test("network uncertainty and rejection retain the same submitted receipt for a safe retry", async () => {
  const attempts = [];
  const fetcher = async (_url, options) => {
    attempts.push(JSON.parse(options.body));
    if (attempts.length === 1) throw new TypeError("network lost after persistence");
    return json(receipt);
  };
  await assert.rejects(submitEnquiry(endpoint, "public", payload, fetcher), { code: "unconfirmed" });
  await submitEnquiry(endpoint, "public", payload, fetcher);
  assert.equal(attempts.length, 2);
  assert.deepEqual(attempts[0], attempts[1]);
  assert.equal(payload.submissionId, receipt.receiptId);
});

test("rate limits and conflicts remain safe distinct errors without reflecting server messages", async () => {
  for (const [status, code] of [[429, "rate_limited"], [409, "conflict"], [400, "unconfirmed"], [503, "unconfirmed"]]) {
    await assert.rejects(submitEnquiry(endpoint, "public", payload, async () => json({ error: "private provider details" }, status)), (error) => {
      assert.ok(error instanceof EnquirySubmissionError);
      assert.equal(error.code, code);
      assert.equal(error.message.includes("private"), false);
      return true;
    });
  }
});

test("transport timeout aborts the request and never invents a receipt", async () => {
  let aborted = false;
  const fetcher = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => { aborted = true; reject(new DOMException("Aborted", "AbortError")); });
  });
  await assert.rejects(submitEnquiry(endpoint, "public", payload, fetcher, 5), { code: "unconfirmed" });
  assert.equal(aborted, true);
});

test("intake configuration rejects missing, unsafe or non-root project URLs", () => {
  assert.equal(enquiryEndpoint("https://example.supabase.co/", "public"), endpoint);
  assert.equal(enquiryEndpoint("http://127.0.0.1:54321", "public"), "http://127.0.0.1:54321/functions/v1/submit-enquiry");
  for (const [url, key] of [[undefined, "public"], ["https://example.supabase.co", ""], ["http://example.com", "public"], ["https://user:secret@example.com", "public"], ["https://example.com/private", "public"], ["https://example.com/?token=secret", "public"]]) {
    assert.equal(enquiryEndpoint(url, key), null);
  }
});
