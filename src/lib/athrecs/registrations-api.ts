import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { registrationFilters } from "./registration-filters";

export const listRegisteredAthletes = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => registrationFilters.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { loadRegistrations } = await import("./registrations.server");
    return loadRegistrations(await getSql(), data);
  });
