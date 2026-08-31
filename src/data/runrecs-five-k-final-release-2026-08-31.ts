import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-31";

type Seed = {
  slug: string;
  name: string;
  date: string;
  country: "England" | "Scotland" | "Northern Ireland" | "Ireland";
  county: string;
  city: string;
  area: string;
  surface: string;
  organiser: string;
  sourceUrl: string;
  entryUrl?: string;
  distances?: string[];
  startTime?: string;
  notes?: string;
};

const newSeeds: Seed[] = [
  {
    slug: "run-forest-run-minnowburn-5k-2026",
    name: "Run Forest Run: Minnowburn 5K 2026",
    date: "2026-10-31",
    country: "Northern Ireland",
    county: "Belfast",
    city: "Belfast",
    area: "Mary Peters Track and Minnowburn",
    surface: "Mixed",
    organiser: "Born 2 Run Events",
    sourceUrl: "https://www.born2runevents.com/run-forest-run-minnowburn/",
    entryUrl: "https://www.born2runevents.com/run-forest-run-minnowburn/",
    notes: "Track, road and forest-trail course; official organiser entry is open.",
  },
  {
    slug: "run-forest-run-gosford-5k-2026",
    name: "Run Forest Run: Gosford 5K 2026",
    date: "2026-11-21",
    country: "Northern Ireland",
    county: "County Armagh",
    city: "Markethill",
    area: "Gosford Forest Park",
    surface: "Mixed",
    organiser: "Born 2 Run Events",
    sourceUrl: "https://www.born2runevents.com/run-forest-run-gosford/",
    entryUrl: "https://www.born2runevents.com/run-forest-run-gosford/",
    notes: "Tarmac and forest-track course; official organiser entry is open.",
  },
  {
    slug: "run-forest-run-tollymore-5k-2026",
    name: "Run Forest Run: Tollymore 5K 2026",
    date: "2026-12-12",
    country: "Northern Ireland",
    county: "County Down",
    city: "Newcastle",
    area: "Tollymore Forest Park",
    surface: "Trail",
    organiser: "Born 2 Run Events",
    sourceUrl: "https://www.born2runevents.com/",
    entryUrl: "https://www.born2runevents.com/",
    notes:
      "The official series page confirms the 2026 date and series entry; the individual page still contains prior-season copy.",
  },
  {
    slug: "run-forest-run-loughgall-5k-2027",
    name: "Run Forest Run: Loughgall 5K 2027",
    date: "2027-01-09",
    country: "Northern Ireland",
    county: "County Armagh",
    city: "Loughgall",
    area: "Loughgall Country Park",
    surface: "Mixed",
    organiser: "Born 2 Run Events",
    sourceUrl: "https://www.born2runevents.com/run-forest-run-loughgall/",
    entryUrl: "https://www.born2runevents.com/run-forest-run-loughgall/",
    notes: "Tarmac and gravel-path course; official organiser entry is open.",
  },
  {
    slug: "run-forest-run-antrim-castle-gardens-5k-2027",
    name: "Run Forest Run: Antrim Castle Gardens 5K 2027",
    date: "2027-02-06",
    country: "Northern Ireland",
    county: "County Antrim",
    city: "Antrim",
    area: "Antrim Castle Gardens",
    surface: "Mixed",
    organiser: "Born 2 Run Events",
    sourceUrl: "https://www.born2runevents.com/run-forest-run-antrim-castle-gardens/",
    entryUrl: "https://www.born2runevents.com/run-forest-run-antrim-castle-gardens/",
  },
  {
    slug: "run-forest-run-castlewellan-5k-2027",
    name: "Run Forest Run: Castlewellan 5K 2027",
    date: "2027-02-27",
    country: "Northern Ireland",
    county: "County Down",
    city: "Castlewellan",
    area: "Castlewellan Forest Park",
    surface: "Trail",
    organiser: "Born 2 Run Events",
    sourceUrl: "https://www.born2runevents.com/run-forest-run-castlewellan/",
    entryUrl: "https://www.born2runevents.com/run-forest-run-castlewellan/",
  },
  {
    slug: "the-bog-run-5k-2026",
    name: "The Bog Run 5K 2026",
    date: "2026-10-11",
    country: "Northern Ireland",
    county: "County Down",
    city: "Castlewellan",
    area: "Castlewellan Forest Park",
    surface: "Trail",
    organiser: "Cancer Fund for Children",
    sourceUrl: "https://cancerfundforchildren.com/event/bogrun-2026/",
    entryUrl: "https://cancerfundforchildren.com/event/bogrun-2026/",
    notes: "Senior 5K mud, obstacle and forest-trail event.",
  },
  {
    slug: "chris-harrington-memorial-5k-2026",
    name: "Chris Harrington Memorial 5K 2026",
    date: "2026-08-30",
    country: "Ireland",
    county: "County Cork",
    city: "Cork",
    area: "Tramore Valley Park",
    surface: "Road",
    organiser: "Chris Harrington Memorial 5K organiser",
    sourceUrl: "https://eventmaster.ie/event/9nBZHw5HWJ",
    entryUrl: "https://eventmaster.ie/event/9nBZHw5HWJ",
    notes:
      "Athletics Ireland permit 26/420 is approved. Eventmaster and Cork Athletics publish conflicting start times, so no start time is displayed.",
  },
  {
    slug: "run-for-clionas-5k-2026",
    name: "Run for Cliona's 5K 2026",
    date: "2026-09-10",
    country: "Ireland",
    county: "County Limerick",
    city: "Limerick",
    area: "Clayton Hotel and Condell Road",
    surface: "Road",
    organiser: "Cliona's Foundation",
    sourceUrl: "https://eventmaster.ie/event/32Qjfx4tZW",
    entryUrl: "https://eventmaster.ie/event/32Qjfx4tZW",
  },
  {
    slug: "luggacurren-5k-2026",
    name: "Luggacurren 5K 2026",
    date: "2026-09-13",
    country: "Ireland",
    county: "County Laois",
    city: "Luggacurren",
    area: "Luggacurren Community Hall",
    surface: "Road",
    organiser: "Luggacurren 5K organiser",
    sourceUrl: "https://eventmaster.ie/event/b9mAU9AHjr",
    entryUrl: "https://eventmaster.ie/event/b9mAU9AHjr",
    notes: "Athletics Ireland permit 26/404 is approved.",
  },
  {
    slug: "bunninadden-charity-road-race-5k-2026",
    name: "Bunninadden Charity Road Race 5K 2026",
    date: "2026-09-19",
    country: "Ireland",
    county: "County Sligo",
    city: "Bunninadden",
    area: "Ballinalack Park",
    surface: "Road",
    organiser: "Bunninadden Charity Road Race",
    sourceUrl: "https://eventmaster.ie/event/P1bZhJDhLe",
    entryUrl: "https://eventmaster.ie/event/P1bZhJDhLe",
    notes: "Athletics Ireland permit 26/440 is approved.",
  },
  {
    slug: "termonfeckin-5k-2026",
    name: "Termonfeckin 5K 2026",
    date: "2026-09-19",
    country: "Ireland",
    county: "County Louth",
    city: "Termonfeckin",
    area: "Termonfeckin Celtic",
    surface: "Road",
    organiser: "Termonfeckin 5K organiser",
    sourceUrl: "https://myrunresults.com/events/termonfeckin_5km_2026/6335/details",
    entryUrl: "https://myrunresults.com/events/termonfeckin_5km_2026/6335/details",
    notes:
      "Direct registration is available despite stale page copy saying registration is coming soon.",
  },
  {
    slug: "big-beaumont-hospital-fun-run-5k-2026",
    name: "Big Beaumont Hospital Fun Run 5K 2026",
    date: "2026-09-27",
    country: "Ireland",
    county: "County Dublin",
    city: "Dublin",
    area: "St Anne's Park, Raheny",
    surface: "Road",
    organiser: "Beaumont Hospital Foundation",
    sourceUrl: "https://www.beaumontfundraising.ie/",
    entryUrl: "https://www.idonate.ie/forms/c/BBFR",
    notes: "The course uses paved park roads and paths.",
  },
  {
    slug: "stonetown-5k-2026",
    name: "Stonetown 5K 2026",
    date: "2026-09-27",
    country: "Ireland",
    county: "County Louth",
    city: "Annaghminnon",
    area: "Annaghminnon Rovers GAA Club",
    surface: "Road",
    organiser: "Stonetown 5K organiser",
    sourceUrl: "https://eventmaster.ie/event/kEBjHK2TA2",
    entryUrl: "https://eventmaster.ie/event/kEBjHK2TA2",
    notes: "Inaugural road race with direct registration open.",
  },
  {
    slug: "dublin-simon-home-run-5k-2026",
    name: "Dublin Simon Home Run 5K 2026",
    date: "2026-10-03",
    country: "Ireland",
    county: "County Dublin",
    city: "Dublin",
    area: "Phoenix Park",
    surface: "Road",
    organiser: "Dublin Simon Community",
    sourceUrl: "https://eventmaster.ie/event/K2PnspnHGx",
    entryUrl: "https://eventmaster.ie/event/K2PnspnHGx",
    notes: "Paved Phoenix Park road course.",
  },
  {
    slug: "croi-galway-night-run-5k-2026",
    name: "Croí Galway Night Run 5K 2026",
    date: "2026-10-09",
    country: "Ireland",
    county: "County Galway",
    city: "Galway",
    area: "Salthill Promenade and Mutton Island",
    surface: "Road",
    organiser: "Croí Heart and Stroke Charity",
    sourceUrl: "https://croi.ie/event/croinightrun2026/",
    entryUrl: "https://croi.ie/event/croinightrun2026/",
  },
  {
    slug: "lauralynn-5k-2026",
    name: "LauraLynn 5K 2026",
    date: "2026-10-10",
    country: "Ireland",
    county: "County Dublin",
    city: "Dublin",
    area: "Leopardstown Racecourse",
    surface: "Road",
    organiser: "LauraLynn Children's Hospice",
    sourceUrl: "https://www.lauralynn.ie/race",
    entryUrl: "https://eventmaster.ie/custom/event/lauralynnrace26",
    notes: "First edition on the racecourse's paved roads and paths.",
  },
  {
    slug: "cork-bhaa-defence-forces-5k-2026",
    name: "Cork BHAA Defence Forces 5K 2026",
    date: "2026-10-11",
    country: "Ireland",
    county: "County Cork",
    city: "Cork",
    area: "Tramore Valley Park",
    surface: "Road",
    organiser: "Cork BHAA",
    sourceUrl: "https://www.corkbhaa.com/calendar/",
    notes: "Confirmed on the organiser calendar; registration is normally available on race day.",
  },
  {
    slug: "clearstream-celebration-of-life-5k-2026",
    name: "Clearstream/Deutsche Börse Celebration of Life 5K 2026",
    date: "2026-11-15",
    country: "Ireland",
    county: "County Cork",
    city: "Cork",
    area: "The Marina",
    surface: "Road",
    organiser: "Cork BHAA",
    sourceUrl: "https://www.corkbhaa.com/calendar/",
    notes: "Confirmed on the organiser calendar; no online entry is currently displayed.",
  },
  {
    slug: "cork-simon-christmas-run-5k-2026",
    name: "Cork Simon Christmas Run 5K 2026",
    date: "2026-12-13",
    country: "Ireland",
    county: "County Cork",
    city: "Cork",
    area: "Blackrock Hurling Club",
    surface: "Road",
    organiser: "Cork BHAA and Cork Simon Community",
    sourceUrl: "https://www.corkbhaa.com/calendar/",
    notes: "Confirmed on the organiser calendar; no online entry is currently displayed.",
  },
  {
    slug: "drogheda-christmas-5k-2026",
    name: "Drogheda Christmas 5K 2026",
    date: "2026-12-20",
    country: "Ireland",
    county: "County Louth",
    city: "Drogheda",
    area: "Drogheda",
    surface: "Road",
    organiser: "Drogheda Christmas 5K organiser",
    sourceUrl: "https://myrunresults.com/events/drogheda_christmas_5k_2026/6233/details",
    entryUrl: "https://myrunresults.com/events/drogheda_christmas_5k_2026/6233/details",
    notes: "Direct registration and event details are live; no permit number is displayed.",
  },
  {
    slug: "letham-glen-5k-trail-race-2026",
    name: "Letham Glen 5K Trail Race 2026",
    date: "2026-09-13",
    country: "Scotland",
    county: "Fife",
    city: "Leven",
    area: "Letham Glen",
    surface: "Trail",
    organiser: "Letham Glen 5K Trail Race",
    sourceUrl: "https://www.entrycentral.com/letham_glen_5K",
    entryUrl: "https://www.entrycentral.com/letham_glen_5K",
    notes: "ARC-permitted race on woodland trails and paths.",
  },
  {
    slug: "runthrough-heaton-park-january-2027",
    name: "Run Heaton Park 5K, 10K & Half Marathon — January 2027",
    date: "2027-01-17",
    country: "England",
    county: "Greater Manchester",
    city: "Manchester",
    area: "Heaton Park",
    surface: "Road",
    organiser: "RunThrough",
    sourceUrl:
      "https://www.runthrough.co.uk/event/run-heaton-park-5k-10k-half-marathon-junior-race-january-2027",
    entryUrl:
      "https://www.runthrough.co.uk/event/run-heaton-park-5k-10k-half-marathon-junior-race-january-2027",
    distances: ["5K", "10K", "Half"],
  },
  {
    slug: "runthrough-battersea-park-november-2027",
    name: "Battersea Park 5K, 10K & Half Marathon — November 2027",
    date: "2027-11-20",
    country: "England",
    county: "Greater London",
    city: "London",
    area: "Battersea Park Millennium Arena",
    surface: "Road",
    organiser: "RunThrough",
    sourceUrl:
      "https://www.runthrough.co.uk/event/battersea-park-5k-10k-half-marathon-november-2027",
    entryUrl:
      "https://www.runthrough.co.uk/event/battersea-park-5k-10k-half-marathon-november-2027",
    distances: ["5K", "10K", "Half"],
  },
];

function option(
  seed: Pick<Seed, "slug" | "organiser" | "entryUrl" | "sourceUrl">,
): EntryOptionSeed[] | undefined {
  if (!seed.entryUrl) return undefined;
  return [
    {
      providerCode: `official-${seed.slug}`,
      providerName: seed.organiser,
      entryUrl: seed.entryUrl,
      entryType: "official",
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl: seed.sourceUrl,
      isVerified: true,
      isPrimary: true,
      notes: "Official organiser, governing-body or direct-registration source.",
    },
  ];
}

function edition(seed: Seed): Edition {
  return {
    seriesSlug: seed.slug,
    date: seed.date,
    distance: "5K",
    distanceKm: 5,
    status: seed.entryUrl ? "Open" : "TBC",
    entryUrl: seed.entryUrl,
    entryOptions: option(seed),
    startTime: seed.startTime,
    source: seed.sourceUrl,
    notes: `${seed.notes ?? "Official event details confirmed."} Source checked ${CHECKED_AT}.`,
    publishAllDistances: true,
  };
}

export const runrecsFinalFiveKSeries: Series[] = newSeeds.map((seed) => ({
  slug: seed.slug,
  name: seed.name,
  sport: "Running",
  country: seed.country,
  county: seed.county,
  city: seed.city,
  area: seed.area,
  surface: seed.surface,
  distances: seed.distances ?? ["5K"],
  summary: `${seed.name} — ${seed.area}, ${seed.city}.`,
  description: `${seed.name} is a confirmed 5K running event at ${seed.area}, ${seed.city}, ${seed.country}. Confirm final participant instructions with ${seed.organiser}.`,
  organiser: seed.organiser,
  website: seed.sourceUrl,
  source_url: seed.sourceUrl,
  featured: false,
}));

export const runrecsFinalFiveKEditions: Edition[] = newSeeds.map(edition);

type ExistingEdition = {
  seriesSlug: string;
  date: string;
  sourceUrl: string;
  providerName: string;
  startTime?: string;
  notes: string;
};

const existingEditions: ExistingEdition[] = [
  {
    seriesSlug: "flete-10k",
    date: "2026-09-12",
    sourceUrl: "https://www.entrycentral.com/festival/4498",
    providerName: "Ivybridge Rotary official entry",
    notes: "Adds the confirmed multi-terrain 5K option to the existing Flete event card.",
  },
  {
    seriesSlug: "tonbridge-half-marathon",
    date: "2026-10-04",
    sourceUrl:
      "https://www.runthrough.co.uk/event/run-kent-tonbridge-half-marathon-10k-5k-october-2026",
    providerName: "RunThrough",
    notes:
      "Adds the confirmed closed-road 5K option to the existing Run Kent Tonbridge event card.",
  },
  {
    seriesSlug: "run-heaton-5k-10k-half-marathon-october",
    date: "2026-10-11",
    sourceUrl:
      "https://www.runthrough.co.uk/event/run-heaton-park-5k-10k-half-marathon-junior-race-october-2026",
    providerName: "RunThrough",
    notes: "Adds the confirmed 5K edition to the existing October Heaton Park event card.",
  },
  {
    seriesSlug: "run-heaton-5k-10k-half-marathon-november",
    date: "2026-11-29",
    sourceUrl:
      "https://www.runthrough.co.uk/event/run-heaton-park-5k-10k-half-marathon-junior-race-november-2026",
    providerName: "RunThrough",
    notes: "Adds the confirmed 5K edition to the existing November Heaton Park event card.",
  },
  {
    seriesSlug: "croft-running-festival-november-2026",
    date: "2026-11-01",
    sourceUrl: "https://www.runthrough.co.uk/event/croft-running-festival-november-2026",
    providerName: "RunThrough",
    notes:
      "Adds the confirmed traffic-free motor-circuit 5K option to the existing Croft event card.",
  },
  {
    seriesSlug: "run-heaton-park-half-marathon-march-2027",
    date: "2027-03-28",
    sourceUrl:
      "https://www.runthrough.co.uk/event/run-heaton-park-5k-10k-half-marathon-junior-race-march-2027",
    providerName: "RunThrough",
    notes: "Adds the confirmed 5K edition to the existing March Heaton Park event card.",
  },
  {
    seriesSlug: "kettering-half-marathon-march",
    date: "2027-03-14",
    sourceUrl: "https://www.runthrough.co.uk/event/kettering-half-marathon-5k-march-2027",
    providerName: "RunThrough",
    notes: "Adds the confirmed 5K edition to the existing Kettering event card.",
  },
  {
    seriesSlug: "surrey-half-marathon-2027",
    date: "2027-03-21",
    sourceUrl: "https://www.runthrough.co.uk/event/surrey-half-marathon-march-2027",
    providerName: "RunThrough",
    notes: "Adds the confirmed road 5K edition to the existing Surrey event card.",
  },
  {
    seriesSlug: "leeds-running-festival-march-2027",
    date: "2027-03-28",
    sourceUrl: "https://www.runthrough.co.uk/event/leeds-running-festival-march-2027",
    providerName: "RunThrough",
    notes: "Adds the confirmed mixed park-path 5K edition to the existing Leeds event card.",
  },
  {
    seriesSlug: "lambton-castle-summer-trail-runs",
    date: "2027-08-15",
    sourceUrl: "https://www.wilddeerevents.co.uk/e/lambton-castle-summer-trail-runs-2026-14571",
    providerName: "Wild Deer Events",
    notes: "Adds the confirmed 5K trail option; the organiser gives an approximate 10:00 start.",
  },
];

export const runrecsFinalFiveKExistingSeriesEditions: Edition[] = existingEditions.map((seed) => ({
  seriesSlug: seed.seriesSlug,
  date: seed.date,
  distance: "5K",
  distanceKm: 5,
  status: "Open",
  entryUrl: seed.sourceUrl,
  entryOptions: [
    {
      providerCode: `official-${seed.seriesSlug}-${seed.date}-5k`,
      providerName: seed.providerName,
      entryUrl: seed.sourceUrl,
      entryType: "official",
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl: seed.sourceUrl,
      isVerified: true,
      isPrimary: true,
      notes: "Official organiser or direct-registration source.",
    },
  ],
  startTime: seed.startTime,
  source: seed.sourceUrl,
  notes: `${seed.notes} Source checked ${CHECKED_AT}.`,
  publishAllDistances: true,
}));

function officialOverride(
  seriesSlug: string,
  sourceUrl: string,
  providerName: string,
  notes: string,
): Partial<Edition> {
  return {
    entryUrl: sourceUrl,
    entryOptions: [
      {
        providerCode: `official-${seriesSlug}-2026`,
        providerName,
        entryUrl: sourceUrl,
        entryType: "official",
        status: "open",
        checkedAt: CHECKED_AT,
        sourceUrl,
        isVerified: true,
        isPrimary: true,
        notes: "Official organiser or direct-registration source.",
      },
    ],
    source: sourceUrl,
    notes: `${notes} Source checked ${CHECKED_AT}.`,
    publishAllDistances: true,
  };
}

export const runrecsFinalFiveKEditionOverrides: Record<string, Partial<Edition>> = {
  "alderton-5k-run|2026-09-05|5K": officialOverride(
    "alderton-5k-run",
    "https://www.entrycentral.com/alderton5krun",
    "Alderton 5K official entry",
    "Official entry confirms the closed-country-road 5K and grass finish.",
  ),
  "warrington-running-festival|2026-09-20|5K": officialOverride(
    "warrington-running-festival",
    "https://www.runthrough.co.uk/event/warrington-running-festival-2026",
    "RunThrough",
    "Official entry confirms the town-centre road 5K.",
  ),
  "macclesfield-half-marathon|2026-10-18|5K": officialOverride(
    "macclesfield-half-marathon",
    "https://www.runthrough.co.uk/event/macclesfield-running-festival-october-2026",
    "RunThrough",
    "Official entry confirms the closed-road 5K with an athletics-track section.",
  ),
  "aberdeen-santa-run|2026-12-13|5K": officialOverride(
    "aberdeen-santa-run",
    "https://www.entrycentral.com/aberdeensantarun",
    "Aberdeen Santa Run official entry",
    "Official entry confirms the untimed 5K promenade event.",
  ),
};

export const runrecsFinalFiveKSeriesOverrides: Record<string, Partial<Series>> = {
  "alderton-5k-run": {
    website: "https://www.entrycentral.com/alderton5krun",
    source_url: "https://www.entrycentral.com/alderton5krun",
  },
  "warrington-running-festival": {
    distances: ["5K", "10K", "Half"],
    website: "https://www.runthrough.co.uk/event/warrington-running-festival-2026",
    source_url: "https://www.runthrough.co.uk/event/warrington-running-festival-2026",
  },
  "macclesfield-half-marathon": {
    distances: ["5K", "10K", "Half"],
    website: "https://www.runthrough.co.uk/event/macclesfield-running-festival-october-2026",
    source_url: "https://www.runthrough.co.uk/event/macclesfield-running-festival-october-2026",
  },
  "aberdeen-santa-run": {
    website: "https://www.entrycentral.com/aberdeensantarun",
    source_url: "https://www.entrycentral.com/aberdeensantarun",
  },
  "lambton-castle-summer-trail-runs": {
    distances: ["5mi", "5K"],
    website: "https://www.wilddeerevents.co.uk/e/lambton-castle-summer-trail-runs-2026-14571",
    source_url: "https://www.wilddeerevents.co.uk/e/lambton-castle-summer-trail-runs-2026-14571",
  },
};

export const runrecsFinalFiveKPublishedKeys = [
  ...runrecsFinalFiveKEditions,
  ...runrecsFinalFiveKExistingSeriesEditions,
].map((item) => `${item.seriesSlug}|${item.date}|${item.distance}`);
