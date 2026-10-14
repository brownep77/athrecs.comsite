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
        const { readProfileSnapshot } =
          await import("@/lib/collection-stats/profile-snapshot.server");
        const snapshot = await readProfileSnapshot(await getSql(), true);
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
