import { findPersonalBests, personalBestGroup, type ProfileResult } from "./profile-records";

export const CHIP_TIME_CAVEAT = "Not verified by chip time";

export type ReportedPersonalBest = {
  id: string;
  recordId?: string;
  sport: string;
  surface: string;
  distanceCode: string;
  distanceKm: number;
  finishTimeSeconds: number;
  event: string;
  date: string;
  note: string;
  sources: readonly { label: string; url: string }[];
};

/** Explicitly opted-in reported PBs compete with recorded PBs; verification is not implied. */
export function selectProfilePersonalBests(
  results: ProfileResult[],
  reported: readonly ReportedPersonalBest[] = [],
) {
  type Candidate =
    { kind: "recorded"; value: ProfileResult } | { kind: "reported"; value: ReportedPersonalBest };
  const bests = new Map<string, Candidate>();
  for (const value of findPersonalBests(results)) {
    bests.set(personalBestGroup(value), { kind: "recorded", value });
  }
  for (const value of reported) {
    if (
      !Number.isFinite(value.finishTimeSeconds) ||
      value.finishTimeSeconds <= 0 ||
      value.distanceKm <= 0 ||
      !value.sources.length
    )
      continue;
    const key = personalBestGroup(value);
    const previous = bests.get(key);
    if (!previous || value.finishTimeSeconds < previous.value.finishTimeSeconds!) {
      bests.set(key, { kind: "reported", value });
    }
  }
  return [...bests.values()].sort(
    (a, b) => a.value.sport.localeCompare(b.value.sport) || a.value.distanceKm - b.value.distanceKm,
  );
}
