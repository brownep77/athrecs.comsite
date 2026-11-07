import { createFileRoute } from "@tanstack/react-router";

// Daily automated fixture collection. Called only by the scheduled GitHub
// Actions job with the SOURCE_IMPORT_TOKEN secret.
//   POST {action:"import", label, csv, dateFrom, dateTo} -> save one chunk to the review queue
//   POST {action:"publish", runId}                       -> publish ready rows within a time budget
//   POST {action:"outreach", targets:[...]}              -> partnership email to sites that refuse collection
export const Route = createFileRoute("/api/source-import-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const { authorizedSourceImport, importCollectedChunk, publishReadyFromRun } =
          await import("@/lib/race-collector/automated-source-import.server");
        if (!authorizedSourceImport(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Send JSON" }, { status: 400, headers });
        }
        try {
          if (body.action === "import") {
            const result = await importCollectedChunk({
              label: String(body.label ?? "Automated source import"),
              csv: String(body.csv ?? ""),
              dateFrom: String(body.dateFrom ?? ""),
              dateTo: String(body.dateTo ?? ""),
            });
            return Response.json(result, { headers });
          }
          if (body.action === "outreach" && Array.isArray(body.targets)) {
            const { sendSourceOutreach } =
              await import("@/lib/race-collector/source-outreach.server");
            const targets = (body.targets as Record<string, unknown>[]).map((t) => ({
              sourceId: String(t.sourceId ?? ""),
              siteName: String(t.siteName ?? ""),
              siteUrl: String(t.siteUrl ?? ""),
              contactEmail: String(t.contactEmail ?? ""),
              reason: String(t.reason ?? ""),
            }));
            return Response.json(await sendSourceOutreach(targets), { headers });
          }
          if (body.action === "publish" && typeof body.runId === "string") {
            return Response.json(await publishReadyFromRun(body.runId), { headers });
          }
          return Response.json({ error: "Unknown action" }, { status: 400, headers });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return Response.json({ error: message.slice(0, 500) }, { status: 422, headers });
        }
      },
    },
  },
});
