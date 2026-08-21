import type { Sport } from "./types";

export const PRIORITY_HOME_SPORTS: readonly Sport[] = [
  "Running",
  "Athletics",
  "Triathlon",
  "Cycling",
];

export type HomeSportUpdate = {
  id: string;
  kind: "fixture" | "results";
  sport: Sport;
  eventSlug: string;
  eventName: string;
  country: string;
  county: string;
  city: string;
  eventDate: string;
  distance: string;
  status: string;
  providerName: string | null;
  publishedAt: string;
};

export function homeRegionLabel(update: Pick<HomeSportUpdate, "country" | "county">): string {
  const country = update.country.trim();
  const county = update.county.trim();
  if (!county || county.toLowerCase() === country.toLowerCase()) return country || "Worldwide";
  return `${county}, ${country}`;
}

/**
 * Keep the all-sports feed balanced instead of letting the largest catalogue
 * (currently Running) occupy every homepage card.
 */
export function selectBalancedHomeUpdates(
  updates: HomeSportUpdate[],
  sport: Sport | "All",
  region: string,
  limit = 8,
): HomeSportUpdate[] {
  const regionFiltered = updates.filter(
    (update) => region === "All" || homeRegionLabel(update) === region,
  );
  if (sport !== "All") {
    return regionFiltered.filter((update) => update.sport === sport).slice(0, limit);
  }

  const sports = [
    ...PRIORITY_HOME_SPORTS,
    ...[...new Set(regionFiltered.map((update) => update.sport))]
      .filter((candidate) => !PRIORITY_HOME_SPORTS.includes(candidate))
      .sort((a, b) => a.localeCompare(b)),
  ];
  const queues = new Map(
    sports.map((candidate) => [
      candidate,
      regionFiltered.filter((update) => update.sport === candidate),
    ]),
  );
  const selected: HomeSportUpdate[] = [];
  let round = 0;

  while (selected.length < limit) {
    let added = false;
    for (const candidate of sports) {
      const update = queues.get(candidate)?.[round];
      if (!update) continue;
      selected.push(update);
      added = true;
      if (selected.length === limit) break;
    }
    if (!added) break;
    round += 1;
  }

  return selected;
}
