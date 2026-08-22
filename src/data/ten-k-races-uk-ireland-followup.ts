import type { Edition, EntryOptionSeed, EntryOptionStatus, Series } from "./types";

const CHECKED_AT = "2026-08-22";

type TenKCountry = "England" | "Ireland" | "Scotland" | "Wales";

type TenKSeed = {
  slug: string;
  name: string;
  date: string;
  startTime?: string;
  country: TenKCountry;
  county: string;
  city: string;
  area: string;
  surface: "Road" | "Trail" | "Mixed";
  distances?: string[];
  organiser: string;
  url: string;
  status?: Edition["status"];
  entryStatus?: EntryOptionStatus;
  hasEntry?: boolean;
  priceAmount?: number;
  priceCurrency?: "EUR" | "GBP";
  notes?: string;
};

const newSeriesSeeds: TenKSeed[] = [
  {
    slug: "runthrough-london-half-10k-february-2027",
    name: "London Half & 10K presented by TREK — February 2027",
    date: "2027-02-28",
    startTime: "09:38",
    country: "England",
    county: "Greater London",
    city: "London",
    area: "Queen Elizabeth Olympic Park",
    surface: "Road",
    distances: ["10K", "Half"],
    organiser: "RunThrough",
    url: "https://www.runthrough.co.uk/event/london-half-10k-presented-by-trek-february-2027",
    priceAmount: 31,
    priceCurrency: "GBP",
  },
  {
    slug: "runthrough-jubilee-bridge-half-10k-june-2027",
    name: "Jubilee Bridge Half Marathon & 10K — June 2027",
    date: "2027-06-06",
    startTime: "09:00",
    country: "England",
    county: "Cheshire",
    city: "Runcorn",
    area: "Silver Jubilee Bridge",
    surface: "Road",
    distances: ["10K", "Half"],
    organiser: "RunThrough",
    url: "https://www.runthrough.co.uk/event/jubilee-bridge-half-marathon-10k-june-2027",
    priceAmount: 31,
    priceCurrency: "GBP",
    notes: "Closed-road race across the Silver Jubilee Bridge between Runcorn and Widnes.",
  },
  {
    slug: "atw-love-welwyn-garden-city-10k-2027",
    name: "ATW Love Welwyn Garden City 10K 2027",
    date: "2027-02-14",
    country: "England",
    county: "Hertfordshire",
    city: "Welwyn Garden City",
    area: "Stanborough Lakes",
    surface: "Road",
    organiser: "ATW",
    url: "https://www.atwevents.co.uk/e/atw-love-welwyn-garden-city-10k-10240",
  },
  {
    slug: "atw-st-albans-easter-10k-2027",
    name: "ATW St Albans Easter 10K 2027",
    date: "2027-03-26",
    country: "England",
    county: "Hertfordshire",
    city: "St Albans",
    area: "Highfield Park and the Alban Way",
    surface: "Road",
    organiser: "ATW",
    url: "https://www.atwevents.co.uk/e/atw-st-albans-easter-10k-8962",
    notes: "Flat, single-lap tarmac route starting and finishing in Highfield Park.",
  },
  {
    slug: "hawkhurst-10k-5k-2027",
    name: "Hawkhurst 10K & 5K 2027",
    date: "2027-06-20",
    country: "England",
    county: "Kent",
    city: "Hawkhurst",
    area: "The Moor",
    surface: "Mixed",
    distances: ["10K", "5K"],
    organiser: "Highgate Hawkhurst WI / Nice Work",
    url: "https://www.nice-work.org.uk/e/hawkhurst-10k-and-5k-9426",
    status: "TBC",
    hasEntry: false,
    notes:
      "The official organiser page confirms the date and currently offers registration of interest.",
  },
  {
    slug: "romney-marsh-10k-2027",
    name: "Romney Marsh 10K 2027",
    date: "2027-07-11",
    startTime: "09:30",
    country: "England",
    county: "Kent",
    city: "New Romney",
    area: "St Martin's Field and Romney Marsh",
    surface: "Road",
    organiser: "Romney Marsh Rotary Club / Nice Work",
    url: "https://www.nice-work.org.uk/e/romney-marsh-10k-9436",
    status: "TBC",
    hasEntry: false,
    notes:
      "The official organiser page confirms the 2027 date; public entry is not currently open.",
  },
  {
    slug: "barry-island-10k-2027",
    name: "Barry Island 10K 2027",
    date: "2027-05-16",
    country: "Wales",
    county: "Vale of Glamorgan",
    city: "Barry",
    area: "Barry Island, Whitmore Bay and The Knap",
    surface: "Road",
    organiser: "Run 4 Wales",
    url: "https://www.run4wales.org/event/barry-island-10k/",
  },
  {
    slug: "porthcawl-10k-2027",
    name: "Porthcawl 10K 2027",
    date: "2027-06-27",
    country: "Wales",
    county: "Bridgend",
    city: "Porthcawl",
    area: "Porthcawl seafront",
    surface: "Road",
    organiser: "Run 4 Wales",
    url: "https://www.run4wales.org/event/porthcawl-10k/",
  },
  {
    slug: "dundalk-half-marathon-10k-2027",
    name: "Life Style Sports Dundalk Half Marathon & 10K 2027",
    date: "2027-01-31",
    startTime: "10:00",
    country: "Ireland",
    county: "County Louth",
    city: "Dundalk",
    area: "Market Square and the Dundalk countryside",
    surface: "Road",
    distances: ["10K", "Half"],
    organiser: "Bear Races / Eventmaster",
    url: "https://eventmaster.ie/event/02RwczqsA1",
    priceAmount: 32.5,
    priceCurrency: "EUR",
    notes: "Athletics Ireland permit 26/320 is shown as approved on the registration page.",
  },
  {
    slug: "galway-womens-mini-marathon-2027",
    name: "Galway Women's Mini Marathon 2027",
    date: "2027-02-01",
    startTime: "10:30",
    country: "Ireland",
    county: "County Galway",
    city: "Craughwell",
    area: "Craughwell AC and the Galway countryside",
    surface: "Road",
    organiser: "Galway Women's Mini Marathon / Eventmaster",
    url: "https://eventmaster.ie/event/noZJFplH0v",
    priceAmount: 25,
    priceCurrency: "EUR",
    notes: "Athletics Ireland permit 26/160 is shown as approved on the registration page.",
  },
  {
    slug: "donegal-town-eamon-harvey-10k-2027",
    name: "Donegal Town Eamon Harvey 10K 2027",
    date: "2027-09-11",
    startTime: "10:30",
    country: "Ireland",
    county: "County Donegal",
    city: "Donegal Town",
    area: "Abbey Vocational School",
    surface: "Road",
    organiser: "Donegal Town 10K / Eventmaster",
    url: "https://eventmaster.ie/event/MDELtbdiBz",
    priceAmount: 29,
    priceCurrency: "EUR",
    notes: "Athletics Ireland permit 26/455 is shown as approved on the registration page.",
  },
];

function entryOptionsFor(seed: TenKSeed): EntryOptionSeed[] | undefined {
  const status = seed.status ?? "Open";
  const hasEntry = seed.hasEntry ?? status !== "TBC";
  if (!hasEntry) return undefined;

  return [
    {
      providerCode: `official-${seed.slug}`,
      providerName: seed.organiser,
      entryUrl: seed.url,
      entryType: "official",
      status: seed.entryStatus ?? (status === "Closed" ? "closed" : "open"),
      ...(seed.priceAmount !== undefined ? { priceAmount: seed.priceAmount } : {}),
      ...(seed.priceCurrency ? { priceCurrency: seed.priceCurrency } : {}),
      checkedAt: CHECKED_AT,
      sourceUrl: seed.url,
      isVerified: true,
      isPrimary: true,
      notes: "Official organiser or governing-body-approved registration page.",
    },
  ];
}

export const verifiedTenKFollowupSeries: Series[] = newSeriesSeeds.map((seed) => ({
  slug: seed.slug,
  name: seed.name,
  sport: "Running",
  country: seed.country,
  county: seed.county,
  city: seed.city,
  area: seed.area,
  surface: seed.surface,
  distances: seed.distances ?? ["10K"],
  summary: `${seed.name} — an officially published 10K fixture at ${seed.area}, ${seed.city}.`,
  description: `${seed.name} is listed by ${seed.organiser}. Its date, distance, surface and entry provenance were checked against the linked official event or registration page on ${CHECKED_AT}.`,
  organiser: seed.organiser,
  website: seed.url,
  source_url: seed.url,
  ...(seed.startTime ? { defaultStartTime: seed.startTime } : {}),
}));

const newSeriesEditions: Edition[] = newSeriesSeeds.map((seed) => {
  const entryOptions = entryOptionsFor(seed);
  return {
    seriesSlug: seed.slug,
    date: seed.date,
    distance: "10K",
    distanceKm: 10,
    status: seed.status ?? "Open",
    ...(entryOptions ? { entryUrl: seed.url, entryOptions } : {}),
    ...(seed.startTime ? { startTime: seed.startTime } : {}),
    source: seed.url,
    notes: seed.notes ?? `Official source checked ${CHECKED_AT}.`,
  };
});

const addedEditionsForExistingSeries: Edition[] = [
  {
    seriesSlug: "edinburgh-running-festival",
    date: "2027-08-01",
    distance: "10K",
    distanceKm: 10,
    status: "Open",
    entryUrl: "https://www.edinburghrunningfestival.com/",
    entryOptions: [
      {
        providerCode: "official-edinburgh-running-festival-2027",
        providerName: "Edinburgh Running Festival",
        entryUrl: "https://www.edinburghrunningfestival.com/",
        entryType: "official",
        status: "open",
        priceAmount: 34,
        priceCurrency: "GBP",
        checkedAt: CHECKED_AT,
        sourceUrl: "https://www.edinburghrunningfestival.com/",
        isVerified: true,
        isPrimary: true,
      },
    ],
    startTime: "10:45",
    source: "https://www.edinburghrunningfestival.com/",
    notes: `The official event site confirms the 10K date and distance; checked ${CHECKED_AT}.`,
  },
  {
    seriesSlug: "clacton-half-marathon-10k",
    date: "2027-08-15",
    distance: "10K",
    distanceKm: 10,
    status: "TBC",
    source: "https://www.nice-work.org.uk/e/clacton-half-marathon-and-10k-9450",
    notes: `The official page confirms the 2027 date and currently offers registration of interest; checked ${CHECKED_AT}.`,
  },
  {
    seriesSlug: "mount-ephraim-10k-august",
    date: "2027-08-08",
    distance: "10K",
    distanceKm: 10,
    status: "TBC",
    source: "https://www.nice-work.org.uk/e/mount-ephraim-10k-9199",
    notes: `The official page confirms the 2027 date and currently offers registration of interest; checked ${CHECKED_AT}.`,
  },
];

export const verifiedTenKFollowupEditions: Edition[] = [
  ...newSeriesEditions,
  ...addedEditionsForExistingSeries,
];

/** Existing catalogue series corrected without creating a second event card. */
export const verifiedTenKFollowupSeriesOverrides: Record<string, Partial<Series>> = {
  "run-balmoral-harbour-energy-5k-2027": {
    name: "Run Balmoral 5K & 10K 2027",
    distances: ["5K", "10K"],
    summary: "Run Balmoral 5K & 10K — Balmoral Estate, Aberdeenshire.",
    description:
      "Run Balmoral's Saturday programme includes the Harbour Energy 5K and the mixed-surface Stena Drilling 10K on the Balmoral Estate.",
    website: "https://runbalmoral.com/content/event-info/",
    source_url: "https://runbalmoral.com/content/event-info/",
  },
  "the-chislehurst-half-marathon": {
    name: "The Maypole Project Chislehurst Half Marathon & 10K",
    distances: ["Half", "10K"],
    summary: "The Maypole Project Chislehurst Half Marathon & 10K — Chislehurst, London.",
    description:
      "An undulating, multi-terrain half marathon and new 10K option through Chislehurst's parks and commons, raising funds for The Maypole Project.",
    website: "https://www.nice-work.org.uk/e/the-maypole-project-chislehurst-half-marathon-12399",
    source_url:
      "https://www.nice-work.org.uk/e/the-maypole-project-chislehurst-half-marathon-12399",
  },
  "stansted-house-trail-run": {
    distances: ["Half", "15K", "10K"],
    description:
      "A choice of half marathon, 15K and 10K trail routes through the Stansted Estate's woodland and countryside.",
    website: "https://www.ukrunningevents.co.uk/events/trail-runs/stansted-house-trail-run-2027",
    source_url: "https://www.ukrunningevents.co.uk/events/trail-runs/stansted-house-trail-run-2027",
  },
  "edinburgh-running-festival": {
    name: "Edinburgh Running Festival",
    country: "Scotland",
    county: "City of Edinburgh",
    city: "Edinburgh",
    area: "Holyrood Park and Arthur's Seat",
    surface: "Road",
    distances: ["Half", "10K", "5K"],
    organiser: "Edinburgh Running Festival",
    website: "https://www.edinburghrunningfestival.com/",
    source_url: "https://www.edinburghrunningfestival.com/",
  },
  "clacton-half-marathon-10k": {
    city: "Clacton-on-Sea",
    county: "Essex",
    country: "England",
    area: "Seafront opposite Fourth Avenue",
    organiser: "Clacton Carnival / Nice Work",
    website: "https://www.nice-work.org.uk/e/clacton-half-marathon-and-10k-9450",
    source_url: "https://www.nice-work.org.uk/e/clacton-half-marathon-and-10k-9450",
  },
  "mount-ephraim-10k-august": {
    city: "Faversham",
    county: "Kent",
    country: "England",
    area: "Mount Ephraim Gardens, Hernhill",
    organiser: "Nice Work",
    website: "https://www.nice-work.org.uk/e/mount-ephraim-10k-9199",
    source_url: "https://www.nice-work.org.uk/e/mount-ephraim-10k-9199",
  },
};

/** Dated candidates kept out of the public catalogue until their permits or distances are confirmed. */
export const verifiedTenKFollowupResearchQueue = [
  {
    slug: "nenagh-half-marathon-10k-2027",
    date: "2027-02-21",
    country: "Ireland",
    reason: "The official registration page labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/8jxys7qTV1",
  },
  {
    slug: "runclare-eamon-moloney-ennis-10k-2027",
    date: "2027-03-21",
    country: "Ireland",
    reason: "The official registration page labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/Z7M0iMWcZY",
  },
  {
    slug: "waterford-viking-marathon-10k-2027",
    date: "2027-06-19",
    country: "Ireland",
    reason: "The official registration page labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/62vzhEpT5G",
  },
  {
    slug: "portadown-running-festival-2027",
    date: "2027-03-14",
    country: "Northern Ireland",
    reason:
      "Athletics Northern Ireland confirms the fixture date but does not publish a 10K distance.",
    sourceUrl: "https://athleticsni.org/Fixtures/Road-Running/Portadown-Running-Festival-2027",
  },
] as const;
