import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/club-scanner-worker")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authorizedWorker } = await import("@/lib/race-collector/service.server");
        if (!authorizedWorker(request)) return new Response("Unauthorized", { status: 401 });
        if (process.env.VERCEL_ENV !== "production")
          return Response.json({ skipped: "Production worker only" });
        const { runNext } = await import("@/lib/club-scanner/service.server");
        return Response.json(await runNext(), { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
