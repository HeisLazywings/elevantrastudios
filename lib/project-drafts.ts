// Server-only local content loader. Node filesystem imports prevent this module
// from being used in a browser bundle. Draft files must remain gitignored.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Project, ProjectScreenshot, ProjectSection } from "./projects";

const sectionIds = new Set([
  "context", "challenge", "discovery", "strategy", "solution", "outcomes", "status",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isTextArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isText);
}

function isHttpsUrl(value: unknown): value is string {
  if (!isText(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isSection(value: unknown): value is ProjectSection {
  return isRecord(value)
    && typeof value.id === "string"
    && sectionIds.has(value.id)
    && isText(value.label)
    && isText(value.title)
    && isTextArray(value.paragraphs)
    && (value.points === undefined || isTextArray(value.points));
}

function isScreenshot(value: unknown): value is ProjectScreenshot {
  if (!isRecord(value)) return false;
  const validSource = isText(value.src)
    && value.src.startsWith("/")
    && !value.src.startsWith("//")
    && !value.src.includes("\\")
    && !value.src.split("/").includes("..");
  return validSource
    && Number.isInteger(value.width) && Number(value.width) > 0
    && Number.isInteger(value.height) && Number(value.height) > 0
    && isText(value.alt)
    && isText(value.caption);
}

function isDraftProject(value: unknown): value is Project {
  if (!isRecord(value) || !isRecord(value.artwork)) return false;
  if (!Array.isArray(value.sections) || !value.sections.length || !value.sections.every(isSection)) return false;
  const uniqueSections = new Set(value.sections.map((section) => section.id));
  return isText(value.slug) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)
    && isText(value.title)
    && isText(value.category)
    && (value.designation === "Concept Demonstration" || value.designation === "Client engagement")
    && value.visibility === "review"
    && isText(value.summary)
    && isText(value.headline)
    && isTextArray(value.focus)
    && isText(value.status)
    && isText(value.statusDetail)
    && (value.demoUrl === undefined || isHttpsUrl(value.demoUrl))
    && isText(value.artwork.initial)
    && isText(value.artwork.title)
    && isText(value.artwork.subtitle)
    && isTextArray(value.artwork.journey)
    && uniqueSections.size === value.sections.length
    && (value.screenshots === undefined
      || (Array.isArray(value.screenshots) && value.screenshots.every(isScreenshot)));
}

export function getDraftProjects(): readonly Project[] {
  if (process.env.CONTENT_PREVIEW !== "true") return [];

  try {
    const path = join(process.cwd(), ".content-drafts", "projects.json");
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (!Array.isArray(parsed) || !parsed.every(isDraftProject)
      || new Set(parsed.map(({ slug }) => slug)).size !== parsed.length) {
      throw new Error("Invalid local content schema");
    }
    return parsed;
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") return [];
    // Do not include error messages, paths, or content: local drafts may be private.
    console.warn("Local content drafts could not be loaded; continuing with public content.");
    return [];
  }
}

export function getDraftProjectBySlug(slug: string): Project | undefined {
  return getDraftProjects().find((project) => project.slug === slug);
}
