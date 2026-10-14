import { createFileRoute, notFound } from "@tanstack/react-router";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { RoadMarathonPage } from "@/components/running/RoadMarathonPages";
import { upcomingRoadEditions } from "@/lib/running/road-marathon-calendar";
import { roadRaceHead } from "@/lib/running/road-marathon-seo";

export const Route = createFileRoute("/running/races/$slug")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: async ({ params }) => {
    const [
      { roadHalfMarathonBySlug, roadHalfMarathonsForCountry },
      { roadMarathonBySlug, roadMarathonsForCountry },
    ] = await Promise.all([import("@/data/road-half-marathons"), import("@/data/road-marathons")]);
    const race = roadHalfMarathonBySlug(params.slug) ?? roadMarathonBySlug(params.slug);
    if (!race) throw notFound();
    const candidates =
      race.distanceKm === 21.0975
        ? roadHalfMarathonsForCountry(race.country)
        : roadMarathonsForCountry(race.country);
    const now = new Date().toISOString();
    const related = candidates
      .filter((item) => item.slug !== race.slug)
      .sort(
        (a, b) =>
          Number(b.region === race.region) - Number(a.region === race.region) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, 4)
      .map((item) => ({
        slug: item.slug,
        name: item.name,
        city: item.city,
        region: item.region,
        timeZone: item.timeZone,
        profile: item.course.profile,
        nextDate: upcomingRoadEditions(item, now)[0]?.date,
        field: item.fieldSize
          ? `${item.fieldSize.display} (${item.fieldSize.basis}, ${item.fieldSize.year})`
          : undefined,
      }));
    return { race, related, now };
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
