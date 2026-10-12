import { z } from "zod";

const year = z.number().int().min(1800).max(2200).nullable();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Use a valid calendar date");
const url = z
  .string()
  .trim()
  .max(2000)
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "Use an http or https URL");
const optionalUrl = z.union([url, z.literal("")]);
export const registerFilters = z.object({
  q: z.string().trim().max(160).default(""),
  sport: z.enum(["All", "Running", "Parkrun", "Athletics", "OCR"]).default("All"),
  country: z.string().trim().max(100).default(""),
  surface: z.string().trim().max(100).default(""),
  year: year.default(null),
  gap: z
    .enum([
      "all",
      "no-editions",
      "no-results",
      "no-contacts",
      "no-organiser",
      "history",
      "results-found",
    ])
    .default("all"),
  page: z.number().int().min(0).max(1000000).default(0),
});
export type RegisterFilters = z.infer<typeof registerFilters>;
export const eventInput = z.object({
  eventId: z.number().int().positive(),
  page: z.number().int().min(0).max(100000).default(0),
  year: year.default(null),
});
export const historyInput = z
  .object({
    eventId: z.number().int().positive(),
    expectedRevision: z.number().int().nonnegative(),
    firstYear: year,
    firstDate: date.nullable(),
    finalYear: year,
    finalDate: date.nullable(),
    lifecycle: z.enum(["unknown", "active", "paused", "ended"]),
    sourceUrl: optionalUrl,
    checkedOn: date.nullable(),
    note: z.string().trim().max(3000),
    priority: z.enum(["low", "normal", "high"]),
    nextCheck: date.nullable(),
  })
  .superRefine((v, c) => {
    const issue = (message: string) => c.addIssue({ code: "custom", message });
    if (v.firstYear !== null && v.finalYear !== null && v.firstYear > v.finalYear)
      issue("Final year must not precede first year");
    if (v.firstDate && Number(v.firstDate.slice(0, 4)) !== v.firstYear)
      issue("First date must agree with first year");
    if (v.finalDate && Number(v.finalDate.slice(0, 4)) !== v.finalYear)
      issue("Final date must agree with final year");
    if (v.firstDate && v.finalDate && v.firstDate > v.finalDate)
      issue("Final date must not precede first date");
    if (v.finalYear !== null && v.lifecycle !== "ended")
      issue("A final year requires confirmed ended status");
    if (
      (v.firstYear !== null || v.finalYear !== null || v.lifecycle !== "unknown") &&
      (!v.sourceUrl || !v.checkedOn || v.note.length < 8)
    )
      issue("History claims need a source, checked date and supporting note");
  });
export const contactInput = z
  .object({
    eventId: z.number().int().positive(),
    organiser: z.string().trim().min(1).max(300),
    contactName: z.string().trim().max(200),
    email: z.union([z.string().trim().email().max(320), z.literal("")]),
    phone: z.string().trim().max(100),
    contactUrl: optionalUrl,
    postalAddress: z.string().trim().max(1000),
    period: z.enum(["current", "historical", "future", "unknown"]),
    fromYear: year,
    toYear: year,
    sourceUrl: url,
    checkedOn: date,
    note: z.string().trim().max(2000),
  })
  .superRefine((v, c) => {
    if (!(v.email || v.phone || v.contactUrl || v.postalAddress))
      c.addIssue({ code: "custom", message: "Add at least one contact method" });
    if (v.fromYear !== null && v.toYear !== null && v.fromYear > v.toYear)
      c.addIssue({ code: "custom", message: "Contact year range is reversed" });
  });

export function safeExternalUrl(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
export function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
