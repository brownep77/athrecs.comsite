import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { checkLinkSchema, saveLinkSchema } from "./core";

export const checkAthleteLink = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => checkLinkSchema.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./service.server")).checkLink(data, context),
  );

export const saveAthleteLink = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => saveLinkSchema.parse(input))
  .handler(async ({ data, context }) => (await import("./service.server")).saveLink(data, context));
