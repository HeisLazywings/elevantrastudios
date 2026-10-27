import assert from "node:assert/strict";
import { test } from "node:test";
import { createEnquiryHandler, buildEmail, authorizedOperator } from "../supabase/functions/submit-enquiry/core.ts";
import { createRepository } from "../supabase/functions/submit-enquiry/repository.ts";
import { ENQUIRY_BUDGET_OPTIONS, validateEnquiry } from "../supabase/functions/_shared/enquiry-contract.ts";

const receipt = "0bd92ada-42d3-45d0-9b08-234468f13366";
const secondReceipt = "6c6048c3-ab72-41bf-a458-3bf9a63296f1";
const timestamp = "2026-10-27T12:00:00.000Z";
const origin = "https://www.elevantrastudios.com.ng";
const input = () => ({ submissionId: receipt, name: "Visitor <Example>", email: " visitor@example.com ", company: "Business & Co", budget: ENQUIRY_BUDGET_OPTIONS[0], message: "A real objective\n<script>escaped</script>", website: "" });
const config = () => ({ resendApiKey: "re_test_not_a_real_key", from: "Elevantra Studios <enquiries@verified.example>", to: "business@example.com", retrySecret: "test-only-operator-secret-longer-than-32-characters", hashSecret: "test-only-hmac-secret-not-real-service-role", allowedOrigins: "http://localhost:3100" });
const request = (body = input(), headers = {}) => new Request("https://project.supabase.co/functions/v1/submit-enquiry", { method: "POST", headers: { origin, "Content-Type": "application/json", apikey: "sb_publishable_test", ...headers }, body: JSON.stringify(body) });
const operator = (action, id = receipt, headers = {}) => request({ action, submissionId: id }, { authorization: `Bearer ${config().retrySecret}`, ...headers });
const accepted = async () => new Response(JSON.stringify({ id: "provider-test-id" }), { status: 200 });

function memoryRepository() {
  const records = new Map();
  let inserts = 0;
  let configurationFailures = 0;
  const repository = {
    async accept(value, payloadHash, networkHash, emailHash) {
      assert.match(networkHash, /^[0-9a-f]{64}$/);
      assert.match(emailHash, /^[0-9a-f]{64}$/);
      const old = records.get(value.submissionId);
      if (old) return old.payloadHash === payloadHash ? { kind: "existing", receipt_id: value.submissionId, received_at: timestamp } : { kind: "conflict" };
      records.set(value.submissionId, { ...value, receipt_id: value.submissionId, received_at: timestamp, payloadHash, state: "pending", attempts: 0, provider_message_id: null, request_payload: null, last_error_code: null });
      inserts++;
      return { kind: "created", receipt_id: value.submissionId, received_at: timestamp };
    },
    async read(id) { return records.get(id) || null; },
    async claim(id, payload, token) {
      const row = records.get(id);
      if (!row) return { kind: "missing" };
      if (row.state === "accepted") return { kind: "accepted" };
      if (row.state === "sending") return { kind: "busy" };
      if (row.attempts >= 3) return { kind: "exhausted" };
      if (row.expired) return { kind: "expired" };
      row.state = "sending"; row.token = token; row.attempts++; row.request_payload ||= structuredClone(payload);
      return { kind: "claimed", request_payload: structuredClone(row.request_payload) };
    },
    async finish(id, token, state, providerId, code) {
      const row = records.get(id);
      if (!row || row.token !== token) return false;
      row.state = state; row.provider_message_id = providerId; row.last_error_code = code;
      return true;
    },
    async configurationFailure(id, code) {
      const row = records.get(id);
      if (row && ["pending", "failed"].includes(row.state)) { row.state = "failed"; row.last_error_code = code; configurationFailures++; }
    },
  };
  return { repository, records, counts: () => ({ inserts, configurationFailures }) };
}
function setup(overrides = {}) {
  const memory = memoryRepository();
  const calls = [];
  const dependencies = { repository: memory.repository, config: config(), fetch: async (...args) => { calls.push(args); return accepted(); }, providerTimeoutMs: 15, ...overrides };
  return { ...memory, calls, dependencies, handler: createEnquiryHandler(dependencies) };
}

test("anonymous intake normalizes, saves before sending, escapes content and records acceptance separately", async () => {
  const s = setup();
  s.dependencies.fetch = async (url, options) => {
    assert.equal(s.records.size, 1, "durable save must precede provider call");
    s.calls.push([url, options]); return accepted();
  };
  const response = await s.handler(request());
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, receiptId: receipt, receivedAt: timestamp });
  const row = s.records.get(receipt);
  assert.equal(row.state, "accepted"); assert.equal(row.attempts, 1); assert.equal(row.provider_message_id, "provider-test-id");
  const [url, options] = s.calls[0];
  assert.equal(url, "https://api.resend.com/emails");
  assert.equal(options.headers["Idempotency-Key"], `elevantra-enquiry/${receipt}`);
  const email = JSON.parse(options.body);
  assert.equal(email.reply_to, "visitor@example.com"); assert.deepEqual(email.to, ["business@example.com"]);
  assert.ok(email.html.includes("&lt;script&gt;escaped&lt;/script&gt;")); assert.ok(!email.html.includes("<script>"));
  assert.ok(email.text.includes(receipt)); assert.ok(email.text.includes(timestamp));
  for (const field of ["Visitor <Example>", "visitor@example.com", "Business & Co", ENQUIRY_BUDGET_OPTIONS[0]]) assert.ok(email.text.includes(field));
});

test("invalid input, injected headers, honeypot, unknown fields and invalid budgets never touch storage", async () => {
  const s = setup();
  for (const update of [{ name: "" }, { email: "a@b" }, { email: "a<b>@example.com" }, { email: "a,b@example.com" }, { email: "a;bad@example.com" }, { email: "visitor@-example.com" }, { name: "A\nB" }, { company: "A\rB" }, { budget: "unapproved" }, { website: "bot.example" }, { submissionId: "invalid" }, { message: "x".repeat(5001) }, { to: "attacker@example.com" }, { message: "bad\u0000data" }, { action: "delete" }]) {
    assert.equal((await s.handler(request({ ...input(), ...update }))).status, 400, JSON.stringify(update).slice(0, 100));
  }
  assert.equal(s.counts().inserts, 0); assert.equal(s.calls.length, 0);
  assert.equal(validateEnquiry({ ...input(), email: "VISITOR@EXAMPLE.COM", message: " a\r\nb " }).message, "a\nb");
});

test("payload limit checks actual streamed bytes, malformed JSON, invalid UTF-8 and content type", async () => {
  const s = setup();
  assert.equal((await s.handler(request(input(), { "content-length": "30000" }))).status, 413);
  const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(25000)); controller.close(); } });
  const streamRequest = new Request("https://project.supabase.co/functions/v1/submit-enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body, duplex: "half" });
  assert.equal((await s.handler(streamRequest)).status, 413);
  for (const malformed of ["{", new Uint8Array([0xff, 0xfe])]) {
    const req = new Request("https://project.supabase.co/functions/v1/submit-enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: malformed });
    assert.equal((await s.handler(req)).status, 400);
  }
  assert.equal((await s.handler(request(input(), { "Content-Type": "text/plain" }))).status, 415);
  assert.equal(s.counts().inserts, 0);
});

test("CORS allows exact actual and configured origins with preflight, without becoming authentication", async () => {
  const s = setup();
  const preflight = await s.handler(new Request("https://project.supabase.co/functions/v1/submit-enquiry", { method: "OPTIONS", headers: { origin, "Access-Control-Request-Headers": "apikey,content-type" } }));
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), origin);
  assert.ok(preflight.headers.get("Access-Control-Allow-Headers").includes("apikey"));
  for (const bad of ["https://www.elevantrastudios.com.ng.evil.example", "null", "https://preview-random.vercel.app"]) {
    const response = await s.handler(request(input(), { origin: bad }));
    assert.equal(response.status, 403); assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  }
  const local = await s.handler(request(input(), { origin: "http://localhost:3100" }));
  assert.equal(local.status, 201);
  const noOrigin = request({ ...input(), submissionId: secondReceipt }); noOrigin.headers.delete("origin");
  assert.equal((await s.handler(noOrigin)).status, 201, "public server clients still go through validation and DB limits");
});

test("missing server credentials or forbidden onboarding sender preserves receipt and records configuration failure", async () => {
  for (const settings of [{ resendApiKey: undefined }, { from: undefined }, { to: undefined }, { from: "Elevantra <onboarding@resend.dev>" }, { from: "X\r\nBcc: bad@example.com" }]) {
    const s = setup({ config: { ...config(), ...settings } });
    const response = await s.handler(request());
    assert.equal(response.status, 201); assert.equal((await response.json()).ok, true);
    assert.equal(s.records.get(receipt).state, "failed"); assert.equal(s.records.get(receipt).attempts, 0);
    assert.equal(s.counts().configurationFailures, 1); assert.equal(s.calls.length, 0);
  }
  const s = setup({ repository: null });
  assert.equal((await s.handler(request())).status, 503);
});

test("provider rejection and timeout retain saved enquiry with bounded internal failure codes", async () => {
  for (const [provider, code] of [[async () => new Response('{"message":"private provider detail"}', { status: 422 }), "provider_rejected"], [async () => new Promise(() => {}), "provider_timeout"], [async () => { throw new Error("contains secret provider detail"); }, "provider_unavailable"], [async () => new Response('{"unexpected":true}', { status: 200 }), "provider_response_invalid"]]) {
    const s = setup({ fetch: provider });
    const response = await s.handler(request()); const body = await response.text();
    assert.equal(response.status, 201); assert.equal(JSON.parse(body).ok, true);
    assert.ok(!body.includes(code)); assert.ok(!body.includes("private"));
    assert.equal(s.records.get(receipt).state, "failed"); assert.equal(s.records.get(receipt).last_error_code, code);
  }
});

test("database failure never reports receipt or sends email; rate limit never sends email", async () => {
  const s = setup();
  s.repository.accept = async () => { throw new Error("private DB connection string"); };
  let response = await s.handler(request());
  assert.equal(response.status, 503); assert.equal((await response.json()).ok, false); assert.equal(s.calls.length, 0);
  s.repository.accept = async () => ({ kind: "limited" });
  response = await s.handler(request());
  assert.equal(response.status, 429); assert.equal(response.headers.get("Retry-After"), "900"); assert.equal(s.calls.length, 0);
});

test("repeated public requests return one receipt and never authorize provider retries", async () => {
  const s = setup({ fetch: async () => new Response("{}", { status: 503 }) });
  assert.equal((await s.handler(request())).status, 201);
  assert.equal((await s.handler(request())).status, 200);
  assert.equal(s.counts().inserts, 1); assert.equal(s.records.get(receipt).attempts, 1);
  const changed = await s.handler(request({ ...input(), message: "Changed objective" }));
  assert.equal(changed.status, 409); assert.equal(s.records.get(receipt).message, input().message);
});

test("operator status and retry require dedicated strong secret, never customer/anonymous credentials", async () => {
  const s = setup({ fetch: async () => new Response("{}", { status: 503 }) }); await s.handler(request());
  for (const authorization of ["", "Bearer sb_publishable_public", "Bearer customer-session-jwt", `Bearer ${config().retrySecret}X`]) {
    assert.equal((await s.handler(operator("status", receipt, { authorization }))).status, 401);
    assert.equal((await s.handler(operator("retry", receipt, { authorization }))).status, 401);
  }
  assert.equal(await authorizedOperator(operator("status"), "short"), false);
  const response = await s.handler(operator("status")); const data = await response.json();
  assert.equal(response.status, 200); assert.equal(data.notification.state, "failed");
  assert.equal(data.notification.lastErrorCode, "provider_rejected");
  assert.ok(!JSON.stringify(data).includes("visitor@example.com"));
  assert.equal((await s.handler(operator("status", secondReceipt))).status, 404);
});

test("protected retries reuse identical provider payload/idempotency key, cap attempts and never duplicate enquiry", async () => {
  const calls = [];
  const s = setup({ fetch: async (_url, options) => { calls.push(options); return new Response("{}", { status: 503 }); } });
  await s.handler(request());
  s.dependencies.config.from = "Different <new@verified.example>";
  s.dependencies.config.to = "changed@example.com";
  await s.handler(operator("retry")); await s.handler(operator("retry"));
  const exhausted = await s.handler(operator("retry"));
  assert.equal((await exhausted.json()).notification.outcome, "exhausted");
  assert.equal(calls.length, 3); assert.equal(s.counts().inserts, 1);
  assert.equal(new Set(calls.map((options) => options.body)).size, 1);
  assert.equal(new Set(calls.map((options) => options.headers["Idempotency-Key"])).size, 1);
});

test("failed notification can recover to accepted, never claimed delivered, and cannot be sent again", async () => {
  const s = setup({ fetch: async () => new Response("{}", { status: 503 }) }); await s.handler(request());
  s.dependencies.fetch = accepted;
  const response = await s.handler(operator("retry")); const data = await response.json();
  assert.equal(data.notification.state, "accepted"); assert.equal(data.notification.providerMessageId, "provider-test-id");
  assert.equal(data.notification.attempts, 2); assert.ok(!JSON.stringify(data).includes('"delivered"'));
  await s.handler(operator("retry")); assert.equal(s.records.get(receipt).attempts, 2);
});

test("acceptance recording outage preserves durable receipt; expired lease retry uses identical provider request", async () => {
  const s = setup(); const originalFinish = s.repository.finish;
  s.repository.finish = async () => { throw new Error("database temporarily unavailable after provider accepted"); };
  assert.equal((await s.handler(request())).status, 201);
  assert.equal(s.records.get(receipt).state, "sending"); assert.equal(s.records.size, 1);
  s.records.get(receipt).state = "failed"; // Simulate DB lease expiry permitting a protected recovery.
  s.repository.finish = originalFinish;
  await s.handler(operator("retry"));
  assert.equal(s.calls.length, 2); assert.equal(s.calls[0][1].body, s.calls[1][1].body);
  assert.equal(s.calls[0][1].headers["Idempotency-Key"], s.calls[1][1].headers["Idempotency-Key"]);
  assert.equal(s.records.get(receipt).state, "accepted");
});

test("expired idempotency window blocks retries, and active leases block concurrent provider calls", async () => {
  const s = setup({ fetch: async () => new Response("{}", { status: 503 }) }); await s.handler(request());
  s.records.get(receipt).expired = true;
  let response = await s.handler(operator("retry")); assert.equal((await response.json()).notification.outcome, "expired");
  s.records.get(receipt).expired = false; s.records.get(receipt).state = "sending";
  response = await s.handler(operator("retry")); assert.equal((await response.json()).notification.outcome, "busy");
  assert.equal(s.records.get(receipt).attempts, 1);
});

test("database adapter keeps credentials server-side and sends exact service-only RPC arguments", async () => {
  const calls = [];
  const repository = createRepository("https://project.supabase.co", "eyJ_test_server_only", async (url, options) => { calls.push([url, options]); return new Response(JSON.stringify({ kind: "created", receipt_id: receipt, received_at: timestamp })); });
  await repository.accept(validateEnquiry(input()), "a".repeat(64), "b".repeat(64), "c".repeat(64));
  assert.equal(calls[0][0], "https://project.supabase.co/rest/v1/rpc/accept_enquiry");
  assert.equal(calls[0][1].headers.apikey, "eyJ_test_server_only");
  const body = JSON.parse(calls[0][1].body); assert.equal(body.p_submission_id, receipt); assert.equal(body.p_payload.email, "visitor@example.com");
  assert.ok(!("website" in body.p_payload)); assert.ok(!("submissionId" in body.p_payload));
  const bad = createRepository("https://project.supabase.co", "test", async () => new Response("private error", { status: 500 }));
  await assert.rejects(() => bad.read(receipt), /enquiry_database_unavailable/);
});

test("configuration repair retries the original stored enquiry without consuming an attempt while misconfigured", async () => {
  const s = setup({ config: { ...config(), resendApiKey: undefined } });
  await s.handler(request());
  assert.equal(s.records.get(receipt).attempts, 0);
  s.dependencies.config.resendApiKey = config().resendApiKey;
  const response = await s.handler(operator("retry")); const data = await response.json();
  assert.equal(data.notification.state, "accepted"); assert.equal(data.notification.attempts, 1);
  assert.equal(s.counts().inserts, 1); assert.equal(s.calls.length, 1);
});

test("a stalled request body times out without touching storage", async () => {
  const s = setup({ bodyTimeoutMs: 5 }); let cancelled = false;
  const body = new ReadableStream({ start() {}, cancel() { cancelled = true; } });
  const req = new Request("https://project.supabase.co/functions/v1/submit-enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body, duplex: "half" });
  assert.equal((await s.handler(req)).status, 408); assert.equal(cancelled, true);
  assert.equal(s.counts().inserts, 0); assert.equal(s.calls.length, 0);
});

test("a concurrent notify lease produces one provider request", async () => {
  let release; let started;
  const underway = new Promise((resolve) => { started = resolve; });
  const pending = new Promise((resolve) => { release = resolve; });
  const s = setup({ providerTimeoutMs: 1000, fetch: async () => { started(); await pending; return accepted(); } });
  const first = s.handler(request()); await underway;
  const duplicate = await s.handler(request()); assert.equal(duplicate.status, 200);
  const retry = await s.handler(operator("retry")); assert.equal((await retry.json()).notification.outcome, "busy");
  release(); assert.equal((await first).status, 201);
  assert.equal(s.records.get(receipt).attempts, 1); assert.equal(s.counts().inserts, 1);
});
