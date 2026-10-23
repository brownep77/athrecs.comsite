import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { recordBrowserDiagnostic } from "@/lib/auth/browser-diagnostics.server";

export const Route = createFileRoute("/api/diagnostics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return await recordBrowserDiagnostic(
            request,
            await getSql(),
            async () => (await auth.api.getSession({ headers: request.headers }))?.user.id ?? null,
          );
        } catch {
          console.warn("[browser-diagnostics] Capture unavailable");
          return new Response(null, {
            status: 503,
            headers: { "cache-control": "private, no-store" },
          });
        }
      },
    },
  },
});
