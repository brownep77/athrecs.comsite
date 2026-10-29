import type { RacePlacePageData } from "./race-places";

export const COLOMBIA_RACE_PLACE = "south-america/colombia";

/** Keep the running guide out of other sports, regional pages and the archive. */
export function isColombiaRunningGuide(data: RacePlacePageData) {
  return (
    data.place.key === COLOMBIA_RACE_PLACE &&
    !data.archive &&
    data.total > 0 &&
    (data.facet.sport?.sport === "Running" ||
      (!data.facet.sport &&
        data.overview.sports.length > 0 &&
        data.overview.sports.every((sport) => sport === "Running")))
  );
}

export function colombiaCityLinks(data: RacePlacePageData) {
  return data.cities
    .slice()
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, 6)
    .map(({ value, count }) => {
      const query = new URLSearchParams();
      if (data.filters.month) query.set("month", data.filters.month);
      query.set("city", value);
      return { name: value, count, href: `${data.path}?${query}#upcoming-races` };
    });
}

// Primary reference checked 28 October 2026. This is a clock convention,
// never evidence for the starting time of an individual race.
export const COLOMBIA_TIME_SOURCE = "https://horalegal.inm.gov.co/";
