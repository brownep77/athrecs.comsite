import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware";
import { staffMiddleware } from "../auth/staff-middleware";
import { IS_ATHRECS_SITE } from "../site-scope";
import { clubSaveSchema, clubReviewSchema } from "./registration";

const clubArea = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader("Cache-Control", "private, no-store");
  setResponseHeader("Vary", "Cookie, Authorization");
  setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (!IS_ATHRECS_SITE) throw new Error("Club registration is managed on AthRecs.com.");
  if (process.env.VERCEL_ENV === "preview" && process.env.DATABASE_URL?.trim())
    throw new Error("Private club registration is disabled on connected preview deployments.");
  const { dbSource } = await import("../db");
  if (process.env.VERCEL_ENV === "production" && dbSource !== "neon")
    throw new Error("Club registration is temporarily unavailable. Please try again later.");
  return next();
});
export const getMyClubRegistrations = createServerFn({ method: "GET" })
  .middleware([clubArea, authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("../db");
    const { myClubApplications } = await import("./registration.server");
    return myClubApplications(await getSql(), context.userId);
  });
export const saveClubRegistration = createServerFn({ method: "POST" })
  .middleware([clubArea, authMiddleware])
  .validator((v: unknown) => clubSaveSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("../db");
    const { saveClubApplication } = await import("./registration.server");
    return saveClubApplication(await getSql(), context.userId, data);
  });
export const withdrawClubRegistration = createServerFn({ method: "POST" })
  .middleware([clubArea, authMiddleware])
  .validator((v: unknown) =>
    z.object({ id: z.uuid(), revision: z.number().int().positive() }).parse(v),
  )
  .handler(async ({ context, data }) => {
    const { getSql } = await import("../db");
    const { withdrawClubApplication } = await import("./registration.server");
    return withdrawClubApplication(await getSql(), context.userId, data.id, data.revision);
  });
export const getClubRegistrationReviewQueue = createServerFn({ method: "GET" })
  .middleware([clubArea, staffMiddleware])
  .validator((v: unknown) =>
    z
      .object({
        status: z.enum([
          "pending",
          "needs_changes",
          "approved",
          "rejected",
          "revoked",
          "withdrawn",
        ]),
        page: z.number().int().min(1).max(10000).default(1),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { clubReviewQueue } = await import("./registration.server");
    return clubReviewQueue(await getSql(), data.status, data.page);
  });
export const reviewClubRegistration = createServerFn({ method: "POST" })
  .middleware([clubArea, staffMiddleware])
  .validator((v: unknown) => clubReviewSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("../db");
    const { reviewClubApplication } = await import("./registration.server");
    return reviewClubApplication(await getSql(), context.userId, data);
  });
