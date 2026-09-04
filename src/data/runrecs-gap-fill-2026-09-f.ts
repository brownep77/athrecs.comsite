/**
 * September 2026 batch F. Existing catalogue names stripped out.
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

export const runrecsGapFillFSeries: Series[] = [
  { slug: "lewes-3-peaks", name: "Lewes 3 Peaks", sport: "Running", country: "United Kingdom", county: "East Sussex", city: "Lewes", area: "Lewes", surface: "Trail", distances: ["18M"], summary: "Lewes 3 Peaks in Lewes.", description: "Lewes 3 Peaks is Saturday 12 September 2026.", organiser: "Lewes 3 Peaks", website: "https://findarace.com/events/lewes-3-peaks", featured: false, source_url: "https://findarace.com/events/lewes-3-peaks" },
  { slug: "wold-top-hunmanby", name: "Wold Top 5K and 10K", sport: "Running", country: "United Kingdom", county: "North Yorkshire", city: "Hunmanby", area: "Hunmanby Grange", surface: "Trail", distances: ["10K", "5K"], summary: "Wold Top 5K and 10K in Hunmanby.", description: "Wold Top 5K and 10K is Sunday 13 September 2026.", organiser: "Wold Top", website: "https://www.facebook.com/wilddeerevents/posts/1786471399350124/", featured: false, source_url: "https://www.facebook.com/wilddeerevents/posts/1786471399350124/" },
  { slug: "rasselbock-run-autumn", name: "The Rasselbock Run Autumn", sport: "Running", country: "United Kingdom", county: "Nottinghamshire", city: "Mansfield", area: "Sherwood Pines", surface: "Trail", distances: ["Marathon", "Half", "10K"], summary: "The Rasselbock Run Autumn in Mansfield.", description: "The Rasselbock Run Autumn is Saturday 19 September 2026.", organiser: "The Rasselbock Run", website: "https://findarace.com/events/the-rasselbock-run-sherwood-pines", featured: false, source_url: "https://findarace.com/events/the-rasselbock-run-sherwood-pines" },
  { slug: "terry-fox-edinburgh", name: "Terry Fox Run Edinburgh", sport: "Running", country: "United Kingdom", county: "Edinburgh", city: "Edinburgh", area: "The Meadows", surface: "Road", distances: ["10K", "5K"], summary: "Terry Fox Run Edinburgh in Edinburgh.", description: "Terry Fox Run Edinburgh is Sunday 27 September 2026.", organiser: "Terry Fox Run UK", website: "https://terryfoxrunuk.org/events/edinburgh2026", featured: false, source_url: "https://terryfoxrunuk.org/events/edinburgh2026" },
];

export const runrecsGapFillFEditions: Edition[] = [
  { seriesSlug: "lewes-3-peaks", date: "2026-09-12", distance: "18M", distanceKm: 28.968, status: "Open", entryUrl: "https://findarace.com/events/lewes-3-peaks", entryOptions: officialEntry("lewes-3-peaks", "Lewes 3 Peaks", "https://findarace.com/events/lewes-3-peaks", "Calendar listing: Saturday 12 September 2026."), source: "https://findarace.com/events/lewes-3-peaks", notes: "18M event." },
  { seriesSlug: "wold-top-hunmanby", date: "2026-09-13", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.facebook.com/wilddeerevents/posts/1786471399350124/", entryOptions: officialEntry("wold-top-hunmanby", "Wold Top 5K and 10K", "https://www.facebook.com/wilddeerevents/posts/1786471399350124/", "Calendar listing: Sunday 13 September 2026."), source: "https://www.facebook.com/wilddeerevents/posts/1786471399350124/", notes: "10K event." },
  { seriesSlug: "rasselbock-run-autumn", date: "2026-09-19", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/events/the-rasselbock-run-sherwood-pines", entryOptions: officialEntry("rasselbock-run-autu", "The Rasselbock Run Autumn", "https://findarace.com/events/the-rasselbock-run-sherwood-pines", "Calendar listing: Saturday 19 September 2026."), source: "https://findarace.com/events/the-rasselbock-run-sherwood-pines", notes: "Half event." },
  { seriesSlug: "terry-fox-edinburgh", date: "2026-09-27", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://terryfoxrunuk.org/events/edinburgh2026", entryOptions: officialEntry("terry-fox-edinburgh", "Terry Fox Run Edinburgh", "https://terryfoxrunuk.org/events/edinburgh2026", "Calendar listing: Sunday 27 September 2026."), source: "https://terryfoxrunuk.org/events/edinburgh2026", notes: "10K event." },
];
