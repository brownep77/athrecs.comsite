import { createFileRoute, notFound } from "@tanstack/react-router";
import { RoadUltraDetail } from "@/components/running/RoadUltraPages";
import { roadUltraHead } from "@/lib/running/road-ultra-seo";
import { ROAD_ULTRAS, ukToday } from "@/lib/running/road-ultras";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/running/ultramarathons/$slug")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: ({ params }) => {
    const race = ROAD_ULTRAS.find((event) => event.slug === params.slug);
    if (!race) throw notFound();
    return { race, today: ukToday() };
  },
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) => (loaderData ? roadUltraHead(loaderData.today, loaderData.race) : {}),
  component: Page,
});

function Page() {
  const { race, today } = Route.useLoaderData();
  return <RoadUltraDetail race={race} today={today} />;
}
