import type { Edition, Series } from "./types";

/** Future editions checked against the official calendar on 23 October 2026. */
export const canadianSwimmingNextSeries: Series[] = [
  {
    slug: "ken-demchuk-international-invitational",
    name: "Ken Demchuk International Invitational",
    sport: "Swimming",
    country: "Canada",
    county: "Quebec",
    city: "Laval",
    area: "",
    surface: "Pool",
    distances: ["Multi-day competition"],
    summary: "Ken Demchuk International Invitational in Laval, Canada.",
    description:
      "Officially listed for 26–28 November 2027 and 24–26 November 2028, in Laval, Quebec. The specific venue has not yet been confirmed. 50m pool. Individual race distances, session start times and entry availability await edition-specific confirmation.",
    organiser: "Swimming Canada",
    website: "https://www.swimming.ca/events-results-hub/national-international-events/",
    source_url: "https://www.swimming.ca/events-results-hub/national-international-events/",
    featured: false,
  },
  {
    slug: "canadian-olympic-paralympic-swimming-trials",
    name: "Olympic & Paralympic Swimming Trials, Presented by Bell",
    sport: "Swimming",
    country: "Canada",
    county: "Ontario",
    city: "Toronto",
    area: "Toronto Pan Am Sports Centre",
    surface: "Pool",
    distances: ["Multi-day competition"],
    summary: "Olympic & Paralympic Swimming Trials, Presented by Bell in Toronto, Canada.",
    description:
      "Officially listed for 2–8 June 2028, in Toronto, Ontario. Toronto Pan Am Sports Centre. 50m pool. Individual race distances, session start times and entry availability await edition-specific confirmation.",
    organiser: "Swimming Canada",
    website: "https://www.swimming.ca/events-results-hub/national-international-events/",
    source_url: "https://www.swimming.ca/events-results-hub/national-international-events/",
    featured: false,
  },
];

export const canadianSwimmingNextEditions: Edition[] = [
  {
    seriesSlug: "ken-demchuk-international-invitational",
    date: "2027-11-26",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "26–28 November 2027, inclusive. Laval, Quebec; specific venue not yet confirmed. 50m pool. Multi-day competition; this is not a single race distance. Dates and listed location checked against the official federation calendar on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "ken-demchuk-international-invitational",
    date: "2028-11-24",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "24–26 November 2028, inclusive. Laval, Quebec; specific venue not yet confirmed. 50m pool. Multi-day competition; this is not a single race distance. Dates and listed location checked against the official federation calendar on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "canadian-olympic-paralympic-swimming-trials",
    date: "2028-06-02",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "2–8 June 2028, inclusive. Toronto Pan Am Sports Centre, Toronto, Ontario. 50m pool. Multi-day competition; this is not a single race distance. Dates and listed location checked against the official federation calendar on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "canadian-swimming-open",
    date: "2028-04-06",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "6–8 April 2028, inclusive. Kinsmen Sports Centre, Edmonton, Alberta. 50m pool. Multi-day competition; this is not a single race distance. Dates and listed location checked against the official federation calendar on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
];

export const canadianSwimmingNextDateRanges = {
  "ken-demchuk-international-invitational:2027-11-26": {
    startDate: "2027-11-26",
    endDate: "2027-11-28",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
  "ken-demchuk-international-invitational:2028-11-24": {
    startDate: "2028-11-24",
    endDate: "2028-11-26",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
  "canadian-olympic-paralympic-swimming-trials:2028-06-02": {
    startDate: "2028-06-02",
    endDate: "2028-06-08",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
  "canadian-swimming-open:2028-04-06": {
    startDate: "2028-04-06",
    endDate: "2028-04-08",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
} as const;
