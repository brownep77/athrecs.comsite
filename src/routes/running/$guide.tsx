import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { halfMarathonCountryFromPath } from "@/data/road-half-marathons/countries";
import { countryGuideFromPath } from "@/data/road-marathons/countries";
import { CountryMarathonPage } from "@/components/running/RoadMarathonPages";
import { RunningDisciplineDiscovery } from "@/components/running/RunningDiscovery";
import {
  RUNNING_DISCIPLINES,
  DISCOVERY_CONTINENTS,
  discoveryJsonLd,
} from "@/lib/running/discovery";
import { countrySlug } from "@/lib/athrecs/country-sites";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { countryMarathonHead } from "@/lib/running/road-marathon-seo";

export const Route = createFileRoute("/running/$guide")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: async ({ params }) => {
    const discipline = RUNNING_DISCIPLINES.find((item) => item.slug === params.guide);
    if (discipline) return { kind: "discipline" as const, discipline };
    const halfCountry = halfMarathonCountryFromPath(params.guide);
    const country = halfCountry ?? countryGuideFromPath(params.guide);
    if (!country) throw notFound();
    const races = halfCountry
      ? (await import("@/data/road-half-marathons")).roadHalfMarathonsForCountry(country.id)
      : (await import("@/data/road-marathons")).roadMarathonsForCountry(country.id);
    return {
      kind: "guide" as const,
      country,
      races,
      now: new Date().toISOString(),
    };
  },
  staleTime: 0,
  preloadStaleTime: 0,
  headers: () => ({ "Cache-Control": "no-store" }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    if (loaderData.kind === "guide")
      return countryMarathonHead(loaderData.country, loaderData.races, loaderData.now);
    const { discipline } = loaderData;
    const url = `${SITE_URL}/running/${discipline.slug}`;
    return {
      meta: siteGraphMeta({
        title: `${discipline.label} races by continent and country | AthRecs`,
        description: `${discipline.description} Browse continents, countries, states and counties on AthRecs.`,
        url,
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            discoveryJsonLd(
              url,
              discipline.heading,
              DISCOVERY_CONTINENTS.map((name) => ({
                name,
                path: `/races/places/${countrySlug(name)}/running/${discipline.slug}`,
              })),
            ),
          ),
        },
      ],
    };
  },
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return data.kind === "discipline" ? (
    <RunningDisciplineDiscovery discipline={data.discipline} />
  ) : (
    <CountryMarathonPage {...data} />
  );
}
