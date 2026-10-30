import { createFileRoute } from "@tanstack/react-router";
import { CompactDiscoveryPage } from "@/components/discovery/CompactDiscoveryPage";
import { DISCOVERY_COUNTRIES } from "@/components/discovery/discovery-navigation";
import { Button } from "@/components/ui/button";
import { getHomeSportUpdates } from "@/lib/athrecs/api";
import { getRunningFixtures } from "@/lib/athrecs/sport-fixtures-api";
import { parseSportFixtureSearch, type SportFixtureSearch } from "@/lib/athrecs/sport-pages";
import { discoveryJsonLd } from "@/lib/running/discovery";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

export const Route = createFileRoute("/")({
  // The specialist RunRecs build aliases this route and still uses its board query.
  // Keep that optional query in the shared router type without applying it here.
  validateSearch: (
    raw: Record<string, unknown>,
  ): SportFixtureSearch & {
    board?: "upcoming" | "results" | "regional";
  } => parseSportFixtureSearch(raw),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [fixtures, feed] = await Promise.all([
      getRunningFixtures({ data: deps }),
      getHomeSportUpdates()
        .then((updates) => ({ updates, updatesUnavailable: false }))
        .catch(() => ({ updates: [], updatesUnavailable: true })),
    ]);
    return { ...fixtures, ...feed };
  },
  staleTime: 60_000,
  head: ({ match }) => ({
    meta: [
      ...siteGraphMeta({
        title: "ATHRECS | Running races, sports, results & athlete profiles",
        description:
          "Find your next running race by country, month and distance. Switch sports, explore country marathon guides, save races and find athlete results.",
        url: SITE_URL,
      }),
      ...(Object.values(match.search).some(Boolean)
        ? [{ name: "robots", content: "noindex, follow" }]
        : []),
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          discoveryJsonLd(SITE_URL, "Running races and sports on AthRecs", [
            { name: "Running guides", path: "/running/guides" },
            ...DISCOVERY_COUNTRIES.map((country) => ({ name: country.name, path: country.path })),
          ]),
        ),
      },
    ],
  }),
  pendingComponent: () => (
    <p role="status" className="p-12 text-center text-muted">
      Loading running fixtures…
    </p>
  ),
  errorComponent: ({ reset }) => (
    <div role="alert" className="space-y-4 p-12 text-center">
      <h1 className="font-display text-2xl">Running fixtures are temporarily unavailable</h1>
      <p className="text-sm text-muted">
        Please try again, or explore the published running guides.
      </p>
      <Button onClick={reset}>Try again</Button>
      <p>
        <a href="/running/guides" className="text-accent underline">
          Browse running guides
        </a>
      </p>
    </div>
  ),
  component: AthleteHomePage,
});

function AthleteHomePage() {
  return <CompactDiscoveryPage {...Route.useLoaderData()} search={Route.useSearch()} />;
}
