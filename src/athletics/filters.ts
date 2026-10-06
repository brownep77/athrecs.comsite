import * as base from "../lib/athrecs/filters";
export * from "../lib/athrecs/filters";

/** Public event sports supported by ATHRECS. */
export const SPORTS = ["Athletics", "Running", "Parkrun", "Triathlon"] as const;
export const DEFAULT_SPORT = "Athletics" as const;

// The running directory's All option combines Running and Parkrun.
export function subfiltersForSport(sport: string): base.SubfilterDef[] {
  return base.subfiltersForSport(sport === "All" ? "Running" : sport);
}
export function subfilterKeysForSport(sport: string): Set<base.SubfilterKey> {
  return new Set(subfiltersForSport(sport).map((filter) => filter.key));
}
export function supportsRaceGroupFilter(sport: string): boolean {
  return sport === "All" || base.supportsRaceGroupFilter(sport);
}
