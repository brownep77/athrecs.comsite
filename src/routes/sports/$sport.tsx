import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { CompactDiscoveryPage } from "@/components/discovery/CompactDiscoveryPage";
import { Button } from "@/components/ui/button";
import { upcomingBroadcasts } from "@/data/sport-broadcasts";
import { getSportFixtures } from "@/lib/athrecs/sport-fixtures-api";
import { getSportPage, parseSportFixtureSearch } from "@/lib/athrecs/sport-pages";
import { disciplineIntros, sportGuideText } from "@/lib/athrecs/sport-guide-text";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/sports/$sport")({
  validateSearch: parseSportFixtureSearch,
  beforeLoad: ({ params, search }) => {
    const page = getSportPage(params.sport);
    if (IS_RUNRECS_SITE || !page) throw notFound();
    if (params.sport !== page.slug) {
      throw redirect({
        to: "/sports/$sport",
        params: { sport: page.slug },
        search,
        statusCode: 301,
      });
    }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const sport = getSportPage(params.sport);
    if (!sport) throw notFound();
    const fixtures = await getSportFixtures({ data: { slug: sport.slug, ...deps } });
    if (
      !deps.q &&
      !deps.country &&
      !deps.distance &&
      !deps.month &&
      (deps.page ?? 1) > 1 &&
      !fixtures.fixtures.length
    )
      throw notFound();
    return { sport, ...fixtures, broadcasts: upcomingBroadcasts(sport) };
  },
  staleTime: 60_000,
  head: ({ params, match }) => {
    const sport = getSportPage(params.sport);
    if (!sport) return {};
    const page = match.search.page ?? 1;
    const filtered = Boolean(
      match.search.q || match.search.country || match.search.month || match.search.distance,
    );
    const url = `${SITE_URL}/sports/${sport.slug}${!filtered && page > 1 ? `?page=${page}` : ""}`;
    return {
      meta: [
        ...siteGraphMeta({
          title: `${sport.label} events, dates & results${page > 1 ? ` — Page ${page}` : ""} | AthRecs`,
          description: disciplineIntros[sport.slug] ?? sportGuideText(sport.sport).intro,
          url,
        }),
        ...(filtered ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  pendingComponent: () => (
    <p role="status" className="py-12 text-center text-muted">
      Loading fixtures…
    </p>
  ),
  errorComponent: ({ reset }) => (
    <div role="alert" className="space-y-4 py-12 text-center">
      <h1 className="font-display text-2xl">Fixtures are temporarily unavailable</h1>
      <Button onClick={reset}>Try again</Button>
    </div>
  ),
  component: SportPage,
});

function SportPage() {
  return <CompactDiscoveryPage {...Route.useLoaderData()} search={Route.useSearch()} />;
}
