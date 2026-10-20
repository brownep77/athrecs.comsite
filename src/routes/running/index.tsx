import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { RunningDiscovery } from "@/components/running/RunningDiscovery";
import {
  discoveryCountry,
  discoveryJsonLd,
  RUNNING_DISCIPLINES,
  runningDisciplinePath,
  runningHubPath,
} from "@/lib/running/discovery";

export const Route = createFileRoute("/running/")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  validateSearch: (search: Record<string, unknown>): { country?: string } => ({
    country:
      typeof search.country === "string" && discoveryCountry(search.country)
        ? search.country
        : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => ({ site: discoveryCountry(deps.country) }),
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const title = site
      ? `Running in ${site.country} | AthRecs`
      : "Running races: road, trail, fell & cross country | AthRecs";
    const url = SITE_URL + runningHubPath(site);
    return {
      meta: siteGraphMeta({
        title,
        description: `Explore road, trail, fell and cross-country running${site ? ` in ${site.country}` : " worldwide"}. Browse by location and distance, or search directly for your next race.`,
        url,
      }).map((tag) =>
        site && "name" in tag && tag.name === "robots"
          ? { name: "robots", content: "noindex, follow" }
          : tag,
      ),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            discoveryJsonLd(
              url,
              title,
              RUNNING_DISCIPLINES.map((item) => ({
                name: item.label,
                path: runningDisciplinePath(item.slug, site),
              })),
            ),
          ),
        },
      ],
    };
  },
  component: RunningPage,
});

function RunningPage() {
  const { site } = Route.useLoaderData();
  return <RunningDiscovery site={site} />;
}
