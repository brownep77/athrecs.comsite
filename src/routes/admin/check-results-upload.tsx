import { createFileRoute } from "@tanstack/react-router";
import { ImportRaceResults } from "@/components/admin/ImportRaceResults";

export const Route = createFileRoute("/admin/check-results-upload")({
  head: () => ({ meta: [{ title: "Import athletes & race results | ATHRECS Staff" }, { name: "robots", content: "noindex, nofollow, noarchive" }] }),
  component: ImportRaceResults,
});
