/**
 * October 2026 batch G.
 */
import type { Edition, Series } from "./types";

const CHECKED_AT = "2026-10-25";

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

export const runrecsGapFillOctGSeries: Series[] = [
  { slug: "grand-circle-trailfest", name: "Grand Circle Trailfest", sport: "Running", country: "United States", county: "Utah", city: "Kanab", area: "Kanab", surface: "Trail", distances: ["Half"], summary: "Grand Circle Trailfest in Kanab.", description: "Grand Circle Trailfest starts Thursday 1 October 2026.", organiser: "Vacation Races", website: "https://www.vacationraces.com/grand-circle", featured: false, source_url: "https://www.vacationraces.com/grand-circle" },
  { slug: "girdwood-marathon", name: "Girdwood Trails Marathon", sport: "Running", country: "United States", county: "Alaska", city: "Girdwood", area: "Girdwood", surface: "Trail", distances: ["Marathon", "Half", "5K"], summary: "Girdwood Trails Marathon in Girdwood.", description: "Girdwood Trails Marathon is Saturday 3 October 2026.", organiser: "Girdwood Marathon", website: "https://runsignup.com/Race/AK/Girdwood/GirdwoodMarathon", featured: false, source_url: "https://runsignup.com/Race/AK/Girdwood/GirdwoodMarathon" },
  { slug: "atlantic-city-marathon", name: "AmeriHealth Atlantic City Marathon", sport: "Running", country: "United States", county: "New Jersey", city: "Atlantic City", area: "Atlantic City", surface: "Road", distances: ["Marathon", "Half", "10K"], summary: "AmeriHealth Atlantic City Marathon in Atlantic City.", description: "AmeriHealth Atlantic City Marathon is Sunday 18 October 2026.", organiser: "AmeriHealth Atlantic City Marathon", website: "https://runsignup.com/Race/NJ/AtlanticCity/AmeriHealthAtlanticCityMarathon", featured: false, source_url: "https://runsignup.com/Race/NJ/AtlanticCity/AmeriHealthAtlanticCityMarathon" },
  { slug: "rosliston-rumble-autumn", name: "Rosliston Rumble: Weekend Edition — Autumn 2026", sport: "Running", country: "United Kingdom", county: "Derbyshire", city: "Swadlincote", area: "Rosliston Forest", surface: "Trail", distances: ["Half", "Marathon", "Ultra"], summary: "A six-hour trail challenge on 5.275km loops in Rosliston Forest.", description: "Rasselbock Running's current organiser page confirms the Sunday 1 November 2026 event, 09:00 shared challenge start and four-lap 21.1km half-marathon target. This is not a separately started fixed-distance half marathon.", organiser: "Rasselbock Running", website: "https://rasselbock.co.uk/event/rosliston-rumble-weekend-edition-autumn-2026/", featured: false, source_url: "https://rasselbock.co.uk/event/rosliston-rumble-weekend-edition-autumn-2026/" },
];

export const runrecsGapFillOctGEditions: Edition[] = [
  { seriesSlug: "grand-circle-trailfest", date: "2026-10-01", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.vacationraces.com/grand-circle", entryOptions: officialEntry("grand-circle-trailf", "Grand Circle Trailfest", "https://www.vacationraces.com/grand-circle", "Official site: Thursday 1 October 2026."), source: "https://www.vacationraces.com/grand-circle", notes: "Half event." },
  { seriesSlug: "girdwood-marathon", date: "2026-10-03", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://runsignup.com/Race/AK/Girdwood/GirdwoodMarathon", entryOptions: officialEntry("girdwood-marathon", "Girdwood Trails Marathon", "https://runsignup.com/Race/AK/Girdwood/GirdwoodMarathon", "Official listing: Saturday 3 October 2026."), source: "https://runsignup.com/Race/AK/Girdwood/GirdwoodMarathon", notes: "Marathon event." },
  { seriesSlug: "atlantic-city-marathon", date: "2026-10-18", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://runsignup.com/Race/NJ/AtlanticCity/AmeriHealthAtlanticCityMarathon", entryOptions: officialEntry("atlantic-city-marat", "AmeriHealth Atlantic City Marathon", "https://runsignup.com/Race/NJ/AtlanticCity/AmeriHealthAtlanticCityMarathon", "Official listing: Sunday 18 October 2026."), source: "https://runsignup.com/Race/NJ/AtlanticCity/AmeriHealthAtlanticCityMarathon", notes: "Marathon event." },
  { seriesSlug: "rosliston-rumble-autumn", date: "2026-11-01", distance: "Half", distanceKm: 21.1, status: "Open", entryUrl: "https://rasselbock.co.uk/event/rosliston-rumble-weekend-edition-autumn-2026/", startTime: "09:00", entryOptions: officialEntry("rosliston-rumble-au", "Rasselbock Running", "https://rasselbock.co.uk/event/rosliston-rumble-weekend-edition-autumn-2026/", "Official organiser checkout checked 25 October 2026."), source: "https://rasselbock.co.uk/event/rosliston-rumble-weekend-edition-autumn-2026/", notes: "Start checked 25 October 2026: the shared six-hour challenge starts at 09:00 Europe/London. Four 5.275km laps form the organiser's 21.1km half-marathon target; there is no separate half wave." },
];
