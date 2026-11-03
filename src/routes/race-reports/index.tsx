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
  head: ({ match }) => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/race-reports` }],
    meta: siteGraphMeta({
      title: "World, Continental, National & Local Race Reports | AthRecs",
      description:
        "Read AthRecs race reports from world championships to local clubs. Browse by sport, continent, country, state, province, county and local area.",
      url: `${SITE_URL}/race-reports`,
      indexable: !Object.values(match.search).some(Boolean),
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
