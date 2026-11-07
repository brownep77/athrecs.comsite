import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";

export const getGrowthDashboard = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => {
    const days = Number((input as { days?: unknown } | undefined)?.days ?? 30);
    return { days: Number.isInteger(days) && days >= 7 && days <= 90 ? days : 30 };
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { readGrowth } = await import("./service.server");
    return readGrowth(await getSql(), data.days);
  });
