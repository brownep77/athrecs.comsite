import { z } from "zod";

export const PARTNER_POLICY_VERSION = "partnerships-2026-09-16";
export const BRAND_CATEGORIES = {
  sportswear: "Sportswear",
  footwear: "Footwear",
  nutrition: "Nutrition",
  equipment: "Equipment",
  technology: "Technology",
  other: "Other",
} as const;
export const OPPORTUNITY_KINDS = {
  sponsorship: "Sponsorship",
  ambassador: "Ambassador role",
  product_testing: "Product testing / gifted kit",
  paid_collaboration: "Paid collaboration",
  club_partnership: "Club partnership",
  discount: "Discount / affiliate offer",
} as const;
export const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting review",
  approved: "Approved",
  needs_changes: "Changes requested",
  rejected: "Not approved",
  suspended: "Suspended",
  closed: "Closed",
  shared: "Shared with brand",
  declined: "Not shared",
  withdrawn: "Withdrawn",
};
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const httpsUrl = z
  .string()
  .trim()
  .max(1000)
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" && !url.username && !url.password && url.hostname.includes(".")
    );
  }, "Use a public HTTPS website without login details");
export const brandSchema = z.object({
  name: text(2, 120),
  website: httpsUrl,
  category: z.enum(["sportswear", "footwear", "nutrition", "equipment", "technology", "other"]),
  description: text(20, 1500),
  sports: text(2, 250),
  markets: text(2, 250),
  contactName: text(2, 120),
  contactRole: text(2, 120),
  declaration: z.literal(true),
});
export const opportunitySchema = z.object({
  id: z.number().int().positive().optional(),
  revision: z.number().int().positive().optional(),
  title: text(5, 140),
  kind: z.enum([
    "sponsorship",
    "ambassador",
    "product_testing",
    "paid_collaboration",
    "club_partnership",
    "discount",
  ]),
  audience: z.enum(["athletes", "clubs", "both"]),
  description: text(30, 4000),
  benefits: text(5, 1000),
  requirements: text(5, 1500),
  sports: text(2, 250),
  markets: text(2, 250),
  closingDate: z.iso.date(),
  declaration: z.literal(true),
});
export const preferenceSchema = z
  .object({
    sponsorship: z.boolean(),
    productTesting: z.boolean(),
    offers: z.boolean(),
    adultConfirmed: z.boolean(),
  })
  .refine(
    (v) => !(v.sponsorship || v.productTesting || v.offers) || v.adultConfirmed,
    "Confirm you are 18 or over to opt in",
  );
export const applicationSchema = z
  .object({
    opportunityId: z.number().int().positive(),
    applicantKind: z.enum(["athlete", "club"]),
    athleteId: z.number().int().positive().optional(),
    clubName: text(2, 120).optional(),
    clubWebsite: httpsUrl.optional(),
    message: text(20, 2000),
    declaration: z.literal(true),
    adultConfirmed: z.literal(true),
  })
  .refine(
    (v) => (v.applicantKind === "athlete" ? !!v.athleteId : !!v.clubName && !!v.clubWebsite),
    "Choose your claimed athlete profile or provide your club's details",
  );
export const reviewSchema = z.object({
  entity: z.enum(["brand", "opportunity", "application"]),
  id: z.number().int().positive(),
  revision: z.number().int().positive(),
  action: z.enum(["approved", "needs_changes", "rejected", "suspended", "shared", "declined"]),
  note: text(10, 2000),
});
export type BrandInput = z.infer<typeof brandSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type PreferenceInput = z.infer<typeof preferenceSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type Brand = {
  id: number;
  name: string;
  website: string;
  category: keyof typeof BRAND_CATEGORIES;
  description: string;
  sports: string;
  markets: string;
};
export type PrivateBrand = Brand & {
  contact_name: string;
  contact_role: string;
  status: string;
  review_note: string;
  revision: number;
};
export type Opportunity = {
  id: number;
  brand_id: number;
  brand_name: string;
  website: string;
  category: keyof typeof BRAND_CATEGORIES;
  title: string;
  kind: keyof typeof OPPORTUNITY_KINDS;
  audience: "athletes" | "clubs" | "both";
  description: string;
  benefits: string;
  requirements: string;
  sports: string;
  markets: string;
  closing_date: string;
};
export type PrivateOpportunity = Opportunity & {
  status: string;
  review_note: string;
  revision: number;
};
export type PartnerApplication = {
  id: number;
  opportunity_id: number;
  title: string;
  brand_name: string;
  applicant_kind: "athlete" | "club";
  display_name: string;
  club_website: string | null;
  message: string;
  status: string;
  brand_response: string;
  review_note: string;
  revision: number;
};
export function preferenceForKind(
  kind: Opportunity["kind"],
): "sponsorship" | "product_testing" | "offers" {
  return kind === "product_testing"
    ? "product_testing"
    : kind === "discount"
      ? "offers"
      : "sponsorship";
}
