import type { Edition, Series } from "./types";

const URL =
  "https://www.wilddeerevents.co.uk/e/gibside-national-trust-wild-trail-runs-2027-14511";

/**
 * The original release treated Gibside as an edition override, but no 5K
 * source edition existed for the override to amend. Keep this tiny correction
 * separate from the reviewed release batch so the published counts remain
 * stable while the official 5K dependency is present in the catalogue.
 */
export const ukIrelandFiveKCorrectionSeries: Series[] = [
  {
    slug: "gibside-national-trust-trail-10k",
    name: "Gibside National Trust Wild Trail Runs",
    sport: "Running",
    country: "England",
    county: "Tyne and Wear",
    city: "Gateshead",
    area: "Gibside National Trust, Rowlands Gill",
    surface: "Trail",
    distances: ["5K", "10K"],
    summary: "Evening 5K and 10K trail races through the Gibside National Trust estate.",
    description:
      "Wild Deer Events' midweek trail races use Gibside's gardens, woodland and countryside, with official 5K and 10K routes.",
    organiser: "Wild Deer Events",
    website: URL,
    featured: false,
    source_url: URL,
    defaultStartTime: "19:15",
  },
];

export const ukIrelandFiveKCorrectionEditions: Edition[] = [
  {
    seriesSlug: "gibside-national-trust-trail-10k",
    date: "2027-05-05",
    distance: "5K",
    distanceKm: 5,
    status: "Open",
    entryUrl: URL,
    entryOptions: [
      {
        providerCode: "official-gibside-5k-2027",
        providerName: "Wild Deer Events",
        entryUrl: URL,
        entryType: "official",
        status: "open",
        checkedAt: "2026-08-28",
        sourceUrl: URL,
        isVerified: true,
        isPrimary: true,
        notes: "Official organiser page confirms the 5K distance and 19:15 start.",
      },
    ],
    startTime: "19:15",
    source: URL,
    notes:
      "Official organiser page confirms Wednesday 5 May 2027, a 5K trail route and a 19:15 start. Source checked 2026-08-28.",
    publishAllDistances: true,
  },
];
