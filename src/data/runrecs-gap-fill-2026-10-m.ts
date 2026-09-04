/**
 * October 2026 batch M. Second A-country sweep.
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

export const runrecsGapFillOctMSeries: Series[] = [
  { slug: "harrietville-half", name: "Harrietville Half Marathon", sport: "Running", country: "Australia", county: "Victoria", city: "Bright", area: "Harrietville", surface: "Road", distances: ["Half"], summary: "Harrietville Half Marathon in Bright.", description: "Harrietville Half Marathon is Sunday 11 October 2026.", organiser: "Harrietville Half Marathon", website: "https://harrietvillehalfmarathon.com/", featured: false, source_url: "https://harrietvillehalfmarathon.com/" },
  { slug: "wodonga-running-festival", name: "Wodonga Running Festival", sport: "Running", country: "Australia", county: "Victoria", city: "Wodonga", area: "Willow Park", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Wodonga Running Festival in Wodonga.", description: "Wodonga Running Festival is Sunday 11 October 2026.", organiser: "Race Hub Australia", website: "https://raceroster.com/events/2026/115147/active-foot-clinic-wodonga-running-festival-2026", featured: false, source_url: "https://raceroster.com/events/2026/115147/active-foot-clinic-wodonga-running-festival-2026" },
  { slug: "geoff-watt-memorial", name: "Geoff Watt Memorial Fun Run", sport: "Running", country: "Australia", county: "Victoria", city: "Warragul", area: "Warragul", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Geoff Watt Memorial Fun Run in Warragul.", description: "Geoff Watt Memorial Fun Run is Sunday 18 October 2026.", organiser: "Geoff Watt Memorial Fun Run", website: "https://www.runningcalendar.com.au/event/geoff-watt-memorial-fun-run/", featured: false, source_url: "https://www.runningcalendar.com.au/event/geoff-watt-memorial-fun-run/" },
  { slug: "portland-3-bays", name: "Portland 3 Bays Running Festival", sport: "Running", country: "Australia", county: "Victoria", city: "Portland", area: "Portland Foreshore", surface: "Trail", distances: ["Marathon", "Half"], summary: "Portland 3 Bays Running Festival in Portland.", description: "Portland 3 Bays Running Festival is Saturday 31 October 2026.", organiser: "Portland Runners Club", website: "https://www.runningcalendar.com.au/event/portland-3-bays-running-festival/", featured: false, source_url: "https://www.runningcalendar.com.au/event/portland-3-bays-running-festival/" },
];

export const runrecsGapFillOctMEditions: Edition[] = [
  { seriesSlug: "harrietville-half", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://harrietvillehalfmarathon.com/", entryOptions: officialEntry("harrietville-half", "Harrietville Half Marathon", "https://harrietvillehalfmarathon.com/", "Official site: Sunday 11 October 2026."), source: "https://harrietvillehalfmarathon.com/", notes: "Half event." },
  { seriesSlug: "wodonga-running-festival", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://raceroster.com/events/2026/115147/active-foot-clinic-wodonga-running-festival-2026", entryOptions: officialEntry("wodonga-running-fes", "Wodonga Running Festival", "https://raceroster.com/events/2026/115147/active-foot-clinic-wodonga-running-festival-2026", "Official listing: Sunday 11 October 2026."), source: "https://raceroster.com/events/2026/115147/active-foot-clinic-wodonga-running-festival-2026", notes: "Half event." },
  { seriesSlug: "geoff-watt-memorial", date: "2026-10-18", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runningcalendar.com.au/event/geoff-watt-memorial-fun-run/", entryOptions: officialEntry("geoff-watt-memorial", "Geoff Watt Memorial Fun Run", "https://www.runningcalendar.com.au/event/geoff-watt-memorial-fun-run/", "Calendar listing: Sunday 18 October 2026."), source: "https://www.runningcalendar.com.au/event/geoff-watt-memorial-fun-run/", notes: "Half event." },
  { seriesSlug: "portland-3-bays", date: "2026-10-31", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.runningcalendar.com.au/event/portland-3-bays-running-festival/", entryOptions: officialEntry("portland-3-bays", "Portland 3 Bays Running Festival", "https://www.runningcalendar.com.au/event/portland-3-bays-running-festival/", "Calendar listing: Saturday 31 October 2026."), source: "https://www.runningcalendar.com.au/event/portland-3-bays-running-festival/", notes: "Marathon event." },
];
