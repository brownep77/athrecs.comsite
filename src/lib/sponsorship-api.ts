import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { PUBLIC_SITE_BRAND } from "@/lib/site-scope";
import { sponsorshipSchema, sponsorshipReviewSchema } from "./sponsorship";

export const getMySponsorshipEnquiries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { mySponsorshipEnquiries } = await import("./sponsorship.server");
    return mySponsorshipEnquiries(await getSql(), context.userId);
  });
export const submitSponsorshipEnquiry = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((v: unknown) => sponsorshipSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { createSponsorshipEnquiry } = await import("./sponsorship.server");
    return createSponsorshipEnquiry(await getSql(), context.userId, PUBLIC_SITE_BRAND, data);
  });
export const withdrawSponsorship = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((v: unknown) => z.object({ id: z.number().int().positive() }).parse(v))
  .handler(async ({ context, data }) => {
    const { withdrawSponsorshipEnquiry } = await import("./sponsorship.server");
    return withdrawSponsorshipEnquiry(await getSql(), context.userId, data.id);
  });
export const getSponsorshipReviewQueue = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((v: unknown) =>
    z.object({ status: z.enum(["pending", "in_review", "closed", "withdrawn"]) }).parse(v),
  )
  .handler(async ({ data }) => {
    const { sponsorshipReviewQueue } = await import("./sponsorship.server");
    return sponsorshipReviewQueue(await getSql(), data.status);
  });
export const reviewSponsorship = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => sponsorshipReviewSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { reviewSponsorshipEnquiry } = await import("./sponsorship.server");
    return reviewSponsorshipEnquiry(await getSql(), context.userId, data);
  });
