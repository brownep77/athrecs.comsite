import type { Edition, EntryOptionSeed, Series } from "./types";

export type UkTenKEditionReplacement = {
  seriesSlug: string;
  distance: string;
  fromDate: string;
  toDate: string;
  toDistance?: string;
};

/** Safe in-place database migrations for verified 10K corrections. */
export const ukTenKEditionReplacements: UkTenKEditionReplacement[] = [];

/** Verified corrections applied before entry options are matched to an edition. */
export const ukTenKEditionOverrides: Record<string, Partial<Edition>> = {
  "chase-the-sun-battersea-5k-10k-august|2026-08-19|10K": {
    startTime: "19:00",
    entryUrl: "https://www.runthrough.co.uk/event/chase-the-sun-battersea-park-5k-10k-august-2026",
    source: "https://www.runthrough.co.uk/event/chase-the-sun-battersea-park-5k-10k-august-2026",
  },
  "rock-up-n-run-bingley-august|2026-08-20|10K": {
    startTime: "18:45",
    entryUrl: "https://www.itsgrimupnorthrunning.co.uk/e/bingley-rock-up-n-run-11712",
    source: "https://www.itsgrimupnorthrunning.co.uk/e/bingley-rock-up-n-run-11712",
  },
  "carsington-water-10k-half-marathon-august|2026-08-22|10K": {
    startTime: "10:00",
    entryUrl: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-august-2026",
    source: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-august-2026",
  },
  "tay-fitness-killin-10k|2026-08-22|10K": {
    startTime: "12:00",
    entryUrl: "https://tayfitness.com/product/killin-10k/",
    source: "https://tayfitness.com/events/killin-10k-5k/",
  },
  "up-and-running-events-bellahouston-park-5k-10k-half-marathon-may-coa|2026-08-22|10K": {
    startTime: "10:00",
    entryUrl:
      "https://www.upandrunningevents.co.uk/event-details/bellahouston-park-5k-10k-half-marathon-9",
    source:
      "https://www.upandrunningevents.co.uk/event-details/bellahouston-park-5k-10k-half-marathon-9",
  },
};

/** Correct source metadata for UK 10K records imported from regional listings. */
export const ukTenKSeriesOverrides: Record<string, Partial<Series>> = {
  "chase-the-sun-battersea-5k-10k-august": {
    name: "Chase the Sun Battersea Park 5K & 10K",
    city: "London",
    county: "Greater London",
    country: "England",
    area: "Battersea Park Bandstand",
    surface: "Road",
    distances: ["10K", "5K"],
    summary: "Chase the Sun Battersea Park 5K & 10K — Battersea Park, London.",
    description:
      "A flat, accurately marked lapped race on the roads and paths of Battersea Park, organised by RunThrough Events.",
    organiser: "RunThrough Events",
    website: "https://www.runthrough.co.uk/event/chase-the-sun-battersea-park-5k-10k-august-2026",
  },
  "rock-up-n-run-bingley-august": {
    name: "Bingley Rock Up 'n' Run",
    city: "Bingley",
    county: "West Yorkshire",
    country: "England",
    area: "Five Rise Locks and the Leeds & Liverpool Canal",
    surface: "Trail",
    distances: ["10K", "5K"],
    summary: "Bingley Rock Up 'n' Run — Five Rise Locks, Bingley.",
    description:
      "A relaxed summer evening trail run beside the Five Rise Locks and Leeds & Liverpool Canal, organised by It's Grim Up North Running.",
    organiser: "It's Grim Up North Running",
    website: "https://www.itsgrimupnorthrunning.co.uk/e/bingley-rock-up-n-run-11712",
  },
  "carsington-water-10k-half-marathon-august": {
    name: "Carsington Water Trail Half Marathon & 10K",
    city: "Ashbourne",
    county: "Derbyshire",
    country: "England",
    area: "Carsington Water",
    surface: "Trail",
    distances: ["10K", "Half"],
    summary: "Carsington Water Trail Half Marathon & 10K — Carsington Water, Derbyshire.",
    description:
      "An undulating trail race on reservoir paths around Carsington Water, organised by RunThrough Events.",
    organiser: "RunThrough Events",
    website: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-august-2026",
  },
  "tay-fitness-killin-10k": {
    name: "Killin 10K & 5K",
    city: "Killin",
    county: "Stirling",
    country: "Scotland",
    area: "Breadalbane Park, Glen Lochay and the Falls of Dochart",
    surface: "Road",
    distances: ["10K", "5K", "1K"],
    summary: "Killin 10K & 5K — Breadalbane Park, Killin.",
    description:
      "A scenic road race from Breadalbane Park through Killin and Glen Lochay, including the Falls of Dochart, organised by Tay Fitness Events.",
    organiser: "Tay Fitness Events",
    website: "https://tayfitness.com/events/killin-10k-5k/",
  },
  "up-and-running-events-bellahouston-park-5k-10k-half-marathon-may-coa": {
    name: "Bellahouston Park 5K, 10K & Half Marathon",
    city: "Glasgow",
    county: "Glasgow City",
    country: "Scotland",
    area: "Bellahouston Park",
    surface: "Road",
    distances: ["10K", "5K", "Half"],
    summary: "Bellahouston Park 5K, 10K & Half Marathon — Glasgow.",
    description:
      "Measured, chip-timed races on the wide tarmac paths of Bellahouston Park, organised by Up and Running Events.",
    organiser: "Up and Running Events",
    website:
      "https://www.upandrunningevents.co.uk/event-details/bellahouston-park-5k-10k-half-marathon-9",
  },
};

/** Entry routes checked on 18 August 2026. */
export const ukTenKEntryOptions: Record<string, EntryOptionSeed[]> = {
  "chase-the-sun-battersea-5k-10k-august|2026-08-19|10K": [
    {
      providerCode: "official-runthrough",
      providerName: "RunThrough official entry",
      entryUrl:
        "https://www.runthrough.co.uk/event/chase-the-sun-battersea-park-5k-10k-august-2026",
      entryType: "official",
      status: "open",
      priceAmount: 32,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl:
        "https://www.runthrough.co.uk/event/chase-the-sun-battersea-park-5k-10k-august-2026",
      isVerified: true,
      isPrimary: true,
      notes: "The live official page lists 10K entry at £32 and a 19:00 event start.",
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl: "https://findarace.com/events/runthrough-chase-the-sun-battersea-park-5k-10k",
      entryType: "third_party",
      status: "open",
      priceAmount: 34,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl: "https://findarace.com/events/runthrough-chase-the-sun-battersea-park-5k-10k",
      isVerified: true,
      notes: "The exact 19 August 2026 10K is available through Quick Book at £34.",
    },
  ],
  "rock-up-n-run-bingley-august|2026-08-20|10K": [
    {
      providerCode: "official-on-day",
      providerName: "Official on-the-day entry",
      entryUrl: "https://www.itsgrimupnorthrunning.co.uk/e/bingley-rock-up-n-run-11712",
      entryType: "official",
      status: "open",
      priceAmount: 15,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl: "https://www.itsgrimupnorthrunning.co.uk/e/bingley-rock-up-n-run-11712",
      isVerified: true,
      isPrimary: true,
      notes: "No online booking is required: register from 18:00 and pay £15 cash on the evening.",
    },
    {
      providerCode: "timeoutdoors",
      providerName: "TimeOutdoors",
      entryUrl: "https://www.timeoutdoors.com/events/bingleyrock-up-n-run/10k",
      entryType: "third_party",
      status: "open",
      priceAmount: 15,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl: "https://www.timeoutdoors.com/events/bingleyrock-up-n-run/10k",
      isVerified: true,
      notes: "The exact 10K page lists an open £15–£17 entry route.",
    },
  ],
  "carsington-water-10k-half-marathon-august|2026-08-22|10K": [
    {
      providerCode: "official-runthrough",
      providerName: "RunThrough official entry",
      entryUrl: "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-august-2026",
      entryType: "official",
      status: "open",
      priceAmount: 30,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl:
        "https://www.runthrough.co.uk/event/carsington-water-half-marathon-10k-august-2026",
      isVerified: true,
      isPrimary: true,
      notes: "The live official page lists 10K entry at £30.",
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl: "https://findarace.com/events/carsington-water-10k-half-marathon",
      entryType: "third_party",
      status: "closing_soon",
      priceAmount: 32,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl: "https://findarace.com/events/carsington-water-10k-half-marathon",
      isVerified: true,
      notes: "The exact 22 August 2026 10K is available through Quick Book at £32.",
    },
  ],
  "tay-fitness-killin-10k|2026-08-22|10K": [
    {
      providerCode: "official-tay-fitness",
      providerName: "Tay Fitness official entry",
      entryUrl: "https://tayfitness.com/product/killin-10k/",
      entryType: "official",
      status: "open",
      priceAmount: 27,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl: "https://tayfitness.com/product/killin-10k/",
      isVerified: true,
      isPrimary: true,
      notes: "The official 10K product is in stock at £27.",
    },
    {
      providerCode: "timeoutdoors",
      providerName: "TimeOutdoors",
      entryUrl: "https://www.timeoutdoors.com/events/killin-10k-5k/10k",
      entryType: "third_party",
      status: "open",
      priceAmount: 27,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl: "https://www.timeoutdoors.com/events/killin-10k-5k/10k",
      isVerified: true,
      notes: "The exact 10K page lists entry open at £27.",
    },
  ],
  "up-and-running-events-bellahouston-park-5k-10k-half-marathon-may-coa|2026-08-22|10K": [
    {
      providerCode: "official-up-and-running",
      providerName: "Up and Running Events official entry",
      entryUrl:
        "https://www.upandrunningevents.co.uk/event-details/bellahouston-park-5k-10k-half-marathon-9",
      entryType: "official",
      status: "open",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl:
        "https://www.upandrunningevents.co.uk/event-details/bellahouston-park-5k-10k-half-marathon-9",
      isVerified: true,
      isPrimary: true,
      notes: "The organiser's exact event page shows a live Buy Tickets route.",
    },
    {
      providerCode: "timeoutdoors",
      providerName: "TimeOutdoors",
      entryUrl: "https://www.timeoutdoors.com/events/bellahouston-park-5k10khalf-marathon-1/10k",
      entryType: "third_party",
      status: "open",
      priceAmount: 24.9,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl: "https://www.timeoutdoors.com/events/bellahouston-park-5k10khalf-marathon-1/10k",
      isVerified: true,
      notes: "The exact 10K page lists entry open at £24.90.",
    },
    {
      providerCode: "findarace",
      providerName: "Find a Race",
      entryUrl:
        "https://findarace.com/events/bellahouston-park-5k-10k-half-marathon/22nd-august-2026",
      entryType: "third_party",
      status: "open",
      priceAmount: 24.9,
      priceCurrency: "GBP",
      checkedAt: "2026-08-18T18:00:00+01:00",
      sourceUrl:
        "https://findarace.com/events/bellahouston-park-5k-10k-half-marathon/22nd-august-2026",
      isVerified: true,
      notes: "The exact 22 August 2026 10K is available through Quick Book at £24.90.",
    },
  ],
};
