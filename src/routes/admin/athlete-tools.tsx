import { createFileRoute } from "@tanstack/react-router";
import { AthleteTools } from "@/components/admin/AthleteTools";
import { athleteToolSections, type AthleteToolSection } from "@/lib/athlete-link/navigation";

export const Route = createFileRoute("/admin/athlete-tools")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { section: AthleteToolSection; athleteId: number | undefined; batch?: string } => ({
    section: athleteToolSections.includes(search.section as AthleteToolSection)
      ? (search.section as AthleteToolSection)
      : ("link" as const),
    batch:
      typeof search.batch === "string" && /^[0-9a-f-]{36}$/i.test(search.batch)
        ? search.batch
        : undefined,
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
  const { section, athleteId, batch } = Route.useSearch();
  return (
    <AthleteTools
      initialSection={batch ? "upload" : section}
      initialUploadMode={batch ? "excel" : "source"}
      initialAthleteId={athleteId ?? null}
    />
  );
}
