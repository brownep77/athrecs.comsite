import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { getSql } from "../db";
import { identityReviewSchema, type IdentityReviewInput } from "./identity-review";
import { reviewAthleteIdentities } from "./identity-review.server";

export const findPossibleAthleteProfiles = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: IdentityReviewInput) => identityReviewSchema.parse(input))
  .handler(async ({ data }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    return reviewAthleteIdentities(await getSql(), data);
  });
