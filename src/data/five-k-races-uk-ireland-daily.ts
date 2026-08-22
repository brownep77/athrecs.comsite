import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-22";

type DailyFiveKSeed = {
  slug: string;
  name: string;
  date: string;
  startTime: string;
  country: "England" | "Ireland";
  county: string;
  city: string;
  area: string;
  surface: "Road" | "Track" | "Mixed" | "Trail" | "Cross Country";
  distances: string[];
  organiser: string;
  url: string;
  notes?: string;
};

const dailySeeds: DailyFiveKSeed[] = [
  {
    slug: "dunboyne-track-5k-2026",
    name: "Dunboyne Track 5K 2026",
    date: "2026-08-27",
    startTime: "18:30",
    country: "Ireland",
    county: "County Meath",
    city: "Dunboyne",
    area: "Dunboyne Athletic Club",
    surface: "Track",
    distances: ["1 Mile", "5K"],
    organiser: "Dunboyne Athletic Club",
    url: "https://eventmaster.ie/custom/event/dbtrack26",
    notes:
      "Multiple pace-based 5K track heats; Athletics Ireland permit 25/611 was approved when checked.",
  },
  {
    slug: "seamie-weldon-5k-10k-2026",
    name: "Seamie Weldon 5K & 10K Road Race 2026",
    date: "2026-09-05",
    startTime: "17:30",
    country: "Ireland",
    county: "County Louth",
    city: "Ardee",
    area: "Ardee Community School",
    surface: "Road",
    distances: ["5K", "10K"],
    organiser: "Ardee & District Athletic Club",
    url: "https://eventmaster.ie/event/kVM2TK2TA2",
    notes: "Athletics Ireland permit 26/318 was approved when checked.",
  },
  {
    slug: "horsted-keynes-fun-run-5k-2026",
    name: "Horsted Keynes Fun Run 5K 2026",
    date: "2026-09-19",
    startTime: "09:50",
    country: "England",
    county: "West Sussex",
    city: "Haywards Heath",
    area: "Horsted Keynes Recreation Ground",
    surface: "Trail",
    distances: ["2.5K", "5K", "8K"],
    organiser: "The Friends of St Giles School PTA",
    url: "https://racebest.com/races/92t2k",
    notes:
      "The 5K follows countryside trails over footpaths, bridleways and country lanes; the 5K start is 09:50.",
  },
  {
    slug: "savills-sandymount-night-run-5k-october-2026",
    name: "Savills Sandymount Night Run 5K — October 2026",
    date: "2026-10-20",
    startTime: "19:20",
    country: "Ireland",
    county: "County Dublin",
    city: "Dublin",
    area: "Sandymount",
    surface: "Road",
    distances: ["5K", "10K"],
    organiser: "Bear Races",
    url: "https://eventmaster.ie/event/DOrzUmAcJr",
    notes: "The direct-registration description gives the 5K start as 19:20.",
  },
  {
    slug: "skipton-santa-fun-run-5k-2026",
    name: "Skipton Santa Fun Run 5K 2026",
    date: "2026-11-29",
    startTime: "11:00",
    country: "England",
    county: "North Yorkshire",
    city: "Skipton",
    area: "Skipton High Street",
    surface: "Mixed",
    distances: ["3K", "5K"],
    organiser: "Rotary Clubs of Skipton and Skipton Craven",
    url: "https://racebest.com/races/36zkv",
    notes: "The organiser describes the event as multi-terrain.",
  },
  {
    slug: "bedale-santa-run-5k-2026",
    name: "Bedale Santa Run 5K 2026",
    date: "2026-12-13",
    startTime: "10:15",
    country: "England",
    county: "North Yorkshire",
    city: "Bedale",
    area: "Bedale Park and Keepers Walk",
    surface: "Mixed",
    distances: ["1 Mile", "5K"],
    organiser: "Bedale and Aiskew Runners",
    url: "https://racebest.com/races/6s63f",
    notes: "The event narrative gives the 5K start as 10:15 and describes a multi-terrain route.",
  },
  {
    slug: "winter-solstice-strider-5k-2026",
    name: "Winter Solstice Strider 5K 2026",
    date: "2026-12-21",
    startTime: "19:30",
    country: "England",
    county: "West Yorkshire",
    city: "Bingley",
    area: "St Ives Estate",
    surface: "Trail",
    distances: ["5K", "10K"],
    organiser: "Sue Ryder Manorlands Hospice",
    url: "https://racebest.com/races/8v6xt",
    notes:
      "This edition represents the physical trail event; its separate virtual option is excluded.",
  },
  {
    slug: "keighley-10k-5k-2027",
    name: "Keighley 10K & 5K 2027",
    date: "2027-03-07",
    startTime: "09:00",
    country: "England",
    county: "West Yorkshire",
    city: "Keighley",
    area: "Victoria Park",
    surface: "Mixed",
    distances: ["5K", "10K"],
    organiser: "Sue Ryder Manorlands Hospice",
    url: "https://racebest.com/races/gc4he",
    notes: "The organiser describes the course as undulating and multi-terrain.",
  },
  {
    slug: "wakefield-hospice-5k-2027",
    name: "Wakefield Hospice 5K 2027",
    date: "2027-03-14",
    startTime: "09:00",
    country: "England",
    county: "West Yorkshire",
    city: "Wakefield",
    area: "Thornes Park",
    surface: "Road",
    distances: ["5K"],
    organiser: "Wakefield Hospice",
    url: "https://racebest.com/races/f5vv7",
    notes:
      "The direct entry is open and the race date is confirmed; the listing says its UKA licence application remains outstanding.",
  },
  {
    slug: "paintrush-5k-2027",
    name: "PaintRush 5K 2027",
    date: "2027-06-13",
    startTime: "13:00",
    country: "England",
    county: "West Yorkshire",
    city: "Silsden",
    area: "Jackson's Field",
    surface: "Cross Country",
    distances: ["5K"],
    organiser: "Sue Ryder",
    url: "https://racebest.com/races/u9qcx",
    notes: "A physical 5K colour run listed as cross-country by the registration provider.",
  },
];

function entryOptionsFor(seed: DailyFiveKSeed): EntryOptionSeed[] {
  return [
    {
      providerCode: `official-${seed.slug}`,
      providerName: seed.organiser,
      entryUrl: seed.url,
      entryType: "official",
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl: seed.url,
      isVerified: true,
      isPrimary: true,
      notes: "Official organiser or direct event-registration page.",
    },
  ];
}

export const dailyFiveKSeries: Series[] = dailySeeds.map((seed) => ({
  slug: seed.slug,
  name: seed.name,
  sport: "Running",
  country: seed.country,
  county: seed.county,
  city: seed.city,
  area: seed.area,
  surface: seed.surface,
  distances: seed.distances,
  summary: `${seed.name} — an officially published 5K fixture at ${seed.area}, ${seed.city}.`,
  description: `${seed.name} is listed by ${seed.organiser}. Date, start time, surface and entry provenance were checked against the linked event or registration page on ${CHECKED_AT}.`,
  organiser: seed.organiser,
  website: seed.url,
  source_url: seed.url,
  defaultStartTime: seed.startTime,
}));

export const dailyFiveKEditions: Edition[] = dailySeeds.map((seed) => ({
  seriesSlug: seed.slug,
  date: seed.date,
  distance: "5K",
  distanceKm: 5,
  status: "Open",
  entryUrl: seed.url,
  entryOptions: entryOptionsFor(seed),
  startTime: seed.startTime,
  source: seed.url,
  notes: `${seed.notes ?? "Official race details confirmed."} Source checked ${CHECKED_AT}.`,
}));

/** Announced candidates held out of the catalogue until their evidence gap is resolved. */
export const dailyFiveKResearchQueue = [
  {
    slug: "portmarnock-ac-beach-5k-2026",
    date: "2026-08-28",
    country: "Ireland",
    reason: "The official registration page still labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/v26rtPoSb4",
  },
  {
    slug: "st-lukes-5k-run-to-remember-2026",
    date: "2026-08-27",
    country: "Ireland",
    reason:
      "The previously indexed direct-registration URL no longer resolves to a stable event page.",
    sourceUrl: "https://eventmaster.ie/event/nq9bUplH0v",
  },
] as const;
