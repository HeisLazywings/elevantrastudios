/** Public fields only. No provider settings or privileged credentials belong here. */
export const ENQUIRY_LIMITS = { name: 120, email: 254, company: 200, budget: 100, message: 5000, bodyBytes: 24_576 } as const;
export const ENQUIRY_BUDGET_OPTIONS = [
  "₦150,000 – ₦299,000",
  "₦300,000 – ₦500,000",
  "₦500,000 – ₦1,000,000",
  "₦1,000,000 – ₦3,000,000",
  "₦3,000,000 – ₦5,000,000",
  "₦5,000,000+",
] as const;
export const ENQUIRY_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type EnquiryFields = { name: string; email: string; company: string; budget: string; message: string };
export type EnquiryInput = EnquiryFields & { submissionId: string };

export function validateEnquiry(value: unknown): EnquiryInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const allowed = new Set(["submissionId", "name", "email", "company", "budget", "message", "website", "action"]);
  if (Object.keys(raw).some((key) => !allowed.has(key)) || (raw.action !== undefined && raw.action !== "submit")) return null;
  if (raw.website !== undefined && raw.website !== "") return null;
  if (typeof raw.submissionId !== "string" || !ENQUIRY_ID_PATTERN.test(raw.submissionId)) return null;
  const result = { submissionId: raw.submissionId.toLowerCase() } as EnquiryInput;
  for (const key of ["name", "email", "company", "budget", "message"] as const) {
    const item = raw[key] === undefined && (key === "company" || key === "budget") ? "" : raw[key];
    if (typeof item !== "string") return null;
    const field = item.trim().replace(/\r\n?/g, "\n").normalize("NFC");
    if (field.length > ENQUIRY_LIMITS[key] || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(field)) return null;
    if (key !== "message" && /[\r\n]/.test(field)) return null;
    result[key] = key === "email" ? field.toLowerCase() : field;
  }
  if (!result.name || !result.message || !/^[A-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(result.email)) return null;
  if (result.budget && !(ENQUIRY_BUDGET_OPTIONS as readonly string[]).includes(result.budget)) return null;
  return result;
}
