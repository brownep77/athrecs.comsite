import { createFileRoute, notFound } from "@tanstack/react-router";
import { EditorialBrowse } from "@/components/editorial/EditorialBrowse";
import { parseEditorialSearch } from "@/lib/athrecs/editorial";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/race-reports/")({
  validateSearch: parseEditorialSearch,
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/race-reports` }],
    meta: siteGraphMeta({
      title: "Race Reports by country, area and county | ATHRECS.com",
      description:
        "Read race reports on AthRecs. Browse by sport, country, area and county, from local races to international events.",
      url: `${SITE_URL}/race-reports`,
    }),
  }),
  component: RaceReportsPage,
});

function RaceReportsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <EditorialBrowse
      kind="race-reports"
      search={search}
      onChange={(next) => {
        void navigate({ search: next });
      }}
    />
  );
}
