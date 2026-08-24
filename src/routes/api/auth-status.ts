import { createFileRoute } from "@tanstack/react-router";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";

function configured(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export const Route = createFileRoute("/api/auth-status")({
  server: {
    handlers: {
      GET: async () => {
        const authEnabled = process.env.VITE_AUTH_ENABLED !== "false";
        const resendApiKeyPresent = configured("RESEND_API_KEY");
        const authEmailFromPresent = configured("AUTH_EMAIL_FROM");
        const emailPasswordAvailable =
          authEnabled &&
          emailAndPasswordEnabled &&
          resendApiKeyPresent &&
          authEmailFromPresent;

        return Response.json(
          {
            authEnabled,
            emailPasswordFeature: emailAndPasswordEnabled,
            resendApiKeyPresent,
            authEmailFromPresent,
            emailPasswordAvailable,
            deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
          },
          {
            headers: {
              "cache-control": "no-store, max-age=0",
            },
          },
        );
      },
    },
  },
});
