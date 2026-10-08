import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/signup-emails")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
        const { authorizedClaimAlertWorker } =
          await import("@/lib/athrecs/result-claim-alerts.server");
        if (!authorizedClaimAlertWorker(request))
          return Response.json({ error: "Unauthorized" }, { status: 401, headers });
        const { signupEmailsEnabled, deliverSignupEmails } =
          await import("@/lib/athrecs/signup-email.server");
        if (!signupEmailsEnabled())
          return Response.json(
            { error: "Signup email delivery is not configured" },
            { status: 503, headers },
          );
        const { getSql } = await import("@/lib/db");
        return Response.json(await deliverSignupEmails(await getSql(), true), { headers });
      },
    },
  },
});
