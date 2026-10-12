import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { FEATURED_ROAD_RACES } from "@/data/featured-road-races";
import { isUpcomingFeaturedRace, featuredPreviewPath } from "@/lib/running/featured-road-races";
import { FeaturedRaceCollection } from "@/components/running/FeaturedRoadRacePages";

export const Route = createFileRoute("/running/featured-races")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: () => {
    const now = new Date().toISOString();
    return { races: FEATURED_ROAD_RACES.filter((race) => isUpcomingFeaturedRace(race, now)), now };
  },
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) => ({
    meta: siteGraphMeta({
      title: "Featured Road Races: Race Previews & Athletes to Watch | ATHRECS",
      description:
        "Explore major road races in the UK, USA, Australia, Canada, New Zealand, Ireland and beyond. Read race previews, course details and confirmed athlete announcements.",
      url: `${SITE_URL}/running/featured-races`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/running/featured-races` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Featured road race previews",
          url: `${SITE_URL}/running/featured-races`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: loaderData?.races.length ?? 0,
            itemListElement: (loaderData?.races ?? []).map((race, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: race.name,
              url: `${SITE_URL}${featuredPreviewPath(race)}`,
            })),
          },
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return <FeaturedRaceCollection {...Route.useLoaderData()} />;
}
