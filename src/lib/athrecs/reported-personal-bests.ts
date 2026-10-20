import {
  eligiblePerformance,
  findPersonalBests,
  personalBestGroup,
  type ProfileResult,
} from "./profile-records.ts";
import { profileAchievementResults, type AchievementResult } from "./profile-history-results.ts";
import { historicalMark, historicalPbEligible } from "./history-performance.ts";
import { hasHistoryFinish } from "./profile-result-presentation.ts";
import type { SourceHistory } from "./source-performance-history";

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
  hasSourceEvidence?: boolean;
  displayMark?: string;
  qualification?: "Aided course";
};

/** Explicitly opted-in reported PBs compete with recorded PBs; verification is not implied. */
export function selectProfilePersonalBests(
  results: ProfileResult[],
  reported: readonly ReportedPersonalBest[] = [],
  histories: readonly SourceHistory[] = [],
) {
  type Candidate =
    | { kind: "recorded"; value: AchievementResult }
    | { kind: "reported"; value: ReportedPersonalBest };
  const bests = new Map<string, Candidate>();
  const projected = profileAchievementResults(results, histories);
  for (const value of findPersonalBests(projected)) {
    bests.set(personalBestGroup(value), { kind: "recorded", value });
  }
  const supplied: ReportedPersonalBest[] = projected.flatMap((result) => {
    const row = result.history?.performance;
    if (!row?.reportedPersonalBest || !hasHistoryFinish(row) || !historicalPbEligible(row))
      return [];
    const mark = historicalMark(row)!;
    if (!eligiblePerformance({ ...result, finishTimeSeconds: mark.seconds })) return [];
    return [
      {
        id: result.history!.key,
        sport: result.sport,
        surface: result.surface,
        distanceCode: result.distanceCode,
        distanceKm: result.distanceKm,
        finishTimeSeconds: mark.seconds,
        displayMark: mark.mark,
        event: result.eventName,
        date: result.eventDate,
        note: "Reported historical performance; verification is shown separately.",
        qualification: mark.aided ? ("Aided course" as const) : undefined,
        sources: row.sourceUrls.map((url) => ({ label: row.providerName || "Source", url })),
        hasSourceEvidence: Boolean(row.sourceUrls.length || row.sourceKeys?.length),
      },
    ];
  });
  for (const value of [...reported, ...supplied]) {
    if (
      !Number.isFinite(value.finishTimeSeconds) ||
      value.finishTimeSeconds <= 0 ||
      value.distanceKm <= 0 ||
      !(value.sources.length || value.hasSourceEvidence)
    )
      continue;
    const key = personalBestGroup(value) + (value.qualification ? `|${value.qualification}` : "");
    const previous = bests.get(key);
    if (!previous || value.finishTimeSeconds < previous.value.finishTimeSeconds!) {
      bests.set(key, { kind: "reported", value });
    }
  }
  return [...bests.values()].sort(
    (a, b) => a.value.sport.localeCompare(b.value.sport) || a.value.distanceKm - b.value.distanceKm,
  );
}
