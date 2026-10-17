import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

// Compile this small server-side data layer in memory. Production imports keep
// Next.js's extensionless convention without changing the application's config.
const require = createRequire(import.meta.url);
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => {
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(compiled.outputText, filename);
};

const { documentSchema, entryInputSchema, getDocumentMediaIds, isSafeContentUrl } = require("../lib/cms/validation.ts");
const { getInitialDrafts } = require("../lib/cms/seed.ts");
const { CMS_MAX_UPLOAD_BYTES } = require("../lib/cms/types.ts");
const mediaId = "dddddddd-dddd-4ddd-8ddd-ddddddddddd1";
const emptyBody = { type: "doc", content: [] };
const articleInput = { kind: "article", title: "A useful article", slug: "a-useful-article", details: {}, body: emptyBody };

test("rich-text parsing retains supported content and removes untrusted image sources and link attributes", () => {
  const body = documentSchema.parse({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Read more", marks: [{ type: "link", attrs: { href: "https://example.com/guide", onclick: "bad()", target: "_blank" } }] }] },
      { type: "image", attrs: { mediaId, alt: "An interface detail", caption: "A considered design", src: "https://untrusted.example/image.png", onerror: "bad()" } },
    ],
  });
  assert.deepEqual(body.content[0].content[0].marks[0], { type: "link", attrs: { href: "https://example.com/guide" } });
  assert.deepEqual(body.content[1].attrs, { mediaId, alt: "An interface detail", caption: "A considered design" });
  assert.deepEqual(getDocumentMediaIds(body), [mediaId]);
});

test("rich-text links reject executable, relative, credential-bearing and malformed URLs", () => {
  for (const href of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:bad()", "/relative", "https://user:secret@example.com/", "https://example.com/\ninvalid"]) {
    assert.equal(isSafeContentUrl(href), false, href);
    assert.equal(documentSchema.safeParse({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Link", marks: [{ type: "link", attrs: { href } }] }] }] }).success, false, href);
  }
  for (const href of ["https://example.com/", "http://example.com/", "mailto:studio@example.com", "tel:+2340000000000"]) {
    assert.equal(isSafeContentUrl(href), true, href);
  }
});

test("the document schema rejects unsupported HTML and invalid block hierarchy", () => {
  for (const content of [
    [{ type: "html", text: "<script>bad()</script>" }],
    [{ type: "heading", attrs: { level: 1 }, content: [] }],
    [{ type: "bulletList", content: [{ type: "paragraph", content: [] }] }],
    [{ type: "listItem", content: [{ type: "paragraph", content: [] }] }],
    [{ type: "paragraph", content: [{ type: "image", attrs: { mediaId, alt: "", caption: "" } }] }],
  ]) assert.equal(documentSchema.safeParse({ type: "doc", content }).success, false);
});

test("a text node cannot repeat link or other mark types", () => {
  const link = { type: "link", attrs: { href: "https://example.com/" } };
  assert.equal(documentSchema.safeParse({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "No nested links", marks: [link, { ...link }] }] }] }).success, false);
});

test("document limits reject excessive nesting and node counts before recursive parsing", () => {
  let nested = { type: "paragraph", content: [] };
  for (let index = 0; index < 100; index++) nested = { type: "blockquote", content: [nested] };
  assert.equal(documentSchema.safeParse({ type: "doc", content: [nested] }).success, false);
  assert.equal(documentSchema.safeParse({ type: "doc", content: Array.from({ length: 2_001 }, () => ({ type: "paragraph" })) }).success, false);
  const cyclic = { type: "doc", content: [] };
  cyclic.content.push(cyclic);
  assert.equal(documentSchema.safeParse(cyclic).success, false);
});

test("document limits bound both individual text nodes and aggregate text", () => {
  const paragraph = (text) => ({ type: "paragraph", content: [{ type: "text", text }] });
  assert.equal(documentSchema.safeParse({ type: "doc", content: [paragraph("a".repeat(20_001))] }).success, false);
  assert.equal(documentSchema.safeParse({ type: "doc", content: Array.from({ length: 7 }, () => paragraph("a".repeat(20_000))) }).success, false);
});

test("entry parsing supplies safe draft defaults and strips unknown fields", () => {
  assert.equal(CMS_MAX_UPLOAD_BYTES, 4 * 1024 * 1024);
  const entry = entryInputSchema.parse({ ...articleInput, created_by: "untrusted", reviewNotes: ["internal"] });
  assert.equal(entry.status, "draft");
  assert.equal(entry.publication_approved, false);
  assert.equal(entry.cover_media_id, null);
  assert.equal(entry.seo_title, "");
  assert.equal(entry.seo_description, "");
  assert.deepEqual(entry.details, { deck: "", issue: "", pullQuote: "", takeaway: "" });
  assert.ok(!("created_by" in entry));
  assert.ok(!("reviewNotes" in entry));
  assert.equal(entryInputSchema.safeParse({ ...articleInput, slug: "Unsafe Slug" }).success, false);
});

test("publishing client profiles and client engagements requires explicit publication permission", () => {
  const client = { ...articleInput, kind: "client", details: {}, status: "published" };
  const engagement = { ...articleInput, kind: "case-study", details: { designation: "Client engagement" }, status: "published" };
  assert.equal(entryInputSchema.safeParse(client).success, false);
  assert.equal(entryInputSchema.safeParse(engagement).success, false);
  assert.equal(entryInputSchema.safeParse({ ...client, publication_approved: true }).success, true);
  assert.equal(entryInputSchema.safeParse({ ...engagement, publication_approved: true }).success, true);
  assert.equal(entryInputSchema.safeParse({ ...engagement, details: { designation: "Concept Demonstration" } }).success, true);
});

test("starter import includes only public source material, always as unapproved drafts", () => {
  const drafts = getInitialDrafts();
  assert.equal(drafts.filter(({ kind }) => kind === "article").length, 3);
  assert.deepEqual(drafts.filter(({ kind }) => kind === "case-study").map(({ slug }) => slug), ["dbc-automobiles"]);
  for (const draft of drafts) {
    assert.equal(draft.status, "draft");
    assert.equal(draft.publication_approved, false);
    assert.equal(entryInputSchema.safeParse(draft).success, true);
    assert.ok(draft.body.content.length > 0);
    assert.ok(!("reviewNotes" in draft));
    assert.ok(!("reviewNotes" in draft.details));
  }
});
