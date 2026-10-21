import { z } from "zod";
import { evidenceUrl } from "./result-verification.ts";

export const staffAthleteNumber = z.string().regex(/^[1-9]\d{0,17}$/);
export const staffResultTarget = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("result"), resultId: z.number().int().positive() }).strict(),
  z
    .object({
      kind: z.literal("history"),
      athleteId: z.number().int().positive(),
      provider: z.string().min(1).max(200),
      externalId: z.string().min(1).max(500),
      index: z.number().int().min(0).max(100000),
    })
    .strict(),
]);
const review = {
  athleteNumber: staffAthleteNumber,
  expectedVersion: z.string().regex(/^[a-f0-9]{64}$/),
  verified: z.boolean(),
  note: z.string().trim().min(12).max(4000),
};
export const staffProfileVerificationInput = z.object(review).strict();
export const staffResultVerificationInput = z
  .object({
    ...review,
    target: staffResultTarget,
    sourceUrl: evidenceUrl,
    locator: z.string().trim().max(2000),
    identityEvidence: z.string().trim().max(4000),
    sourceChecked: z.boolean(),
  })
  .strict()
  .refine(
    (data) =>
      !data.verified ||
      (data.sourceChecked &&
        data.sourceUrl &&
        data.locator.length >= 2 &&
        data.identityEvidence.length >= 12),
    "Check the source row and record its location and athlete identity match.",
  );
export type StaffResultTarget = z.infer<typeof staffResultTarget>;
export type StaffProfileVerificationInput = z.infer<typeof staffProfileVerificationInput>;
export type StaffResultVerificationInput = z.infer<typeof staffResultVerificationInput>;
