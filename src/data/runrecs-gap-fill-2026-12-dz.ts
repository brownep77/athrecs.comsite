/**
 * December 2026 Algeria batch.
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

export const runrecsGapFillDecDzSeries: Series[] = [
  { slug: "trail-chrea", name: "Trail Chrea", sport: "Running", country: "Algeria", county: "Blida", city: "Chrea", area: "Chrea National Park", surface: "Trail", distances: ["40K", "25K", "14K"], summary: "Trail Chrea in Blida.", description: "Trail Chrea is Saturday 12 December 2026.", organiser: "Trail Chrea", website: "https://trailchrea.com/en", featured: false, source_url: "https://trailchrea.com/en" },
];

export const runrecsGapFillDecDzEditions: Edition[] = [
  { seriesSlug: "trail-chrea", date: "2026-12-12", distance: "40K", distanceKm: 40.39, status: "Open", entryUrl: "https://trailchrea.com/en", entryOptions: officialEntry("trail-chrea", "Trail Chrea", "https://trailchrea.com/en", "Official site: Saturday 12 December 2026."), source: "https://trailchrea.com/en", notes: "Ultra Trail 40 km event." },
];
