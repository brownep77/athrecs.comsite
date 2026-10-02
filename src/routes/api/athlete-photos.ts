import { createFileRoute } from "@tanstack/react-router";

async function handle({ request }: { request: Request }) {
  const { handleAthleteGalleryRequest } = await import("@/lib/athrecs/gallery-photo.server");
  return handleAthleteGalleryRequest(request);
}

export const Route = createFileRoute("/api/athlete-photos")({
  server: { handlers: { GET: handle, POST: handle, DELETE: handle } },
});
