import { z } from "zod";
import { httpsUrl } from "./athrecs/partnerships.ts";

export const SPONSORSHIP_POLICY = "sponsorship-enquiries-2026-09-16";
export const ENQUIRY_KINDS = {
  brand: "Brand seeking sponsorship opportunities",
  race_organiser: "Race organiser seeking sponsors",
  creator: "Athlete or influencer seeking partnerships",
} as const;
export const SUPPORT_TYPES = {
  cash: "Paid sponsorship",
  products: "Products or sampling",
  services: "Services or equipment support",
  mixed: "A mix / open to ideas",
} as const;
export const ENQUIRY_STATUSES = {
  pending: "Awaiting review",
  in_review: "In review",
  closed: "Closed",
  withdrawn: "Withdrawn",
} as const;
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const sponsorshipSchema = z
  .object({
    requestId: z.uuid(),
    kind: z.enum(["brand", "race_organiser", "creator"]),
    contactName: text(2, 120),
    name: text(2, 160),
    website: httpsUrl,
    location: text(2, 200),
    eventDate: z.iso.date().optional(),
    support: z.enum(["cash", "products", "services", "mixed"]),
    budget: text(0, 160).default(""),
    reach: text(0, 600).default(""),
    message: text(30, 3000),
    declaration: z.literal(true),
    adultConfirmed: z.literal(true),
  })
  .refine((v) => v.kind !== "race_organiser" || !!v.eventDate, {
    message: "Add the date of the race you represent",
    path: ["eventDate"],
  });
export const sponsorshipReviewSchema = z.object({
  id: z.number().int().positive(),
  revision: z.number().int().positive(),
  status: z.enum(["in_review", "closed"]),
  response: text(10, 2000),
});
export type SponsorshipInput = z.infer<typeof sponsorshipSchema>;
export type SponsorshipReview = z.infer<typeof sponsorshipReviewSchema>;
export type SponsorshipEnquiry = {
  id: number;
  source: "athrecs" | "runrecs";
  kind: keyof typeof ENQUIRY_KINDS;
  contact_name: string;
  name: string;
  website: string;
  location: string;
  event_date: string | null;
  support: keyof typeof SUPPORT_TYPES;
  budget: string;
  reach: string;
  message: string;
  status: keyof typeof ENQUIRY_STATUSES;
  response: string;
  revision: number;
  created_at: string;
};
