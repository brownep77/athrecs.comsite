import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assistant-chat-alerts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = {
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
        };
        const { authorizedAssistantAlertWorker, assistantAlertConfig, deliverAssistantAlerts } =
          await import("@/lib/athrecs/assistant-alerts.server");
        if (!authorizedAssistantAlertWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const config = assistantAlertConfig();
        if (!config.enabled)
          return Response.json(
            { skipped: "Chat alerts are paused or not configured." },
            { headers },
          );
        const { getSql } = await import("@/lib/db");
        return Response.json(await deliverAssistantAlerts(await getSql(), config), { headers });
      },
    },
  },
});
