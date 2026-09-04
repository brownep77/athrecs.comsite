/**
 * Angola Sep-Dec 2026 road races, 0-150 km.
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

export const runrecsGapFillAngolaQ4Series: Series[] = [
  { slug: "meia-maratona-petromar-ambriz", name: "Meia Maratona Petromar Ambriz", sport: "Running", country: "Angola", county: "Bengo", city: "Ambriz", area: "Ambriz", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Petromar half marathon in Ambriz.", description: "Meia Maratona Petromar Ambriz is 17 September 2026.", organiser: "Petromar / TCHACO Sport", website: "https://www.tchacosport.com/novo-cadastro/3768/meia-maratona-petromar-ambriz", featured: false, source_url: "https://www.tchacosport.com/calendario-eventos" },
  { slug: "lobito-run", name: "Lobito Run", sport: "Running", country: "Angola", county: "Benguela", city: "Lobito", area: "Restinga do Lobito", surface: "Road", distances: ["10K", "5K"], summary: "Lobito Run in Benguela.", description: "Lobito Run is 19 September 2026.", organiser: "TCHACO Sport", website: "https://www.tchacosport.com/evento/2417/corrida-lobito-run-2026", featured: false, source_url: "https://www.tchacosport.com/evento/2417/corrida-lobito-run-2026" },
  { slug: "africell-color-run-luanda", name: "Africell Color Run Luanda", sport: "Running", country: "Angola", county: "Luanda", city: "Luanda", area: "Luanda", surface: "Road", distances: ["5K"], summary: "Africell Color Run in Luanda.", description: "Africell Color Run is 27 September 2026.", organiser: "Africell / TCHACO Sport", website: "https://www.tchacosport.com/evento/4144/corrida-africell-color-run-2026", featured: false, source_url: "https://www.tchacosport.com/evento/4144/corrida-africell-color-run-2026" },
  { slug: "sao-silvestre-luanda", name: "São Silvestre de Luanda", sport: "Running", country: "Angola", county: "Luanda", city: "Luanda", area: "Luanda", surface: "Road", distances: ["10K"], summary: "São Silvestre de Luanda 10 km.", description: "AIMS lists Thursday 31 December 2026.", organiser: "São Silvestre de Luanda", website: "https://aims-worldrunning.org/races/928.html", featured: false, source_url: "https://aims-worldrunning.org/races/928.html" },
];

export const runrecsGapFillAngolaQ4Editions: Edition[] = [
  { seriesSlug: "meia-maratona-petromar-ambriz", date: "2026-09-17", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.tchacosport.com/novo-cadastro/3768/meia-maratona-petromar-ambriz", entryOptions: officialEntry("tchaco-petromar", "TCHACO Sport", "https://www.tchacosport.com/novo-cadastro/3768/meia-maratona-petromar-ambriz", "Official calendar: 17 September 2026."), source: "https://www.tchacosport.com/calendario-eventos", notes: "Half marathon event." },
  { seriesSlug: "lobito-run", date: "2026-09-19", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.tchacosport.com/evento/2417/corrida-lobito-run-2026", entryOptions: officialEntry("tchaco-lobito", "TCHACO Sport", "https://www.tchacosport.com/evento/2417/corrida-lobito-run-2026", "Official: 19 September 2026, 10 km and 5 km."), source: "https://www.tchacosport.com/evento/2417/corrida-lobito-run-2026", notes: "10 km event." },
  { seriesSlug: "africell-color-run-luanda", date: "2026-09-27", distance: "5K", distanceKm: 5, status: "Open", entryUrl: "https://www.tchacosport.com/evento/4144/corrida-africell-color-run-2026", entryOptions: officialEntry("tchaco-africell", "TCHACO Sport", "https://www.tchacosport.com/evento/4144/corrida-africell-color-run-2026", "Official calendar: 27 September 2026."), source: "https://www.tchacosport.com/calendario-eventos", notes: "5 km color run." },
  { seriesSlug: "sao-silvestre-luanda", date: "2026-12-31", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://aims-worldrunning.org/races/928.html", entryOptions: officialEntry("aims-sao-silvestre-luanda", "AIMS", "https://aims-worldrunning.org/races/928.html", "AIMS: Thursday 31 December 2026."), source: "https://aims-worldrunning.org/races/928.html", notes: "10 km event." },
];
