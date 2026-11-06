import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/fin/cleanup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = {
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        };
        const { authorizedClaimAlertWorker } =
          await import("@/lib/athrecs/result-claim-alerts.server");
        if (!authorizedClaimAlertWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { finIsAthrecsEnvironment } = await import("@/lib/athrecs/fin-actions.server");
        if (
          process.env.VERCEL_ENV !== "production" ||
          !process.env.DATABASE_URL?.trim() ||
          !finIsAthrecsEnvironment()
        )
          return Response.json({ status: "disabled" }, { headers });
        try {
          const { getSql } = await import("@/lib/db");
          const { cleanupFinOnboarding } = await import("@/lib/athrecs/fin-onboarding.server");
          const { cleanupFinResearch } = await import("@/lib/athrecs/fin-research.server");
          // Cleanup remains available after Fin is switched off.
          const sql = await getSql();
          await cleanupFinOnboarding(sql);
          await cleanupFinResearch(sql);
          return Response.json({ status: "complete" }, { headers });
        } catch {
          console.error("[fin] onboarding cleanup failed");
          return Response.json({ error: "Cleanup unavailable" }, { status: 503, headers });
        }
      },
    },
  },
});
