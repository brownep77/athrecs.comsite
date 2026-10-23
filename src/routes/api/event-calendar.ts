import { createFileRoute } from "@tanstack/react-router";
import { calendarDownloadResponse } from "@/lib/athrecs/calendar-download";

export const Route = createFileRoute("/api/event-calendar")({
  server: { handlers: { POST: ({ request }) => calendarDownloadResponse(request) } },
});
