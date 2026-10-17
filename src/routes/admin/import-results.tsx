import { createFileRoute } from "@tanstack/react-router";
import { AthleteTools } from "@/components/admin/AthleteTools";

// Retain saved private batch URLs and the parent staff authentication boundary.
export const Route = createFileRoute("/admin/import-results")({
  head: () => ({
    meta: [
      { title: "Import Excel results | ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: () => <AthleteTools initialSection="upload" initialUploadMode="excel" />,
});
