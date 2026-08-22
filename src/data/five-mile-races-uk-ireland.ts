import type { Edition, EntryOptionSeed, EntryOptionStatus, Series } from "./types";

const CHECKED_AT = "2026-08-22";

type FiveMileCountry = "England" | "Ireland" | "Northern Ireland" | "Scotland" | "Wales";

type FiveMileDateSeed = {
  date: string;
  startTime?: string;
  status?: Edition["status"];
  entryStatus?: EntryOptionStatus;
  hasEntry?: boolean;
  notes?: string;
};

type FiveMileSeed = {
  slug: string;
  name: string;
  country: FiveMileCountry;
  county: string;
  city: string;
  area: string;
  surface: "Road" | "Trail" | "Mixed";
  distances?: string[];
  organiser: string;
  url: string;
  dates: FiveMileDateSeed[];
  notes?: string;
};

const seeds: FiveMileSeed[] = [
  // Northern Ireland: governing-body fixtures missing from the imported five-mile calendar.
  {
    slug: "portrush-5-mile-road-race-2026",
    name: "Portrush 5 Mile Road Race 2026",
    country: "Northern Ireland",
    county: "County Antrim",
    city: "Portrush",
    area: "West Strand",
    surface: "Road",
    organiser: "Portrush 5 / Athletics Northern Ireland",
    url: "https://athleticsni.org/Fixtures/Road-Running/Portrush-5-Mile-Road-Race",
    dates: [
      {
        date: "2026-08-28",
        startTime: "19:30",
        status: "TBC",
        hasEntry: false,
        notes:
          "Athletics Northern Ireland confirms the fixture, date and start time; no direct checkout was asserted.",
      },
    ],
  },
  {
    slug: "heath-graham-ards-5-mile-2026",
    name: "Heath Graham Ards 5 Mile 2026",
    country: "Northern Ireland",
    county: "County Down",
    city: "Newtownards",
    area: "Londonderry Park",
    surface: "Road",
    organiser: "Scrabo Striders",
    url: "https://www.scrabostriders.com/open-races",
    dates: [{ date: "2026-09-04", startTime: "19:00" }],
    notes:
      "The club entry calendar and Athletics Northern Ireland fixture agree on the race details.",
  },

  // Wales: three measured night races on the old Severn Bridge.
  {
    slug: "severn-bridge-5-night-races-2026",
    name: "Severn Bridge 5 Night Races 2026",
    country: "Wales",
    county: "Monmouthshire",
    city: "Chepstow",
    area: "Old Severn Bridge",
    surface: "Road",
    organiser: "Rogue Runs",
    url: "https://sites.google.com/site/roguerunsevents/home/our-events/sb-night-runs",
    dates: [
      { date: "2026-10-29", startTime: "19:30", notes: "Halloween night race." },
      { date: "2026-11-19", startTime: "19:30" },
      { date: "2026-12-17", startTime: "19:30", notes: "Christmas night race." },
    ],
    notes: "The organiser describes an accurately measured, entirely tarmac five-mile route.",
  },

  // Scotland: one licensed road race and one dated mixed-terrain 2027 fixture.
  {
    slug: "glasgow-university-des-gilmore-5-mile-2026",
    name: "Glasgow University Des Gilmore 5 Mile Road Race 2026",
    country: "Scotland",
    county: "Glasgow City",
    city: "Glasgow",
    area: "Garscube Sports Complex",
    surface: "Road",
    organiser: "Glasgow University Hares & Hounds",
    url: "https://www.entrycentral.com/glasgow-5-mile",
    dates: [{ date: "2026-10-17", startTime: "12:00" }],
    notes: "The direct entry page confirms a Scottish Athletics licensed, UKA-certified course.",
  },
  {
    slug: "scurry-around-cramond-island-5-mile-2027",
    name: "Scurry Around Cramond Island 5 Mile 2027",
    country: "Scotland",
    county: "City of Edinburgh",
    city: "Edinburgh",
    area: "Cramond Island",
    surface: "Mixed",
    organiser: "Scurry Events",
    url: "https://scurryevents.co.uk/event/scurry-sround-cramond-island-5-mile-run/",
    dates: [
      {
        date: "2027-05-28",
        status: "TBC",
        hasEntry: false,
        notes: "The organiser has dated the event but says entries will go live in 2027.",
      },
    ],
    notes:
      "The official listing describes a multi-terrain sunset race across tidal Cramond Island.",
  },

  // Republic of Ireland: approved Athletics Ireland permits only.
  {
    slug: "beara-glengarriff-5-mile-2026",
    name: "Glengarriff 5 Mile 2026",
    country: "Ireland",
    county: "County Cork",
    city: "Glengarriff",
    area: "Glengarriff",
    surface: "Road",
    organiser: "Beara A.C.",
    url: "https://eventmaster.ie/event/noYbiplH0v",
    dates: [{ date: "2026-09-05", startTime: "16:30" }],
    notes: "Part of the permit-approved Beara A.C. Autumn 5 Mile Series (permit 26/447).",
  },
  {
    slug: "beara-allihies-5-mile-2026",
    name: "Allihies 5 Mile 2026",
    country: "Ireland",
    county: "County Cork",
    city: "Allihies",
    area: "Allihies",
    surface: "Road",
    organiser: "Beara A.C.",
    url: "https://eventmaster.ie/event/noYbiplH0v",
    dates: [{ date: "2026-09-26", startTime: "14:30" }],
    notes: "Part of the permit-approved Beara A.C. Autumn 5 Mile Series (permit 26/447).",
  },
  {
    slug: "beara-bere-island-5-mile-2026",
    name: "Bere Island 5 Mile 2026",
    country: "Ireland",
    county: "County Cork",
    city: "Bere Island",
    area: "Bere Island",
    surface: "Road",
    organiser: "Beara A.C.",
    url: "https://eventmaster.ie/event/noYbiplH0v",
    dates: [{ date: "2026-10-17", startTime: "14:30" }],
    notes: "Part of the permit-approved Beara A.C. Autumn 5 Mile Series (permit 26/447).",
  },
  {
    slug: "beara-eyeries-5-mile-2026",
    name: "Eyeries 5 Mile 2026",
    country: "Ireland",
    county: "County Cork",
    city: "Eyeries",
    area: "Eyeries",
    surface: "Road",
    organiser: "Beara A.C.",
    url: "https://eventmaster.ie/event/noYbiplH0v",
    dates: [{ date: "2026-11-07", startTime: "14:30" }],
    notes: "Part of the permit-approved Beara A.C. Autumn 5 Mile Series (permit 26/447).",
  },
  {
    slug: "lucan-harriers-5-mile-road-race-2026",
    name: "Lucan Harriers 5 Mile Road Race 2026",
    country: "Ireland",
    county: "County Dublin",
    city: "Lucan",
    area: "Lucan Harriers",
    surface: "Road",
    organiser: "Lucan Harriers",
    url: "https://eventmaster.ie/event/rYWWuPmS9y",
    dates: [{ date: "2026-09-13", startTime: "10:00" }],
    notes: "Athletics Ireland permit 26/365 is approved on the direct entry page.",
  },
  {
    slug: "tommy-ryan-memorial-carrigaline-5-mile-2027",
    name: "Tommy Ryan Memorial Carrigaline 5 Mile 2027",
    country: "Ireland",
    county: "County Cork",
    city: "Carrigaline",
    area: "Carrigaline",
    surface: "Road",
    organiser: "Eagle A.C.",
    url: "https://eventmaster.ie/event/02ObczqsA1",
    dates: [
      {
        date: "2027-02-14",
        startTime: "10:00",
        status: "TBC",
        hasEntry: false,
        notes:
          "Athletics Ireland permit 26/460 is approved; online sales are scheduled to open 1 January 2027.",
      },
    ],
  },

  // England: dated official organiser pages, including 2027 editions of three existing series.
  {
    slug: "southend-rudolph-run-2026",
    name: "Southend Rudolph Run 2026",
    country: "England",
    county: "Essex",
    city: "Southend-on-Sea",
    area: "The Esplanade",
    surface: "Road",
    organiser: "Nice Work",
    url: "https://www.nice-work.org.uk/e/southend-rudolph-run-9240",
    dates: [{ date: "2026-12-13", startTime: "10:30" }],
    notes: "The official course is a flat tarmac path and promenade race.",
  },
  {
    slug: "atw-bedford-5-and-10-2027",
    name: "ATW Bedford 5 & 10 2027",
    country: "England",
    county: "Bedfordshire",
    city: "Bedford",
    area: "Russell Park and Bedford Embankment",
    surface: "Mixed",
    distances: ["5mi", "10mi"],
    organiser: "ATW Events",
    url: "https://www.atwevents.co.uk/e/atw-bedford-5-and-10-8922",
    dates: [{ date: "2027-01-24" }],
    notes: "The traffic-free lap combines tarmac with firm riverside paths.",
  },
  {
    slug: "ashdown-forest-10-5-mile-winter-challenge-2027",
    name: "Ashdown Forest 10 & 5 Mile Winter Challenge 2027",
    country: "England",
    county: "East Sussex",
    city: "Uckfield",
    area: "Pippingford Park Manor",
    surface: "Trail",
    distances: ["5mi", "10mi"],
    organiser: "Running Hub / Nice Work",
    url: "https://www.nice-work.org.uk/e/ashdown-forest-10-and-5-mile-10707",
    dates: [{ date: "2027-01-24" }],
  },
  {
    slug: "bedgebury-forest-10-5-mile-2027",
    name: "Bedgebury Forest 10 & 5 Mile 2027",
    country: "England",
    county: "Kent",
    city: "Goudhurst",
    area: "Bedgebury National Pinetum & Forest",
    surface: "Trail",
    distances: ["5mi", "10mi"],
    organiser: "Nice Work",
    url: "https://www.nice-work.org.uk/e/bedgebury-forest-10-and-5-mile-9014",
    dates: [{ date: "2027-02-07" }],
  },
  {
    slug: "cannock-chase-10-5-mile",
    name: "Cannock Chase 20, 15, 10 & 5 Mile",
    country: "England",
    county: "Staffordshire",
    city: "Rugeley",
    area: "Cannock Chase Forest",
    surface: "Mixed",
    distances: ["5mi", "10mi", "15mi", "20mi"],
    organiser: "Nice Work",
    url: "https://www.nice-work.org.uk/e/cannock-chase-forest-20-15-10-and-5-mile-9035",
    dates: [
      {
        date: "2027-02-14",
        status: "TBC",
        hasEntry: false,
        notes:
          "The organiser has published the date but currently offers registration of interest.",
      },
    ],
  },
  {
    slug: "ashford-district-girlings-may-10k",
    name: "Girlings Ashford & District RRC 10 & 5 Mile",
    country: "England",
    county: "Kent",
    city: "Ashford",
    area: "Towers School, Kennington",
    surface: "Road",
    distances: ["5mi", "10mi"],
    organiser: "Ashford & District RRC / Nice Work",
    url: "https://www.nice-work.org.uk/e/girlings-ashford-and-district-rrc-10-and-5-mile-12895",
    dates: [
      {
        date: "2027-02-21",
        status: "TBC",
        hasEntry: false,
        notes:
          "The organiser has published the date but currently offers registration of interest.",
      },
    ],
  },
  {
    slug: "pendle-5-mile-trail-race-2027",
    name: "Pendle 5 Mile Trail Race 2027",
    country: "England",
    county: "Lancashire",
    city: "Barley",
    area: "Pendle Inn",
    surface: "Trail",
    organiser: "Pendle Trail Running Club",
    url: "https://www.sientries.co.uk/event/pendle-5-mile-trail-race-2027?elid=Y",
    dates: [{ date: "2027-03-20", startTime: "09:30" }],
    notes: "The entry page confirms a TRA-licensed event held under UK Athletics rules.",
  },
  {
    slug: "stort10-5-mile-trail-race-2027",
    name: "Stort10 5 Mile Trail Race 2027",
    country: "England",
    county: "Essex",
    city: "Hatfield Broad Oak",
    area: "Cammas Hall Farm",
    surface: "Mixed",
    distances: ["5mi", "10mi"],
    organiser: "Stort10 / Bishop's Stortford Running Club",
    url: "https://www.stort10.co.uk/",
    dates: [{ date: "2027-05-16", startTime: "10:00" }],
    notes: "The course uses farm tracks, fields, woodland paths and short road sections.",
  },
  {
    slug: "bewl-15-5-mile-2027",
    name: "Bewl 15 & 5 Mile 2027",
    country: "England",
    county: "East Sussex",
    city: "Wadhurst",
    area: "Bewl Water",
    surface: "Trail",
    distances: ["5mi", "15mi"],
    organiser: "Wadhurst Runners / Nice Work",
    url: "https://www.nice-work.org.uk/e/bewl-15-and-5-mile-9431",
    dates: [
      {
        date: "2027-07-04",
        startTime: "09:30",
        status: "Closed",
        entryStatus: "closed",
        notes: "The organiser's future event page currently marks online entry as closed.",
      },
    ],
    notes: "The five-mile course is entirely off-road on the trails beside Bewl Water.",
  },
  {
    slug: "arthur-whiston-5-mile-2027",
    name: "Arthur Whiston 5 Mile 2027",
    country: "England",
    county: "Essex",
    city: "Colchester",
    area: "Colchester Garrison Track and Abbey Field",
    surface: "Mixed",
    organiser: "Colchester Harriers AC / Nice Work",
    url: "https://www.nice-work.org.uk/e/arthur-whiston-5-mile-13137",
    dates: [
      {
        date: "2027-07-18",
        status: "TBC",
        hasEntry: false,
        notes:
          "The organiser has published the date but currently offers registration of interest.",
      },
    ],
    notes: "The route combines tarmac, track and traffic-free paths.",
  },
  {
    slug: "st-agnes-5-miler-2027",
    name: "St Agnes 5 Miler 2027",
    country: "England",
    county: "Cornwall",
    city: "St Agnes",
    area: "St Agnes Beacon",
    surface: "Road",
    organiser: "Cornwall Road Running Grand Prix / Truro Running Club",
    url: "https://cornwallrunning.co.uk/",
    dates: [
      {
        date: "2027-06-23",
        status: "TBC",
        hasEntry: false,
        notes:
          "The official Cornwall Grand Prix diary confirms Wednesday 23 June 2027; entry details are not yet published.",
      },
    ],
  },
];

function entryOptionsFor(
  seed: FiveMileSeed,
  dateSeed: FiveMileDateSeed,
): EntryOptionSeed[] | undefined {
  const status = dateSeed.status ?? "Open";
  const hasEntry = dateSeed.hasEntry ?? status !== "TBC";
  if (!hasEntry) return undefined;

  return [
    {
      providerCode: `official-${seed.slug}-${dateSeed.date}`,
      providerName: seed.organiser,
      entryUrl: seed.url,
      entryType: "official",
      status: dateSeed.entryStatus ?? (status === "Closed" ? "closed" : "open"),
      checkedAt: CHECKED_AT,
      sourceUrl: seed.url,
      isVerified: true,
      isPrimary: true,
      notes: "Official organiser, governing-body or direct event-registration page.",
    },
  ];
}

export const verifiedFiveMileSeries: Series[] = seeds.map((seed) => ({
  slug: seed.slug,
  name: seed.name,
  sport: "Running",
  country: seed.country,
  county: seed.county,
  city: seed.city,
  area: seed.area,
  surface: seed.surface,
  distances: seed.distances ?? ["5mi"],
  summary: `${seed.name} — an officially published five-mile fixture at ${seed.area}, ${seed.city}.`,
  description: `${seed.name} is listed by ${seed.organiser}. Date, surface and entry provenance were checked against the linked event or registration page on ${CHECKED_AT}.`,
  organiser: seed.organiser,
  website: seed.url,
  source_url: seed.url,
  ...(seed.dates.length === 1 && seed.dates[0].startTime
    ? { defaultStartTime: seed.dates[0].startTime }
    : {}),
}));

export const verifiedFiveMileEditions: Edition[] = seeds.flatMap((seed) =>
  seed.dates.map((dateSeed) => {
    const entryOptions = entryOptionsFor(seed, dateSeed);
    return {
      seriesSlug: seed.slug,
      date: dateSeed.date,
      distance: "5mi",
      distanceKm: 8.05,
      status: dateSeed.status ?? "Open",
      ...(entryOptions ? { entryUrl: seed.url, entryOptions } : {}),
      ...(dateSeed.startTime ? { startTime: dateSeed.startTime } : {}),
      source: seed.url,
      notes: dateSeed.notes ?? seed.notes ?? `Source checked ${CHECKED_AT}.`,
    };
  }),
);

/** Official corrections for five-mile races already present in another catalogue source. */
export const verifiedFiveMileSeriesOverrides: Record<string, Partial<Series>> = {
  "m10-swansea": {
    name: "M10 Swansea 5 & 10 Mile 2027",
    country: "Wales",
    county: "Swansea",
    city: "Swansea",
    area: "Brynmill and Swansea Bay Promenade",
    surface: "Road",
    distances: ["5mi", "10mi"],
    organiser: "Aspire X Events",
    website: "https://www.aspirexevents.com/e/m10-swansea-14119",
    source_url: "https://www.aspirexevents.com/e/m10-swansea-14119",
    defaultStartTime: "09:15",
  },
};

export const verifiedFiveMileEditionOverrides: Record<string, Partial<Edition>> = {
  "m10-swansea|2027-03-21|10mi": {
    date: "2027-02-28",
    distance: "5mi",
    distanceKm: 8.05,
    startTime: "09:15",
    entryUrl: "https://www.aspirexevents.com/e/m10-swansea-14119",
    entryOptions: [
      {
        providerCode: "official-m10-swansea-2027-02-28",
        providerName: "Aspire X Events",
        entryUrl: "https://www.aspirexevents.com/e/m10-swansea-14119",
        entryType: "official",
        status: "open",
        checkedAt: CHECKED_AT,
        sourceUrl: "https://www.aspirexevents.com/e/m10-swansea-14119",
        isVerified: true,
        isPrimary: true,
        notes: "Official organiser entry page.",
      },
    ],
    source: "https://www.aspirexevents.com/e/m10-swansea-14119",
    notes: "The official organiser confirms the 5-mile race on 28 February 2027.",
  },
};

/** Candidates kept out of the public catalogue until their permit or date is confirmed. */
export const verifiedFiveMileResearchQueue = [
  {
    slug: "garrettstown-5-mile-2027",
    date: "2027-04-11",
    country: "Ireland",
    reason: "The official registration page labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/PK79UJDhLe",
  },
  {
    slug: "runclare-whitegate-5-mile-2027",
    date: "2027-02-20",
    country: "Ireland",
    reason: "The official registration page labels the Athletics Ireland permit as pending.",
    sourceUrl: "https://eventmaster.ie/event/Z7M0iMWcZY",
  },
  {
    slug: "hellhole-5-mile-trail-race-2026",
    date: "2026-10-18",
    country: "England",
    reason: "The direct entry page says the Trail Runners Association permit number is still TBA.",
    sourceUrl: "https://www.sientries.co.uk/event/hellhole-5-mile-trail-race-2026",
  },
  {
    slug: "falmouth-mob-match-2026",
    date: "2026-11-29",
    country: "England",
    reason: "The direct entry page explicitly labels the race licence as pending.",
    sourceUrl: "https://www.sientries.co.uk/event/falmouth-mob-match-2026",
  },
  {
    slug: "preston-harriers-5-mile-run-2026",
    date: "2026-11-15",
    country: "England",
    reason: "The direct entry page still shows the UK Athletics race licence as TBC.",
    sourceUrl: "https://bookitzone.com/preston_harriers_1/iPjFFX",
  },
  {
    slug: "plough-and-harroween-5-mile-2027",
    date: "2027-10-31",
    country: "England",
    reason:
      "The official registration page says the Trail Runners Association permit is in progress.",
    sourceUrl: "https://www.entrycentral.com/event/125241",
  },
  {
    slug: "lets-run-rhyl-5-mile-2027",
    date: "2027-02-28",
    country: "Wales",
    reason:
      "The organiser homepage shows 28 February, but the event detail page still labels the February 2027 date TBC.",
    sourceUrl: "https://www.runwales.com/e/lets-run-rhyl-5-mile-and-10-mile-8640",
  },
] as const;
