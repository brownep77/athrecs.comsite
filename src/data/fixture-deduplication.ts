import type { Edition, Series } from "./types";

export type VerifiedEditionReplacement = {
  seriesSlug: string;
  distance: string;
  fromDate: string;
  toDate: string;
  toDistance?: string;
};

/**
 * Source-specific records verified as the same event and occurrence.
 *
 * The left-hand slug is retired in favour of the canonical right-hand slug.
 * Database seeding refuses to retire an alias that already holds results.
 */
export const verifiedFixtureAliases: Readonly<Record<string, string>> = {
  "runabc-west-acre-wild-10k": "west-acre-wild-10k",
  "rb-10th-anniversary-abp-humber-coastal-half-marathon-10k-family-fun-run":
    "abp-humber-coastal-half-marathon-5k",
  "rb-brackley-chicken-run": "brackley-10k-chicken-run",
  "rb-xmiles-preston-half-marathon-10k": "preston-half-marathon-10k",
  "rb-rising-sun-country-park-10k-trail-run": "rising-sun-country-park-trail-run",
  "rb-cattle-creepy-10k": "cattle-creepy-10k",
  "rb-haldon-halloween-twilight-run": "haldon-halloween-twilight-run",
  "rb-ashington-10k-trail-run": "ashington-10k-trail-run",
  "far-cowman-triathlon": "rb-the-cowman-triathlon",
  // Marathon Runners Diary name/date reconciliation (checked 2026-08-20).
  "reykjavik-marathon": "reykjavik-marathon-half",
  "bmw-berlin-marathon": "berlin-marathon",
  "wa-bmw-berlin-marathon-7235580": "berlin-marathon",
  "wa-oslo-marathon-7244012": "oslo-marathon",
  "wa-tallinn-marathon-7234777": "tallinn-marathon",
  "wa-48th-warsaw-marathon-7236127": "warsaw-marathon",
  "wa-ko-ice-peace-marathon-7236032": "kosice-marathon",
  "wa-asml-eindhoven-marathon-7242235": "eindhoven-marathon",
  "wa-graz-marathon-7242010": "graz-marathon",
  "wa-nlb-ljubljana-marathon-7235593": "ljubljana-marathon",
  "wa-prishtina-half-marathon-7242724": "prishtina-marathon",
  "wa-prishtina-marathon-7242723": "prishtina-marathon",
  "wa-10k-belgrade-nike-run-7244711": "belgrade-nike-10k",
  "tcs-amsterdam-marathonhalf-marathon-8k": "amsterdam-marathon",
  "wa-tcs-amsterdam-marathon-7235581": "amsterdam-marathon",
  "wa-irish-life-dublin-marathon-7238744": "dublin-marathon",
  "bmw-frankfurt-marathon": "frankfurt-marathon",
  "wa-venicemarathon-7238053": "venice-marathon",
  "wa-istanbul-marathon-7235596": "istanbul-marathon",
  "athens-marathon": "athens-classic-marathon",
  "wa-maybank-marathon-7238457": "maybank-bali-marathon",
  "wa-nmdc-hyderabad-marathon-7238761": "hyderabad-marathon",
  "wa-tcs-sydney-marathon-presented-by-asics-7235579": "sydney-marathon",
  "wa-amman-marathon-7245168": "amman-marathon",
  "wa-marathon-beneva-de-montr-al-7236102": "marathon-beneva-de-montreal",
  "wa-tcs-toronto-waterfront-marathon-7238226": "toronto-waterfront-marathon",
  "wa-casablanca-marathon-7245003": "casablanca-marathon",
  "wa-shanghai-marathon-7235577": "shanghai-marathon",
};

/** Canonical aliases established by earlier catalogue audits. */
export const legacyFixtureAliases: Readonly<Record<string, string>> = {
  "rb-dirt-half-challenge": "dirt-half-challenge",
  "rb-glentress-winter-half-marathon-10k-trail-races": "glentress-winter-trail-races",
  "fellbrigg-trail-run": "felbrigg-trail-run",
  "round-the-lakes-summer-special": "round-the-lakes",
  "thompson-millennium-green-10k-5k": "thompson-millennium-green",
  "well-run-10k": "far-peak-10k-half-marathon",
};

export const allFixtureAliases: Readonly<Record<string, string>> = {
  ...legacyFixtureAliases,
  ...verifiedFixtureAliases,
};

/** Incorrect second-day dates found during the all-sport duplicate audit. */
export const verifiedFixtureEditionReplacements: VerifiedEditionReplacement[] = [
  {
    seriesSlug: "isle-of-wight-fell-series-sunday",
    distance: "Other",
    fromDate: "2026-09-12",
    toDate: "2026-09-13",
  },
  {
    seriesSlug: "ultra-x-england-sunday",
    distance: "Ultra",
    fromDate: "2026-09-12",
    toDate: "2026-09-13",
  },
  {
    seriesSlug: "dublin-marathon",
    distance: "Marathon",
    fromDate: "2026-10-24",
    toDate: "2026-10-25",
  },
  {
    seriesSlug: "venice-marathon",
    distance: "Marathon",
    fromDate: "2026-10-24",
    toDate: "2026-10-25",
  },
  {
    seriesSlug: "chicago-marathon",
    distance: "Marathon",
    fromDate: "2026-10-10",
    toDate: "2026-10-11",
  },
  {
    seriesSlug: "barcelona-marathon",
    distance: "Marathon",
    fromDate: "2027-03-15",
    toDate: "2027-03-14",
  },
  {
    seriesSlug: "paris-marathon",
    distance: "Marathon",
    fromDate: "2027-04-10",
    toDate: "2027-04-11",
  },
  {
    seriesSlug: "paris-marathon",
    distance: "Marathon",
    fromDate: "2027-04-12",
    toDate: "2027-04-11",
  },
  {
    seriesSlug: "rome-marathon",
    distance: "Marathon",
    fromDate: "2027-03-21",
    toDate: "2027-03-14",
  },
  {
    seriesSlug: "marrakech-marathon",
    distance: "Marathon",
    fromDate: "2027-01-24",
    toDate: "2027-01-31",
  },
  {
    seriesSlug: "great-wall-marathon",
    distance: "Marathon",
    fromDate: "2027-05-14",
    toDate: "2027-05-15",
  },
  {
    seriesSlug: "sanlam-cape-town-marathon",
    distance: "Marathon",
    fromDate: "2027-05-22",
    toDate: "2027-05-23",
  },
  {
    seriesSlug: "boston-marathon",
    distance: "Marathon",
    fromDate: "2027-04-11",
    toDate: "2027-04-19",
  },
];

export const verifiedFixtureEditionOverrides: Record<string, Partial<Edition>> = {
  "wa-le-marathon-vert-rennes-school-of-business-7236026|2026-10-18|Other": {
    distance: "Marathon",
    distanceKm: 42.195,
    source: "https://www.lemarathonvert.org/le-marathon.php",
    notes: "The organiser identifies this World Athletics fixture as the 42.195K marathon.",
  },
  "wa-bilbao-night-half-marathon-7236025|2026-10-17|Other": {
    distance: "Half",
    distanceKm: 21.0975,
    status: "Closed",
    entryUrl: undefined,
    source: "https://www.bilbaonightrun.com/en-gb/reglamento",
    notes: "The organiser identifies this World Athletics fixture as the certified half marathon.",
  },
  "isle-of-wight-fell-series-sunday|2026-09-12|Other": {
    date: "2026-09-13",
    distanceKm: 21,
    startTime: "10:00",
    entryUrl: "https://www.sientries.co.uk/event/isle-of-wight-fell-race-series-2026-2026",
    source: "https://www.rydeharriers.co.uk/the-isle-of-wight-fell-series/",
    notes:
      "The Sunday Wroxall Round is on 13 September 2026; the supplied listing incorrectly repeated Saturday's date.",
  },
  "ultra-x-england-sunday|2026-09-12|Ultra": {
    date: "2026-09-13",
    distanceKm: 51,
    startTime: "08:00",
    entryUrl: "https://ultra-x.co/event/ultra-marathon-in-england/",
    source: "https://ultra-x.co/event/ultra-marathon-in-england/",
    notes:
      "The Sunday 51K starts on 13 September 2026; the supplied listing incorrectly repeated Saturday's date.",
  },
  "dublin-marathon|2026-10-24|Marathon": {
    date: "2026-10-25",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source: "http://www.marathonrunnersdiary.com/races/europe-marathons/dublin-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2026 marathon on 25 October.",
  },
  "venice-marathon|2026-10-24|Marathon": {
    date: "2026-10-25",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source: "http://www.marathonrunnersdiary.com/races/europe-marathons/venice-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2026 marathon on 25 October.",
  },
  "chicago-marathon|2026-10-10|Marathon": {
    date: "2026-10-11",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source:
      "http://www.marathonrunnersdiary.com/races/international-marathons/chicago-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2026 marathon on 11 October.",
  },
  "barcelona-marathon|2027-03-15|Marathon": {
    date: "2027-03-14",
    distanceKm: 42.195,
    status: "TBC",
    source: "http://www.marathonrunnersdiary.com/races/europe-marathons/barcelona-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2027 marathon on 14 March.",
  },
  "paris-marathon|2027-04-10|Marathon": {
    date: "2027-04-11",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source: "https://www.france.fr/nl/evenement/de-marathon-van-parijs/",
    notes:
      "France.fr lists the 2027 Paris Marathon on 11 April; the supplied directory currently marks the date TBC.",
  },
  "paris-marathon|2027-04-12|Marathon": {
    date: "2027-04-11",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source: "https://www.france.fr/nl/evenement/de-marathon-van-parijs/",
    notes:
      "France.fr lists the 2027 Paris Marathon on 11 April; the supplied directory currently marks the date TBC.",
  },
  "rome-marathon|2027-03-21|Marathon": {
    date: "2027-03-14",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source: "http://www.marathonrunnersdiary.com/races/europe-marathons/rome-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2027 marathon on 14 March.",
  },
  "marrakech-marathon|2027-01-24|Marathon": {
    date: "2027-01-31",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source:
      "http://www.marathonrunnersdiary.com/races/international-marathons/marrakech-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2027 marathon on 31 January.",
  },
  "great-wall-marathon|2027-05-14|Marathon": {
    date: "2027-05-15",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source:
      "http://www.marathonrunnersdiary.com/races/international-marathons/chinese-wall-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2027 marathon on 15 May.",
  },
  "sanlam-cape-town-marathon|2027-05-22|Marathon": {
    date: "2027-05-23",
    distanceKm: 42.195,
    status: "TBC",
    entryUrl: undefined,
    startTime: undefined,
    source:
      "http://www.marathonrunnersdiary.com/races/international-marathons/cape-town-marathon.php",
    notes: "The live Marathon Runners Diary listing places the 2027 marathon on 23 May.",
  },
  "boston-marathon|2027-04-11|Marathon": {
    date: "2027-04-19",
    distanceKm: 42.195,
    status: "Open",
    entryUrl: "https://www.baa.org/races/boston-marathon/qualify/",
    startTime: undefined,
    source:
      "https://www.baa.org/news/registration-updates-and-information-announced-for-2027-boston-marathon-presented-by-bank-of-america/",
    notes:
      "The B.A.A. confirms the 131st Boston Marathon for Monday 19 April 2027; the supplied directory date of 11 April is retired.",
  },
};

/** Official organiser metadata for canonical records retained after a merge. */
export const verifiedFixtureSeriesOverrides: Record<string, Partial<Series>> = {
  "boston-marathon": {
    name: "Boston Marathon",
    country: "United States",
    county: "Massachusetts",
    city: "Boston",
    area: "Hopkinton to Boston",
    surface: "Road",
    distances: ["Marathon"],
    summary:
      "Boston Marathon is a point-to-point certified road marathon from Hopkinton to Boston.",
    description:
      "The Boston Athletic Association stages the Boston Marathon on its certified point-to-point course from Hopkinton to Boston. Entry through the open field requires a verified qualifying performance and remains subject to field limits.",
    organiser: "Boston Athletic Association",
    website: "https://www.baa.org/races/boston-marathon",
    source_url: "https://www.baa.org/races/boston-marathon",
  },
  "rb-the-cowman-triathlon": {
    name: "Cowman Triathlon",
    country: "England",
    county: "Buckinghamshire",
    city: "Olney",
    area: "Emberton Country Park",
    surface: "Mixed",
    distances: ["Middle", "Standard", "Sprint", "Aquabike", "Aquathlon"],
    summary:
      "Cowman Triathlon — middle, standard, sprint and multisport racing at Emberton Country Park.",
    description:
      "BCS Events' rescheduled 2026 Cowman programme includes middle, standard and sprint triathlons plus aquabike, aquathlon and bike-run options.",
    organiser: "BCS Events",
    website: "https://bigcowsports.com/cowman-triathlon/",
    source_url: "https://bigcowsports.com/cowman-triathlon/",
  },
};
