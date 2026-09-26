import { createFileRoute, notFound } from "@tanstack/react-router";
import { RoadUltraGuide } from "@/components/running/RoadUltraPages";
import { roadUltraHead } from "@/lib/running/road-ultra-seo";
import { ukToday } from "@/lib/running/road-ultras";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/running/uk-road-ultramarathons")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: () => ({ today: ukToday() }),
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) => roadUltraHead(loaderData?.today ?? ukToday()),
  component: Page,
});

function Page() {
  return <RoadUltraGuide today={Route.useLoaderData().today} />;
}
