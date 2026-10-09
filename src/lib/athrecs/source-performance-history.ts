import { z } from "zod";
import { disqualificationSchema } from "./result-details.ts";

// Text fields deliberately retain decimal precision, field marks, heat positions,
// non-finishes and source annotations; never coerce these into integer seconds.
const sourceUrl = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:");
export const sourcePerformanceSchema = z.object({
  year: z.number().int().min(1800).max(2200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateLabel: z.string().max(200).optional(),
  yearLabel: z.string().max(80).optional(),
  notes: z.string().max(6000).optional(),
  providerName: z.string().max(200).optional(),
  // Administrator confirmation and independent source checks are distinct audit bases.
  verificationStatus: z
    .enum(["unverified", "verified_by_administrator", "source_verified"])
    .optional(),
  profileExcluded: z.boolean().optional(),
  sourceDate: z.string(),
  ageGroup: z.string(),
  discipline: z.string(),
  performance: z.string(),
  wind: z.string(),
  place: z.string(),
  venue: z.string(),
  meeting: z.string(),
  sourceUrls: z.array(sourceUrl),
  labels: z.array(z.string()),
  disqualification: disqualificationSchema.optional(),
});
export const historyPerformanceSchema = sourcePerformanceSchema.extend({
  date: z.string().regex(/^(?:\d{4}-\d{2}-\d{2})?$/),
});
export type SourcePerformance = z.infer<typeof sourcePerformanceSchema>;
export const sourceHistorySchema = z.object({
  provider: z.string(),
  externalId: z.string(),
  sourceUrl,
  capturedAt: z.string(),
  complete: z.boolean(),
  yearsExpected: z.array(z.number().int()),
  yearsCaptured: z.array(z.number().int()),
  performances: z.array(historyPerformanceSchema),
});
export type SourceHistory = z.infer<typeof sourceHistorySchema>;
