/**
 * Andorra 2026-2027 missing fixtures.
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

export const runrecsGapFillAndorraSeries: Series[] = [
  { slug: "travessa-dencamp", name: "OTSO Travessa d'Encamp", sport: "Running", country: "Andorra", county: "Encamp", city: "Encamp", area: "Encamp", surface: "Trail", distances: ["84K", "Marathon", "Half", "14K", "7K"], summary: "OTSO Travessa d'Encamp in Encamp.", description: "Andorra's oldest mountain race. The 44th edition is 28-30 May 2027.", organiser: "OTSO Sport", website: "https://otsosport.com/en/pages/otso-travessa-encamp-2027", featured: false, source_url: "https://otsosport.com/en/pages/otso-travessa-encamp-2027" },
  { slug: "skyrace-comapedrosa", name: "XTERRA Skyrace Comapedrosa", sport: "Running", country: "Andorra", county: "La Massana", city: "Arinsal", area: "Comapedrosa", surface: "Trail", distances: ["36K", "24K", "19K", "8K"], summary: "XTERRA Skyrace Comapedrosa in Arinsal.", description: "Mountain festival 25-26 July 2026.", organiser: "XTERRA / Skyrace Comapedrosa", website: "https://skyracecomapedrosa.com/en/home-eng/", featured: false, source_url: "https://skyracecomapedrosa.com/en/home-eng/" },
  { slug: "dynafit-andorra-trail", name: "Dynafit Andorra Trail", sport: "Running", country: "Andorra", county: "Andorra la Vella", city: "Escaldes-Engordany", area: "Engordany", surface: "Trail", distances: ["47K", "26K", "17K", "5K"], summary: "Dynafit Andorra Trail stage race.", description: "Three-stage trail weekend 9-11 October 2026.", organiser: "Dynafit Andorra Trail", website: "https://andorratrail.com/en/", featured: false, source_url: "https://andorratrail.com/en/" },
];

export const runrecsGapFillAndorraEditions: Edition[] = [
  { seriesSlug: "travessa-dencamp", date: "2026-05-23", distance: "Marathon", distanceKm: 42.195, status: "Finished", entryUrl: "https://andorra.com/en/blog/events/andorra-marathon", entryOptions: officialEntry("travessa-dencamp", "OTSO Travessa d'Encamp", "https://andorra.com/en/blog/events/andorra-marathon", "43rd edition 22-24 May 2026."), source: "https://andorra.com/en/blog/events/andorra-marathon", notes: "Finished 2026 edition." },
  { seriesSlug: "travessa-dencamp", date: "2027-05-29", distance: "Marathon", distanceKm: 42, status: "Open", entryUrl: "https://otsosport.com/en/pages/otso-travessa-encamp-2027", entryOptions: officialEntry("travessa-dencamp", "OTSO Travessa d'Encamp", "https://otsosport.com/en/pages/otso-travessa-encamp-2027", "Official: 42K and 84K Saturday 29 May 2027."), source: "https://otsosport.com/en/pages/otso-travessa-encamp-2027", notes: "Marathon event." },
  { seriesSlug: "skyrace-comapedrosa", date: "2026-07-26", distance: "36K", distanceKm: 36, status: "Finished", entryUrl: "https://skyracecomapedrosa.com/en/home-eng/", entryOptions: officialEntry("skyrace-comapedrosa", "XTERRA Skyrace Comapedrosa", "https://www.xterraplanet.com/event/xterra-skyrace-comapedrosa", "Official: marathon 26 July 2026."), source: "https://www.xterraplanet.com/event/xterra-skyrace-comapedrosa", notes: "Marathon Comapedrosa." },
  { seriesSlug: "dynafit-andorra-trail", date: "2026-10-09", distance: "5K", distanceKm: 5, status: "Open", entryUrl: "https://andorratrail.com/en/", entryOptions: officialEntry("dynafit-andorra-trail", "Dynafit Andorra Trail", "https://andorratrail.com/en/", "Official: stage 1 Friday 9 October 2026."), source: "https://andorratrail.com/en/", notes: "Stage race weekend 9-11 October 2026." },
];
