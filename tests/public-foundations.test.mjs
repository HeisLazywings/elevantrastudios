import assert from "node:assert/strict";
import { test } from "node:test";
import { filterPublicAnalyticsEvent } from "../lib/analytics.ts";
import { contactNavigation, isNavigationActive, mobileNavigation, studioNavigation } from "../lib/navigation.ts";

const origin = "https://www.elevantrastudios.com.ng";

test("public analytics rejects private routes and preview credentials for every event type", () => {
  for (const path of [
    "/admin", "/admin/login", "/admin/preview/entry-id", "/api/admin/me", "/%61dmin/entries",
    "/work/preview", "/work?preview=true", "/insights?draft=1", "/?access_token=private",
    "/work?Preview=true", "/?code=private", "/?secret=private",
  ]) {
    for (const type of ["pageview", "event"]) {
      assert.equal(filterPublicAnalyticsEvent({ type, url: origin + path }), null, `${type}: ${path}`);
    }
  }
  for (const url of ["invalid", "javascript:alert(1)", "https://user:password@example.com/work", origin + "/%invalid"]) {
    assert.equal(filterPublicAnalyticsEvent({ url }), null);
  }
});

test("public analytics keeps page and event metadata while removing query strings and fragments", () => {
  const event = { type: "pageview", url: origin + "/insights/credible-websites?utm_source=example#evidence", route: "/insights/[slug]" };
  const result = filterPublicAnalyticsEvent(event);
  assert.deepEqual(result, { ...event, url: origin + "/insights/credible-websites" });
  assert.notEqual(result, event);
  assert.equal(event.url, origin + "/insights/credible-websites?utm_source=example#evidence");
  assert.equal(filterPublicAnalyticsEvent({ url: origin + "/commercial-challenges" })?.url, origin + "/commercial-challenges");
});

test("navigation exposes the new studio pages once and contains no private destinations", () => {
  const mobileHrefs = [...mobileNavigation.map(({ href }) => href), contactNavigation.href];
  assert.equal(new Set(mobileHrefs).size, mobileHrefs.length);
  for (const href of ["/commercial-challenges", "/approach", "/who-we-work-with"]) {
    assert.equal(studioNavigation.filter((link) => link.href === href).length, 1);
    assert.equal(mobileHrefs.filter((value) => value === href).length, 1);
  }
  assert.ok(mobileHrefs.every((href) => !href.startsWith("/admin") && !href.includes("login")));
  assert.equal(contactNavigation.label, "Discuss your business");
  assert.equal(isNavigationActive("/work/dbc-automobiles", "/work"), true);
  assert.equal(isNavigationActive("/workshop", "/work"), false);
  assert.equal(isNavigationActive("/approach", "/approach"), true);
});
