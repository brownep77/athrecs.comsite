/**
 * October 2026 batch I. Worldwide leftovers.
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

export const runrecsGapFillOctISeries: Series[] = [
  { slug: "jurere-marathon", name: "Maratona de Jurere", sport: "Running", country: "Brazil", county: "Santa Catarina", city: "Florianopolis", area: "Jurere", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Maratona de Jurere in Florianopolis.", description: "Maratona de Jurere is Sunday 11 October 2026.", organiser: "Maratona de Jurere", website: "https://www.ahotu.com/event/maratona-de-jurere", featured: false, source_url: "https://www.ahotu.com/event/maratona-de-jurere" },
  { slug: "rock-n-roll-santiago", name: "Santander Rock n Roll Santiago", sport: "Running", country: "Chile", county: "Santiago", city: "Santiago", area: "Lo Barnechea", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Santander Rock n Roll Santiago in Santiago.", description: "Santander Rock n Roll Santiago is Saturday 17 October 2026.", organiser: "Rock n Roll Running Series", website: "https://www.runrocknroll.com/news/rock-n-roll-running-series-returns-santiago-chile-october-17-2026-move-lo-barnechea-world", featured: false, source_url: "https://www.runrocknroll.com/news/rock-n-roll-running-series-returns-santiago-chile-october-17-2026-move-lo-barnechea-world" },
  { slug: "yeti-marathon-nepal", name: "Yeti Marathon Nepal", sport: "Running", country: "Nepal", county: "Gandaki", city: "Manang", area: "Annapurna", surface: "Trail", distances: ["Marathon", "Half", "10K"], summary: "Yeti Marathon Nepal in Manang.", description: "Yeti Marathon Nepal is Tuesday 20 October 2026.", organiser: "WildMarathon", website: "https://findarace.com/events/yeti-marathon-nepal", featured: false, source_url: "https://findarace.com/events/yeti-marathon-nepal" },
  { slug: "ecomarathon-futakotama-october", name: "EcoMarathon Futakotama October", sport: "Running", country: "Japan", county: "Tokyo", city: "Tokyo", area: "Tamagawa", surface: "Road", distances: ["Half", "10K", "5K"], summary: "EcoMarathon Futakotama October in Tokyo.", description: "EcoMarathon Futakotama October is Sunday 25 October 2026.", organiser: "EcoMarathon Futakotama", website: "https://www.finishers.com/en/event/ecomarathon-futakotama", featured: false, source_url: "https://www.finishers.com/en/event/ecomarathon-futakotama" },
];

export const runrecsGapFillOctIEditions: Edition[] = [
  { seriesSlug: "jurere-marathon", date: "2026-10-11", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/event/maratona-de-jurere", entryOptions: officialEntry("jurere-marathon", "Maratona de Jurere", "https://www.ahotu.com/event/maratona-de-jurere", "Calendar listing: Sunday 11 October 2026."), source: "https://www.ahotu.com/event/maratona-de-jurere", notes: "Marathon event." },
  { seriesSlug: "rock-n-roll-santiago", date: "2026-10-17", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runrocknroll.com/news/rock-n-roll-running-series-returns-santiago-chile-october-17-2026-move-lo-barnechea-world", entryOptions: officialEntry("rock-n-roll-santiag", "Santander Rock n Roll Santiago", "https://www.runrocknroll.com/news/rock-n-roll-running-series-returns-santiago-chile-october-17-2026-move-lo-barnechea-world", "Official announcement: Saturday 17 October 2026."), source: "https://www.runrocknroll.com/news/rock-n-roll-running-series-returns-santiago-chile-october-17-2026-move-lo-barnechea-world", notes: "Half event." },
  { seriesSlug: "yeti-marathon-nepal", date: "2026-10-20", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://findarace.com/events/yeti-marathon-nepal", entryOptions: officialEntry("yeti-marathon-nepal", "Yeti Marathon Nepal", "https://findarace.com/events/yeti-marathon-nepal", "Calendar listing: Tuesday 20 October 2026."), source: "https://findarace.com/events/yeti-marathon-nepal", notes: "Marathon event." },
  { seriesSlug: "ecomarathon-futakotama-october", date: "2026-10-25", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.finishers.com/en/event/ecomarathon-futakotama", entryOptions: officialEntry("ecomarathon-futakot", "EcoMarathon Futakotama October", "https://www.finishers.com/en/event/ecomarathon-futakotama", "Calendar listing: Sunday 25 October 2026."), source: "https://www.finishers.com/en/event/ecomarathon-futakotama", notes: "Half event." },
];
