/**
 * October 2026 batch H.
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

export const runrecsGapFillOctHSeries: Series[] = [
  { slug: "bhm26-2", name: "BHM26.2 Alabama Race Series", sport: "Running", country: "United States", county: "Alabama", city: "Hoover", area: "Hoover", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "BHM26.2 Alabama Race Series in Hoover.", description: "BHM26.2 Alabama Race Series is Sunday 4 October 2026.", organiser: "BHM26.2", website: "https://runsignup.com/Race/AL/Hoover/bhm262", featured: false, source_url: "https://runsignup.com/Race/AL/Hoover/bhm262" },
  { slug: "carsington-water-october", name: "Carsington Water Half Marathon October", sport: "Running", country: "United Kingdom", county: "Derbyshire", city: "Ashbourne", area: "Carsington Water", surface: "Trail", distances: ["Half", "10K"], summary: "Carsington Water Half Marathon October in Ashbourne.", description: "Carsington Water Half Marathon October is Saturday 17 October 2026.", organiser: "RunThrough", website: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-october-2026", featured: false, source_url: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-october-2026" },
];

export const runrecsGapFillOctHEditions: Edition[] = [
  { seriesSlug: "bhm26-2", date: "2026-10-04", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://runsignup.com/Race/AL/Hoover/bhm262", entryOptions: officialEntry("bhm26-2", "BHM26.2 Alabama Race Series", "https://runsignup.com/Race/AL/Hoover/bhm262", "Official listing: Sunday 4 October 2026."), source: "https://runsignup.com/Race/AL/Hoover/bhm262", notes: "Marathon event." },
  { seriesSlug: "carsington-water-october", date: "2026-10-17", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-october-2026", entryOptions: officialEntry("carsington-water-oc", "Carsington Water Half Marathon October", "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-october-2026", "Official listing: Saturday 17 October 2026."), source: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-october-2026", notes: "Half event." },
];
