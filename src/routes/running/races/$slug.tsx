import { getRoadGuideRace } from "@/lib/running/public-road-guides";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { RoadMarathonPage } from "@/components/running/RoadMarathonPages";
import { roadRaceHead } from "@/lib/running/road-marathon-seo";

export const Route = createFileRoute("/running/races/$slug")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: async ({ params }) => {
    const page = await getRoadGuideRace({ data: params.slug });
    if (!page) throw notFound();
    return page;
  },
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) => (loaderData ? roadRaceHead(loaderData.race, loaderData.now) : {}),
  component: Page,
});

function Page() {
  return <RoadMarathonPage {...Route.useLoaderData()} />;
}
