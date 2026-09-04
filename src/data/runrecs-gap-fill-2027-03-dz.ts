/**
 * March 2027 Algeria batch.
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

export const runrecsGapFillMar27DzSeries: Series[] = [
  { slug: "sahara-marathon", name: "Sahara Marathon", sport: "Running", country: "Algeria", county: "Tindouf", city: "Tindouf", area: "Sahrawi refugee camps", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Sahara Marathon near Tindouf.", description: "Sahara Marathon is Tuesday 16 March 2027.", organiser: "Sahara Marathon", website: "https://www.saharamarathon.org/", featured: false, source_url: "https://www.saharamarathon.org/" },
  { slug: "tassili-najjer-marathon", name: "Tassili N'Ajjer Marathon", sport: "Running", country: "Algeria", county: "Illizi", city: "Djanet", area: "Tassili N'Ajjer National Park", surface: "Trail", distances: ["Marathon"], summary: "Tassili N'Ajjer Marathon in Djanet.", description: "Tassili N'Ajjer Marathon is Wednesday 24 March 2027.", organiser: "Z Adventures", website: "http://z-adventures.org/algeria-challenge.html", featured: false, source_url: "http://z-adventures.org/algeria-challenge.html" },
];

export const runrecsGapFillMar27DzEditions: Edition[] = [
  { seriesSlug: "sahara-marathon", date: "2027-03-16", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.saharamarathon.org/", entryOptions: officialEntry("sahara-marathon", "Sahara Marathon", "https://www.saharamarathon.org/", "Official site: Tuesday 16 March 2027."), source: "https://www.saharamarathon.org/", notes: "Marathon event." },
  { seriesSlug: "tassili-najjer-marathon", date: "2027-03-24", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "http://z-adventures.org/algeria-challenge.html", entryOptions: officialEntry("tassili-najjer-mara", "Tassili N'Ajjer Marathon", "http://z-adventures.org/algeria-challenge.html", "Official itinerary: Wednesday 24 March 2027."), source: "http://z-adventures.org/algeria-challenge.html", notes: "Marathon event." },
];
