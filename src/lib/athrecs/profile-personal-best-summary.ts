import { isParkrunResult } from "./parkrun-timing.ts";
import { personalBestGroup } from "./profile-records.ts";
import { selectProfilePersonalBests } from "./reported-personal-bests.ts";
import { historicalTime } from "./history-performance.ts";
import { formatDuration } from "./format.ts";
import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";

/** Retain source fractions only when they agree with the stored finish to within rounding. */
function recordedMark(row: ProfileResult): string {
  const mark = row.details?.reportedPerformance?.trim();
  const seconds = mark ? historicalTime(mark) : null;
  return mark &&
    seconds != null &&
    row.finishTimeSeconds != null &&
    Math.abs(seconds - row.finishTimeSeconds) < 1
    ? mark
    : formatDuration(row.finishTimeSeconds);
}

/** Public cards are calculated before pagination and contain no private evidence. */
export function profilePersonalBestSummary(
  results: readonly ProfileResult[],
  histories: readonly SourceHistory[],
) {
  return selectProfilePersonalBests([...results], [], histories).map((candidate) => {
    const row = candidate.value;
    return {
      verified: candidate.verified,
      id: `${personalBestGroup(row)}|${candidate.kind === "reported" ? (candidate.value.qualification ?? "") : ""}`,
      sport: isParkrunResult(row) ? "Parkrun" : row.sport,
      surface: isParkrunResult(row) ? "Parkrun" : row.surface,
      distance: row.distanceCode,
      mark:
        candidate.kind === "reported"
          ? (candidate.value.displayMark ?? formatDuration(row.finishTimeSeconds))
          : (candidate.value.history?.performance.performance ?? recordedMark(candidate.value)),
      event: candidate.kind === "reported" ? candidate.value.event : candidate.value.eventName,
      date: candidate.kind === "reported" ? candidate.value.date : candidate.value.eventDate,
      label:
        candidate.kind === "reported"
          ? candidate.value.qualification
            ? "Aided-course best · Reported"
            : "Reported PB"
          : "PB",
    };
  });
}
export type PersonalBestSummary = ReturnType<typeof profilePersonalBestSummary>;
