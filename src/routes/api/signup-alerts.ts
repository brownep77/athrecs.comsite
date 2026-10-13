import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/signup-alerts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const { authorizedClaimAlertWorker } =
          await import("@/lib/athrecs/result-claim-alerts.server");
        if (!authorizedClaimAlertWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { signupAlertsReady, deliverSignupAlerts } =
          await import("@/lib/auth/signup-alerts.server");
        if (!signupAlertsReady())
          return Response.json({ skipped: "Not configured on this deployment" }, { headers });
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const { deliverSignupWelcomes } = await import("@/lib/auth/signup-welcome.server");
        const alerts = await deliverSignupAlerts(sql);
        const welcomes = await deliverSignupWelcomes(sql);
        return Response.json({ ...alerts, welcomes }, { headers });
      },
    },
  },
});
