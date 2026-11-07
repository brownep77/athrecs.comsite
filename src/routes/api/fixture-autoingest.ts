import { createFileRoute } from "@tanstack/react-router";

// The scheduled collector (GitHub Actions) posts what it read from approved sources.
// Storing only: classification and publication happen in /api/fixture-autoingest-worker.
export const Route = createFileRoute("/api/fixture-autoingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const { authorizedIntake, validateIntake, receiveIntake } =
          await import("@/lib/race-collector/autoingest.server");
        if (!authorizedIntake(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { dbSource, getSql } = await import("@/lib/db");
        if (dbSource !== "neon")
          return Response.json(
            { error: "Persistent storage is not configured" },
            { status: 503, headers },
          );
        let body;
        try {
          body = validateIntake(await request.json());
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Invalid body" },
            { status: 400, headers },
          );
        }
        return Response.json(await receiveIntake(await getSql(), body), { headers });
      },
    },
  },
});
