import { z } from "zod";

export const verificationKey = z
  .string()
  .regex(/^(?:r:-?[1-9]\d*|h:[1-9]\d*:[0-9a-f-]{36}:\d{1,3})$/);
export const evidenceUrl = z.union([
  z.literal(""),
  z
    .string()
    .url()
    .max(2000)
    .refine((v) => new URL(v).protocol === "https:", "Use an HTTPS link."),
]);
export const verificationRequestInput = z
  .object({
    key: verificationKey,
    expectedVersion: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    note: z.string().trim().max(2000),
    evidenceUrl,
  })
  .strict();
export const verificationReviewInput = z
  .object({
    id: z.string().uuid(),
    revision: z.number().int().positive(),
    action: z.enum(["approve", "needs_info", "reject"]),
    sourceUrl: evidenceUrl,
    locator: z.string().trim().max(2000),
    identityEvidence: z.string().trim().max(4000),
    staffNote: z.string().trim().min(12).max(4000),
    memberMessage: z.string().trim().min(1).max(2000),
    sourceChecked: z.boolean(),
  })
  .strict();
export type VerificationRequestInput = z.infer<typeof verificationRequestInput>;
export type VerificationReviewInput = z.infer<typeof verificationReviewInput>;
export type VerificationStatus = "pending" | "needs_info" | "approved" | "rejected";
export type MemberVerificationRequest = {
  key: string;
  status: VerificationStatus;
  message: string;
};
