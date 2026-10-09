import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware";
import { staffMiddleware } from "../auth/staff-middleware";
import { adminHistoryInput, historyExclusionInput } from "./admin-history";
async function ready() {
  const [{ getSql, dbSource }, { IS_RUNRECS_SITE }] = await Promise.all([
    import("../db"),
    import("../site-scope"),
  ]);
  if (IS_RUNRECS_SITE || dbSource !== "neon") throw new Error("Use the live AthRecs workspace.");
  return getSql();
}
const target = z.object({ athleteId: z.number().int().positive() });
export const publishStaffPerformanceHistory = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof adminHistoryInput>) => adminHistoryInput.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./admin-history.server")).publishAdminHistory(await ready(), data, {
      userId: context.userId,
      staff: true,
    }),
  );
export const getOwnedPerformanceHistory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: z.input<typeof target>) => target.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./admin-history.server")).readManagedHistory(await ready(), data.athleteId, {
      userId: context.userId,
      staff: false,
    }),
  );
export const getStaffPerformanceHistory = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof target>) => target.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./admin-history.server")).readManagedHistory(await ready(), data.athleteId, {
      userId: context.userId,
      staff: true,
    }),
  );
export const excludeOwnedPerformance = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: z.input<typeof historyExclusionInput>) => historyExclusionInput.parse(input))
  .handler(async ({ data, context }) =>
    (await import("./admin-history.server")).excludeHistoryPerformance(await ready(), data, {
      userId: context.userId,
      staff: false,
    }),
  );
