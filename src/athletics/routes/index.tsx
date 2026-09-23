import { createFileRoute } from "@tanstack/react-router";
import { AthleteDiscoveryHome } from "@/components/home/AthleteDiscoveryHome";
import { getHomeDiscovery, type HomeDiscovery } from "@/lib/athrecs/home-discovery-api";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: siteGraphMeta({
      title: "ATHRECS | Your sporting life, all in one place",
      description:
        "Discover athletes, explore sporting performances and find your next event. Bring your results, personal bests and achievements together on AthRecs.",
      url: SITE_URL,
    }),
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  loader: () => getHomeDiscovery({ data: {} }),
  component: AthleteHomePage,
});

function AthleteHomePage() {
  // Vite replaces the base route; the generated tree retains the base loader type.
  const initial = Route.useLoaderData() as unknown as HomeDiscovery;
  return <AthleteDiscoveryHome initial={initial} />;
}
