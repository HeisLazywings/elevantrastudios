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

const readinessConfig = () => ({ ...config(), from: "Elevantra Studios <enquiries@elevantrastudios.com.ng>", to: "elevantrastudios@gmail.com" });
const readinessRequest = (fields = {}, authorization = `Bearer ${config().retrySecret}`) => request({ action: "readiness", ...fields }, { authorization });

test("readiness requires operator authentication and a strict action-only body before provider or database access", async () => {
  let probes = 0;
  const s = setup({ repository: null, config: readinessConfig(), fetch: async () => { probes++; throw new Error("must not probe"); } });
  for (const authorization of ["", "Bearer sb_publishable_public", "Bearer customer-session-jwt", `Bearer ${config().retrySecret}X`]) {
    const response = await s.handler(readinessRequest({}, authorization));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { ok: false, code: "unauthorized", error: "Operator authorization is required." });
  }
  const extra = await s.handler(readinessRequest({ submissionId: receipt }));
  assert.equal(extra.status, 400); assert.equal((await extra.json()).code, "invalid_readiness");
  assert.equal(probes, 0); assert.equal(s.counts().inserts, 0);
});

test("readiness checks the exact Resend domain without sending mail, storing data or disclosing configuration", async () => {
  const calls = [];
  const s = setup({ repository: null, config: readinessConfig(), fetch: async (url, options) => {
    calls.push([url, options]);
    return new Response(JSON.stringify({ data: [
      { id: "other-private-domain-id", name: "unrelated-private.example", status: "verified" },
      { id: "target-private-domain-id", name: "elevantrastudios.com.ng", status: "verified" },
    ], has_more: false }));
  } });
  const response = await s.handler(readinessRequest()); const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, configuration: {
    resendApiKeyConfigured: true, senderConfigured: true, senderMatchesExpectedDomain: true,
    recipientMatchesExpected: true, retrySecretConfigured: true,
  }, provider: { domainVerified: true, code: "verified" } });
  const text = JSON.stringify(body);
  for (const privateValue of [config().resendApiKey, config().retrySecret, readinessConfig().from, readinessConfig().to, "unrelated-private.example", "target-private-domain-id"]) assert.ok(!text.includes(privateValue));
  assert.equal(calls.length, 1); assert.equal(calls[0][0], "https://api.resend.com/domains?limit=100");
  assert.equal(calls[0][1].method, "GET"); assert.equal(calls[0][1].body, undefined);
  assert.equal(calls[0][1].headers.Authorization, `Bearer ${config().resendApiKey}`);
  assert.equal(s.counts().inserts, 0);
});

test("readiness distinguishes pending, absent, partial and unauthorized Resend domain information", async () => {
  const cases = [
    [200, { data: [{ name: "elevantrastudios.com.ng", status: "pending" }], has_more: false }, { domainVerified: false, code: "not_verified" }],
    [200, { data: [{ name: "different.example", status: "verified" }], has_more: false }, { domainVerified: false, code: "not_found" }],
    [200, { data: [], has_more: true }, { domainVerified: null, code: "unavailable" }],
    [200, { data: [], has_more: undefined }, { domainVerified: null, code: "unavailable" }],
    [200, { unexpected: "private provider detail" }, { domainVerified: null, code: "unavailable" }],
    [401, { message: "private provider detail" }, { domainVerified: null, code: "access_denied" }],
    [403, { message: "sending-only key cannot list domains" }, { domainVerified: null, code: "access_denied" }],
    [503, { message: "private provider failure" }, { domainVerified: null, code: "unavailable" }],
  ];
  for (const [status, payload, expected] of cases) {
    const s = setup({ repository: null, config: readinessConfig(), fetch: async () => new Response(JSON.stringify(payload), { status }) });
    const response = await s.handler(readinessRequest()); const text = await response.text();
    assert.equal(response.status, 200); assert.deepEqual(JSON.parse(text).provider, expected);
    assert.ok(!text.includes("private provider")); assert.ok(!text.includes("sending-only"));
  }
});

test("readiness reports configuration mismatch safely and skips provider access when the sending key is missing", async () => {
  let calls = 0;
  const s = setup({ repository: null, config: { ...readinessConfig(), resendApiKey: undefined, from: "wrong@unverified.example", to: "wrong-private-recipient@example.com" }, fetch: async () => { calls++; throw new Error("must not run"); } });
  const response = await s.handler(readinessRequest()); const body = await response.json();
  assert.deepEqual(body.configuration, { resendApiKeyConfigured: false, senderConfigured: true,
    senderMatchesExpectedDomain: false, recipientMatchesExpected: false, retrySecretConfigured: true });
  assert.deepEqual(body.provider, { domainVerified: null, code: "unavailable" });
  assert.equal(calls, 0); assert.ok(!JSON.stringify(body).includes("wrong-private-recipient"));
  for (const from of [undefined, "Elevantra <onboarding@resend.dev>", "X\r\nBcc:bad@example.com"]) {
    s.dependencies.config.from = from;
    const data = await (await s.handler(readinessRequest())).json();
    assert.equal(data.configuration.senderConfigured, false); assert.equal(data.configuration.senderMatchesExpectedDomain, false);
  }
});

test("readiness bounds provider and response-body stalls and never exposes underlying exceptions", async () => {
  for (const provider of [async () => new Promise(() => {}), async () => { throw new Error("private Resend credential detail"); }, async () => new Response(new ReadableStream({ start() {} }))]) {
    const s = setup({ repository: null, config: readinessConfig(), providerTimeoutMs: 5, fetch: provider });
    const response = await s.handler(readinessRequest()); const text = await response.text();
    assert.equal(response.status, 200); assert.deepEqual(JSON.parse(text).provider, { domainVerified: null, code: "unavailable" });
    assert.ok(!text.includes("private Resend")); assert.equal(s.counts().inserts, 0);
  }
});

function deliverySetup(state = "accepted", providerId = "provider-test-id", overrides = {}) {
  const s = setup(overrides);
  s.records.set(receipt, { ...validateEnquiry(input()), receipt_id: receipt, received_at: timestamp,
    state, attempts: 1, provider_message_id: providerId, request_payload: null, last_error_code: null });
  for (const operation of ["accept", "claim", "finish", "configurationFailure"]) {
    s.repository[operation] = async () => { throw new Error("delivery inspection must not write or send"); };
  }
  return s;
}

test("delivery-status authenticates and validates the receipt before database or provider access", async () => {
  let reads = 0; let calls = 0;
  const s = deliverySetup("accepted", "provider-test-id", { fetch: async () => { calls++; throw new Error("must not run"); } });
  s.repository.read = async () => { reads++; throw new Error("must not read before authorization"); };
  for (const authorization of ["", "Bearer sb_publishable_public", "Bearer customer-session-jwt", `Bearer ${config().retrySecret}X`]) {
    assert.equal((await s.handler(operator("delivery-status", receipt, { authorization }))).status, 401);
  }
  assert.equal((await s.handler(operator("delivery-status", "invalid"))).status, 400);
  assert.equal((await s.handler(request({ action: "delivery-status", submissionId: receipt, providerMessageId: "chosen-by-caller" }, { authorization: `Bearer ${config().retrySecret}` }))).status, 400);
  assert.equal(reads, 0); assert.equal(calls, 0);
  const unavailable = setup({ repository: null });
  assert.equal((await unavailable.handler(operator("delivery-status"))).status, 503);
});

test("delivery-status reads only the stored provider ID and returns an allowed event without exposing email content", async () => {
  const providerId = "provider/id?opaque";
  const calls = [];
  const s = deliverySetup("accepted", providerId, { fetch: async (url, options) => {
    calls.push([url, options]);
    return new Response(JSON.stringify({ id: providerId, last_event: "delivered", to: ["private-recipient@example.com"], from: "private-sender@example.com", html: "private email body", text: "private plain text" }));
  } });
  const storedBefore = JSON.stringify(s.records.get(receipt));
  const response = await s.handler(operator("delivery-status")); const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, receiptId: receipt, delivery: { providerMessageId: providerId, lastEvent: "delivered", code: "checked" } });
  assert.equal(calls.length, 1); assert.equal(calls[0][0], "https://api.resend.com/emails/provider%2Fid%3Fopaque");
  assert.equal(calls[0][1].method, "GET"); assert.equal(calls[0][1].body, undefined);
  assert.equal(calls[0][1].headers.Authorization, `Bearer ${config().resendApiKey}`);
  for (const value of ["private-recipient@example.com", "private-sender@example.com", "private email body", "private plain text", config().resendApiKey, config().retrySecret]) assert.ok(!JSON.stringify(body).includes(value));
  assert.equal(JSON.stringify(s.records.get(receipt)), storedBefore); assert.equal(s.counts().inserts, 0);
});

test("delivery-status skips provider access for absent or unaccepted enquiries", async () => {
  let calls = 0;
  for (const [state, id] of [["pending", null], ["sending", null], ["failed", null], ["accepted", null]]) {
    const s = deliverySetup(state, id, { fetch: async () => { calls++; throw new Error("must not call provider"); } });
    const response = await s.handler(operator("delivery-status"));
    assert.equal(response.status, 200); assert.deepEqual((await response.json()).delivery, { providerMessageId: null, lastEvent: null, code: "not_accepted" });
  }
  const missing = deliverySetup("accepted", "provider-test-id", { fetch: async () => { calls++; throw new Error("must not call provider"); } });
  assert.equal((await missing.handler(operator("delivery-status", secondReceipt))).status, 404);
  assert.equal(calls, 0);
});

test("delivery-status accepts known provider events while treating unknown or mismatched responses as unverified", async () => {
  const known = ["sent", "delivered", "bounced", "complained", "delivery_delayed", "failed", "queued", "scheduled", "canceled", "opened", "clicked", "suppressed"];
  for (const last_event of known) {
    const s = deliverySetup("accepted", "provider-test-id", { fetch: async () => new Response(JSON.stringify({ id: "provider-test-id", last_event })) });
    const data = await (await s.handler(operator("delivery-status"))).json();
    assert.deepEqual(data.delivery, { providerMessageId: "provider-test-id", lastEvent: last_event, code: "checked" });
  }
  for (const payload of [{ id: "provider-test-id", last_event: "unknown-private-provider-state" }, { id: "different-message", last_event: "delivered" }, { last_event: "delivered" }, { id: "provider-test-id", last_event: null }, [{ id: "provider-test-id", last_event: "delivered" }]]) {
    const s = deliverySetup("accepted", "provider-test-id", { fetch: async () => new Response(JSON.stringify(payload)) });
    const response = await s.handler(operator("delivery-status")); const text = await response.text();
    assert.equal(response.status, 200); assert.deepEqual(JSON.parse(text).delivery, { providerMessageId: "provider-test-id", lastEvent: null, code: "unavailable" });
    assert.ok(!text.includes("unknown-private-provider-state")); assert.ok(!text.includes("different-message"));
  }
});

test("delivery-status handles sending-only credentials and provider outages without leaking raw errors", async () => {
  for (const status of [401, 403, 404, 429, 500]) {
    const s = deliverySetup("accepted", "provider-test-id", { fetch: async () => new Response(JSON.stringify({ message: "private provider failure" }), { status }) });
    const response = await s.handler(operator("delivery-status")); const text = await response.text();
    assert.equal(response.status, 200); assert.deepEqual(JSON.parse(text).delivery, { providerMessageId: "provider-test-id", lastEvent: null, code: [401, 403].includes(status) ? "access_denied" : "unavailable" });
    assert.ok(!text.includes("private provider failure"));
  }
  let calls = 0;
  const missingKey = deliverySetup("accepted", "provider-test-id", { config: { ...config(), resendApiKey: undefined }, fetch: async () => { calls++; throw new Error("must not run"); } });
  assert.equal((await (await missingKey.handler(operator("delivery-status"))).json()).delivery.code, "unavailable"); assert.equal(calls, 0);
});

test("delivery-status bounds request and response-body stalls without altering notification acceptance", async () => {
  for (const provider of [async () => new Promise(() => {}), async () => { throw new Error("private provider exception"); }, async () => new Response(new ReadableStream({ start() {} })), async () => new Response("invalid JSON")]) {
    const s = deliverySetup("accepted", "provider-test-id", { providerTimeoutMs: 5, fetch: provider });
    const before = JSON.stringify(s.records.get(receipt));
    const response = await s.handler(operator("delivery-status")); const text = await response.text();
    assert.equal(response.status, 200); assert.deepEqual(JSON.parse(text).delivery, { providerMessageId: "provider-test-id", lastEvent: null, code: "unavailable" });
    assert.ok(!text.includes("private provider exception")); assert.equal(JSON.stringify(s.records.get(receipt)), before);
  }
});
