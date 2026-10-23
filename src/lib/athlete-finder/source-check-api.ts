import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { sourceCheckSchema } from "./source-check";

/** A private preview: this never imports, claims, verifies or publishes a result. */
export const checkAthleteSource = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((value: unknown) => sourceCheckSchema.parse(value))
  .handler(async ({ data, context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    const { checkSourcePage } = await import("./source-check.server");
    return checkSourcePage(data, { userId: context.userId, staffEmail: context.staffEmail });
  });
