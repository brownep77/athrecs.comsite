import { createFileRoute } from "@tanstack/react-router";
import { AthleteResultFinder } from "@/components/staff/AthleteResultFinder";

export const Route = createFileRoute("/admin/athlete-result-finder")({
  head: () => ({
    meta: [
      { title: "Athlete result finder | ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name.slice(0, 160) : undefined,
    source:
      typeof search.source === "string" && /^[a-z0-9_]{1,120}$/.test(search.source)
        ? search.source
        : undefined,
  }),
  component: FinderPage,
});

function FinderPage() {
  const { name, source } = Route.useSearch();
  return (
    <AthleteResultFinder
      key={`${name ?? ""}:${source ?? ""}`}
      initialName={name}
      initialSource={source}
    />
  );
}
