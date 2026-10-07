import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";

export const getClaimAlertSummary = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { claimAlertSummary } = await import("./result-claim-alerts.server");
    return claimAlertSummary(await getSql());
  });

export const retryClaimAlerts = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { deliverClaimConflictAlerts } = await import("./result-claim-alerts.server");
    return deliverClaimConflictAlerts(await getSql());
  });
