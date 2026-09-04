/**
 * October 2026 batch K.
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

export const runrecsGapFillOctKSeries: Series[] = [
  { slug: "wheat-city-run", name: "Wheat City Run", sport: "Running", country: "Canada", county: "Manitoba", city: "Brandon", area: "Dinsdale Park", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Wheat City Run in Brandon.", description: "Wheat City Run is Saturday 3 October 2026.", organiser: "Wheat City Run", website: "https://raceroster.com/events/2026/109576/wheat-city-run", featured: false, source_url: "https://raceroster.com/events/2026/109576/wheat-city-run" },
  { slug: "magdeburg-marathon", name: "Magdeburg Marathon", sport: "Running", country: "Germany", county: "Saxony-Anhalt", city: "Magdeburg", area: "Magdeburg", surface: "Road", distances: ["Marathon", "10K"], summary: "Magdeburg Marathon in Magdeburg.", description: "Magdeburg Marathon is Sunday 4 October 2026.", organiser: "Magdeburg Marathon", website: "https://app.endorphinsrunning.com/races/magdeburg-magdeburg/2026", featured: false, source_url: "https://app.endorphinsrunning.com/races/magdeburg-magdeburg/2026" },
  { slug: "mitteldeutscher-marathon", name: "Mitteldeutscher Marathon", sport: "Running", country: "Germany", county: "Saxony-Anhalt", city: "Halle", area: "Halle", surface: "Road", distances: ["Marathon", "Half", "10K"], summary: "Mitteldeutscher Marathon in Halle.", description: "Mitteldeutscher Marathon is Sunday 4 October 2026.", organiser: "Mitteldeutscher Marathon", website: "https://worldsmarathons.com/marathon/mitteldeutscher-marathon", featured: false, source_url: "https://worldsmarathons.com/marathon/mitteldeutscher-marathon" },
  { slug: "black-forest-marathon", name: "Black Forest Marathon", sport: "Running", country: "Germany", county: "Baden-Wurttemberg", city: "Braunlingen", area: "Braunlingen", surface: "Trail", distances: ["Marathon", "Half", "10K"], summary: "Black Forest Marathon in Braunlingen.", description: "Black Forest Marathon is Sunday 11 October 2026.", organiser: "Schwarzwald Marathon", website: "https://www.ahotu.com/event/schwarzwald-marathon", featured: false, source_url: "https://www.ahotu.com/event/schwarzwald-marathon" },
  { slug: "juarez-international-marathon", name: "Juarez International Marathon", sport: "Running", country: "Mexico", county: "Chihuahua", city: "Ciudad Juarez", area: "Ciudad Juarez", surface: "Road", distances: ["Marathon", "Half"], summary: "Juarez International Marathon in Ciudad Juarez.", description: "Juarez International Marathon is Sunday 18 October 2026.", organiser: "Juarez International Marathon", website: "https://www.finishers.com/en/event/juarez-international-marathon", featured: false, source_url: "https://www.finishers.com/en/event/juarez-international-marathon" },
];

export const runrecsGapFillOctKEditions: Edition[] = [
  { seriesSlug: "wheat-city-run", date: "2026-10-03", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://raceroster.com/events/2026/109576/wheat-city-run", entryOptions: officialEntry("wheat-city-run", "Wheat City Run", "https://raceroster.com/events/2026/109576/wheat-city-run", "Official listing: Saturday 3 October 2026."), source: "https://raceroster.com/events/2026/109576/wheat-city-run", notes: "Half event." },
  { seriesSlug: "magdeburg-marathon", date: "2026-10-04", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://app.endorphinsrunning.com/races/magdeburg-magdeburg/2026", entryOptions: officialEntry("magdeburg-marathon", "Magdeburg Marathon", "https://app.endorphinsrunning.com/races/magdeburg-magdeburg/2026", "Calendar listing: Sunday 4 October 2026."), source: "https://app.endorphinsrunning.com/races/magdeburg-magdeburg/2026", notes: "Marathon event." },
  { seriesSlug: "mitteldeutscher-marathon", date: "2026-10-04", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://worldsmarathons.com/marathon/mitteldeutscher-marathon", entryOptions: officialEntry("mitteldeutscher-mar", "Mitteldeutscher Marathon", "https://worldsmarathons.com/marathon/mitteldeutscher-marathon", "Calendar listing: Sunday 4 October 2026."), source: "https://worldsmarathons.com/marathon/mitteldeutscher-marathon", notes: "Marathon event." },
  { seriesSlug: "black-forest-marathon", date: "2026-10-11", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/event/schwarzwald-marathon", entryOptions: officialEntry("black-forest-marath", "Black Forest Marathon", "https://www.ahotu.com/event/schwarzwald-marathon", "Calendar listing: Sunday 11 October 2026."), source: "https://www.ahotu.com/event/schwarzwald-marathon", notes: "Marathon event." },
  { seriesSlug: "juarez-international-marathon", date: "2026-10-18", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.finishers.com/en/event/juarez-international-marathon", entryOptions: officialEntry("juarez-internationa", "Juarez International Marathon", "https://www.finishers.com/en/event/juarez-international-marathon", "Calendar listing: Sunday 18 October 2026."), source: "https://www.finishers.com/en/event/juarez-international-marathon", notes: "Marathon event." },
];
