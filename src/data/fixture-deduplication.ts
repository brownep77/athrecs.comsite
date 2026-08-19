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
];

export const verifiedFixtureEditionOverrides: Record<string, Partial<Edition>> = {
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
};

/** Official organiser metadata for canonical records retained after a merge. */
export const verifiedFixtureSeriesOverrides: Record<string, Partial<Series>> = {
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
