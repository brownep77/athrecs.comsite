/**
 * October 2026 batch N. Third A-country sweep.
 */
import type { Edition, Series } from "./types";

const CHECKED_AT = "2026-09-04";

function officialEntry(
  code: string,
  name: string,
  url: string,
  notes: string,
): Edition["entryOptions"] {
  return [
    {
      providerCode: code,
      providerName: name,
      entryUrl: url,
      entryType: "official",
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl: url,
      notes,
    },
  ];
}

export const runrecsGapFillOctNSeries: Series[] = [
  { slug: "runningworks-festival", name: "Runningworks Festival", sport: "Running", country: "Australia", county: "Western Australia", city: "Perth", area: "Champion Lakes", surface: "Road", distances: ["Half"], summary: "Runningworks Festival at Champion Lakes.", description: "Runningworks Festival is Saturday 31 October 2026.", organiser: "Runningworks Event Series", website: "https://raceroster.com/events/2026/118445/perth-duathlon-and-runningworks-festival", featured: false, source_url: "https://raceroster.com/events/2026/118445/perth-duathlon-and-runningworks-festival" },
];

export const runrecsGapFillOctNEditions: Edition[] = [
  { seriesSlug: "runningworks-festival", date: "2026-10-31", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://raceroster.com/events/2026/118445/perth-duathlon-and-runningworks-festival", entryOptions: officialEntry("runningworks-festiv", "Runningworks Festival", "https://raceroster.com/events/2026/118445/perth-duathlon-and-runningworks-festival", "Official listing: Saturday 31 October 2026."), source: "https://raceroster.com/events/2026/118445/perth-duathlon-and-runningworks-festival", notes: "Half event." },
];
