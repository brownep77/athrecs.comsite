import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/catalogue-automation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const mode = new URL(request.url).searchParams.get("mode");
        if (mode === "historical-results") {
          const { handleAutomatedHistoricalResultsRequest } = await import(
            "@/lib/athrecs/result-source-automation.server"
          );
          return handleAutomatedHistoricalResultsRequest(request);
        }
        const { handleAutomatedCatalogueRequest } = await import(
          "@/lib/athrecs/catalogue-automation.server"
        );
        return handleAutomatedCatalogueRequest(request);
      },
    },
  },
});
