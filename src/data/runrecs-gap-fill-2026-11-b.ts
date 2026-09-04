/**
 * Nov-Dec 2026 batch. Countries beginning with B.
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

export const runrecsGapFillNovBSeries: Series[] = [
  { slug: "pedra-azul-marathon", name: "Maratona Pedra Azul", sport: "Running", country: "Brazil", county: "Espirito Santo", city: "Domingos Martins", area: "Pedra Azul", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Maratona Pedra Azul in Domingos Martins.", description: "Maratona Pedra Azul is Sunday 1 November 2026.", organiser: "Maratona Pedra Azul", website: "https://www.ticketsports.com.br/e/maratona-pedra-azul-2026-86752", featured: false, source_url: "https://www.ticketsports.com.br/e/maratona-pedra-azul-2026-86752" },
  { slug: "aracaju-marathon", name: "Maratona de Aracaju", sport: "Running", country: "Brazil", county: "Sergipe", city: "Aracaju", area: "Aracaju", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Maratona de Aracaju in Aracaju.", description: "Maratona de Aracaju is Sunday 1 November 2026.", organiser: "Maratona de Aracaju", website: "https://www.instagram.com/maratonadearacaju/", featured: false, source_url: "https://www.instagram.com/maratonadearacaju/" },
  { slug: "bebedouro-half", name: "Meia Maratona de Bebedouro", sport: "Running", country: "Brazil", county: "Sao Paulo", city: "Bebedouro", area: "Bebedouro", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Meia Maratona de Bebedouro in Bebedouro.", description: "Meia Maratona de Bebedouro is Sunday 1 November 2026.", organiser: "Meia Maratona de Bebedouro", website: "https://oticketplay.com.br/event/t-3-meia-maratona-de-bebedouro", featured: false, source_url: "https://oticketplay.com.br/event/t-3-meia-maratona-de-bebedouro" },
  { slug: "curitiba-marathon", name: "Santander Maratona de Curitiba", sport: "Running", country: "Brazil", county: "Parana", city: "Curitiba", area: "Curitiba", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Santander Maratona de Curitiba in Curitiba.", description: "Santander Maratona de Curitiba is Sunday 15 November 2026.", organiser: "Santander Maratona de Curitiba", website: "https://www.ahotu.com/event/maratona-de-curitiba", featured: false, source_url: "https://www.ahotu.com/event/maratona-de-curitiba" },
  { slug: "burgas-marathon", name: "Burgas Marathon", sport: "Running", country: "Bulgaria", county: "Burgas", city: "Burgas", area: "Burgas", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Burgas Marathon in Burgas.", description: "Burgas Marathon is Sunday 15 November 2026.", organiser: "Burgas Marathon", website: "https://burgasmarathon.bg/en/", featured: false, source_url: "https://burgasmarathon.bg/en/" },
  { slug: "end-of-the-world-belize", name: "End of the World Marathon Belize", sport: "Running", country: "Belize", county: "Stann Creek", city: "Placencia", area: "Placencia", surface: "Road", distances: ["Marathon", "Half"], summary: "End of the World Marathon in Placencia.", description: "End of the World Marathon Belize is Sunday 6 December 2026.", organiser: "Run Belize", website: "http://runbelize.org/index.html", featured: false, source_url: "http://runbelize.org/index.html" },
];

export const runrecsGapFillNovBEditions: Edition[] = [
  { seriesSlug: "pedra-azul-marathon", date: "2026-11-01", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ticketsports.com.br/e/maratona-pedra-azul-2026-86752", entryOptions: officialEntry("pedra-azul-marathon", "Maratona Pedra Azul", "https://www.ticketsports.com.br/e/maratona-pedra-azul-2026-86752", "Official listing: Sunday 1 November 2026."), source: "https://www.ticketsports.com.br/e/maratona-pedra-azul-2026-86752", notes: "Marathon event." },
  { seriesSlug: "aracaju-marathon", date: "2026-11-01", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.instagram.com/maratonadearacaju/", entryOptions: officialEntry("aracaju-marathon", "Maratona de Aracaju", "https://www.instagram.com/maratonadearacaju/", "Official listing: Sunday 1 November 2026."), source: "https://www.instagram.com/maratonadearacaju/", notes: "Marathon event." },
  { seriesSlug: "bebedouro-half", date: "2026-11-01", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://oticketplay.com.br/event/t-3-meia-maratona-de-bebedouro", entryOptions: officialEntry("bebedouro-half", "Meia Maratona de Bebedouro", "https://oticketplay.com.br/event/t-3-meia-maratona-de-bebedouro", "Official listing: Sunday 1 November 2026."), source: "https://oticketplay.com.br/event/t-3-meia-maratona-de-bebedouro", notes: "Half event." },
  { seriesSlug: "curitiba-marathon", date: "2026-11-15", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/event/maratona-de-curitiba", entryOptions: officialEntry("curitiba-marathon", "Santander Maratona de Curitiba", "https://www.ahotu.com/event/maratona-de-curitiba", "Calendar listing: Sunday 15 November 2026."), source: "https://www.ahotu.com/event/maratona-de-curitiba", notes: "Marathon event." },
  { seriesSlug: "burgas-marathon", date: "2026-11-15", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://burgasmarathon.bg/en/", entryOptions: officialEntry("burgas-marathon", "Burgas Marathon", "https://burgasmarathon.bg/en/", "Official site: Sunday 15 November 2026."), source: "https://burgasmarathon.bg/en/", notes: "Marathon event." },
  { seriesSlug: "end-of-the-world-belize", date: "2026-12-06", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "http://runbelize.org/index.html", entryOptions: officialEntry("end-of-the-world-be", "End of the World Marathon Belize", "http://runbelize.org/index.html", "Official site: Sunday 6 December 2026."), source: "http://runbelize.org/index.html", notes: "Marathon event." },
];
