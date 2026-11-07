import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/collection-stats-worker")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authorizedWorker } = await import("@/lib/race-collector/service.server");
        if (!authorizedWorker(request)) return new Response("Unauthorized", { status: 401 });
        if (process.env.VERCEL_ENV !== "production")
          return Response.json({ skipped: "Production worker only" });
        // RunRecs shares this repository and database; AthRecs owns the summary worker.
        if (
          process.env.VITE_SITE_BRAND === "runrecs" ||
          process.env.VERCEL_PROJECT_PRODUCTION_URL?.includes("runrecs")
        )
          return Response.json({ skipped: "AthRecs maintains the shared statistics" });
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        // Existing histories are classified once, in batches; the snapshot is only
        // rebuilt from the stored classification after that backfill completes.
        const { backfillHistorySports } =
          await import("@/lib/collection-stats/history-sports-cache.server");
        const backfill = await backfillHistorySports(sql);
        if (!backfill.complete)
          return Response.json(
            { backfill: "in progress", added: backfill.added },
            { headers: { "Cache-Control": "no-store" } },
          );
        const { readProfileSnapshot } =
          await import("@/lib/collection-stats/profile-snapshot.server");
        const snapshot = await readProfileSnapshot(sql, true);
        return Response.json(
          { updatedAt: snapshot.generated_at },
          {
            headers: { "Cache-Control": "no-store" },
          },
        );
      },
    },
  },
});
