import { z } from "zod";

export const disqualificationSchema = z.object({
  reason: z.enum(["whereabouts", "positive_test", "other"]),
  sourceUrl: z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === "https:"),
  decisionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(2000),
});
export type Disqualification = z.infer<typeof disqualificationSchema>;
export const resultDetailsSchema = z.object({
  disqualification: disqualificationSchema.optional(),
  splits: z.array(z.object({ label: z.string(), time: z.string() })).optional(),
  note: z.string().max(2000).optional(),
  // Display exclusion only. Original source result and race archive remain intact.
  // Actor identities and reasons are retained in the staff audit, not this shape.
  profileExcluded: z.boolean().optional(),
});
export type ResultDetails = z.infer<typeof resultDetailsSchema>;
export function readResultDetails(value: unknown): ResultDetails {
  return resultDetailsSchema.parse(value ?? {});
}
export function disqualificationLabel(reason: Disqualification["reason"]): string {
  return {
    whereabouts: "Disqualified — whereabouts failures",
    positive_test: "Disqualified — positive drug test",
    other: "Disqualified — see decision",
  }[reason];
}
export function isDisqualified(result: { status: string; details?: ResultDetails }): boolean {
  return (
    Boolean(result.details?.disqualification) ||
    ["dq", "dsq", "disqualified"].includes(result.status.trim().toLowerCase())
  );
}
