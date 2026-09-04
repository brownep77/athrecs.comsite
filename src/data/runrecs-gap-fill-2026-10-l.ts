/**
 * October 2026 batch L. Countries beginning with A only.
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

export const runrecsGapFillOctLSeries: Series[] = [
  { slug: "coastal-pathway-ultra", name: "Coastal Pathway Ultra", sport: "Running", country: "Australia", county: "Tasmania", city: "Latrobe", area: "North West Coast", surface: "Trail", distances: ["Marathon", "Half", "10K"], summary: "Coastal Pathway Ultra in Latrobe.", description: "Coastal Pathway Ultra is Sunday 4 October 2026.", organiser: "Coastal Pathway Ultra", website: "https://www.runningcalendar.com.au/event/coastal-pathway-ultra/", featured: false, source_url: "https://www.runningcalendar.com.au/event/coastal-pathway-ultra/" },
  { slug: "hume-hovell-ultra", name: "Hume and Hovell Ultra", sport: "Running", country: "Australia", county: "New South Wales", city: "Tumbarumba", area: "Hume and Hovell Track", surface: "Trail", distances: ["Half", "10K"], summary: "Hume and Hovell Ultra in Tumbarumba.", description: "Hume and Hovell Ultra is Saturday 10 October 2026.", organiser: "Hume and Hovell Ultra", website: "https://raceroster.com/events/2026/115362/hume-and-hovell-ultra-2026", featured: false, source_url: "https://raceroster.com/events/2026/115362/hume-and-hovell-ultra-2026" },
  { slug: "goulburn-running-festival", name: "Goulburn Running Festival", sport: "Running", country: "Australia", county: "New South Wales", city: "Goulburn", area: "Goulburn", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Goulburn Running Festival in Goulburn.", description: "Goulburn Running Festival is Sunday 18 October 2026.", organiser: "Goulburn Running Festival", website: "https://www.runningcalendar.com.au/event/goulburn-running-festival-2/", featured: false, source_url: "https://www.runningcalendar.com.au/event/goulburn-running-festival-2/" },
  { slug: "mclaren-vale-running-festival", name: "McLaren Vale Running Festival", sport: "Running", country: "Australia", county: "South Australia", city: "McLaren Vale", area: "Hardys Tintara Winery", surface: "Road", distances: ["Half", "10K", "5K"], summary: "McLaren Vale Running Festival in McLaren Vale.", description: "McLaren Vale Running Festival is Sunday 18 October 2026.", organiser: "South Australian Road Runners and Walkers Club", website: "https://www.runningcalendar.com.au/event/mclaren-vale-half-marathon/", featured: false, source_url: "https://www.runningcalendar.com.au/event/mclaren-vale-half-marathon/" },
  { slug: "bbbrun", name: "BBBRun Bennelong Bridge Run", sport: "Running", country: "Australia", county: "New South Wales", city: "Sydney", area: "Wentworth Point", surface: "Road", distances: ["Half", "10K"], summary: "BBBRun Bennelong Bridge Run in Sydney.", description: "BBBRun is Sunday 25 October 2026.", organiser: "BBBRun", website: "https://www.runningcalendar.com.au/event/bennelong-bridge-run/", featured: false, source_url: "https://www.runningcalendar.com.au/event/bennelong-bridge-run/" },
  { slug: "run-huskisson", name: "Run Huskisson", sport: "Running", country: "Australia", county: "New South Wales", city: "Huskisson", area: "Jervis Bay", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Run Huskisson in Jervis Bay.", description: "Run Huskisson is Saturday 31 October 2026.", organiser: "Husky Running Festival", website: "https://www.runningcalendar.com.au/event/run-huskisson-husky-running-festival/", featured: false, source_url: "https://www.runningcalendar.com.au/event/run-huskisson-husky-running-festival/" },
];

export const runrecsGapFillOctLEditions: Edition[] = [
  { seriesSlug: "coastal-pathway-ultra", date: "2026-10-04", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.runningcalendar.com.au/event/coastal-pathway-ultra/", entryOptions: officialEntry("coastal-pathway-ult", "Coastal Pathway Ultra", "https://www.runningcalendar.com.au/event/coastal-pathway-ultra/", "Calendar listing: Sunday 4 October 2026."), source: "https://www.runningcalendar.com.au/event/coastal-pathway-ultra/", notes: "Marathon event." },
  { seriesSlug: "hume-hovell-ultra", date: "2026-10-10", distance: "Half", distanceKm: 22, status: "Open", entryUrl: "https://raceroster.com/events/2026/115362/hume-and-hovell-ultra-2026", entryOptions: officialEntry("hume-hovell-ultra", "Hume and Hovell Ultra", "https://raceroster.com/events/2026/115362/hume-and-hovell-ultra-2026", "Official listing: Saturday 10 October 2026."), source: "https://raceroster.com/events/2026/115362/hume-and-hovell-ultra-2026", notes: "22K event." },
  { seriesSlug: "goulburn-running-festival", date: "2026-10-18", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runningcalendar.com.au/event/goulburn-running-festival-2/", entryOptions: officialEntry("goulburn-running-fe", "Goulburn Running Festival", "https://www.runningcalendar.com.au/event/goulburn-running-festival-2/", "Calendar listing: Sunday 18 October 2026."), source: "https://www.runningcalendar.com.au/event/goulburn-running-festival-2/", notes: "Half event." },
  { seriesSlug: "mclaren-vale-running-festival", date: "2026-10-18", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runningcalendar.com.au/event/mclaren-vale-half-marathon/", entryOptions: officialEntry("mclaren-vale-runnin", "McLaren Vale Running Festival", "https://www.runningcalendar.com.au/event/mclaren-vale-half-marathon/", "Calendar listing: Sunday 18 October 2026."), source: "https://www.runningcalendar.com.au/event/mclaren-vale-half-marathon/", notes: "Half event." },
  { seriesSlug: "bbbrun", date: "2026-10-25", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runningcalendar.com.au/event/bennelong-bridge-run/", entryOptions: officialEntry("bbbrun", "BBBRun Bennelong Bridge Run", "https://www.runningcalendar.com.au/event/bennelong-bridge-run/", "Calendar listing: Sunday 25 October 2026."), source: "https://www.runningcalendar.com.au/event/bennelong-bridge-run/", notes: "Half event." },
  { seriesSlug: "run-huskisson", date: "2026-10-31", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.runningcalendar.com.au/event/run-huskisson-husky-running-festival/", entryOptions: officialEntry("run-huskisson", "Run Huskisson", "https://www.runningcalendar.com.au/event/run-huskisson-husky-running-festival/", "Calendar listing: Saturday 31 October 2026."), source: "https://www.runningcalendar.com.au/event/run-huskisson-husky-running-festival/", notes: "Marathon event." },
];
