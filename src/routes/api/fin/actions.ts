import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/fin/actions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleFinActionRequest } = await import("@/lib/athrecs/fin-actions.server");
        return handleFinActionRequest(request);
      },
      GET: async ({ request }) => {
        const { handleFinActionRequest } = await import("@/lib/athrecs/fin-actions.server");
        return handleFinActionRequest(request);
      },
      ANY: async ({ request }) => {
        const { handleFinActionRequest } = await import("@/lib/athrecs/fin-actions.server");
        return handleFinActionRequest(request);
      },
    },
  },
});
