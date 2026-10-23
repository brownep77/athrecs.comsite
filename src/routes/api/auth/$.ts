import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { handleAuthWithDiagnostics } from "@/lib/auth/access-diagnostics.server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthWithDiagnostics(request, auth.handler, getSql),
      POST: ({ request }) =>
        handleAuthWithDiagnostics(
          request,
          auth.handler,
          getSql,
          async () => (await auth.api.getSession({ headers: request.headers }))?.user.id ?? null,
        ),
    },
  },
});
