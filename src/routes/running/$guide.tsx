import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { halfMarathonCountryFromPath } from "@/data/road-half-marathons/countries";
import { roadHalfMarathonsForCountry } from "@/data/road-half-marathons";
import { countryGuideFromPath } from "@/data/road-marathons/countries";
import { roadMarathonsForCountry } from "@/data/road-marathons";
import { CountryMarathonPage } from "@/components/running/RoadMarathonPages";
import { countryMarathonHead } from "@/lib/running/road-marathon-seo";

export const Route = createFileRoute("/running/$guide")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: ({ params }) => {
    const halfCountry = halfMarathonCountryFromPath(params.guide);
    const country = halfCountry ?? countryGuideFromPath(params.guide);
    if (!country) throw notFound();
    return {
      country,
      races: halfCountry
        ? roadHalfMarathonsForCountry(country.id)
        : roadMarathonsForCountry(country.id),
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
