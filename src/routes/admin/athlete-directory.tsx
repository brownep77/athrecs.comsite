import { createFileRoute } from "@tanstack/react-router";
import { AthleteDirectory } from "@/components/admin/AthleteDirectory";

export const Route = createFileRoute("/admin/athlete-directory")({
  head: () => ({
    meta: [
      { title: "Athlete directory — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AthleteDirectory,
});
