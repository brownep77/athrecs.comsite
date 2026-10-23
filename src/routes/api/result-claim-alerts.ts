import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/result-claim-alerts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authorizedClaimAlertWorker, claimAlertReadiness, deliverClaimConflictAlerts } =
          await import("@/lib/athrecs/result-claim-alerts.server");
        const headers = { "Cache-Control": "no-store" };
        if (!authorizedClaimAlertWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const ready = claimAlertReadiness();
        if (!ready.production || !ready.persistent || !ready.emailConfigured)
          return Response.json(
            { error: "Claim email delivery is not configured" },
            { status: 503, headers },
          );
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const { deliverProfileResultReceipts } =
          await import("@/lib/athrecs/profile-result-receipts.server");
        const summaries = await deliverProfileResultReceipts(sql);
        return Response.json(
          { ...(await deliverClaimConflictAlerts(sql)), summaries },
          { headers },
        );
      },
    },
  },
});
