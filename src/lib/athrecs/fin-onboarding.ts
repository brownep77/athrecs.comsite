import { z } from "zod";

const shortText = (max: number) =>
  z
    .string()
    .trim()
    .min(2)
    .max(max)
    .refine((value) => !/\p{Cc}/u.test(value));

export const finProfileSearchSchema = z
  .object({
    action: z.literal("find_public_profiles"),
    racingName: shortText(120),
  })
  .strict();

export const finSignupLinkSchema = z
  .object({
    action: z.literal("create_signup_link"),
    requestId: z.string().regex(/^[A-Za-z0-9._:-]{16,128}$/),
    racingName: shortText(120),
    eventName: shortText(200).optional(),
    year: z
      .number()
      .int()
      .min(1800)
      .refine((year) => year <= new Date().getUTCFullYear())
      .optional(),
  })
  .strict();

export const finActionSchema = z.discriminatedUnion("action", [
  finProfileSearchSchema,
  finSignupLinkSchema,
]);

export type FinSignupInput = z.infer<typeof finSignupLinkSchema>;

/** Opaque reference only: no account identity or personal details in the URL. */
export function parseFinContinuation(value: unknown): string | undefined {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : undefined;
}

export type FinPublicProfile = {
  displayName: string;
  athleteNumber: string;
  profileUrl: string;
  city: string | null;
  country: string | null;
  club: string | null;
  sports: string[];
  publicResultCount: number;
};

export type FinProfileSearchResult = {
  status: "possible_profiles" | "no_public_profiles";
  profiles: FinPublicProfile[];
  hasMore: boolean;
  scope: "public_directory_search";
  message: string;
};

export type FinSignupLink = {
  status: "ready";
  signupUrl: string;
  expiresAt: string;
};

export type FinResumeResult =
  | { status: "unavailable" | "verify_email" }
  | {
      status: "ready";
      racingName: string;
      eventName: string | null;
      year: number | null;
      expiresAt: string;
      accountStatus: "verified_new_signup" | "existing_account";
    };
