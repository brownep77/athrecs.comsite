/**
 * September 2026 worldwide batch G.
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

export const runrecsGapFillGSeries: Series[] = [
  { slug: "patagonian-international-marathon", name: "Patagonian International Marathon", sport: "Running", country: "Chile", county: "Magallanes", city: "Torres del Paine", area: "Torres del Paine", surface: "Trail", distances: ["Marathon", "Half", "10K"], summary: "Patagonian International Marathon in Torres del Paine.", description: "Patagonian International Marathon is Saturday 5 September 2026.", organiser: "Patagonian International Marathon", website: "https://www.patagonianinternationalmarathon.com/en/about", featured: false, source_url: "https://www.patagonianinternationalmarathon.com/en/about" },
  { slug: "labor-day-triple-winter-park", name: "Labor Day Triple Marathon Winter Park", sport: "Running", country: "United States", county: "Florida", city: "Winter Park", area: "Winter Park", surface: "Road", distances: ["Marathon", "Half"], summary: "Labor Day Triple Marathon Winter Park in Winter Park.", description: "Labor Day Triple Marathon Winter Park is Saturday 5 September 2026.", organiser: "Labor Day Triple", website: "https://runsignup.com/Race/FL/WinterPark/LaborDayTriple", featured: false, source_url: "https://runsignup.com/Race/FL/WinterPark/LaborDayTriple" },
  { slug: "ostrava-city-marathon", name: "BREMBO Ostrava City Marathon", sport: "Running", country: "Czechia", county: "Moravia-Silesia", city: "Ostrava", area: "Masaryk Square", surface: "Road", distances: ["Marathon", "Half"], summary: "BREMBO Ostrava City Marathon in Ostrava.", description: "BREMBO Ostrava City Marathon is Sunday 6 September 2026.", organiser: "BREMBO Ostrava City Marathon", website: "https://ostravacitymarathon.cz/", featured: false, source_url: "https://ostravacitymarathon.cz/" },
  { slug: "franconian-switzerland-marathon", name: "Franconian Switzerland Marathon", sport: "Running", country: "Germany", county: "Bavaria", city: "Wiesenttal", area: "Franconian Switzerland", surface: "Trail", distances: ["Marathon", "Half"], summary: "Franconian Switzerland Marathon in Wiesenttal.", description: "Franconian Switzerland Marathon is Sunday 6 September 2026.", organiser: "Franconian Switzerland Marathon", website: "https://www.ahotu.com/event/frankische-schweiz-marathon", featured: false, source_url: "https://www.ahotu.com/event/frankische-schweiz-marathon" },
  { slug: "limeira-half-marathon", name: "Meia Maratona de Limeira", sport: "Running", country: "Brazil", county: "Sao Paulo", city: "Limeira", area: "Parque Cidade", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Meia Maratona de Limeira in Limeira.", description: "Meia Maratona de Limeira is Sunday 13 September 2026.", organiser: "Meia Maratona de Limeira", website: "https://correriacampinas.com.br/calendario/meia-maratona-de-limeira/", featured: false, source_url: "https://correriacampinas.com.br/calendario/meia-maratona-de-limeira/" },
  { slug: "pikes-peak-marathon", name: "Pikes Peak Marathon", sport: "Running", country: "United States", county: "Colorado", city: "Manitou Springs", area: "Pikes Peak", surface: "Trail", distances: ["Marathon", "Half"], summary: "Pikes Peak Marathon in Manitou Springs.", description: "Pikes Peak Marathon is Sunday 20 September 2026.", organiser: "Pikes Peak Marathon", website: "http://www.pikespeakmarathon.org/", featured: false, source_url: "http://www.pikespeakmarathon.org/" },
];

export const runrecsGapFillGEditions: Edition[] = [
  { seriesSlug: "patagonian-international-marathon", date: "2026-09-05", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.patagonianinternationalmarathon.com/en/about", entryOptions: officialEntry("patagonian-internat", "Patagonian International Marathon", "https://www.patagonianinternationalmarathon.com/en/about", "Official site: Saturday 5 September 2026."), source: "https://www.patagonianinternationalmarathon.com/en/about", notes: "Marathon event." },
  { seriesSlug: "labor-day-triple-winter-park", date: "2026-09-05", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://runsignup.com/Race/FL/WinterPark/LaborDayTriple", entryOptions: officialEntry("labor-day-triple-wi", "Labor Day Triple Marathon Winter Park", "https://runsignup.com/Race/FL/WinterPark/LaborDayTriple", "Calendar listing: Saturday 5 September 2026."), source: "https://runsignup.com/Race/FL/WinterPark/LaborDayTriple", notes: "Marathon event." },
  { seriesSlug: "ostrava-city-marathon", date: "2026-09-06", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://ostravacitymarathon.cz/", entryOptions: officialEntry("ostrava-city-marath", "BREMBO Ostrava City Marathon", "https://ostravacitymarathon.cz/", "Official site: Sunday 6 September 2026."), source: "https://ostravacitymarathon.cz/", notes: "Marathon event." },
  { seriesSlug: "franconian-switzerland-marathon", date: "2026-09-06", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/event/frankische-schweiz-marathon", entryOptions: officialEntry("franconian-switzerl", "Franconian Switzerland Marathon", "https://www.ahotu.com/event/frankische-schweiz-marathon", "Calendar listing: Sunday 6 September 2026."), source: "https://www.ahotu.com/event/frankische-schweiz-marathon", notes: "Marathon event." },
  { seriesSlug: "limeira-half-marathon", date: "2026-09-13", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://correriacampinas.com.br/calendario/meia-maratona-de-limeira/", entryOptions: officialEntry("limeira-half-marath", "Meia Maratona de Limeira", "https://correriacampinas.com.br/calendario/meia-maratona-de-limeira/", "Calendar listing: Sunday 13 September 2026."), source: "https://correriacampinas.com.br/calendario/meia-maratona-de-limeira/", notes: "Half event." },
  { seriesSlug: "pikes-peak-marathon", date: "2026-09-20", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "http://www.pikespeakmarathon.org/", entryOptions: officialEntry("pikes-peak-marathon", "Pikes Peak Marathon", "http://www.pikespeakmarathon.org/", "Calendar listing: Sunday 20 September 2026."), source: "http://www.pikespeakmarathon.org/", notes: "Marathon event." },
];
