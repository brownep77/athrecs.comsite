import { createFileRoute } from "@tanstack/react-router";
import { AthleteTools } from "@/components/admin/AthleteTools";
import { athleteToolSections, type AthleteToolSection } from "@/lib/athlete-link/navigation";

export const Route = createFileRoute("/admin/athlete-tools")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: athleteToolSections.includes(search.section as AthleteToolSection)
      ? (search.section as AthleteToolSection)
      : ("link" as const),
    athleteId:
      Number.isSafeInteger(Number(search.athleteId)) && Number(search.athleteId) > 0
        ? Number(search.athleteId)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Add or update athletes | ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AthleteToolsPage,
});
function AthleteToolsPage() {
  const { section, athleteId } = Route.useSearch();
  return <AthleteTools initialSection={section} initialAthleteId={athleteId ?? null} />;
}
