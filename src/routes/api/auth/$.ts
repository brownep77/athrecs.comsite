import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { handleAuthWithDiagnostics } from "@/lib/auth/access-diagnostics.server";
import { handleAuthWithOtpDeliveryStatus } from "@/lib/auth/otp-delivery.server";

const handleAuth = (request: Request) => handleAuthWithOtpDeliveryStatus(request, auth.handler);

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthWithDiagnostics(request, handleAuth, getSql),
      POST: ({ request }) =>
        handleAuthWithDiagnostics(
          request,
          handleAuth,
          getSql,
          async () =>
            (
              await auth.api.getSession({
                headers: request.headers,
                query: { disableCookieCache: true },
              })
            )?.user.id ?? null,
        ),
    },
  },
});
