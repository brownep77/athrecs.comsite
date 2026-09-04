/**
 * October 2026 batch E.
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

export const runrecsGapFillOctESeries: Series[] = [
  { slug: "matsue-castle-marathon", name: "Matsue Castle Marathon", sport: "Running", country: "Japan", county: "Shimane", city: "Matsue", area: "Matsue Castle", surface: "Road", distances: ["Marathon"], summary: "Matsue Castle Marathon in Matsue.", description: "Matsue Castle Marathon is Sunday 4 October 2026.", organiser: "Matsue Castle Marathon", website: "https://runjapan.jp/", featured: false, source_url: "https://runjapan.jp/" },
  { slug: "hikyaku-marathon", name: "Hikyaku Marathon", sport: "Running", country: "Japan", county: "Osaka", city: "Toyonaka", area: "Toyonaka", surface: "Road", distances: ["Marathon"], summary: "Hikyaku Marathon in Toyonaka.", description: "Hikyaku Marathon is Sunday 4 October 2026.", organiser: "Hikyaku Marathon", website: "https://hikyaku-marathon.com/", featured: false, source_url: "https://hikyaku-marathon.com/" },
  { slug: "chasewater-trail-october", name: "Chasewater Trail Half Marathon October", sport: "Running", country: "United Kingdom", county: "Staffordshire", city: "Burntwood", area: "Chasewater", surface: "Trail", distances: ["Half", "10K", "5K"], summary: "Chasewater Trail Half Marathon October in Burntwood.", description: "Chasewater Trail Half Marathon October is Sunday 11 October 2026.", organiser: "RunThrough", website: "https://www.runthrough.co.uk/event/cannock-chase-running-festival-october-2026", featured: false, source_url: "https://www.runthrough.co.uk/event/cannock-chase-running-festival-october-2026" },
  { slug: "bath-bristol-railway-october", name: "Bath and Bristol Railway Races October", sport: "Running", country: "United Kingdom", county: "Somerset", city: "Bath", area: "Green Park", surface: "Trail", distances: ["Marathon", "Half", "10K"], summary: "Bath and Bristol Railway Races October in Bath.", description: "Bath and Bristol Railway Races October is Sunday 11 October 2026.", organiser: "Relish Running Races", website: "https://www.runningcalendar.co.uk/event/bath-bristol-railway-races-autumn/", featured: false, source_url: "https://www.runningcalendar.co.uk/event/bath-bristol-railway-races-autumn/" },
  { slug: "bucaramanga-half-marathon", name: "Bucaramanga Half Marathon", sport: "Running", country: "Colombia", county: "Santander", city: "Bucaramanga", area: "Bucaramanga", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Bucaramanga Half Marathon in Bucaramanga.", description: "Bucaramanga Half Marathon is Sunday 18 October 2026.", organiser: "Bucaramanga Half Marathon", website: "https://www.ahotu.com/event/media-maraton-de-bucaramanga", featured: false, source_url: "https://www.ahotu.com/event/media-maraton-de-bucaramanga" },
];

export const runrecsGapFillOctEEditions: Edition[] = [
  { seriesSlug: "matsue-castle-marathon", date: "2026-10-04", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://runjapan.jp/", entryOptions: officialEntry("matsue-castle-marat", "Matsue Castle Marathon", "https://runjapan.jp/", "Calendar listing: Sunday 4 October 2026."), source: "https://runjapan.jp/", notes: "Marathon event." },
  { seriesSlug: "hikyaku-marathon", date: "2026-10-04", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://hikyaku-marathon.com/", entryOptions: officialEntry("hikyaku-marathon", "Hikyaku Marathon", "https://hikyaku-marathon.com/", "Official listing: Sunday 4 October 2026."), source: "https://hikyaku-marathon.com/", notes: "Marathon event." },
  { seriesSlug: "chasewater-trail-october", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runthrough.co.uk/event/cannock-chase-running-festival-october-2026", entryOptions: officialEntry("chasewater-trail-oc", "Chasewater Trail Half Marathon October", "https://www.runthrough.co.uk/event/cannock-chase-running-festival-october-2026", "Official listing: Sunday 11 October 2026."), source: "https://www.runthrough.co.uk/event/cannock-chase-running-festival-october-2026", notes: "Half event." },
  { seriesSlug: "bath-bristol-railway-october", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runningcalendar.co.uk/event/bath-bristol-railway-races-autumn/", entryOptions: officialEntry("bath-bristol-railwa", "Bath and Bristol Railway Races October", "https://www.runningcalendar.co.uk/event/bath-bristol-railway-races-autumn/", "Calendar listing: Sunday 11 October 2026."), source: "https://www.runningcalendar.co.uk/event/bath-bristol-railway-races-autumn/", notes: "Half event." },
  { seriesSlug: "bucaramanga-half-marathon", date: "2026-10-18", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.ahotu.com/event/media-maraton-de-bucaramanga", entryOptions: officialEntry("bucaramanga-half-ma", "Bucaramanga Half Marathon", "https://www.ahotu.com/event/media-maraton-de-bucaramanga", "Calendar listing: Sunday 18 October 2026."), source: "https://www.ahotu.com/event/media-maraton-de-bucaramanga", notes: "Half event." },
];
