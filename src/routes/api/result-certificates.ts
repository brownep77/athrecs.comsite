import { createFileRoute } from "@tanstack/react-router";

async function handle({ request }: { request: Request }) {
  const { handleResultCertificates } = await import("@/lib/athrecs/result-certificates.server");
  return handleResultCertificates(request);
}

export const Route = createFileRoute("/api/result-certificates")({
  server: { handlers: { GET: handle, POST: handle, DELETE: handle } },
});
