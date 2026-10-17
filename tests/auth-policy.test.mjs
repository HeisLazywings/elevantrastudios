import assert from "node:assert/strict";
import { test } from "node:test";
import { AdminAuthError, assertSameOrigin, readLoginJson, safeAdminPath } from "../lib/cms/auth-policy.ts";

const mutation = (origin, extraHeaders = {}, url = "https://studio.example/api/admin/login") => new Request(url, {
  method: "POST",
  headers: { ...(origin ? { origin } : {}), ...extraHeaders },
});

const jsonRequest = (body, headers = {}) => new Request("https://studio.example/api/admin/login", {
  method: "POST",
  headers,
  body,
  ...(body instanceof ReadableStream ? { duplex: "half" } : {}),
});

test("admin redirects stay inside the workspace and cannot loop through sign in", () => {
  assert.equal(safeAdminPath("/admin"), "/admin");
  assert.equal(safeAdminPath("/admin/entries/new?kind=article#editor"), "/admin/entries/new?kind=article");
  for (const path of [
    undefined, null, ["/admin"], "https://external.example/admin", "//external.example/admin",
    "//admin.invalid/admin/entries", "/\\external.example", "/admin/../outside", "/admin/%2e%2e/outside",
    "/administer", "/admin/login", "/admin/login?next=/admin", "/admin/login/nested", "/admin\n/entries",
  ]) assert.equal(safeAdminPath(path), "/admin", String(path));
});

test("mutations require a matching browser origin, including the deployed proxy origin", () => {
  assert.doesNotThrow(() => assertSameOrigin(mutation("https://studio.example")));
  assert.doesNotThrow(() => assertSameOrigin(mutation("https://studio.example", {
    host: "studio.example", "x-forwarded-proto": "https",
  }, "http://internal-server:3000/api/admin/login")));
  assert.doesNotThrow(() => assertSameOrigin(mutation("http://localhost:3000", {
    host: "localhost:3000",
  }, "http://0.0.0.0:3000/api/admin/login")));
  for (const request of [
    mutation(undefined), mutation("null"), mutation("https://external.example"), mutation("http://studio.example"),
    mutation("https://studio.example.evil.example"), mutation("https://studio.example:444"),
  ]) assert.throws(() => assertSameOrigin(request), (error) => error instanceof AdminAuthError && error.status === 403);
  assert.doesNotThrow(() => assertSameOrigin(new Request("https://studio.example/api/admin/me")));
});

test("login JSON is limited before parsing declared and streamed bodies", async () => {
  const valid = await readLoginJson(jsonRequest(JSON.stringify({ email: "editor@example.com", password: "test-only" })));
  assert.equal(valid.ok, true);
  assert.equal(valid.value.email, "editor@example.com");
  assert.equal((await readLoginJson(jsonRequest("{}", { "content-length": "4097" }))).status, 413);

  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(3000));
      controller.enqueue(new Uint8Array(1097));
    },
    cancel() { cancelled = true; },
  });
  const result = await readLoginJson(jsonRequest(stream));
  assert.equal(result.status, 413);
  assert.equal(cancelled, true);
  assert.equal((await readLoginJson(jsonRequest(JSON.stringify("😀".repeat(1500))))).status, 413);
  assert.equal((await readLoginJson(jsonRequest(JSON.stringify("a".repeat(4094))))).ok, true);
});

test("malformed sign-in requests fail without returning submitted values", async () => {
  for (const request of [
    jsonRequest("private malformed input"), jsonRequest("{}", { "content-length": "-1" }),
    jsonRequest(new Uint8Array([0xff, 0xfe])), mutation("https://studio.example"),
  ]) {
    const result = await readLoginJson(request);
    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
    assert.equal(result.error, "Send a valid sign-in request.");
  }
});
