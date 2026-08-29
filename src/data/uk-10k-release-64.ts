import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-29";

export const ukTenKRelease64Keys = [
  "fleet-10k5k-peter-driver-memorial|2026-10-25|10K",
  "haltemprice-10k|2026-10-25|10K",
  "jedburgh-half-marathon|2026-10-25|10K",
  "kernow-killer-october|2026-10-25|10K",
  "monsal-trail-half-marathon-autumn-sunday|2026-10-25|10K",
  "polesden-lacey-10k|2026-10-25|10K",
  "regents-park-5k-10k-october|2026-10-25|10K",
  "rosemullion-10k|2026-10-25|10K",
  "running-tribe-races-october|2026-10-25|10K",
  "stroud-half-marathon|2026-10-25|10K",
  "the-one-in-the-park-greenwich-park-10k-5k|2026-10-25|10K",
  "the-pumpkin-plod|2026-10-25|10K",
] as const;

export const ukTenKRelease64ExpectedPrimaryUrls: Readonly<Record<string, string>> = {
  "fleet-10k5k-peter-driver-memorial|2026-10-25|10K": "https://www.fleet10k.co.uk/",
  "haltemprice-10k|2026-10-25|10K":
    "https://www.runthrough.co.uk/event/haltemprice-10k-october-2026",
  "jedburgh-half-marathon|2026-10-25|10K": "https://www.entrycentral.com/festival/18",
  "kernow-killer-october|2026-10-25|10K": "https://www.kernowkiller.uk/",
  "monsal-trail-half-marathon-autumn-sunday|2026-10-25|10K":
    "https://www.nice-work.org.uk/e/monsal-trail-october-half-marathon-and-10k-weekend-10050",
  "polesden-lacey-10k|2026-10-25|10K":
    "https://www.nationaltrust.org.uk/visit/surrey/polesden-lacey/events/6ae7564c-7591-4e38-a056-0bea88be8062",
  "regents-park-5k-10k-october|2026-10-25|10K":
    "https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026",
  "rosemullion-10k|2026-10-25|10K":
    "https://www.sientries.co.uk/event/rosemullion-10k-2026?elid=Y",
  "running-tribe-races-october|2026-10-25|10K":
    "https://findarace.com/events/running-tribe-races",
  "stroud-half-marathon|2026-10-25|10K":
    "https://race-nation.co.uk/register/racenation-events-ltd/stroud-10k-2026",
  "the-one-in-the-park-greenwich-park-10k-5k|2026-10-25|10K":
    "https://enter.onerace.events/register/onerace-events/one-in-the-park-greenwich-october",
  "the-pumpkin-plod|2026-10-25|10K":
    "https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105",
};

function verifiedPrimary(
  providerCode: string,
  providerName: string,
  entryUrl: string,
  sourceUrl: string,
  entryType: EntryOptionSeed["entryType"] = "official",
  extra: Partial<EntryOptionSeed> = {},
): EntryOptionSeed[] {
  return [
    {
      providerCode,
      providerName,
      entryUrl,
      entryType,
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl,
      isVerified: true,
      isPrimary: true,
      ...extra,
    },
  ];
}

/**
 * Release 64 finishes the next immutable twelve-race UK 10K checkpoint.
 * The first six keys already have verified enrichment in entry-options-uk-10ks.
 * These six records add the remaining authoritative organiser or official-booking routes.
 */
export const ukTenKRelease64EditionOverrides: Record<string, Partial<Edition>> = {
  "fleet-10k5k-peter-driver-memorial|2026-10-25|10K": {
    status: "Open",
    startTime: "09:30",
    entryUrl: "https://www.fleet10k.co.uk/",
    source: "https://www.fleet10k.co.uk/",
    notes:
      "Fleet & Crookham Athletic Club confirms the Peter Driver Memorial 10K on Sunday 25 October 2026 at 09:30 from The Harlington Centre.",
    publishAllDistances: true,
  },
  "haltemprice-10k|2026-10-25|10K": {
    status: "Open",
    startTime: "09:00",
    entryUrl: "https://www.runthrough.co.uk/event/haltemprice-10k-october-2026",
    source: "https://www.runthrough.co.uk/event/haltemprice-10k-october-2026",
    notes:
      "RunThrough confirms the closed-road Haltemprice 10K on Sunday 25 October 2026 at 09:00 from South Ella Way in Kirk Ella.",
    publishAllDistances: true,
  },
  "jedburgh-half-marathon|2026-10-25|10K": {
    status: "Open",
    startTime: "11:00",
    entryUrl: "https://www.entrycentral.com/festival/18",
    source: "https://www.entrycentral.com/festival/18",
    notes:
      "The official Jedburgh Running Festival registration confirms the 10K on Sunday 25 October 2026 at 11:00 from Abbey Place.",
    publishAllDistances: true,
  },
  "kernow-killer-october|2026-10-25|10K": {
    status: "Open",
    startTime: "09:30",
    entryUrl: "https://www.kernowkiller.uk/",
    source: "https://www.kernowkiller.uk/",
    notes:
      "Kernow Killer confirms its 10K obstacle challenge at Scorrier House Estate on Sunday 25 October 2026 at 09:30.",
    publishAllDistances: true,
  },
  "monsal-trail-half-marathon-autumn-sunday|2026-10-25|10K": {
    status: "Open",
    startTime: "10:00",
    entryUrl:
      "https://www.nice-work.org.uk/e/monsal-trail-october-half-marathon-and-10k-weekend-10050",
    source:
      "https://www.nice-work.org.uk/e/monsal-trail-october-half-marathon-and-10k-weekend-10050",
    notes:
      "Nice Work confirms the Sunday Monsal Trail 10K on 25 October 2026 at 10:00 from Bakewell Station.",
    publishAllDistances: true,
  },
  "polesden-lacey-10k|2026-10-25|10K": {
    status: "Open",
    startTime: "09:00",
    entryUrl:
      "https://www.nationaltrust.org.uk/visit/surrey/polesden-lacey/events/6ae7564c-7591-4e38-a056-0bea88be8062",
    source:
      "https://www.nationaltrust.org.uk/visit/surrey/polesden-lacey/events/6ae7564c-7591-4e38-a056-0bea88be8062",
    notes:
      "The National Trust event page confirms the Polesden Lacey 10K on Sunday 25 October 2026 at 09:00.",
    publishAllDistances: true,
  },
  "regents-park-5k-10k-october|2026-10-25|10K": {
    status: "Open",
    startTime: "09:00",
    entryUrl: "https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026",
    source: "https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026",
    notes:
      "RunThrough confirms the Regent's Park 10K on Sunday 25 October 2026 at 09:00 from The Broad Walk. The flat, chip-timed park race has direct organiser entry.",
    publishAllDistances: true,
  },
  "rosemullion-10k|2026-10-25|10K": {
    status: "Open",
    startTime: "10:00",
    entryUrl: "https://www.sientries.co.uk/event/rosemullion-10k-2026?elid=Y",
    source: "https://www.falmouthrunningclub.co.uk/race-list",
    notes:
      "Falmouth Running Club confirms the Rosemullion 10K on Sunday 25 October 2026 at 10:00 from Carwinion Playing Field, Mawnan Smith. The multi-terrain route uses coast paths, fields and lanes.",
    publishAllDistances: true,
  },
  "running-tribe-races-october|2026-10-25|10K": {
    status: "Open",
    startTime: "09:00",
    entryUrl: "https://findarace.com/events/running-tribe-races",
    source: "https://findarace.com/events/running-tribe-races",
    notes:
      "The organiser's official booking partner confirms the 10K at Chalfont Park Sports Club on Sunday 25 October 2026 at 09:00. The loop is approximately 80% trail and 20% road.",
    publishAllDistances: true,
  },
  "stroud-half-marathon|2026-10-25|10K": {
    status: "Open",
    startTime: "09:20",
    entryUrl: "https://race-nation.co.uk/register/racenation-events-ltd/stroud-10k-2026",
    source: "https://www.stroudhalf.com/events/stroud-10k/",
    notes:
      "The official Stroud event page confirms the UK Athletics-licensed 10K on Sunday 25 October 2026 at 09:20, starting at Grove Lane and finishing at Marling School.",
    publishAllDistances: true,
  },
  "the-one-in-the-park-greenwich-park-10k-5k|2026-10-25|10K": {
    status: "Open",
    startTime: "09:30",
    entryUrl:
      "https://enter.onerace.events/register/onerace-events/one-in-the-park-greenwich-october",
    source: "https://www.onerace.events/london-5k-10k-greenwich-park-october",
    notes:
      "OneRace confirms The One in the Park Greenwich 10K on Sunday 25 October 2026 at 09:30 in Greenwich Park, with entry through the organiser's branded checkout.",
    publishAllDistances: true,
  },
  "the-pumpkin-plod|2026-10-25|10K": {
    status: "Open",
    startTime: "09:00",
    entryUrl: "https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105",
    source: "https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105",
    notes:
      "Zig Zag Running confirms Pumpkin Plod at Ferry Meadows on Sunday 25 October 2026. The 10K uses the mixed gravel-and-grass loop, with a 09:00 six-hour wave and an additional 11:00 four-hour wave.",
    publishAllDistances: true,
  },
};

export const ukTenKRelease64SeriesOverrides: Record<string, Partial<Series>> = {
  "regents-park-5k-10k-october": {
    name: "Regent's Park 5K & 10K — October 2026",
    city: "London",
    county: "Greater London",
    country: "England",
    area: "The Broad Walk, Regent's Park",
    surface: "Road",
    distances: ["5K", "10K"],
    summary: "Regent's Park 5K & 10K — flat, chip-timed park racing in central London.",
    description:
      "RunThrough's October 5K and 10K use a flat, accurately measured course on the roads and paths of Regent's Park, starting from The Broad Walk.",
    organiser: "RunThrough Events",
    website: "https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026",
    source_url: "https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026",
  },
  "rosemullion-10k": {
    name: "Rosemullion 10K",
    city: "Mawnan Smith",
    county: "Cornwall",
    country: "England",
    area: "Carwinion Playing Field and Rosemullion Head",
    surface: "Mixed",
    distances: ["10K"],
    summary: "Rosemullion 10K — a multi-terrain coastal race near Falmouth.",
    description:
      "Falmouth Running Club's Rosemullion 10K starts at Carwinion Playing Field and crosses coast paths, fields and quiet lanes around Mawnan Smith and Rosemullion Head.",
    organiser: "Falmouth Running Club",
    website: "https://www.falmouthrunningclub.co.uk/race-list",
    source_url: "https://www.falmouthrunningclub.co.uk/race-list",
  },
  "running-tribe-races-october": {
    name: "Running Tribe Races — October 2026",
    city: "Chalfont St Peter",
    county: "Buckinghamshire",
    country: "England",
    area: "Chalfont Park Sports Club",
    surface: "Mixed",
    distances: ["10K", "Half", "Marathon", "Ultra"],
    summary: "Running Tribe Races — trail-led loop racing at Chalfont Park.",
    description:
      "Running Tribe's October event uses a loop from Chalfont Park Sports Club over an approximately 80% trail and 20% road course, with 10K through ultra-distance options.",
    organiser: "Running Tribe",
    website: "https://runningtribe.co.uk/",
    source_url: "https://runningtribe.co.uk/",
  },
  "stroud-half-marathon": {
    name: "Stroud Half Marathon & 10K",
    city: "Stroud",
    county: "Gloucestershire",
    country: "England",
    area: "Grove Lane to Marling School",
    surface: "Road",
    distances: ["10K", "Half"],
    summary: "Stroud Half Marathon & 10K — licensed road races in Gloucestershire.",
    description:
      "The Stroud 10K is a UK Athletics-licensed road race starting at Grove Lane and finishing at Marling School, staged alongside the established half marathon.",
    organiser: "Stroud Half Marathon",
    website: "https://www.stroudhalf.com/events/stroud-10k/",
    source_url: "https://www.stroudhalf.com/events/stroud-10k/",
  },
  "the-one-in-the-park-greenwich-park-10k-5k": {
    name: "The One in the Park — Greenwich 5K & 10K",
    city: "London",
    county: "Greater London",
    country: "England",
    area: "Greenwich Park",
    surface: "Road",
    distances: ["5K", "10K"],
    summary: "The One in the Park — 5K and 10K racing in Greenwich Park.",
    description:
      "OneRace stages chip-timed 5K and 10K races within Greenwich Park, starting together on Great Cross Avenue.",
    organiser: "OneRace Events",
    website: "https://www.onerace.events/london-5k-10k-greenwich-park-october",
    source_url: "https://www.onerace.events/london-5k-10k-greenwich-park-october",
  },
  "the-pumpkin-plod": {
    name: "Pumpkin Plod",
    city: "Peterborough",
    county: "Cambridgeshire",
    country: "England",
    area: "Ferry Meadows",
    surface: "Mixed",
    distances: ["5K", "10K", "Half", "Marathon", "Ultra"],
    summary: "Pumpkin Plod — flexible-distance loop running at Ferry Meadows.",
    description:
      "Zig Zag Running's Pumpkin Plod uses a 5.3K mixed gravel-and-grass loop at Ferry Meadows, allowing runners to complete distances from 5K through ultra within four- or six-hour windows.",
    organiser: "Zig Zag Running",
    website: "https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105",
    source_url: "https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105",
  },
};

export const ukTenKRelease64EntryOptions: Record<string, EntryOptionSeed[]> = {
  "regents-park-5k-10k-october|2026-10-25|10K": verifiedPrimary(
    "official-runthrough-regents-park-october-2026",
    "RunThrough official entry",
    "https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026",
    "https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026",
    "official",
    {
      priceAmount: 32,
      priceCurrency: "GBP",
      notes: "Official organiser checkout for the 10K starting at 09:00.",
    },
  ),
  "rosemullion-10k|2026-10-25|10K": verifiedPrimary(
    "official-sientries-rosemullion-2026",
    "Falmouth Running Club official entry",
    "https://www.sientries.co.uk/event/rosemullion-10k-2026?elid=Y",
    "https://www.falmouthrunningclub.co.uk/race-list",
    "official",
    {
      notes: "Official club-linked SiEntries checkout for the 2026 Rosemullion 10K.",
    },
  ),
  "running-tribe-races-october|2026-10-25|10K": verifiedPrimary(
    "official-booking-partner-running-tribe-october-2026",
    "Find a Race — official booking partner",
    "https://findarace.com/events/running-tribe-races",
    "https://findarace.com/events/running-tribe-races",
    "third_party",
    {
      priceAmount: 40,
      priceCurrency: "GBP",
      notes:
        "Exact-date checkout supplied by the organiser's stated official booking partner for the 10K option.",
    },
  ),
  "stroud-half-marathon|2026-10-25|10K": verifiedPrimary(
    "official-racenation-stroud-10k-2026",
    "Stroud 10K official entry",
    "https://race-nation.co.uk/register/racenation-events-ltd/stroud-10k-2026",
    "https://www.stroudhalf.com/events/stroud-10k/",
    "official",
    {
      notes: "Direct RaceNation checkout linked from the official Stroud 10K page.",
    },
  ),
  "the-one-in-the-park-greenwich-park-10k-5k|2026-10-25|10K": verifiedPrimary(
    "official-onerace-greenwich-october-2026",
    "OneRace official entry",
    "https://enter.onerace.events/register/onerace-events/one-in-the-park-greenwich-october",
    "https://www.onerace.events/london-5k-10k-greenwich-park-october",
    "official",
    {
      priceAmount: 26,
      priceCurrency: "GBP",
      notes: "Organiser-branded checkout for the Greenwich Park 10K.",
    },
  ),
  "the-pumpkin-plod|2026-10-25|10K": verifiedPrimary(
    "official-eventrac-pumpkin-plod-2026",
    "Zig Zag Running official entry",
    "https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105",
    "https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105",
    "official",
    {
      notes:
        "Official Eventrac checkout; runners can choose the 09:00 six-hour or 11:00 four-hour wave.",
    },
  ),
};
