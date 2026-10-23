import { z } from "zod";
import { publicResultUrl } from "./result-matching-settings";

export const profileSetupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .refine((v) => /\p{L}/u.test(v), "Enter your full racing name."),
  currentClub: z.string().trim().max(160).default(""),
  previousClubs: z.array(z.string().trim().min(1).max(160)).max(10).default([]),
  previousNames: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
  sourceUrls: z.array(z.string().trim().max(2048).transform(publicResultUrl)).max(10).default([]),
  privacyAcknowledged: z.literal(true),
});
export type ProfileSetup = z.infer<typeof profileSetupSchema>;
export const setupLines = (value: string) => [
  ...new Set(
    value
      .split(/\n/)
      .map((v) => v.trim())
      .filter(Boolean),
  ),
];
