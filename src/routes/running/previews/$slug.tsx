import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { featuredRaceBySlug, featuredRaceHead } from "@/lib/running/featured-road-races";
import { FeaturedRacePreview } from "@/components/running/FeaturedRoadRacePages";

export const Route = createFileRoute("/running/previews/$slug")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: ({ params }) => {
    const race = featuredRaceBySlug(params.slug);
    if (!race) throw notFound();
    return { race, now: new Date().toISOString() };
  },
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) => (loaderData ? featuredRaceHead(loaderData.race) : {}),
  component: Page,
});

function Page() {
  return <FeaturedRacePreview {...Route.useLoaderData()} />;
}
