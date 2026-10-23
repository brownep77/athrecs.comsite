import type { Edition, Series } from "./types";

/** Official 2027 meeting ranges, checked 23 October 2026. */
export const canadianSwimming2027Series: Series[] = [
  {
    slug: "u-sports-swimming-championships",
    name: "U SPORTS Swimming Championships",
    sport: "Swimming",
    country: "Canada",
    county: "Alberta",
    city: "Calgary",
    area: "MNP Community and Sport Centre",
    surface: "Pool",
    distances: ["Multi-day competition"],
    summary: "Canadian swimming competition: 4–6 March 2027.",
    description:
      "The 2027 meeting is listed for 4–6 March 2027 at MNP Community and Sport Centre, Calgary, Alberta. Pool length not specified. This listing covers the full competition; individual race distances, session start times and entry availability await edition-specific confirmation.",
    organiser: "U SPORTS",
    website: "https://www.swimming.ca/events-results-hub/national-international-events/",
    featured: false,
    source_url: "https://www.swimming.ca/events-results-hub/national-international-events/",
  },
  {
    slug: "canadian-swimming-trials",
    name: "Bell Canadian Swimming Trials",
    sport: "Swimming",
    country: "Canada",
    county: "British Columbia",
    city: "Victoria",
    area: "Saanich Commonwealth Place",
    surface: "Pool",
    distances: ["Multi-day competition"],
    summary: "Canadian swimming competition: 5–10 April 2027.",
    description:
      "The 2027 meeting is listed for 5–10 April 2027 at Saanich Commonwealth Place, Victoria, British Columbia. 50m pool. This listing covers the full competition; individual race distances, session start times and entry availability await edition-specific confirmation.",
    organiser: "Swimming Canada",
    website: "https://www.swimming.ca/events-results-hub/national-international-events/",
    featured: false,
    source_url: "https://www.swimming.ca/events-results-hub/national-international-events/",
  },
  {
    slug: "canadian-masters-swimming-championships",
    name: "Speedo Canadian Masters Swimming Championships",
    sport: "Swimming",
    country: "Canada",
    county: "Alberta",
    city: "Edmonton",
    area: "Kinsmen Sports Centre",
    surface: "Pool",
    distances: ["Multi-day competition"],
    summary: "Canadian swimming competition: 21–23 May 2027.",
    description:
      "The 2027 meeting is listed for 21–23 May 2027 at Kinsmen Sports Centre, Edmonton, Alberta. 25m pool. This listing covers the full competition; individual race distances, session start times and entry availability await edition-specific confirmation.",
    organiser: "Swimming Canada",
    website: "https://www.swimming.ca/events-results-hub/national-international-events/",
    featured: false,
    source_url: "https://www.swimming.ca/events-results-hub/national-international-events/",
  },
  {
    slug: "canadian-swimming-open",
    name: "Speedo Canadian Swimming Open",
    sport: "Swimming",
    country: "Canada",
    county: "Alberta",
    city: "Edmonton",
    area: "Kinsmen Sports Centre",
    surface: "Pool",
    distances: ["Multi-day competition"],
    summary: "Canadian swimming competition: 3–5 June 2027.",
    description:
      "The 2027 meeting is listed for 3–5 June 2027 at Kinsmen Sports Centre, Edmonton, Alberta. 50m pool. This listing covers the full competition; individual race distances, session start times and entry availability await edition-specific confirmation.",
    organiser: "Swimming Canada",
    website: "https://www.swimming.ca/events-results-hub/national-international-events/",
    featured: false,
    source_url: "https://www.swimming.ca/events-results-hub/national-international-events/",
  },
  {
    slug: "canadian-open-water-swimming-championships",
    name: "Speedo Canadian Open Water Swimming Championships",
    sport: "Swimming",
    country: "Canada",
    county: "Ontario",
    city: "Gravenhurst",
    area: "Gull Lake",
    surface: "Open water",
    distances: ["Multi-day competition"],
    summary: "Canadian swimming competition: 24–25 July 2027.",
    description:
      "The 2027 meeting is listed for 24–25 July 2027 at Gull Lake, Gravenhurst, Ontario. Individual distances not yet confirmed. This listing covers the full competition; individual race distances, session start times and entry availability await edition-specific confirmation. Held in conjunction with the Ontario Open Water Championships; no separate duplicate Ontario listing is created.",
    organiser: "Swimming Canada",
    website:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
    featured: false,
    source_url:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
  },
  {
    slug: "canadian-swimming-championships",
    name: "Speedo Canadian Swimming Championships",
    sport: "Swimming",
    country: "Canada",
    county: "Ontario",
    city: "Toronto",
    area: "Toronto Pan Am Sports Centre",
    surface: "Pool",
    distances: ["Multi-day competition"],
    summary: "Canadian swimming competition: 27 July–1 August 2027.",
    description:
      "The 2027 meeting is listed for 27 July–1 August 2027 at Toronto Pan Am Sports Centre, Toronto, Ontario. 50m pool. This listing covers the full competition; individual race distances, session start times and entry availability await edition-specific confirmation.",
    organiser: "Swimming Canada",
    website:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
    featured: false,
    source_url:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
  },
];

export const canadianSwimming2027Editions: Edition[] = [
  {
    seriesSlug: "u-sports-swimming-championships",
    date: "2027-03-04",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "4–6 March 2027, inclusive. Pool length not specified. Multi-day competition; this is not a single race distance. Dates and venue checked against the official 2027 federation listing on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "canadian-swimming-trials",
    date: "2027-04-05",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "5–10 April 2027, inclusive. 50m pool. Multi-day competition; this is not a single race distance. Dates and venue checked against the official 2027 federation listing on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "canadian-masters-swimming-championships",
    date: "2027-05-21",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "21–23 May 2027, inclusive. 25m pool. Multi-day competition; this is not a single race distance. Dates and venue checked against the official 2027 federation listing on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "canadian-swimming-open",
    date: "2027-06-03",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source: "https://www.swimming.ca/events-results-hub/national-international-events/",
    publishAllDistances: true,
    notes:
      "3–5 June 2027, inclusive. 50m pool. Multi-day competition; this is not a single race distance. Dates and venue checked against the official 2027 federation listing on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "canadian-open-water-swimming-championships",
    date: "2027-07-24",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
    publishAllDistances: true,
    notes:
      "24–25 July 2027, inclusive. Individual distances not yet confirmed. Multi-day competition; this is not a single race distance. Dates and venue checked against the official 2027 federation listing on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
  {
    seriesSlug: "canadian-swimming-championships",
    date: "2027-07-27",
    distance: "Multi-day competition",
    distanceKm: 0,
    status: "TBC",
    source:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
    publishAllDistances: true,
    notes:
      "27 July–1 August 2027, inclusive. 50m pool. Multi-day competition; this is not a single race distance. Dates and venue checked against the official 2027 federation listing on 23 October 2026. Session start times and entry availability are not yet confirmed. Dates are local to the venue.",
  },
];

export const canadianSwimming2027DateRanges = {
  "u-sports-swimming-championships": {
    startDate: "2027-03-04",
    endDate: "2027-03-06",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
  "canadian-swimming-trials": {
    startDate: "2027-04-05",
    endDate: "2027-04-10",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
  "canadian-masters-swimming-championships": {
    startDate: "2027-05-21",
    endDate: "2027-05-23",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
  "canadian-swimming-open": {
    startDate: "2027-06-03",
    endDate: "2027-06-05",
    sourceUrl: "https://www.swimming.ca/events-results-hub/national-international-events/",
    checkedAt: "2026-10-23",
  },
  "canadian-open-water-swimming-championships": {
    startDate: "2027-07-24",
    endDate: "2027-07-25",
    sourceUrl:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
    checkedAt: "2026-10-23",
  },
  "canadian-swimming-championships": {
    startDate: "2027-07-27",
    endDate: "2027-08-01",
    sourceUrl:
      "https://www.swimming.ca/blog/canadas-best-swimmers-set-their-sights-on-toronto-for2027-speedo-canadian-swimming-championships/",
    checkedAt: "2026-10-23",
  },
} as const;
