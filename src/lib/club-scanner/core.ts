import { z } from "zod";
import { sourcePerformanceSchema } from "../athrecs/source-performance-history.ts";
export const normal = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s);
export const scopeSchema = z
  .object({
    clubId: z.number().int().positive(),
    aliases: z.array(z.string().trim().min(3).max(120)).max(20),
    dateFrom: day,
    dateTo: day,
    discover: z.boolean().default(true),
    urls: z
      .array(
        z
          .string()
          .url()
          .max(1500)
          .refine((s) => {
            const u = new URL(s);
            return u.protocol === "https:" && !u.username && !u.password;
          }),
      )
      .max(100)
      .default([]),
  })
  .refine(
    (s) =>
      s.dateFrom <= s.dateTo &&
      s.dateTo <= new Date().toISOString().slice(0, 10) &&
      Number(s.dateTo.slice(0, 4)) - Number(s.dateFrom.slice(0, 4)) <= 11,
    "Choose a past date range of at most 11 calendar years.",
  )
  .refine(
    (s) => s.discover || s.urls.length > 0,
    "Select archive discovery or supply result links.",
  );
export type Scope = z.infer<typeof scopeSchema>;
export const rowSchema = z.object({
  key: z.string(),
  name: z.string().min(2).max(200),
  gender: z.string(),
  club: z.string(),
  bib: z.string(),
  url: z.string().url(),
  sourceHash: z.string(),
  checkedAt: z.string(),
  raw: z.record(z.string(), z.string()),
  performance: sourcePerformanceSchema.extend({
    year: z.number().int().min(0).max(2200),
    date: z.string(),
  }),
  sourceIssues: z.array(z.string()),
});
export type Row = z.infer<typeof rowSchema>;
export type Match = {
  number?: string;
  id: number;
  name: string;
  slug: string;
  gender: string;
  clubId: number | null;
  club: string | null;
  visibility: string;
  managed: boolean;
};
export type Decision = {
  target?: { name: string; gender: string; clubId: number | null };
  action: "create" | "link";
  athleteId?: number;
  reason: string;
  evidenceUrl: string;
  reviewedBy: string;
  reviewedAt: string;
  sourceHash: string;
};
export type Candidate = {
  id: string;
  club_id: number;
  source_key: string;
  data: Row;
  matches: Match[];
  issues: string[];
  status: string;
  decision: Decision | null;
  athlete_id: number | null;
};
export function matchesFor(row: Row, athletes: Match[]) {
  const parts = row.name.trim().split(/\s+/),
    surname = normal(parts.at(-1) ?? ""),
    initial = normal(parts[0]).slice(0, 1);
  return athletes.filter(
    (a) =>
      normal(a.name) === normal(row.name) ||
      (normal(a.name.split(/\s+/).at(-1) ?? "") === surname && normal(a.name).startsWith(initial)),
  );
}
export function assess(row: Row, athletes: Match[], clubId: number) {
  const matches = matchesFor(row, athletes),
    exact = matches.filter((a) => normal(a.name) === normal(row.name));
  const issues = [...row.sourceIssues];
  if (row.name.split(/\s+/)[0].replace(/\W/g, "").length < 2)
    issues.push("Initial-only name needs identity evidence");
  if (matches.length > 1 || (matches.length && exact.length !== 1))
    issues.push("Similar or multiple athlete names need review");
  if (exact.length === 1) {
    const a = exact[0];
    if (a.managed || a.visibility !== "public")
      issues.push("Existing profile requires separate publication review");
    if (a.clubId !== clubId)
      issues.push("Different club: confirm historical identity without changing membership");
    if (!row.gender || a.gender !== row.gender)
      issues.push("Source gender does not establish the existing identity");
  }
  return { matches, issues, status: issues.length ? "held" : "proposed" };
}
export const reviewSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(["suggested", "create", "link", "hold", "dismiss", "reopen"]),
  athleteId: z.number().int().positive().optional(),
  reason: z.string().trim().min(12).max(2000),
  evidenceUrl: z
    .string()
    .url()
    .refine((s) => new URL(s).protocol === "https:")
    .optional(),
  sourcesReviewed: z.boolean().default(false),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
export const filterSchema = z.object({
  runId: z.string().uuid().optional(),
  status: z
    .enum(["all", "proposed", "held", "approved", "published", "dismissed", "duplicate"])
    .default("all"),
  q: z.string().max(120).default(""),
  page: z.number().int().min(1).max(10000).default(1),
});
export type Filters = z.infer<typeof filterSchema>;
export const providerUrl = (s: string) =>
  /^https:\/\/totalracetiming\.co\.uk\/raceresults\/\d+\/?(?:#sr\d+)?$/.test(s);
