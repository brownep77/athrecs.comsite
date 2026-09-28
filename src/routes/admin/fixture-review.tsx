import { createFileRoute } from "@tanstack/react-router";
import { PendingFixtureReviewPage } from "@/components/admin/fixture-review";

export const Route = createFileRoute("/admin/fixture-review")({
  head: () => ({
    meta: [
      { title: "Fixture review — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: PendingFixtureReviewPage,
});
