import { ATHRECS_PUBLIC_SPORTS } from "../athrecs/public-sports.ts";
import { z } from "zod";

export const CLUB_NOTICE_VERSION = "club-registration-2026-10-13";
export const CLUB_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Awaiting verification",
  needs_changes: "More information needed",
  approved: "Representative approved",
  rejected: "Not approved",
  revoked: "Access removed",
  withdrawn: "Withdrawn",
};
export const CLUB_SPORTS = ATHRECS_PUBLIC_SPORTS;
const shortText = z.string().trim().max(160).default("");
// Links are evidence references only. They are never fetched on the server.
const publicUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        !url.port &&
        /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname) &&
        !/(?:^|\.)(?:localhost|local|internal|invalid)$/i.test(url.hostname) &&
        ![...url.searchParams.keys()].some((key) =>
          /token|password|secret|auth|session|signature|^code$/i.test(key),
        )
      );
    } catch {
      return false;
    }
  }, "Use a public HTTPS page without passwords or private access codes.")
  .default("");
export const clubDetailsSchema = z.object({
  clubName: shortText,
  city: shortText,
  county: shortText,
  country: shortText,
  sports: z.array(z.enum(CLUB_SPORTS)).max(CLUB_SPORTS.length).default([]),
  website: publicUrl,
  affiliation: z.enum(["affiliated", "unaffiliated", "unknown"]).default("unknown"),
  governingBody: shortText,
  affiliationNumber: shortText,
  representativeName: shortText,
  representativeRole: shortText,
  clubEmail: z
    .string()
    .trim()
    .max(254)
    .refine(
      (v) => !v || z.email().safeParse(v).success,
      "Enter a valid club contact email or leave it blank.",
    )
    .default(""),
  phone: z.string().trim().max(40).default(""),
  verificationMethod: z.enum(["officer_page", "club_contact"]).default("officer_page"),
  evidenceUrl: publicUrl,
  authorityDetails: z.string().trim().max(2000).default(""),
  adultConfirmed: z.boolean().default(false),
  authorityConfirmed: z.boolean().default(false),
  privacyAcknowledged: z.boolean().default(false),
});
export type ClubDetails = z.infer<typeof clubDetailsSchema>;
export const clubSaveSchema = z
  .object({
    id: z.uuid().optional(),
    revision: z.number().int().positive().optional(),
    clubId: z.number().int().positive().nullable(),
    details: clubDetailsSchema,
    submit: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.id && !v.revision)
      ctx.addIssue({ code: "custom", message: "Reload this application before saving." });
    if (!v.clubId && (!v.details.clubName || !v.details.country || !v.details.city))
      ctx.addIssue({
        code: "custom",
        message: "Enter the missing club's name, town/city and country.",
      });
    if (!v.submit) return;
    const d = v.details;
    for (const [valid, message] of [
      [d.representativeName.length >= 2, "Enter your full name."],
      [d.representativeRole.length >= 2, "Enter your role in the club."],
      [
        d.authorityDetails.length >= 30,
        "Explain your authority and how it can be checked (at least 30 characters).",
      ],
      [
        d.verificationMethod !== "officer_page" || !!d.evidenceUrl,
        "Add the public page that identifies your club role.",
      ],
      [
        d.verificationMethod !== "club_contact" || !!(d.website || d.evidenceUrl),
        "Add an official club or governing-body contact page for independent verification.",
      ],
      [
        d.affiliation !== "affiliated" || !!d.governingBody,
        "Name the governing body, or choose another affiliation status.",
      ],
      [!!v.clubId || d.sports.length > 0, "Choose at least one sport for the missing club."],
      [d.adultConfirmed, "Confirm that you are aged 18 or over."],
      [d.authorityConfirmed, "Confirm that you are authorised to represent the club."],
      [d.privacyAcknowledged, "Read and acknowledge the club registration privacy notice."],
    ] as const)
      if (!valid) ctx.addIssue({ code: "custom", message });
  });
export type ClubSave = z.infer<typeof clubSaveSchema>;
export const clubReviewSchema = z
  .object({
    id: z.uuid(),
    revision: z.number().int().positive(),
    action: z.enum(["approved", "needs_changes", "rejected", "revoked"]),
    message: z.string().trim().min(10).max(2000),
    evidenceNote: z.string().trim().min(30).max(4000),
    identityChecked: z.boolean().default(false),
    authorityChecked: z.boolean().default(false),
    resolvedClubId: z.number().int().positive().optional(),
    createListing: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.action === "approved" && (!v.identityChecked || !v.authorityChecked))
      ctx.addIssue({
        code: "custom",
        message:
          "Check the club identity and representative authority independently before approval.",
      });
    if (v.createListing && v.resolvedClubId)
      ctx.addIssue({
        code: "custom",
        message: "Choose an existing listing or create one, not both.",
      });
  });
export type ClubReview = z.infer<typeof clubReviewSchema>;
export type ClubApplication = {
  id: string;
  club_id: number | null;
  club_name: string | null;
  club_slug: string | null;
  details: ClubDetails;
  status: string;
  revision: number;
  review_message: string;
  updated_at: string;
  submitted_at: string | null;
};
export type ClubReviewApplication = ClubApplication & {
  user_id: string;
  submitted_email: string | null;
  active_representatives: number;
  confirmation_club_id: number | null;
  confirmation_status: string | null;
  confirmation_method: string | null;
  confirmation_source: string | null;
  confirmation_contact: string | null;
  confirmation_note: string | null;
};
export function registrationKey(clubId: number | null, details: ClubDetails) {
  return clubId
    ? `club:${clubId}`
    : `new:${[details.clubName, details.country, details.city]
        .map((v) => v.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim())
        .join("|")}`;
}

export const clubConfirmationSchema = z
  .object({
    id: z.uuid(),
    revision: z.number().int().positive(),
    targetClubId: z.number().int().positive().nullable(),
    method: z.enum(["email", "manual"]),
    sourceUrl: publicUrl.refine(Boolean, "Enter the independently sourced public contact page."),
    contact: z.string().trim().min(3).max(254),
    replyNote: z.string().trim().max(1200).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.method === "email" && !z.email().safeParse(v.contact).success)
      ctx.addIssue({ code: "custom", message: "Enter the officer's published email address." });
    if (v.method === "manual" && v.replyNote.length < 30)
      ctx.addIssue({
        code: "custom",
        message: "Record who replied, when and how they authorised this applicant.",
      });
  });
export type ClubConfirmation = z.infer<typeof clubConfirmationSchema>;
export const clubContentSchema = z.object({
  clubId: z.number().int().positive(),
  revision: z.number().int().nonnegative(),
  biography: z.string().trim().max(3000),
  training: z.string().trim().max(1600),
  contactUrl: publicUrl,
});
export type ClubContent = z.infer<typeof clubContentSchema>;
