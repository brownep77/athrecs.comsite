import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/fin/research-worker")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = {
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        };
        const { authorizedClaimAlertWorker } = await import(
          "@/lib/athrecs/result-claim-alerts.server"
        );
        if (!authorizedClaimAlertWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { finConnectorConfigured, finIsAthrecsEnvironment } = await import(
          "@/lib/athrecs/fin-actions.server"
        );
        if (
          !process.env.DATABASE_URL?.trim() ||
          !finIsAthrecsEnvironment() ||
          !finConnectorConfigured()
        )
          return Response.json({ status: "disabled" }, { headers });
        try {
          const { getSql } = await import("@/lib/db");
          const { callXai } = await import("@/lib/athrecs/grok-runner-search-api");
          const { FIN_RESEARCH_SYSTEM_PROMPT } = await import("@/lib/athrecs/fin-research");
          const { fetchPublicSourcePage, processFinResearchQueue } = await import(
            "@/lib/athrecs/fin-research.server"
          );
          const result = await processFinResearchQueue(await getSql(), {
            fetcher: fetchPublicSourcePage,
            provider: async ({ prompt, maySend }) => {
              const response = await callXai(prompt, maySend, {
                systemPrompt: FIN_RESEARCH_SYSTEM_PROMPT,
                timeoutMs: 20_000,
              });
              if (!response.ok) {
                const error =
                  response.error === "missing-key" ||
                  response.error === "privacy-configuration" ||
                  response.error === "settings-changed"
                    ? response.error
                    : "provider";
                return { ok: false as const, error, model: response.model };
              }
              return { ok: true as const, text: response.text, model: response.model };
            },
          });
          return Response.json({ status: "complete", processed: result.processed }, { headers });
        } catch {
          console.error("[fin] result research worker failed");
          return Response.json({ error: "Research worker unavailable" }, { status: 503, headers });
        }
      },
    },
  },
});
