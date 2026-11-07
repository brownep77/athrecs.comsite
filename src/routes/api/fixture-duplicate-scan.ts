import { createFileRoute } from "@tanstack/react-router";

// Daily Vercel cron: flag likely duplicate upcoming fixtures and email new ones.
export const Route = createFileRoute("/api/fixture-duplicate-scan")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const { authorizedWorker } = await import("@/lib/race-collector/service.server");
        if (!authorizedWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { scanFixtureDuplicates, sendDuplicateSummary } =
          await import("@/lib/race-collector/fixture-duplicate-scan.server");
        const result = await scanFixtureDuplicates();
        let emailed = false;
        try {
          emailed = Boolean(await sendDuplicateSummary(result.fresh, result.open));
        } catch (error) {
          console.error("[duplicate-scan] summary email failed", error);
        }
        return Response.json(
          {
            scanned: result.scanned,
            flagged: result.flagged,
            new: result.fresh.length,
            open: result.open,
            emailed,
          },
          { headers },
        );
      },
    },
  },
});
