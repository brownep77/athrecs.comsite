/**
 * October 2026 batch O. Countries beginning with B.
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

export const runrecsGapFillOctOSeries: Series[] = [
  { slug: "pelotas-sesc-marathon", name: "Maratona Sesc de Pelotas", sport: "Running", country: "Brazil", county: "Rio Grande do Sul", city: "Pelotas", area: "Pelotas", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Maratona Sesc de Pelotas in Pelotas.", description: "Maratona Sesc de Pelotas is Sunday 11 October 2026.", organiser: "SESC-RS", website: "https://www.sesc-rs.com.br/maratonadepelotas/", featured: false, source_url: "https://www.sesc-rs.com.br/maratonadepelotas/" },
  { slug: "christ-the-redeemer-half", name: "Christ the Redeemer Half Marathon", sport: "Running", country: "Brazil", county: "Rio de Janeiro", city: "Rio de Janeiro", area: "Tijuca National Park", surface: "Trail", distances: ["Half"], summary: "Christ the Redeemer Half Marathon in Rio de Janeiro.", description: "Christ the Redeemer Half Marathon is Sunday 11 October 2026.", organiser: "Christ the Redeemer Half Marathon", website: "https://gorunningtours.com/rio-de-janerio-running-races/", featured: false, source_url: "https://gorunningtours.com/rio-de-janerio-running-races/" },
  { slug: "pomerode-marathon", name: "Maratona Internacional de Pomerode", sport: "Running", country: "Brazil", county: "Santa Catarina", city: "Pomerode", area: "Pomerode", surface: "Road", distances: ["Marathon", "Half"], summary: "Maratona Internacional de Pomerode in Pomerode.", description: "Maratona Internacional de Pomerode is Saturday 17 October 2026.", organiser: "Corre Brasil", website: "https://www.ahotu.com/event/maratona-internacional-de-pomerode", featured: false, source_url: "https://www.ahotu.com/event/maratona-internacional-de-pomerode" },
];

export const runrecsGapFillOctOEditions: Edition[] = [
  { seriesSlug: "pelotas-sesc-marathon", date: "2026-10-11", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.sesc-rs.com.br/maratonadepelotas/", entryOptions: officialEntry("pelotas-sesc-marath", "Maratona Sesc de Pelotas", "https://www.sesc-rs.com.br/maratonadepelotas/", "Official site: Sunday 11 October 2026."), source: "https://www.sesc-rs.com.br/maratonadepelotas/", notes: "Marathon event." },
  { seriesSlug: "christ-the-redeemer-half", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://gorunningtours.com/rio-de-janerio-running-races/", entryOptions: officialEntry("christ-the-redeemer", "Christ the Redeemer Half Marathon", "https://gorunningtours.com/rio-de-janerio-running-races/", "Calendar listing: Sunday 11 October 2026."), source: "https://gorunningtours.com/rio-de-janerio-running-races/", notes: "Half event." },
  { seriesSlug: "pomerode-marathon", date: "2026-10-17", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/event/maratona-internacional-de-pomerode", entryOptions: officialEntry("pomerode-marathon", "Maratona Internacional de Pomerode", "https://www.ahotu.com/event/maratona-internacional-de-pomerode", "Calendar listing: Saturday 17 October 2026."), source: "https://www.ahotu.com/event/maratona-internacional-de-pomerode", notes: "Marathon event." },
];
