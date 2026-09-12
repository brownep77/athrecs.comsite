import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/race-collector-worker")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authorizedWorker, runWorker, readiness } =
          await import("@/lib/race-collector/service.server");
        const headers = { "Cache-Control": "no-store" };
        if (!authorizedWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const ready = readiness();
        if (!ready.persistent || !ready.research || !ready.background)
          return Response.json({ error: "Worker not configured" }, { status: 503, headers });
        return Response.json(await runWorker(), { headers });
      },
    },
  },
});
