import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { signupContext } from "@/lib/auth/signup-context.server";

async function handleAuth(request: Request) {
  const createdUsers = new Set<string>();
  const response = await signupContext.run(createdUsers, () => auth.handler(request));
  // Delivery runs only after the auth transaction has completed. The outbox
  // survives interrupted requests, and mail failures never undo registrations.
  if (response.status < 400 && createdUsers.size) {
    const { flushSignupEmailsAfterAuth } = await import("@/lib/athrecs/signup-email.server");
    await flushSignupEmailsAfterAuth([...createdUsers]);
  }
  return response;
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
