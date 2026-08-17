import type { Edition, EntryOptionSeed, Series } from "./types";

export type UkHalfMarathonEditionReplacement = {
  seriesSlug: string;
  distance: string;
  fromDate: string;
  toDate: string;
  toDistance?: string;
};

/** Date corrections that also need a safe in-place database migration. */
export const ukHalfMarathonEditionReplacements: UkHalfMarathonEditionReplacement[] = [
  {
    seriesSlug: "run-sandringham-half-marathon",
    distance: "Half",
    fromDate: "2026-09-26",
    toDate: "2026-09-27",
  },
];

/** Verified corrections applied before entry options are matched to an edition. */
export const ukHalfMarathonEditionOverrides: Record<string, Partial<Edition>> = {
  "nottingham-running-festival|2026-08-30|Half": {
    startTime: "09:30",
    source: "https://www.runthrough.co.uk/event/nottingham-running-festival-august-2026",
  },
  "birmingham-running-festival-september|2026-09-06|Half": {
    startTime: "09:30",
    source: "https://www.runthrough.co.uk/event/birmingham-running-festival-september-2026",
  },
  "run-sandringham-half-marathon|2026-09-26|Half": {
    date: "2026-09-27",
    startTime: "10:00",
    source: "https://www.runsandringham.co.uk/races/half-marathon",
  },
  "ealing-half-marathon|2026-09-27|Half": {
    startTime: "09:00",
    source: "https://ealinghalfmarathon.com/",
  },
  "ipswich-half-marathon|2026-09-27|Half": {
    startTime: "09:30",
    source: "https://www.runforall.com/events/half-marathon/ipswich-half-marathon/",
  },
  "windsor-half-marathon|2026-09-27|Half": {
    startTime: "10:00",
    source: "https://runwindsor.com/",
  },
};

/** Correct source metadata for half-marathon records imported from regional listings. */
export const ukHalfMarathonSeriesOverrides: Record<string, Partial<Series>> = {
  "nottingham-running-festival": {
    city: "Nottingham",
    county: "Nottinghamshire",
    country: "England",
    area: "Nottingham Racecourse and Colwick Country Park",
    surface: "Mixed",
    summary:
      "Nottingham Running Festival Half Marathon — Nottingham Racecourse and Colwick Country Park.",
    description:
      "A flat, multi-lap half marathon on road and gravel paths around Nottingham Racecourse and Colwick Country Park, organised by RunThrough Events.",
    organiser: "RunThrough Events",
    website: "https://www.runthrough.co.uk/event/nottingham-running-festival-august-2026",
  },
  "birmingham-running-festival-september": {
    city: "Sutton Coldfield",
    county: "West Midlands",
    country: "England",
    area: "Sutton Park",
    surface: "Road",
    summary: "Birmingham Running Festival Half Marathon — Sutton Park, Sutton Coldfield.",
    description:
      "A four-lap half marathon on the roads and paths of Sutton Park, organised by RunThrough Events.",
    organiser: "RunThrough Events",
    website: "https://www.runthrough.co.uk/event/birmingham-running-festival-september-2026",
  },
  "run-sandringham-half-marathon": {
    city: "Sandringham",
    county: "Norfolk",
    country: "England",
    area: "Sandringham Estate",
    surface: "Mixed",
    summary: "Run Sandringham Half Marathon — Sandringham Estate, Norfolk.",
    description:
      "A traffic-free road and trail half marathon through the Sandringham Estate, starting and finishing within the Royal Estate.",
    organiser: "Good Running Events",
    website: "https://www.runsandringham.co.uk/races/half-marathon",
  },
  "ealing-half-marathon": {
    name: "Wizz Air Ealing Half Marathon",
    city: "Ealing",
    county: "Greater London",
    country: "England",
    area: "Lammas Park and Walpole Park",
    surface: "Road",
    summary: "Wizz Air Ealing Half Marathon — Ealing, West London.",
    description:
      "A fully road-closed half marathon through Ealing, starting in Lammas Park and finishing in Walpole Park.",
    organiser: "RaceNation Events",
    website: "https://ealinghalfmarathon.com/",
  },
  "windsor-half-marathon": {
    city: "Windsor",
    county: "Berkshire",
    country: "England",
    area: "Windsor Great Park",
    surface: "Road",
    summary: "Windsor Half Marathon — Windsor Great Park, Berkshire.",
    description:
      "A traffic-free, undulating road half marathon in Windsor Great Park, starting and finishing on the Long Walk with Windsor Castle as its backdrop.",
    organiser: "Windsor Half Marathon",
    website: "https://runwindsor.com/",
  },
};

/**
 * Entry routes checked on 17 August 2026.
 *
 * A provider is included only when the exact destination offered registration
 * for the listed 2026 edition. Listing-only and "Notify me" pages are excluded.
 */
export const ukHalfMarathonEntryOptions: Record<string, EntryOptionSeed[]> = {
  "nottingham-running-festival|2026-08-30|Half": [
    {
      providerCode: "official",
      providerName: "RunThrough official entry",
      entryUrl: "https://www.runthrough.co.uk/event/nottingham-running-festival-august-2026",
      entryType: "official",
      status: "open",
      priceAmount: 32,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://www.runthrough.co.uk/event/nottingham-running-festival-august-2026",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "lets-do-this",
      providerName: "Let's Do This",
      entryUrl: "https://www.letsdothis.com/gb/e/nottingham-running-festival-august-2026-193794",
      entryType: "third_party",
      status: "open",
      priceAmount: 32,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://www.letsdothis.com/gb/e/nottingham-running-festival-august-2026-193794",
      isVerified: true,
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl: "https://findarace.com/events/nottingham-running-festival",
      entryType: "third_party",
      status: "open",
      priceAmount: 34,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://findarace.com/events/nottingham-running-festival",
      isVerified: true,
    },
  ],
  "birmingham-running-festival-september|2026-09-06|Half": [
    {
      providerCode: "official",
      providerName: "RunThrough official entry",
      entryUrl: "https://www.runthrough.co.uk/event/birmingham-running-festival-september-2026",
      entryType: "official",
      status: "open",
      priceAmount: 34,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://www.runthrough.co.uk/event/birmingham-running-festival-september-2026",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "lets-do-this",
      providerName: "Let's Do This",
      entryUrl: "https://www.letsdothis.com/gb/e/birmingham-running-festival-september-2026-192724",
      entryType: "third_party",
      status: "open",
      priceAmount: 34,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl:
        "https://www.letsdothis.com/gb/e/birmingham-running-festival-september-2026-192724",
      isVerified: true,
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl: "https://findarace.com/events/birmingham-running-festival-5k-10k-half-marathon",
      entryType: "third_party",
      status: "open",
      priceAmount: 36,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://findarace.com/events/birmingham-running-festival-5k-10k-half-marathon",
      isVerified: true,
    },
  ],
  "run-sandringham-half-marathon|2026-09-27|Half": [
    {
      providerCode: "official",
      providerName: "Total Race Timing (official entry)",
      entryUrl: "https://totalracetiming.co.uk/race/646",
      entryType: "official",
      status: "open",
      priceAmount: 29.9,
      priceCurrency: "GBP",
      closesAt: "2026-09-26T23:59:00+01:00",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://www.runsandringham.co.uk/races/half-marathon",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl: "https://findarace.com/events/run-sandringham-half-marathon-5k-community-mile",
      entryType: "third_party",
      status: "open",
      priceAmount: 31.9,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://findarace.com/events/run-sandringham-half-marathon-5k-community-mile",
      isVerified: true,
    },
    {
      providerCode: "worlds-marathons",
      providerName: "World's Marathons",
      entryUrl: "https://worldsmarathons.com/marathon/run-sandringham-half-marathon",
      entryType: "third_party",
      status: "open",
      priceAmount: 35,
      priceCurrency: "EUR",
      closesAt: "2026-09-26T23:59:00+01:00",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://worldsmarathons.com/marathon/run-sandringham-half-marathon",
      isVerified: true,
    },
  ],
  "ipswich-half-marathon|2026-09-27|Half": [
    {
      providerCode: "official",
      providerName: "Run For All official entry",
      entryUrl: "https://endurancecui.active.com/event-reg/select-race?e=95486218",
      entryType: "official",
      status: "open",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://www.runforall.com/events/half-marathon/ipswich-half-marathon/",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "charity-mnessexmind",
      providerName: "Mid and North East Essex Mind charity place",
      entryUrl: "https://mnessexmind.org/p/larking-gowen-ipswich-half-marathon-2026/",
      entryType: "charity",
      status: "open",
      priceAmount: 20,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://mnessexmind.org/p/larking-gowen-ipswich-half-marathon-2026/",
      isVerified: true,
    },
  ],
  "ealing-half-marathon|2026-09-27|Half": [
    {
      providerCode: "official",
      providerName: "RaceNation (official entry)",
      entryUrl: "https://race-nation.co.uk/register/ealing-half-marathon/ehm-2026",
      entryType: "official",
      status: "open",
      priceAmount: 55,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://ealinghalfmarathon.com/",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl: "https://findarace.com/events/ealing-half-marathon",
      entryType: "third_party",
      status: "open",
      priceAmount: 55.89,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://findarace.com/events/ealing-half-marathon",
      isVerified: true,
    },
  ],
  "windsor-half-marathon|2026-09-27|Half": [
    {
      providerCode: "official",
      providerName: "EntryHub (official entry)",
      entryUrl: "https://www.entryhub.co.uk/windsor-half-marathon-2026",
      entryType: "official",
      status: "open",
      priceAmount: 44,
      priceCurrency: "GBP",
      closesAt: "2026-09-25T23:59:00+01:00",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://runwindsor.com/",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl: "https://findarace.com/events/windsor-half-marathon",
      entryType: "third_party",
      status: "open",
      priceAmount: 44,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://findarace.com/events/windsor-half-marathon",
      isVerified: true,
    },
    {
      providerCode: "timeoutdoors",
      providerName: "TimeOutdoors",
      entryUrl: "https://www.timeoutdoors.com/events/windsor-half-marathon/half-marathon",
      entryType: "third_party",
      status: "open",
      priceAmount: 42,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T23:55:00+01:00",
      sourceUrl: "https://www.timeoutdoors.com/events/windsor-half-marathon/half-marathon",
      isVerified: true,
    },
  ],
};
