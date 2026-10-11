import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";

export const getClaimAlertSummary = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { claimAlertSummary } = await import("./result-claim-alerts.server");
    const sql = await getSql();
    const [receipts] = await sql<{ profile_pending: number; profile_needs_review: number }>`select
      count(*) filter(where email_sent_at is null and not email_needs_review)::int profile_pending,
      count(*) filter(where email_needs_review)::int profile_needs_review
      from athlete_profile_result_confirmations where email_payload is not null`;
    return { ...(await claimAlertSummary(sql)), ...receipts };
  });

export const retryClaimAlerts = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { deliverClaimConflictAlerts } = await import("./result-claim-alerts.server");
    const sql = await getSql();
    const { deliverProfileResultReceipts } = await import("./profile-result-receipts.server");
    const summaries = await deliverProfileResultReceipts(sql);
    return { ...(await deliverClaimConflictAlerts(sql)), summaries };
  });
