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
import { achievementResultVerified } from "./achievement-verification.ts";

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
    | { kind: "recorded"; value: AchievementResult; verified: boolean }
    | { kind: "reported"; value: ReportedPersonalBest; verified: boolean };
  const bests = new Map<string, Candidate>();
  // Published legacy histories may predate the explicit verification field.
  // Count their eligible marks; verification remains a separate display decision.
  const projected = profileAchievementResults(results, histories, {
    includeUnreviewedHistory: true,
  });
  // Prefer confirmed evidence for equal marks without hiding a faster pending PB.
  const confirmedFirst = [...projected].sort(
    (a, b) => Number(achievementResultVerified(b)) - Number(achievementResultVerified(a)),
  );
  for (const value of findPersonalBests(confirmedFirst)) {
    bests.set(personalBestGroup(value), {
      kind: "recorded",
      value,
      verified: achievementResultVerified(value),
    });
  }
  const supplied: Array<{ value: ReportedPersonalBest; verified: boolean }> = projected.flatMap((result) => {
    const row = result.history?.performance;
    if (!row?.reportedPersonalBest || !hasHistoryFinish(row) || !historicalPbEligible(row))
      return [];
    const mark = historicalMark(row)!;
    if (!eligiblePerformance({ ...result, finishTimeSeconds: mark.seconds })) return [];
    return [
      {
        value: {
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
        verified: achievementResultVerified(result),
      },
    ];
  });
  for (const { value, verified } of [
    ...reported.map((value) => ({ value, verified: false })),
    ...supplied,
  ]) {
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
      bests.set(key, { kind: "reported", value, verified });
    }
  }
  return [...bests.values()].sort(
    (a, b) => a.value.sport.localeCompare(b.value.sport) || a.value.distanceKm - b.value.distanceKm,
  );
}
