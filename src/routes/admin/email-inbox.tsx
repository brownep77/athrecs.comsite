import { createFileRoute } from "@tanstack/react-router";
import { AthleteInboxConnection } from "@/components/staff/AthleteInboxConnection";
export const Route = createFileRoute("/admin/email-inbox")({
  head: () => ({
    meta: [
      { title: "Email replies — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AthleteInboxConnection,
});
