import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { raceCalendarResponse } from "@/lib/athrecs/calendar-subscription.server";
import { validCalendarToken } from "@/lib/athrecs/calendar-subscription";

export const Route = createFileRoute("/api/race-calendar/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!validCalendarToken(params.token))
          return new Response("Calendar link unavailable.", {
            status: 404,
            headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
          });
        try {
          return await raceCalendarResponse(await getSql(), params.token);
        } catch {
          // A transient failure must not become an empty feed that removes saved events.
          return new Response("Calendar temporarily unavailable. Try again later.", {
            status: 503,
            headers: {
              "Cache-Control": "no-store",
              "X-Robots-Tag": "noindex",
              "Retry-After": "300",
            },
          });
        }
      },
    },
  },
});
