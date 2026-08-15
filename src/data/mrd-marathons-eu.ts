/**
 * European full marathons listed by Marathon Runners Diary.
 *
 * These are public calendar facts only. Dates marked TBC by the source are
 * represented as series without an edition until a date is published.
 * ATHRECS' catalogue merge removes matching names/slugs already supplied by a
 * higher-priority source.
 */
import type { Edition, Series } from "./types";

const SOURCE_URL = "http://www.marathonrunnersdiary.com/races/europe-marathons-list.php";

type EuropeanMarathon = {
  slug: string;
  name: string;
  city: string;
  country: string;
  date?: string;
};

const races: EuropeanMarathon[] = [
  {
    slug: "reykjavik-marathon",
    name: "Reykjavik Marathon",
    city: "Reykjavik",
    country: "Iceland",
    date: "2026-08-22",
  },
  {
    slug: "helsinki-marathon",
    name: "Helsinki Marathon",
    city: "Helsinki",
    country: "Finland",
    date: "2026-08-22",
  },
  {
    slug: "stavanger-marathon",
    name: "Stavanger Marathon",
    city: "Stavanger",
    country: "Norway",
    date: "2026-08-29",
  },
  {
    slug: "jungfrau-marathon",
    name: "Jungfrau Marathon",
    city: "Interlaken",
    country: "Switzerland",
    date: "2026-09-05",
  },
  {
    slug: "kilkenny-medieval-marathon",
    name: "Kilkenny Medieval Marathon",
    city: "Kilkenny",
    country: "Ireland",
    date: "2026-09-12",
  },
  {
    slug: "oslo-marathon",
    name: "Oslo Marathon",
    city: "Oslo",
    country: "Norway",
    date: "2026-09-12",
  },
  {
    slug: "tallinn-marathon",
    name: "Tallinn Marathon",
    city: "Tallinn",
    country: "Estonia",
    date: "2026-09-13",
  },
  {
    slug: "international-vilnius-marathon",
    name: "International Vilnius Marathon",
    city: "Vilnius",
    country: "Lithuania",
    date: "2026-09-13",
  },
  {
    slug: "wachau-marathon",
    name: "Wachau Marathon",
    city: "Wachau",
    country: "Austria",
    date: "2026-09-13",
  },
  {
    slug: "hc-andersen-marathon",
    name: "H.C. Andersen Marathon",
    city: "Odense",
    country: "Denmark",
    date: "2026-09-27",
  },
  {
    slug: "warsaw-marathon",
    name: "Warsaw Marathon",
    city: "Warsaw",
    country: "Poland",
    date: "2026-09-27",
  },
  {
    slug: "run-galway-bay-marathon",
    name: "Run Galway Bay Marathon",
    city: "Galway",
    country: "Ireland",
    date: "2026-10-03",
  },
  {
    slug: "cologne-marathon",
    name: "Cologne Marathon",
    city: "Cologne",
    country: "Germany",
    date: "2026-10-04",
  },
  {
    slug: "kosice-marathon",
    name: "Kosice Marathon",
    city: "Kosice",
    country: "Slovakia",
    date: "2026-10-04",
  },
  {
    slug: "lisbon-marathon",
    name: "Lisbon Marathon",
    city: "Lisbon",
    country: "Portugal",
    date: "2026-10-10",
  },
  {
    slug: "bruges-marathon",
    name: "Bruges Marathon",
    city: "Bruges",
    country: "Belgium",
    date: "2026-10-11",
  },
  {
    slug: "budapest-marathon",
    name: "Budapest Marathon",
    city: "Budapest",
    country: "Hungary",
    date: "2026-10-11",
  },
  {
    slug: "eindhoven-marathon",
    name: "Eindhoven Marathon",
    city: "Eindhoven",
    country: "Netherlands",
    date: "2026-10-11",
  },
  {
    slug: "graz-marathon",
    name: "Graz Marathon",
    city: "Graz",
    country: "Austria",
    date: "2026-10-11",
  },
  {
    slug: "ljubljana-marathon",
    name: "Ljubljana Marathon",
    city: "Ljubljana",
    country: "Slovenia",
    date: "2026-10-18",
  },
  {
    slug: "dresden-marathon",
    name: "Dresden Marathon",
    city: "Dresden",
    country: "Germany",
    date: "2026-10-25",
  },
  {
    slug: "venice-marathon",
    name: "Venice Marathon",
    city: "Venice",
    country: "Italy",
    date: "2026-10-25",
  },
  {
    slug: "x-ray-marathon",
    name: "X-ray Marathon",
    city: "Remscheid",
    country: "Germany",
    date: "2026-10-25",
  },
  { slug: "brussels-marathon", name: "Brussels Marathon", city: "Brussels", country: "Belgium" },
  {
    slug: "istanbul-marathon",
    name: "Istanbul Marathon",
    city: "Istanbul",
    country: "Turkey",
    date: "2026-11-01",
  },
  {
    slug: "athens-marathon",
    name: "Athens Marathon",
    city: "Athens",
    country: "Greece",
    date: "2026-11-08",
  },
  {
    slug: "malaga-marathon",
    name: "Malaga Marathon",
    city: "Malaga",
    country: "Spain",
    date: "2026-11-08",
  },
  {
    slug: "rursee-marathon",
    name: "Rursee Marathon",
    city: "Simmerath-Einruhr",
    country: "Germany",
    date: "2026-11-08",
  },
  {
    slug: "larnaka-marathon",
    name: "Larnaka Marathon",
    city: "Larnaka",
    country: "Cyprus",
    date: "2026-11-15",
  },
  {
    slug: "palermo-marathon",
    name: "Palermo Marathon",
    city: "Palermo",
    country: "Italy",
    date: "2026-11-15",
  },
  {
    slug: "san-sebastian-marathon",
    name: "San Sebastian Marathon",
    city: "San Sebastian",
    country: "Spain",
    date: "2026-11-22",
  },
  {
    slug: "florence-marathon",
    name: "Florence Marathon",
    city: "Florence",
    country: "Italy",
    date: "2026-11-29",
  },
  {
    slug: "lanzarote-marathon",
    name: "Lanzarote Marathon",
    city: "Lanzarote",
    country: "Spain",
    date: "2026-12-05",
  },
  {
    slug: "pisa-marathon",
    name: "Pisa Marathon",
    city: "Pisa",
    country: "Italy",
    date: "2026-12-20",
  },
  { slug: "seville-marathon", name: "Seville Marathon", city: "Seville", country: "Spain" },
  {
    slug: "cyprus-marathon",
    name: "Cyprus Marathon",
    city: "Paphos",
    country: "Cyprus",
    date: "2027-02-28",
  },
  {
    slug: "bologna-marathon",
    name: "Bologna Marathon",
    city: "Bologna",
    country: "Italy",
    date: "2027-03-07",
  },
  { slug: "limassol-marathon", name: "Limassol Marathon", city: "Limassol", country: "Cyprus" },
  {
    slug: "milan-city-marathon",
    name: "Milan City Marathon",
    city: "Milan",
    country: "Italy",
    date: "2027-04-04",
  },
  {
    slug: "ibiza-marathon",
    name: "Ibiza Marathon",
    city: "Ibiza",
    country: "Spain",
    date: "2027-04-10",
  },
  {
    slug: "enschede-marathon",
    name: "Enschede Marathon",
    city: "Enschede",
    country: "Netherlands",
    date: "2027-04-11",
  },
  {
    slug: "lodz-marathon",
    name: "Lodz Marathon",
    city: "Lodz",
    country: "Poland",
    date: "2027-04-11",
  },
  {
    slug: "connemara-international-marathon",
    name: "Connemara International Marathon",
    city: "Connemara",
    country: "Ireland",
    date: "2027-04-25",
  },
  {
    slug: "hamburg-marathon",
    name: "Hamburg Marathon",
    city: "Hamburg",
    country: "Germany",
    date: "2027-04-25",
  },
  {
    slug: "madrid-marathon",
    name: "Madrid Marathon",
    city: "Madrid",
    country: "Spain",
    date: "2027-04-25",
  },
  { slug: "vandra-marathon", name: "Vandra Marathon", city: "Vandra", country: "Estonia" },
  {
    slug: "prague-international-marathon",
    name: "Prague International Marathon",
    city: "Prague",
    country: "Czech Republic",
  },
  {
    slug: "helsinki-city-run-marathon",
    name: "Helsinki City Run Marathon",
    city: "Helsinki",
    country: "Finland",
    date: "2027-05-08",
  },
  {
    slug: "copenhagen-marathon",
    name: "Copenhagen Marathon",
    city: "Copenhagen",
    country: "Denmark",
    date: "2027-05-09",
  },
  {
    slug: "geneva-marathon",
    name: "Geneva Marathon",
    city: "Geneva",
    country: "Switzerland",
    date: "2027-05-09",
  },
  { slug: "leiden-marathon", name: "Leiden Marathon", city: "Leiden", country: "Netherlands" },
  {
    slug: "rhein-ruhr-marathon",
    name: "Rhein-Ruhr Marathon",
    city: "Duisburg",
    country: "Germany",
  },
  {
    slug: "regensburg-marathon",
    name: "Regensburg Marathon",
    city: "Regensburg",
    country: "Germany",
  },
  { slug: "riga-marathon", name: "Riga Marathon", city: "Riga", country: "Latvia" },
  {
    slug: "stockholm-marathon",
    name: "Stockholm Marathon",
    city: "Stockholm",
    country: "Sweden",
    date: "2027-05-29",
  },
  {
    slug: "d-day-landings-marathon",
    name: "D-Day Landings Marathon",
    city: "Caen",
    country: "France",
  },
  { slug: "eifel-marathon", name: "Eifel Marathon", city: "Bitburg", country: "Germany" },
  {
    slug: "midnight-sun-marathon",
    name: "Midnight Sun Marathon",
    city: "Tromso",
    country: "Norway",
  },
  { slug: "mont-blanc-marathon", name: "Mont Blanc Marathon", city: "Chamonix", country: "France" },
  {
    slug: "marburg-nachtmarathon",
    name: "Marburg Nachtmarathon",
    city: "Marburg",
    country: "Germany",
  },
  { slug: "jolster-marathon", name: "Jolster Marathon", city: "Jolster", country: "Norway" },
  {
    slug: "swiss-alpine-marathon",
    name: "Swiss Alpine Marathon",
    city: "Davos",
    country: "Switzerland",
  },
];

export const mrdEuMarathonSeries: Series[] = races.map((race) => ({
  slug: race.slug,
  name: race.name,
  sport: "Running",
  country: race.country,
  county: "",
  city: race.city,
  area: race.city,
  surface: "Road",
  distances: ["Marathon"],
  summary: `${race.name} — marathon 42.2 km.`,
  description:
    "Full marathon listed on Marathon Runners Diary. Confirm the date, entry status and race details on the official event website.",
  organiser: "See official race site",
  website: "",
  featured: false,
  source_url: SOURCE_URL,
}));

export const mrdEuMarathonEditions: Edition[] = races.flatMap((race) =>
  race.date
    ? [
        {
          seriesSlug: race.slug,
          date: race.date,
          distance: "Marathon",
          distanceKm: 42.195,
          status: "TBC" as const,
          source: SOURCE_URL,
        },
      ]
    : [],
);
