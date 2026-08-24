import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/catalogue-automation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleAutomatedCatalogueRequest } = await import(
          "@/lib/athrecs/catalogue-automation.server"
        );
        return handleAutomatedCatalogueRequest(request);
      },
    },
  },
});
