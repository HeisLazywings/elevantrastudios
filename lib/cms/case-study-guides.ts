import type { CaseStudySection } from "./types";

/**
 * Editorial prompts only. Never insert private client information or fabricated
 * results into public content automatically. Existing saved chapters are retained.
 */
export const caseStudyChapterGuides = [
  {
    id: "context",
    label: "Context",
    prompt: "Explain the business, audience and situation in plain language. Obtain client permission before naming an engagement.",
  },
  {
    id: "challenge",
    label: "Challenge",
    prompt: "State the business question and where a customer journey appears to break down. Distinguish observations from assumptions.",
  },
  {
    id: "discovery",
    label: "Discovery",
    prompt: "Record confirmed customer questions, existing touchpoints, baseline evidence and the source/date of each observation.",
  },
  {
    id: "strategy",
    label: "Strategy",
    prompt: "Describe the intended customer journey and what success would mean. Avoid promising unmeasured commercial results.",
  },
  {
    id: "decision-rationale",
    label: "Decision rationale",
    prompt: "Document alternatives considered, the option selected, trade-offs and what was deliberately not built, with reasons.",
  },
  {
    id: "solution",
    label: "Solution",
    prompt: "Describe the actual delivered scope or explicitly label a concept. Use only approved assets and screenshots.",
  },
  {
    id: "evidence",
    label: "Evidence & measurement",
    prompt: "Record metric definitions, baseline and comparison periods, data sources, sample sizes and whether values are measured, estimated or client-reported.",
  },
  {
    id: "outcomes",
    label: "Outcomes",
    prompt: "State what changed, if anything, with the period and evidence. Clearly separate observed correlation from claimed causation.",
  },
  {
    id: "limitations",
    label: "Limitations",
    prompt: "Explain what remains unknown or unverified, and how it might be tested next. Do not disguise assumptions as results.",
  },
  {
    id: "status",
    label: "Project status",
    prompt: "State whether this is a concept demonstration, active engagement or delivered project, without implying client endorsement.",
  },
] as const;

export const evidenceChapterIds = ["decision-rationale", "evidence", "limitations"] as const;

export function newCaseStudyChapter(id: string): CaseStudySection {
  const guide = caseStudyChapterGuides.find((item) => item.id === id);
  return {
    id,
    label: guide?.label || "New chapter",
    title: "",
    paragraphs: [],
    points: [],
  };
}
