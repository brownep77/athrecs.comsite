import { createFileRoute } from "@tanstack/react-router";
import { CollectorPage } from "@/components/admin/race-collector";

export const Route = createFileRoute("/admin/race-collector")({
  head: () => ({
    meta: [
      { title: "Worldwide race collector · RunRecs" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: CollectorPage,
});
