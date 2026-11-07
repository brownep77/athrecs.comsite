import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/fixture-autoingest-worker")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const { authorizedWorker } = await import("@/lib/race-collector/service.server");
        if (!authorizedWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { dbSource } = await import("@/lib/db");
        if (dbSource !== "neon" || process.env.VERCEL_ENV !== "production")
          return Response.json({ skipped: "Not configured on this deployment" }, { headers });
        if (process.env.FIXTURE_AUTOPUBLISH === "off")
          return Response.json(
            { skipped: "Automatic fixture publishing is switched off" },
            { headers },
          );
        const { runAutoingestWorker } = await import("@/lib/race-collector/autoingest.server");
        return Response.json(await runAutoingestWorker(), { headers });
      },
    },
  },
});
