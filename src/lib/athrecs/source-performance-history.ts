import { z } from "zod";
import { disqualificationSchema } from "./result-details.ts";
import { performanceTimingSchema } from "./performance-timing.ts";
import type { Sport } from "./types";

// Text fields deliberately retain decimal precision, field marks, heat positions,
// non-finishes and source annotations; never coerce these into integer seconds.
// Enigma's original result PDFs are still served over HTTP. Retain the actual
// evidence URL instead of fabricating an HTTPS equivalent or losing the archive.
// This exception applies only to the organiser's two exact legacy hostnames.
export const historySourceUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    return (
      url.protocol === "http:" &&
      /^http:\/\/(?:www\.)?enigmarunning\.co\.uk\//.test(value) &&
      !url.username &&
      !url.password &&
      !url.port &&
      ["enigmarunning.co.uk", "www.enigmarunning.co.uk"].includes(url.hostname)
    );
  });
export const sourcePerformanceSchema = z.object({
  syntheticTest: z.boolean().optional(),
  year: z.number().int().min(1800).max(2200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  places: z
    .object({
      overall: z.number().int().positive().nullable(),
      gender: z.number().int().positive().nullable(),
      category: z.number().int().positive().nullable(),
    })
    .optional(),
  dateLabel: z.string().max(200).optional(),
  yearLabel: z.string().max(80).optional(),
  notes: z.string().max(6000).optional(),
  providerName: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  // Only a reviewed catalogue match may establish an event/major identity.
  eventSlug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  // Administrator confirmation and independent source checks are distinct audit bases.
  verificationStatus: z
    .enum(["unverified", "verified_by_administrator", "source_verified"])
    .optional(),
  profileExcluded: z.boolean().optional(),
  // Explicitly opt a supplied mark into reported PB display; never verifies it.
  reportedPersonalBest: z.boolean().optional(),
  sourceDate: z.string(),
  ageGroup: z.string(),
  // Older imports also used numbers or null for bibs. Keep those readable.
  bib: z
    .union([z.string(), z.number()])
    .transform(String)
    .pipe(z.string().max(40))
    .optional()
    .catch(undefined),
  triathlonSplits: z
    .object({
      swim: z.string().regex(/^\d{1,3}:[0-5]\d:[0-5]\d(?:\.\d+)?$/),
      bike: z.string().regex(/^\d{1,3}:[0-5]\d:[0-5]\d(?:\.\d+)?$/),
      run: z.string().regex(/^\d{1,3}:[0-5]\d:[0-5]\d(?:\.\d+)?$/),
    })
    .optional(),
  discipline: z.string(),
  performance: z.string(),
  timing: performanceTimingSchema.optional(),
  wind: z.string(),
  place: z.string(),
  venue: z.string(),
  meeting: z.string(),
  sourceUrls: z.array(historySourceUrlSchema),
  sourceKeys: z.array(z.string()).optional(),
  labels: z.array(z.string()),
  disqualification: disqualificationSchema.optional(),
});
export const historyPerformanceSchema = sourcePerformanceSchema.extend({
  date: z.string().regex(/^(?:\d{4}-\d{2}-\d{2})?$/),
});
export type SourcePerformance = z.infer<typeof sourcePerformanceSchema>;
// Browser-only derived classification preserves calculations after source names are removed.
export type DisplaySourcePerformance = SourcePerformance & {
  displaySport?: Sport | "Unclassified";
};
export const sourceHistorySchema = z.object({
  provider: z.string(),
  externalId: z.string(),
  sourceUrl: historySourceUrlSchema,
  capturedAt: z.string(),
  complete: z.boolean(),
  yearsExpected: z.array(z.number().int()),
  yearsCaptured: z.array(z.number().int()),
  performances: z.array(historyPerformanceSchema),
});
export type SourceHistory = Omit<z.infer<typeof sourceHistorySchema>, "performances"> & {
  performances: DisplaySourcePerformance[];
  rankingHistory?: boolean;
};
