/**
 * Antigua and Barbuda Jan-Apr 2027 ABAA running dates.
 * Jan 3 reuses the existing 1 mile series. No March or April official dates.
 */
import type { Edition, Series } from "./types";

const CHECKED_AT = "2026-09-04";
const ABAA = "https://www.facebook.com/AntiguaAthletics/posts/1569045255266421";

function officialEntry(notes: string): Edition["entryOptions"] {
  return [
    {
      providerCode: "abaa",
      providerName: "Antigua Barbuda Athletic Association",
      entryUrl: ABAA,
      entryType: "official",
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl: ABAA,
      notes,
    },
  ];
}

export const runrecsGapFillAntiguaQ1Series: Series[] = [
  {
    slug: "abaa-national-road-race-championships",
    name: "ABAA National Road Race Championships",
    sport: "Running",
    country: "Antigua and Barbuda",
    county: "Saint John",
    city: "St. John's",
    area: "St. John's",
    surface: "Road",
    distances: ["10K"],
    summary: "National road race championships.",
    description: "ABAA lists 14 February 2027.",
    organiser: "Antigua Barbuda Athletic Association",
    website: ABAA,
    featured: false,
    source_url: ABAA,
  },
];

export const runrecsGapFillAntiguaQ1Editions: Edition[] = [
  {
    seriesSlug: "abaa-one-mile-run",
    date: "2027-01-03",
    distance: "1M",
    distanceKm: 1.609,
    status: "Open",
    entryUrl: ABAA,
    entryOptions: officialEntry("Official ABAA calendar: 3 January 2027."),
    source: ABAA,
    notes: "Same series as 27 September 2026.",
  },
  {
    seriesSlug: "abaa-national-road-race-championships",
    date: "2027-02-14",
    distance: "10K",
    distanceKm: 10,
    status: "Open",
    entryUrl: ABAA,
    entryOptions: officialEntry("Official ABAA calendar: 14 February 2027."),
    source: ABAA,
    notes: "National championships. Calendar does not list a second distance.",
  },
];
