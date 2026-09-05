/**
 * Unique Antigua Jan-Jun 2027 running dates not already on RunRecs.
 */
import type { Edition, Series } from "./types";

const CHECKED_AT = "2026-09-05";
const SITE = "https://www.runinparadise.com/";

function officialEntry(notes: string): Edition["entryOptions"] {
  return [
    {
      providerCode: "run-in-paradise",
      providerName: "Run in Paradise Antigua",
      entryUrl: SITE,
      entryType: "official",
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl: SITE,
      notes,
    },
  ];
}

export const runrecsGapFillAntiguaH1Series: Series[] = [
  {
    slug: "run-in-paradise-antigua",
    name: "Run in Paradise Antigua",
    sport: "Running",
    country: "Antigua and Barbuda",
    county: "Saint John",
    city: "St. John's",
    area: "St. John's",
    surface: "Road",
    distances: ["Half", "10K", "5K"],
    summary: "Coastal road race in Antigua.",
    description: "Official site lists race day 30 May 2027.",
    organiser: "Run in Paradise",
    website: SITE,
    featured: false,
    source_url: SITE,
  },
];

export const runrecsGapFillAntiguaH1Editions: Edition[] = [
  {
    seriesSlug: "run-in-paradise-antigua",
    date: "2027-05-30",
    distance: "Half",
    distanceKm: 21.0975,
    status: "Open",
    entryUrl: SITE,
    entryOptions: officialEntry("Official: 30 May 2027, half, 10 km and 5 km."),
    source: SITE,
    notes: "Half marathon event.",
  },
];
