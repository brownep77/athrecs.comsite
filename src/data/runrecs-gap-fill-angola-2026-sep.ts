/**
 * Extra Angola September 2026 road races confirmed on TCHACO.
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

export const runrecsGapFillAngolaSepSeries: Series[] = [
  { slug: "setic-fp-run-luanda", name: "SETIC-FP Run Luanda", sport: "Running", country: "Angola", county: "Luanda", city: "Luanda", area: "Luanda", surface: "Road", distances: ["10K", "5K"], summary: "SETIC-FP Run in Luanda.", description: "Second edition on 5 September 2026.", organiser: "SETIC-FP / TCHACO Sport", website: "https://www.tchacosport.com/calendario-eventos", featured: false, source_url: "https://www.tchacosport.com/calendario-eventos" },
  { slug: "exxonmobil-run-luanda", name: "ExxonMobil Run Luanda", sport: "Running", country: "Angola", county: "Luanda", city: "Luanda", area: "Marginal 4 de Fevereiro", surface: "Road", distances: ["12K", "5K"], summary: "ExxonMobil Run on the Luanda waterfront.", description: "ExxonMobil Run is 18 September 2026.", organiser: "ExxonMobil / TCHACO Sport", website: "https://www.tchacosport.com/calendario-eventos", featured: false, source_url: "https://www.tchacosport.com/calendario-eventos" },
  { slug: "standard-bank-angola-run", name: "Standard Bank Angola Run", sport: "Running", country: "Angola", county: "Luanda", city: "Talatona", area: "Inara Business Park", surface: "Road", distances: ["10K", "5K"], summary: "Standard Bank 16 years run in Talatona.", description: "Standard Bank Run is 19 September 2026.", organiser: "Standard Bank Angola / TCHACO Sport", website: "https://www.tchacosport.com/calendario-eventos", featured: false, source_url: "https://www.tchacosport.com/calendario-eventos" },
  { slug: "banco-bai-benguela-run", name: "Banco BAI Benguela Run", sport: "Running", country: "Angola", county: "Benguela", city: "Benguela", area: "Benguela", surface: "Road", distances: ["10K", "5K"], summary: "BAI 30 years run in Benguela.", description: "BAI Benguela Run is 20 September 2026.", organiser: "Banco BAI / TCHACO Sport", website: "https://www.tchacosport.com/evento/8204/corrida-de-atletismo-banco-bai-30-anos-benguela", featured: false, source_url: "https://www.tchacosport.com/evento/8204/corrida-de-atletismo-banco-bai-30-anos-benguela" },
];

export const runrecsGapFillAngolaSepEditions: Edition[] = [
  { seriesSlug: "setic-fp-run-luanda", date: "2026-09-05", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.tchacosport.com/calendario-eventos", entryOptions: officialEntry("tchaco-setic", "TCHACO Sport", "https://www.tchacosport.com/calendario-eventos", "Official: 5 September 2026, 10 km race and 5 km walk."), source: "https://www.tchacosport.com/calendario-eventos", notes: "10 km event." },
  { seriesSlug: "exxonmobil-run-luanda", date: "2026-09-18", distance: "12K", distanceKm: 12, status: "Open", entryUrl: "https://www.tchacosport.com/calendario-eventos", entryOptions: officialEntry("tchaco-exxon", "TCHACO Sport", "https://www.tchacosport.com/calendario-eventos", "Official: 18 September 2026, 12 km and 5 km, Marginal 4 de Fevereiro."), source: "https://www.tchacosport.com/calendario-eventos", notes: "12 km event." },
  { seriesSlug: "standard-bank-angola-run", date: "2026-09-19", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.tchacosport.com/calendario-eventos", entryOptions: officialEntry("tchaco-standard-bank", "TCHACO Sport", "https://www.tchacosport.com/calendario-eventos", "Official: 19 September 2026, 10 km and 5 km, Talatona."), source: "https://www.tchacosport.com/calendario-eventos", notes: "10 km event." },
  { seriesSlug: "banco-bai-benguela-run", date: "2026-09-20", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.tchacosport.com/evento/8204/corrida-de-atletismo-banco-bai-30-anos-benguela", entryOptions: officialEntry("tchaco-bai-benguela", "TCHACO Sport", "https://www.tchacosport.com/evento/8204/corrida-de-atletismo-banco-bai-30-anos-benguela", "Official: 20 September 2026, 10 km and 5 km."), source: "https://www.tchacosport.com/evento/8204/corrida-de-atletismo-banco-bai-30-anos-benguela", notes: "10 km event." },
];
