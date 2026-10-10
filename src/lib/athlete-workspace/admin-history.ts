import { z } from "zod";
import { historyPerformanceSchema } from "../athrecs/source-performance-history.ts";
export const adminHistoryInput = z.object({
  athleteId: z.number().int().positive(),
  requestId: z.string().uuid(),
  sourceUrl: z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === "https:"),
  performances: z.array(historyPerformanceSchema).min(1).max(250),
  reason: z.string().trim().min(12).max(4000),
  administratorApproval: z.literal(true),
  batches: z
    .array(
      z.object({
        id: z.string().uuid(),
        revision: z.number().int().positive(),
        indexes: z.array(z.number().int().positive()).min(1).max(250),
      }),
    )
    .max(20)
    .default([]),
});
export const historyExclusionInput = z.object({
  athleteId: z.number().int().positive(),
  externalId: z.string().uuid(),
  index: z.number().int().min(0).max(249),
  excluded: z.boolean(),
  reason: z.string().trim().min(1).max(2000),
});
