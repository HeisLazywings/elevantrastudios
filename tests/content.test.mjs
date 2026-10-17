import assert from "node:assert/strict";
import { test } from "node:test";
import { articles, featuredArticles, getArticle, getReadingTime, toArticleSummary } from "../lib/insights.ts";
import { publicProjects, getProjectBySlug, getVisibleProjects } from "../lib/projects.ts";
import { getDraftProjectBySlug } from "../lib/project-drafts.ts";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("every article has a unique routable slug, a complete body, and usable section anchors", () => {
  assert.equal(new Set(articles.map(({ slug }) => slug)).size, articles.length);
  for (const article of articles) {
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(getArticle(article.slug), article);
    assert.ok(article.sections.length >= 3, `${article.slug} needs a complete article`);
    const anchors = article.sections.map(({ id }) => id);
    assert.equal(new Set(anchors).size, anchors.length);
    for (const section of article.sections) {
      assert.match(section.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.ok(section.title && section.paragraphs.every((paragraph) => paragraph.length > 0));
    }
    assert.ok(article.sections.flatMap(({ paragraphs }) => paragraphs).join(" ").split(/\s+/).length > 400);
    assert.ok(Number.isInteger(getReadingTime(article)) && getReadingTime(article) > 0);
  }
  assert.equal(getArticle("not-a-published-article"), undefined);
});

test("the homepage has three distinct featured articles and client summaries omit internal content", () => {
  assert.equal(featuredArticles.length, 3);
  assert.equal(new Set(featuredArticles.map(({ slug }) => slug)).size, 3);
  for (const article of featuredArticles) {
    const summary = toArticleSummary(article);
    assert.equal(summary.slug, article.slug);
    assert.equal(summary.readingTime, getReadingTime(article));
    assert.ok(!("sections" in summary));
    assert.ok(!("reviewNotes" in summary));
  }
});

test("unapproved content is unavailable by default, never listed, and selected only in explicit server preview", () => {
  const previous = process.env.CONTENT_PREVIEW;
  const previousCwd = process.cwd();
  const fixture = mkdtempSync(join(tmpdir(), "studio-content-"));
  mkdirSync(join(fixture, ".content-drafts"));
  writeFileSync(join(fixture, ".content-drafts", "projects.json"), JSON.stringify([{
    ...publicProjects[0], slug: "private-test", title: "Private test engagement", visibility: "review", designation: "Client engagement",
  }]));
  try {
    process.chdir(fixture);
    delete process.env.CONTENT_PREVIEW;
    assert.equal(getDraftProjectBySlug("private-test"), undefined);
    assert.ok(getVisibleProjects().every(({ visibility }) => visibility === "public"));
    process.env.CONTENT_PREVIEW = "true";
    assert.equal(getDraftProjectBySlug("private-test")?.visibility, "review");
    assert.equal(getDraftProjectBySlug("private-test")?.designation, "Client engagement");
    assert.ok(getVisibleProjects().every(({ visibility }) => visibility === "public"));
    assert.equal(getProjectBySlug("unknown-project"), undefined);
    process.env.CONTENT_PREVIEW = "false";
    assert.equal(getDraftProjectBySlug("private-test"), undefined);
  } finally {
    process.chdir(previousCwd);
    rmSync(fixture, { recursive: true, force: true });
    if (previous === undefined) delete process.env.CONTENT_PREVIEW;
    else process.env.CONTENT_PREVIEW = previous;
  }
});

test("public projects disclose their status and cover every case-study section", () => {
  assert.equal(new Set(publicProjects.map(({ slug }) => slug)).size, publicProjects.length);
  const dbc = publicProjects.find(({ slug }) => slug === "dbc-automobiles");
  assert.ok(dbc);
  assert.equal(dbc.designation, "Concept Demonstration");
  assert.equal(dbc.demoUrl, "https://dbcautomobiles.vercel.app/");
  for (const project of publicProjects) {
    assert.ok(project.status && project.statusDetail);
    for (const required of ["context", "challenge", "discovery", "strategy", "solution", "outcomes", "status"]) {
      assert.ok(project.sections.some(({ id }) => id === required), `${project.slug} missing ${required}`);
    }
    for (const screenshot of project.screenshots ?? []) {
      assert.ok(screenshot.alt && screenshot.caption && screenshot.width > 0 && screenshot.height > 0);
    }
  }
});
