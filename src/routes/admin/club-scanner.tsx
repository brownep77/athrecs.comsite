import { createFileRoute } from "@tanstack/react-router";
import { ClubScanner } from "@/components/admin/club-athlete-scanner";
export const Route = createFileRoute("/admin/club-scanner")({
  head: () => ({
    meta: [
      { title: "Club athlete scanner · ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: ClubScanner,
});
