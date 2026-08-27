import type { Edition, EntryOptionStatus, Series } from "./types";

export const IRONMAN_703_CALENDAR_SOURCE =
  "https://www.ironman.com/races?facet%5B0%5D=race%3AIRONMAN%2070.3";
export const IRONMAN_703_CALENDAR_CHECKED_AT = "2026-08-27";

type RegistrationState = "open" | "opening_soon" | "sold_out" | "closed" | "qualification" | "unknown";

type RaceMeta = {
  seriesSlug?: string;
  notes?: string;
  dateSource?: "official" | "official-linked";
};

type Ironman703RaceSeed = readonly [
  sourceSlug: string,
  name: string,
  date: string,
  city: string,
  region: string,
  country: string,
  registration: RegistrationState,
  meta?: RaceMeta,
];

const raceSeeds = [
  ["im703-poznan", "IRONMAN 70.3 Poznan", "2026-08-30", "Poznan", "Greater Poland", "Poland", "sold_out"],
  ["im703-zell-am-see", "IRONMAN 70.3 Zell am See-Kaprun", "2026-08-30", "Zell am See", "Salzburg", "Austria", "sold_out"],
  ["im703-baku", "IRONMAN 70.3 Baku", "2026-09-05", "Baku", "Baku", "Azerbaijan", "open"],
  ["im703-knokke-heist", "IRONMAN 70.3 Knokke-Heist", "2026-09-06", "Knokke-Heist", "West Flanders", "Belgium", "sold_out"],
  ["im703-wisconsin", "IRONMAN 70.3 Wisconsin", "2026-09-12", "Madison", "Wisconsin", "United States", "open"],
  ["im703-world-championship-2026", "IRONMAN 70.3 World Championship Nice", "2026-09-12", "Nice", "Provence-Alpes-Cote d'Azur", "France", "qualification", { seriesSlug: "ironman-703-world-championship-nice", notes: "Two-day championship on 12-13 September 2026." }],
  ["im703-belgrade", "IRONMAN 70.3 Belgrade", "2026-09-13", "Belgrade", "Belgrade", "Serbia", "open"],
  ["im703-dali", "IRONMAN 70.3 Dali", "2026-09-13", "Dali", "Yunnan", "China", "opening_soon"],
  ["im703-erkner", "IRONMAN 70.3 Erkner", "2026-09-13", "Erkner", "Brandenburg", "Germany", "sold_out"],
  ["im703-santa-cruz", "IRONMAN 70.3 Santa Cruz", "2026-09-13", "Santa Cruz", "California", "United States", "sold_out"],
  ["im703-sunshine-coast", "IRONMAN 70.3 Sunshine Coast", "2026-09-13", "Mooloolaba", "Queensland", "Australia", "sold_out"],
  ["im703-cozumel", "IRONMAN 70.3 Cozumel", "2026-09-20", "Cozumel", "Quintana Roo", "Mexico", "open"],
  ["im703-emilia-romagna", "IRONMAN 70.3 Emilia-Romagna", "2026-09-20", "Cervia", "Emilia-Romagna", "Italy", "sold_out"],
  ["im703-michigan", "IRONMAN 70.3 Michigan", "2026-09-20", "Frankfort", "Michigan", "United States", "open"],
  ["im703-sao-paulo", "IRONMAN 70.3 Sao Paulo", "2026-09-20", "Sao Paulo", "Sao Paulo", "Brazil", "sold_out"],
  ["im703-washington-tri-cities", "IRONMAN 70.3 Washington Tri-Cities", "2026-09-20", "Richland", "Washington", "United States", "open"],
  ["im703-weymouth", "IRONMAN 70.3 Weymouth", "2026-09-20", "Weymouth", "Dorset", "England", "sold_out"],
  ["im703-new-york", "IRONMAN 70.3 New York", "2026-09-26", "Jones Beach", "New York", "United States", "open"],
  ["im703-augusta", "IRONMAN 70.3 Augusta", "2026-09-27", "Augusta", "Georgia", "United States", "open"],
  ["im703-buenos-aires", "IRONMAN 70.3 Buenos Aires", "2026-10-04", "Buenos Aires", "Buenos Aires", "Argentina", "open"],
  ["im703-waco", "IRONMAN 70.3 Waco", "2026-10-04", "Waco", "Texas", "United States", "open"],
  ["im703-encarnacion", "IRONMAN 70.3 Encarnacion", "2026-10-11", "Encarnacion", "Itapua", "Paraguay", "open"],
  ["im703-sharm-el-sheikh", "IRONMAN 70.3 Sharm El-Sheikh", "2026-10-16", "Sharm El-Sheikh", "South Sinai", "Egypt", "open"],
  ["im703-cascais", "IRONMAN 70.3 Cascais", "2026-10-17", "Cascais", "Lisbon", "Portugal", "sold_out"],
  ["im703-north-carolina", "IRONMAN 70.3 North Carolina", "2026-10-17", "Wilmington", "North Carolina", "United States", "open"],
  ["im703-florianopolis", "IRONMAN 70.3 Florianopolis", "2026-10-18", "Florianopolis", "Santa Catarina", "Brazil", "sold_out"],
  ["im703-malaga", "IRONMAN 70.3 Malaga", "2026-10-18", "Malaga", "Andalusia", "Spain", "sold_out"],
  ["im703-croatia", "IRONMAN 70.3 Porec", "2026-10-18", "Porec", "Istria", "Croatia", "sold_out"],
  ["im703-port-macquarie", "IRONMAN 70.3 Port Macquarie", "2026-10-18", "Port Macquarie", "New South Wales", "Australia", "open"],
  ["im703-dhofar", "IRONMAN 70.3 Dhofar", "2026-10-24", "Salalah", "Dhofar", "Oman", "open"],
  ["im703-agadir", "IRONMAN 70.3 Agadir", "2026-10-25", "Agadir", "Souss-Massa", "Morocco", "open"],
  ["im703-greece", "IRONMAN 70.3 Greece", "2026-10-25", "Costa Navarino", "Peloponnese", "Greece", "sold_out"],
  ["im703-kenting", "IRONMAN 70.3 Kenting", "2026-11-01", "Kenting", "Pingtung", "Taiwan", "open"],
  ["im703-melbourne", "IRONMAN 70.3 Melbourne", "2026-11-08", "Melbourne", "Victoria", "Australia", "open"],
  ["im703-langkawi", "IRONMAN 70.3 Langkawi", "2026-11-21", "Langkawi", "Kedah", "Malaysia", "open"],
  ["im703-mossel-bay", "IRONMAN 70.3 Mossel Bay", "2026-11-22", "Mossel Bay", "Western Cape", "South Africa", "open"],
  ["im703-aracaju-sergipe", "IRONMAN 70.3 Aracaju-Sergipe", "2026-11-29", "Aracaju", "Sergipe", "Brazil", "sold_out"],
  ["im703-cartagena", "IRONMAN 70.3 Cartagena", "2026-11-29", "Cartagena", "Bolivar", "Colombia", "open"],
  ["im703-valdivia", "IRONMAN 70.3 Valdivia", "2026-11-29", "Valdivia", "Los Rios", "Chile", "closed"],
  ["im703-bahrain", "IRONMAN 70.3 Bahrain", "2026-12-05", "Manama", "Capital Governorate", "Bahrain", "open"],
  ["im703-la-quinta", "IRONMAN 70.3 La Quinta", "2026-12-06", "La Quinta", "California", "United States", "open"],
  ["im703-western-australia", "IRONMAN 70.3 Western Australia", "2026-12-06", "Busselton", "Western Australia", "Australia", "sold_out"],
  ["im703-florida", "IRONMAN 70.3 Florida", "2026-12-13", "Haines City", "Florida", "United States", "open"],
  ["im703-oman", "IRONMAN 70.3 Oman", "2027-02-06", "Muscat", "Muscat", "Oman", "opening_soon"],
  ["im703-san-juan", "IRONMAN 70.3 San Juan", "2027-03-01", "San Juan", "San Juan", "Argentina", "opening_soon"],
  ["im703-new-zealand", "IRONMAN 70.3 New Zealand", "2027-03-06", "Taupo", "Waikato", "New Zealand", "open"],
  ["im703-dallas-little-elm", "IRONMAN 70.3 Dallas-Little Elm", "2027-03-14", "Little Elm", "Texas", "United States", "opening_soon"],
  ["im703-geelong", "IRONMAN 70.3 Geelong", "2027-03-21", "Geelong", "Victoria", "Australia", "opening_soon"],
  ["im703-oceanside", "IRONMAN 70.3 Oceanside", "2027-04-03", "Oceanside", "California", "United States", "unknown", { dateSource: "official-linked" }],
  ["im703-vilamoura-algarve", "IRONMAN 70.3 Vilamoura-Algarve", "2027-04-03", "Vilamoura", "Algarve", "Portugal", "opening_soon"],
  ["im703-valencia", "IRONMAN 70.3 Valencia", "2027-04-18", "Valencia", "Valencian Community", "Spain", "sold_out"],
  ["im703-venice-jesolo", "IRONMAN 70.3 Venice-Jesolo", "2027-04-24", "Jesolo", "Veneto", "Italy", "open"],
  ["im703-mallorca", "IRONMAN 70.3 Alcudia-Mallorca", "2027-05-08", "Alcudia", "Balearic Islands", "Spain", "unknown", { dateSource: "official-linked" }],
  ["im703-gulf-coast", "IRONMAN 70.3 Gulf Coast", "2027-05-08", "Panama City Beach", "Florida", "United States", "unknown", { dateSource: "official-linked" }],
  ["im703-aix-en-provence", "IRONMAN 70.3 Aix-en-Provence", "2027-05-23", "Aix-en-Provence", "Provence-Alpes-Cote d'Azur", "France", "unknown", { dateSource: "official-linked" }],
  ["im703-kraichgau", "IRONMAN 70.3 Kraichgau", "2027-05-23", "Bad Schonborn", "Baden-Wurttemberg", "Germany", "unknown", { dateSource: "official-linked" }],
  ["im703-alghero", "IRONMAN 70.3 Alghero", "2027-05-30", "Alghero", "Sardinia", "Italy", "open"],
  ["im703-bolton", "IRONMAN 70.3 Bolton", "2027-06-06", "Bolton", "Greater Manchester", "England", "opening_soon", { dateSource: "official-linked" }],
  ["im703-switzerland", "IRONMAN 70.3 Switzerland", "2027-06-06", "Rapperswil-Jona", "St. Gallen", "Switzerland", "unknown", { dateSource: "official-linked" }],
  ["im703-cairns", "IRONMAN 70.3 Cairns", "2027-06-13", "Cairns", "Queensland", "Australia", "unknown", { dateSource: "official-linked" }],
  ["im703-westfriesland", "IRONMAN 70.3 Westfriesland", "2027-06-20", "Hoorn", "North Holland", "Netherlands", "unknown", { dateSource: "official-linked" }],
  ["im703-elsinore", "IRONMAN 70.3 Elsinore", "2027-06-27", "Helsingor", "Capital Region", "Denmark", "unknown", { dateSource: "official-linked" }],
  ["im703-jonkoping", "IRONMAN 70.3 Jonkoping", "2027-07-11", "Jonkoping", "Jonkoping County", "Sweden", "unknown", { dateSource: "official-linked" }],
  ["im703-swansea", "IRONMAN 70.3 Swansea", "2027-07-11", "Swansea", "Swansea", "Wales", "unknown", { dateSource: "official-linked" }],
  ["im703-vitoria", "IRONMAN 70.3 Vitoria-Gasteiz", "2027-07-11", "Vitoria-Gasteiz", "Basque Country", "Spain", "unknown", { dateSource: "official-linked" }],
  ["im703-maine", "IRONMAN 70.3 Maine", "2027-07-18", "Augusta", "Maine", "United States", "unknown", { dateSource: "official-linked" }],
] satisfies readonly Ironman703RaceSeed[];

function officialRaceUrl(sourceSlug: string): string {
  return `https://www.ironman.com/races/${sourceSlug}`;
}

function seriesSlug(sourceSlug: string, meta?: RaceMeta): string {
  return meta?.seriesSlug ?? sourceSlug.replace(/^im703-/, "ironman-703-");
}

function entryStatus(state: RegistrationState): EntryOptionStatus {
  switch (state) {
    case "open":
      return "open";
    case "sold_out":
      return "sold_out";
    case "closed":
    case "qualification":
      return "closed";
    default:
      return "unknown";
  }
}

function editionStatus(state: RegistrationState): Edition["status"] {
  return state === "open" ? "Open" : "Closed";
}

function registrationNote(state: RegistrationState, meta?: RaceMeta): string | undefined {
  const sourceNote =
    meta?.dateSource === "official-linked"
      ? "Date confirmed by an official-linked host or event calendar; recheck the IRONMAN race page before entering."
      : undefined;
  const statusNote = (() => {
    switch (state) {
      case "opening_soon":
        return "Registration was shown as opening soon when checked on 27 August 2026.";
      case "sold_out":
        return "General registration was shown as sold out when checked on 27 August 2026.";
      case "closed":
        return "Registration was shown as closed when checked on 27 August 2026.";
      case "qualification":
        return "Entry is by qualification only.";
      case "unknown":
        return "Race date confirmed; current registration availability was not confirmed.";
      default:
        return undefined;
    }
  })();
  return [meta?.notes, statusNote, sourceNote].filter(Boolean).join(" ") || undefined;
}

export const ironman703Series: Series[] = raceSeeds.map(
  ([sourceSlug, name, , city, region, country, , meta]) => {
    const website = officialRaceUrl(sourceSlug);
    return {
      slug: seriesSlug(sourceSlug, meta),
      name,
      sport: "Triathlon",
      country,
      county: region,
      city,
      area: region,
      surface: "Mixed",
      distances: ["70.3"],
      summary: `Official IRONMAN 70.3 middle-distance triathlon in ${city}.`,
      description:
        "A 70.3-mile triathlon comprising a 1.9 km swim, 90 km bike and 21.1 km run. Dates and entry availability are sourced from the IRONMAN calendar and linked event pages.",
      organiser: "The IRONMAN Group",
      website,
      source_url: website,
    };
  },
);

export const ironman703Editions: Edition[] = raceSeeds.map(
  ([sourceSlug, , date, , , , registration, meta]) => {
    const website = officialRaceUrl(sourceSlug);
    const notes = registrationNote(registration, meta);
    return {
      seriesSlug: seriesSlug(sourceSlug, meta),
      date,
      distance: "70.3",
      distanceKm: 113,
      status: editionStatus(registration),
      entryUrl: registration === "open" ? website : undefined,
      entryOptions: [
        {
          providerCode: "ironman",
          providerName: "IRONMAN",
          entryUrl: website,
          entryType: "official",
          status: entryStatus(registration),
          checkedAt: IRONMAN_703_CALENDAR_CHECKED_AT,
          sourceUrl: website,
          isVerified: meta?.dateSource !== "official-linked",
          isPrimary: true,
          notes,
        },
      ],
      source: website,
      notes,
    };
  },
);

export const ironman703CalendarStats = {
  checkedAt: IRONMAN_703_CALENDAR_CHECKED_AT,
  races: raceSeeds.length,
  countries: new Set(raceSeeds.map((seed) => seed[5])).size,
  firstDate: raceSeeds[0]?.[2],
  lastDate: raceSeeds[raceSeeds.length - 1]?.[2],
};
