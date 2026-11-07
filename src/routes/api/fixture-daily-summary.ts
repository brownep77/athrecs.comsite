import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/fixture-daily-summary")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const { authorizedWorker } = await import("@/lib/race-collector/service.server");
        if (!authorizedWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { summaryReady, deliverDailySummary } =
          await import("@/lib/race-collector/daily-summary.server");
        if (!summaryReady())
          return Response.json({ skipped: "Not configured on this deployment" }, { headers });
        const { getSql } = await import("@/lib/db");
        return Response.json(await deliverDailySummary(await getSql()), { headers });
      },
    },
  },
});
