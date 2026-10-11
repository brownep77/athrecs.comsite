import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { halfMarathonCountryFromPath } from "@/data/road-half-marathons/countries";
import { countryGuideFromPath } from "@/data/road-marathons/countries";
import { CountryMarathonPage } from "@/components/running/RoadMarathonPages";
import { countryMarathonHead } from "@/lib/running/road-marathon-seo";

export const Route = createFileRoute("/running/$guide")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: async ({ params }) => {
    const halfCountry = halfMarathonCountryFromPath(params.guide);
    const country = halfCountry ?? countryGuideFromPath(params.guide);
    if (!country) throw notFound();
    const races = halfCountry
      ? (await import("@/data/road-half-marathons")).roadHalfMarathonsForCountry(country.id)
      : (await import("@/data/road-marathons")).roadMarathonsForCountry(country.id);
    return {
      country,
      races,
      now: new Date().toISOString(),
    };
  },
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) =>
    loaderData ? countryMarathonHead(loaderData.country, loaderData.races, loaderData.now) : {},
  component: Page,
});

function Page() {
  return <CountryMarathonPage {...Route.useLoaderData()} />;
}
