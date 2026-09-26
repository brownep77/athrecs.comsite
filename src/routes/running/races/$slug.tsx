import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { roadMarathonBySlug } from "@/data/road-marathons";
import { RoadMarathonPage } from "@/components/running/RoadMarathonPages";
import { roadRaceHead } from "@/lib/running/road-marathon-seo";

export const Route = createFileRoute("/running/races/$slug")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: ({ params }) => {
    const race = roadMarathonBySlug(params.slug);
    if (!race) throw notFound();
    return { race, now: new Date().toISOString() };
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
