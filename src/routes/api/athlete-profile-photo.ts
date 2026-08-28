import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/athlete-profile-photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleAthleteProfilePhotoRequest } = await import(
          "@/lib/athrecs/profile-photo.server"
        );
        return handleAthleteProfilePhotoRequest(request);
      },
      POST: async ({ request }) => {
        const { handleAthleteProfilePhotoRequest } = await import(
          "@/lib/athrecs/profile-photo.server"
        );
        return handleAthleteProfilePhotoRequest(request);
      },
      DELETE: async ({ request }) => {
        const { handleAthleteProfilePhotoRequest } = await import(
          "@/lib/athrecs/profile-photo.server"
        );
        return handleAthleteProfilePhotoRequest(request);
      },
    },
  },
});
