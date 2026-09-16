import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";
import {
  brandSchema,
  opportunitySchema,
  preferenceSchema,
  applicationSchema,
  reviewSchema,
} from "./partnerships";

const athrecsOnly = createMiddleware({ type: "function" }).server(({ next }) => {
  if (!IS_ATHRECS_SITE) throw new Error("Brand partnerships are managed on AthRecs.com.");
  return next();
});
const idSchema = z.object({ id: z.number().int().positive() });

export const getPublicPartnerships = createServerFn({ method: "GET" })
  .middleware([athrecsOnly])
  .handler(async () => {
    const { publicPartnerships } = await import("./partnerships.server");
    return publicPartnerships(await getSql());
  });
export const getMyPartnerships = createServerFn({ method: "GET" })
  .middleware([athrecsOnly, authMiddleware])
  .handler(async ({ context }) => {
    const { myPartnerships } = await import("./partnerships.server");
    return myPartnerships(await getSql(), context.userId);
  });
export const saveBrandRegistration = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, authMiddleware])
  .validator((v: unknown) => brandSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { registerBrand } = await import("./partnerships.server");
    return registerBrand(await getSql(), context.userId, data);
  });
export const saveOpportunity = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, authMiddleware])
  .validator((v: unknown) => opportunitySchema.parse(v))
  .handler(async ({ context, data }) => {
    const { submitOpportunity } = await import("./partnerships.server");
    return submitOpportunity(await getSql(), context.userId, data);
  });
export const savePartnershipChoices = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, authMiddleware])
  .validator((v: unknown) => preferenceSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { savePreferences } = await import("./partnerships.server");
    return savePreferences(await getSql(), context.userId, data);
  });
export const submitPartnerApplication = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, authMiddleware])
  .validator((v: unknown) => applicationSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { applyToOpportunity } = await import("./partnerships.server");
    return applyToOpportunity(await getSql(), context.userId, data);
  });
export const getPartnershipReviewQueue = createServerFn({ method: "GET" })
  .middleware([athrecsOnly, staffMiddleware])
  .handler(async () => {
    const { reviewQueue } = await import("./partnerships.server");
    return reviewQueue(await getSql());
  });
export const reviewPartnership = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, staffMiddleware])
  .validator((v: unknown) => reviewSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { reviewPartnerItem } = await import("./partnerships.server");
    return reviewPartnerItem(await getSql(), context.userId, data);
  });
export const closePartnerOpportunity = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, authMiddleware])
  .validator((v: unknown) => idSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { closeOpportunity } = await import("./partnerships.server");
    return closeOpportunity(await getSql(), context.userId, data.id);
  });
export const withdrawPartnerApplication = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, authMiddleware])
  .validator((v: unknown) => idSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { withdrawApplication } = await import("./partnerships.server");
    return withdrawApplication(await getSql(), context.userId, data.id);
  });
export const replyToPartnerApplication = createServerFn({ method: "POST" })
  .middleware([athrecsOnly, authMiddleware])
  .validator((v: unknown) =>
    idSchema.extend({ response: z.string().trim().min(5).max(2000) }).parse(v),
  )
  .handler(async ({ context, data }) => {
    const { respondToApplication } = await import("./partnerships.server");
    return respondToApplication(await getSql(), context.userId, data.id, data.response);
  });
