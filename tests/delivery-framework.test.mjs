import assert from "node:assert/strict";
import { test } from "node:test";
import { processSteps } from "../lib/data.ts";
import {
  caseStudyChapterGuides,
  evidenceChapterIds,
  newCaseStudyChapter,
} from "../lib/cms/case-study-guides.ts";

test("public delivery framework defines six reviewed stages", () => {
  assert.deepEqual(processSteps.map(({ n }) => n), ["01", "02", "03", "04", "05", "06"]);
  assert.deepEqual(processSteps.map(({ title }) => title), [
    "Discovery", "Strategy", "Design", "Development", "Launch", "Growth",
  ]);
  for (const stage of processSteps) {
    assert.ok(stage.description.length > 40, stage.title);
    assert.ok(stage.output.length > 15, stage.title);
    assert.ok(stage.checkpoint.length > 12, stage.title);
    assert.doesNotMatch(stage.output + stage.checkpoint, /guaranteed sales|guaranteed rankings/i);
  }
});

test("case study guidance includes decisions, evidence and limits with no invented results", () => {
  const ids = caseStudyChapterGuides.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of evidenceChapterIds) {
    assert.ok(ids.includes(id));
    const chapter = newCaseStudyChapter(id);
    assert.equal(chapter.id, id);
    assert.ok(chapter.label);
    assert.equal(chapter.title, "");
    assert.deepEqual(chapter.paragraphs, []);
    assert.deepEqual(chapter.points, []);
  }
  assert.match(caseStudyChapterGuides.find(({ id }) => id === "evidence").prompt, /source|sample|baseline/i);
  assert.match(caseStudyChapterGuides.find(({ id }) => id === "limitations").prompt, /unverified/i);
});
