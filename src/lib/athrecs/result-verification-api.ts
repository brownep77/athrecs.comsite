import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware";
import { staffMiddleware } from "../auth/staff-middleware";
import {
  verificationRequestInput,
  verificationReviewInput,
  type VerificationRequestInput,
  type VerificationReviewInput,
} from "./result-verification";

async function ready() {
  const [{ getSql, dbSource }, { IS_ATHRECS_SITE }] = await Promise.all([
    import("../db"),
    import("../site-scope"),
  ]);
  if (!IS_ATHRECS_SITE || dbSource !== "neon")
    throw new Error("Use the live AthRecs profile. Nothing has been saved.");
  return getSql();
}
export const requestResultVerification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: VerificationRequestInput) => verificationRequestInput.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./result-verification.server")).requestVerification(
      await ready(),
      data,
      context.userId,
    ),
  );
export const getMyResultVerificationRequests = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) =>
    (await import("./result-verification.server")).memberRequests(await ready(), context.userId),
  );
const filter = z
  .object({
    athleteIds: z.array(z.number().int().positive()).max(20).default([]),
    status: z.enum(["all", "pending", "needs_info", "approved", "rejected"]).default("pending"),
    offset: z.number().int().min(0).max(100000).default(0),
  })
  .strict();
export const getStaffResultVerificationInbox = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof filter>) => filter.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./result-verification.server")).staffRequests(await ready(), data, {
      userId: context.userId,
      staff: true,
    }),
  );
export const reviewResultVerification = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: VerificationReviewInput) => verificationReviewInput.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./result-verification.server")).reviewVerification(await ready(), data, {
      userId: context.userId,
      staff: true,
    }),
  );
