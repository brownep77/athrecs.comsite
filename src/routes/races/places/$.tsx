import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { getRacePlacePage } from "@/lib/athrecs/race-places-api";
import { racePlaceHead } from "@/lib/athrecs/race-places-seo";
import { RacePlacesPage } from "@/components/races/RacePlacesPage";
import { racePlaceSearch } from "@/lib/athrecs/race-places-search";

export const Route = createFileRoute("/races/places/$")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  validateSearch: racePlaceSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const data = await getRacePlacePage({
      data: {
        key: params._splat,
        page: deps.page,
        archive: deps.view === "archive",
        month: deps.month,
        city: deps.city,
      },
    });
    if (!data) throw notFound();
    return data;
  },
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) => (loaderData ? racePlaceHead(loaderData) : {}),
  component: Page,
});

function Page() {
  return <RacePlacesPage data={Route.useLoaderData()} />;
}
