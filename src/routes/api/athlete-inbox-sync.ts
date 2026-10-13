import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/athlete-inbox-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authorizedWorker } = await import("@/lib/race-collector/service.server");
        if (!authorizedWorker(request)) return new Response("Unauthorized", { status: 401 });
        if (process.env.VERCEL_ENV !== "production")
          return Response.json({ skipped: "Production only" });
        try {
          const { getSql } = await import("@/lib/db");
          const { syncAthleteInbox } = await import("@/lib/athrecs/athlete-inbox.server");
          return Response.json(await syncAthleteInbox(await getSql()), {
            headers: { "Cache-Control": "no-store" },
          });
        } catch {
          return Response.json(
            { error: "Inbox sync failed" },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
