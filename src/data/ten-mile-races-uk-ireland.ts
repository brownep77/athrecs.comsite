import type { Edition, EntryOptionSeed, EntryOptionStatus, Series } from "./types";

const CHECKED_AT = "2026-08-22";

type TenMileCountry = "England" | "Ireland" | "Northern Ireland" | "Scotland" | "Wales";

type TenMileSeed = {
  slug: string;
  name: string;
  date: string;
  startTime?: string;
  country: TenMileCountry;
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

const newSeriesSeeds: TenMileSeed[] = [
  // Northern Ireland: Athletics Northern Ireland fixtures absent from the catalogue.
  {
    slug: "clonmore-10-mile-road-race-2026",
    name: "Clonmore 10 Mile Road Race 2026",
    date: "2026-08-30",
    startTime: "10:00",
    country: "Northern Ireland",
    county: "County Armagh",
    city: "Clonmore",
    area: "Clonmore Hall",
    surface: "Road",
    organiser: "Clonmore 10 Mile / Athletics Northern Ireland",
    url: "https://athleticsni.org/Fixtures/Clonmore-10-Mile-Road-Race-2026",
    status: "TBC",
    hasEntry: false,
    notes:
      "Athletics Northern Ireland confirms the fixture, date and start time; no direct checkout was asserted.",
  },
  {
    slug: "mckinney-games-10-mile-2026",
    name: "McKinney Games 10 Mile 2026",
    date: "2026-08-31",
    startTime: "10:10",
    country: "Northern Ireland",
    county: "County Antrim",
    city: "Lisburn",
    area: "Eikon Exhibition Centre",
    surface: "Road",
    distances: ["1K", "5K", "10K", "10mi", "20mi", "Half", "Marathon"],
    organiser: "McKinney Games",
    url: "https://www.mckinney.games/",
    priceAmount: 36.5,
    priceCurrency: "GBP",
    notes:
      "Athletics Northern Ireland confirms the rescheduled date; the organiser lists the 10-mile start, price and registration route.",
  },

  // Republic of Ireland: direct registration pages, with approved permits where stated.
  {
    slug: "mooreabbey-10-10-2026",
    name: "Mooreabbey 10/10 2026",
    date: "2026-08-30",
    startTime: "10:00",
    country: "Ireland",
    county: "County Limerick",
    city: "Galbally",
    area: "Galbally village",
    surface: "Road",
    distances: ["10K", "10mi"],
    organiser: "Mooreabbey Milers A.C.",
    url: "https://eventmaster.ie/event/D0Q2SmAcJr",
    priceAmount: 30,
    priceCurrency: "EUR",
    notes: "The direct entry page shows approved Athletics Ireland permit 26/220.",
  },
  {
    slug: "sligo-coast-to-coast-10-mile-2026",
    name: "Sligo Coast to Coast 10 Mile 2026",
    date: "2026-09-27",
    startTime: "10:30",
    country: "Ireland",
    county: "County Sligo",
    city: "Sligo",
    area: "Strandhill to Rosses Point",
    surface: "Road",
    organiser: "Sligo Athletic Club",
    url: "https://eventmaster.ie/event/LEM0Up3H76",
    notes:
      "The direct entry page shows approved permit 26/352 and a point-to-point Wild Atlantic Way course.",
  },
  {
    slug: "bundoran-10-mile-2027",
    name: "Bundoran 10 Mile 2027",
    date: "2027-03-06",
    startTime: "10:30",
    country: "Ireland",
    county: "County Donegal",
    city: "Bundoran",
    area: "Bundoran seafront and Wild Atlantic Way",
    surface: "Road",
    organiser: "Bundoran Run",
    url: "https://eventmaster.ie/event/q0OlFP7SQq",
    priceAmount: 31,
    priceCurrency: "EUR",
    notes: "The direct registration page confirms the dated 10-mile race and three-hour cut-off.",
  },
  {
    slug: "midleton-greenway-10-mile-2027",
    name: "Midleton Greenway 10 Mile 2027",
    date: "2027-03-07",
    startTime: "11:00",
    country: "Ireland",
    county: "County Cork",
    city: "Midleton",
    area: "Midleton GAA Club and Midleton–Mogeely Greenway",
    surface: "Road",
    organiser: "Aghada Running Club",
    url: "https://eventmaster.ie/event/wbRvfPySRQ",
    status: "TBC",
    hasEntry: false,
    notes:
      "The direct page shows approved permit 26/459 and a future sales window, but currently labels entries closed, so no live checkout is advertised.",
  },

  // England: official organiser and direct-registration pages for dated 2027 editions.
  {
    slug: "morecambe-festival-of-running-january-2027",
    name: "Morecambe Festival of Running — January 2027",
    date: "2027-01-10",
    startTime: "11:00",
    country: "England",
    county: "Lancashire",
    city: "Morecambe",
    area: "Heysham Cricket Club and Morecambe Promenade",
    surface: "Road",
    distances: ["5K", "10K", "10mi"],
    organiser: "Lancaster Race Series",
    url: "https://bookitzone.com/helen_mcgregor_2/6XjFFX",
    notes: "The direct entry page lists open 5K, 10K and 10-mile options starting together.",
  },
  {
    slug: "fred-hughes-10-mile-2027",
    name: "Fred Hughes 10 Mile 2027",
    date: "2027-01-17",
    country: "England",
    county: "Hertfordshire",
    city: "St Albans",
    area: "St Columba's College and Bedmond lanes",
    surface: "Road",
    organiser: "St Albans Striders",
    url: "https://www.atwevents.co.uk/e/fred-hughes-10-mile-10377/",
    status: "TBC",
    hasEntry: false,
    notes:
      "The official entry provider identifies 17 January 2027 as the next race but currently offers registration of interest.",
  },
  {
    slug: "canterbury-10-mile-road-race-2027",
    name: "Canterbury 10 Mile Road Race 2027",
    date: "2027-01-24",
    startTime: "09:00",
    country: "England",
    county: "Kent",
    city: "Canterbury",
    area: "University of Kent Sports Centre",
    surface: "Road",
    organiser: "Invicta East Kent A.C.",
    url: "https://www.canterbury10.co.uk/e/canterbury-10-mile-road-race-8571",
    notes:
      "The official event page confirms an England Athletics-licensed, largely traffic-free course.",
  },
  {
    slug: "ryde-10-mile-road-race-2027",
    name: "Ryde 10 Mile Road Race 2027",
    date: "2027-02-07",
    startTime: "11:00",
    country: "England",
    county: "Isle of Wight",
    city: "Ryde",
    area: "Ryde",
    surface: "Road",
    organiser: "Ryde Harriers",
    url: "https://www.rydeharriers.co.uk/races/the-ryde-10-mile-road-race/",
    notes: "The club race page confirms the 2027 date, start time and 31 January closing date.",
  },
  {
    slug: "bramley-10-mile-road-race-2027",
    name: "Bramley 10 Mile Road Race 2027",
    date: "2027-02-14",
    country: "England",
    county: "Hampshire",
    city: "Bramley",
    area: "Bramley Primary School",
    surface: "Road",
    organiser: "Reading Roadrunners",
    url: "https://readingroadrunners.org/races/bramley/",
    status: "TBC",
    hasEntry: false,
    notes:
      "Reading Roadrunners confirms the date and UK Athletics rules; the start time and full 2027 details remain TBA.",
  },
  {
    slug: "baddow-10-mile-road-race-2027",
    name: "Baddow 10 Mile Road Race 2027",
    date: "2027-05-16",
    startTime: "10:00",
    country: "England",
    county: "Essex",
    city: "Great Baddow",
    area: "The Recreation Ground",
    surface: "Road",
    organiser: "Rotary Baddow Races",
    url: "https://baddowraces.co.uk/",
    status: "TBC",
    hasEntry: false,
    notes:
      "The organiser confirms the 2027 date and start time, while its displayed entry-fee schedule still refers to 2026.",
  },

  // Wales: one road race and two trail events with live official entry routes.
  {
    slug: "llandudno-half-marathon-10-mile-2027",
    name: "Llandudno Half Marathon & 10 Mile 2027",
    date: "2027-04-04",
    startTime: "10:00",
    country: "Wales",
    county: "Conwy",
    city: "Llandudno",
    area: "Venue Cymru and Llandudno Promenade",
    surface: "Road",
    distances: ["10mi", "Half"],
    organiser: "Run Wales",
    url: "https://www.runwales.com/e/llandudno-half-marathon-and-10-mile-9601",
    notes: "The organiser confirms both race distances, the date, start time and promenade course.",
  },
  {
    slug: "vale-coastal-trail-10-mile-2027",
    name: "Vale Coastal Trail 10 Mile 2027",
    date: "2027-04-24",
    startTime: "11:00",
    country: "Wales",
    county: "Vale of Glamorgan",
    city: "Llantwit Major",
    area: "Llantwit Major Beach to Ogmore-by-Sea",
    surface: "Trail",
    distances: ["10mi", "18.5mi", "Ultra"],
    organiser: "Run Walk Crawl",
    url: "https://www.runwalkcrawl.co.uk/vale-coastal-trail-races-2027",
    priceAmount: 40,
    priceCurrency: "GBP",
    notes: "The official event page confirms the linear Wales Coast Path route and live entry.",
  },
  {
    slug: "ott-trail-marathon-10-mile-2027",
    name: "OTT Trail Marathon & 10 Mile Trail Race 2027",
    date: "2027-05-15",
    startTime: "10:00",
    country: "Wales",
    county: "Merthyr Tydfil",
    city: "Merthyr Tydfil",
    area: "Parkwood Outdoors, Dolygaer",
    surface: "Trail",
    distances: ["10mi", "Marathon"],
    organiser: "Off The Tarmac",
    url: "https://www.sientries.co.uk/event/ott-marathon-10-mile-race-2027",
    notes:
      "The direct entry page confirms the 10-mile trail option, date, start time and open entries.",
  },
];

function entryOptionsFor(seed: TenMileSeed): EntryOptionSeed[] | undefined {
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
      notes: "Official organiser, governing-body or direct event-registration page.",
    },
  ];
}

export const verifiedTenMileSeries: Series[] = newSeriesSeeds.map((seed) => ({
  slug: seed.slug,
  name: seed.name,
  sport: "Running",
  country: seed.country,
  county: seed.county,
  city: seed.city,
  area: seed.area,
  surface: seed.surface,
  distances: seed.distances ?? ["10mi"],
  summary: `${seed.name} — an officially published 10-mile fixture at ${seed.area}, ${seed.city}.`,
  description: `${seed.name} is listed by ${seed.organiser}. Its date, distance, surface and entry provenance were checked against the linked official event or registration page on ${CHECKED_AT}.`,
  organiser: seed.organiser,
  website: seed.url,
  source_url: seed.url,
  ...(seed.startTime ? { defaultStartTime: seed.startTime } : {}),
}));

export const verifiedTenMileEditions: Edition[] = newSeriesSeeds.map((seed) => {
  const entryOptions = entryOptionsFor(seed);
  return {
    seriesSlug: seed.slug,
    date: seed.date,
    distance: "10mi",
    distanceKm: 16.09,
    status: seed.status ?? "Open",
    ...(entryOptions ? { entryUrl: seed.url, entryOptions } : {}),
    ...(seed.startTime ? { startTime: seed.startTime } : {}),
    source: seed.url,
    notes: seed.notes ?? `Official source checked ${CHECKED_AT}.`,
  };
});

/** Existing multi-distance cards corrected to expose their confirmed 10-mile option. */
export const verifiedTenMileSeriesOverrides: Record<string, Partial<Series>> = {
  "lee-valley-velo-park-january-2027": {
    distances: ["Half", "10mi", "10K", "5K"],
    description:
      "A choice of half marathon, 10 mile, 10K and 5K races on the gently undulating, traffic-free one-mile road circuit at Lee Valley VeloPark.",
  },
  "lee-valley-velo-park-april-2027": {
    name: "Lee Valley VeloPark Half Marathon, 10 Mile, 10K & 5K — April 2027",
    distances: ["Half", "10mi", "10K", "5K", "1M"],
    description:
      "A choice of half marathon, 10 mile, 10K, 5K and mile races on the traffic-free one-mile road circuit at Lee Valley VeloPark.",
  },
  "runthrough-lee-valley-june-2027": {
    name: "Lee Valley VeloPark Half Marathon, 10 Mile, 10K & 5K — June 2027",
    distances: ["5K", "10K", "10mi", "Half"],
    summary: "Lee Valley VeloPark multi-distance races — June 2027, London.",
    description:
      "Half marathon, 10 mile, 10K and 5K races on the traffic-free one-mile road circuit at Lee Valley VeloPark.",
  },
  "runthrough-lee-valley-august-2027": {
    name: "Lee Valley VeloPark Half Marathon, 10 Mile, 10K & 5K — August 2027",
    distances: ["5K", "10K", "10mi", "Half"],
    summary: "Lee Valley VeloPark multi-distance races — August 2027, London.",
    description:
      "Half marathon, 10 mile, 10K and 5K races on the traffic-free one-mile road circuit at Lee Valley VeloPark.",
  },
  "runthrough-lee-valley-october-2027": {
    name: "Lee Valley VeloPark Half Marathon, 10 Mile, 10K & 5K — October 2027",
    distances: ["5K", "10K", "10mi", "Half"],
    summary: "Lee Valley VeloPark multi-distance races — October 2027, London.",
    description:
      "Half marathon, 10 mile, 10K and 5K races on the traffic-free one-mile road circuit at Lee Valley VeloPark.",
  },
  "runthrough-lee-valley-december-2027": {
    name: "Lee Valley VeloPark Half Marathon, 10 Mile, 10K & 5K — December 2027",
    distances: ["5K", "10K", "10mi", "Half"],
    summary: "Lee Valley VeloPark multi-distance races — December 2027, London.",
    description:
      "Half marathon, 10 mile, 10K and 5K races on the traffic-free one-mile road circuit at Lee Valley VeloPark.",
  },
};

/** Candidates held out of the public catalogue until their permit or exact date is confirmed. */
export const verifiedTenMileResearchQueue = [
  {
    slug: "gorey-courtown-10-mile-2026",
    date: "2026-08-23",
    country: "Ireland",
    reason: "The Athletics Ireland calendar labels the race permit as pending approval.",
    sourceUrl: "https://athleticsireland.eventmaster.ie/event-calendar/",
  },
  {
    slug: "kinsale-10-mile-2027",
    date: "2027-02-28",
    country: "Ireland",
    reason: "The direct registration page labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/v7jyuPoSb4",
  },
  {
    slug: "runclare-kilkishen-10-mile-2027",
    date: "2027-04-10",
    country: "Ireland",
    reason: "The direct series registration page labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/Z7M0iMWcZY",
  },
  {
    slug: "lets-run-rhyl-10-mile-2027",
    date: null,
    country: "Wales",
    reason:
      "The organiser homepage shows 28 February 2027, but the event detail page still says the February date is TBC.",
    sourceUrl: "https://www.runwales.com/e/lets-run-rhyl-5-mile-and-10-mile-8640",
  },
] as const;
