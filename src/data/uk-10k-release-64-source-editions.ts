import type { Edition, Series } from "./types";

const POLESDEN_LACEY_SOURCE =
  "https://www.nationaltrust.org.uk/visit/surrey/polesden-lacey/events/6ae7564c-7591-4e38-a056-0bea88be8062";

/** Missing canonical event dependency for the next immutable 10K checkpoint. */
export const ukTenKRelease64SourceSeries: Series[] = [
  {
    slug: "polesden-lacey-10k",
    name: "Polesden Lacey Trust 10K Run",
    sport: "Running",
    country: "England",
    county: "Surrey",
    city: "Dorking",
    area: "Polesden Lacey Estate and Ranmore Common",
    surface: "Trail",
    distances: ["10K"],
    summary: "A free monthly 10K trail run around the Polesden Lacey estate.",
    description:
      "The National Trust's informal 10K follows a circular trail route through the Polesden Lacey Estate and Ranmore Common. It is suitable for all abilities and starts from the main visitor car park.",
    organiser: "National Trust",
    website: POLESDEN_LACEY_SOURCE,
    source_url: POLESDEN_LACEY_SOURCE,
    defaultStartTime: "09:00",
  },
];

/** Missing dated edition dependency for the release 64 catalogue override. */
export const ukTenKRelease64SourceEditions: Edition[] = [
  {
    seriesSlug: "polesden-lacey-10k",
    date: "2026-10-25",
    distance: "10K",
    distanceKm: 10,
    status: "Open",
    startTime: "09:00",
    entryUrl: POLESDEN_LACEY_SOURCE,
    source: POLESDEN_LACEY_SOURCE,
    notes:
      "The National Trust confirms the free Polesden Lacey Trust 10K run on Sunday 25 October 2026 at 09:00. Booking is not required.",
    publishAllDistances: true,
  },
];
