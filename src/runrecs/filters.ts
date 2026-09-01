import * as base from "../lib/athrecs/filters";

export * from "../lib/athrecs/filters";

/** RunRecs deliberately exposes only the two running catalogue families. */
export const SPORTS = ["All", "Running", "Parkrun"] as const;

export const DEFAULT_SPORT = "All" as const;

/** RunRecs keeps its four primary race filters visible as compact dropdowns. */
export const PREFER_DROPDOWN_FILTERS = true;

export function subfiltersForSport(sport: string): base.SubfilterDef[] {
  return base.subfiltersForSport(sport === "All" ? "Running" : sport);
}

export function subfilterKeysForSport(sport: string): Set<base.SubfilterKey> {
  return new Set(subfiltersForSport(sport).map((filter) => filter.key));
}

export function supportsRaceGroupFilter(sport: string): boolean {
  return sport === "All" || base.supportsRaceGroupFilter(sport);
}
