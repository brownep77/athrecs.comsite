import { z } from "zod";
import { personNameTokens, uniquePotentialMatchNames } from "./result-match.ts";

export const MATCHING_NOTICE_VERSION = "result-matching-optional-2026-10-13";
const names = z.array(z.string().trim().min(1).max(120)).max(8).default([]);
export function publicResultUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a full HTTPS results or athlete profile link.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname) ||
    /(?:^|\.)(?:localhost|local|internal|test|example|invalid)$/i.test(url.hostname) ||
    [...url.searchParams.keys()].some((key) =>
      /token|password|secret|auth|session|signature|^code$|api.?key/i.test(key),
    )
  )
    throw new Error(
      "Use a public HTTPS result link without passwords, sign-in codes or private access tokens.",
    );
  return url.toString();
}
export const matchingSettingsSchema = z
  .object({
    otherSurnames: names,
    maidenName: z.string().trim().max(120).default(""),
    sourceUrls: z.array(z.string().trim().max(2048).transform(publicResultUrl)).max(10).default([]),
    address: z.string().trim().max(500).default(""),
    phone: z.string().trim().max(40).default(""),
    contactConsent: z.boolean().default(false),
    externalSearchConsent: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if ((v.address || v.phone) && !v.contactConsent)
      ctx.addIssue({
        code: "custom",
        message:
          "Choose whether we may use your optional address or phone for account support, or clear them.",
      });
  });
export type MatchingSettings = z.infer<typeof matchingSettingsSchema>;
export const emptyMatchingSettings = (): MatchingSettings => matchingSettingsSchema.parse({});
export function matchingNames(
  fullName: string | null | undefined,
  previousNames: string[] = [],
  settings?: Partial<MatchingSettings> | null,
  otherNames: Array<string | null | undefined> = [],
): string[] {
  const first = fullName?.trim().split(/\s+/)[0] || "";
  const surnames = [...(settings?.otherSurnames ?? []), settings?.maidenName ?? ""].filter(Boolean);
  return uniquePotentialMatchNames([
    fullName,
    ...previousNames,
    ...otherNames,
    ...surnames.map((surname) => `${first} ${surname}`),
  ]);
}
export function validBirthDate(value: string, today = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date <= today &&
    date.getUTCFullYear() >= 1900
  );
}
export function missingClaimIdentity(
  value?: {
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    verifiedEmail?: string;
    emailVerified?: boolean;
  } | null,
): string[] {
  return [
    !/\p{L}/u.test(value?.fullName?.trim() ?? "") ? "name" : "",
    !value?.verifiedEmail?.trim() || !value.emailVerified ? "verified email" : "",
  ].filter(Boolean);
}
export const claimIdentitySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .refine((v) => /\p{L}/u.test(v), "Enter your name."),
  dateOfBirth: z
    .string()
    .trim()
    .refine((v) => !v || validBirthDate(v), "Enter a valid date of birth or leave it blank.")
    .default(""),
  nationality: z
    .string()
    .trim()
    .max(100)
    .refine(
      (v) => !v || (v.length >= 2 && /\p{L}/u.test(v)),
      "Enter your nationality or leave it blank.",
    )
    .default(""),
  privacyAcknowledged: z.literal(true, { message: "Please read the privacy notice." }),
});
export const resultSearchSchema = z
  .object({
    name: z.string().trim().max(120).default(""),
    year: z
      .string()
      .trim()
      .regex(/^(?:\d{4})?$/)
      .default(""),
    distance: z.string().trim().max(40).default(""),
  })
  .default({ name: "", year: "", distance: "" });
export type ResultSearchFilters = z.infer<typeof resultSearchSchema>;
export function distanceSearchAliases(value: string): string[] {
  const normal = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, "");
  const code = normal(value);
  if (!code) return [];
  if (["half", "halfmarathon", "hm", "21.0975k", "21.1k"].includes(code))
    return ["half", "halfmarathon", "hm", "21.0975k", "21.1k"];
  if (["marathon", "fullmarathon", "42.195k", "42.2k"].includes(code))
    return ["marathon", "fullmarathon", "42.195k", "42.2k"];
  const miles = value.trim().match(/^(\d+(?:\.\d+)?)\s*(?:M|mi|miles?)$/);
  if (miles) return [`${miles[1]}m`, `${miles[1]}mi`, `${miles[1]}mile`, `${miles[1]}miles`];
  const km = code.match(/^(\d+(?:\.\d+)?)(?:k|km|kilometres?|kilometers?)$/);
  if (km) return ["k", "km", "kilometres", "kilometers"].map((unit) => km[1] + unit);
  return [code];
}
export function selectedMatchingNames(saved: string[], selected: string): string[] {
  if (!selected) return saved;
  const match = saved.find(
    (name) => personNameTokens(name).join(" ") === personNameTokens(selected).join(" "),
  );
  if (!match)
    throw new Error(
      "Save this racing name in Names and result sources before searching. Searches are limited to your own saved names.",
    );
  return [match];
}
