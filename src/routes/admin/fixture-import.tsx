import { createFileRoute } from "@tanstack/react-router";
import { FixtureImportPage } from "@/components/admin/fixture-import";

export const Route = createFileRoute("/admin/fixture-import")({
  validateSearch: (search: Record<string, unknown>): { run?: string } => ({
    run:
      typeof search.run === "string" && /^[0-9a-f-]{36}$/i.test(search.run)
        ? search.run
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Import running fixtures — AthRecs Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: ImportRoute,
});
function ImportRoute() {
  const { run } = Route.useSearch();
  const navigate = Route.useNavigate();
  return <FixtureImportPage run={run} onRun={(id) => navigate({ search: { run: id } })} />;
}
