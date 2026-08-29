import type { Edition } from "./types";

const POLESDEN_LACEY_SOURCE =
  "https://www.nationaltrust.org.uk/visit/surrey/polesden-lacey/events/6ae7564c-7591-4e38-a056-0bea88be8062";

/**
 * Missing source dependency for release 64.
 *
 * Polesden Lacey already has a canonical event series and verified enrichment,
 * but the catalogue did not contain a dated 10K edition for the override to amend.
 */
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
      "The National Trust confirms the Polesden Lacey 10K on Sunday 25 October 2026 at 09:00.",
    publishAllDistances: true,
  },
];
