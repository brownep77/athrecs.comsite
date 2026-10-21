import { selectProfilePersonalBests } from "./reported-personal-bests.ts";
import { formatDuration } from "./format.ts";
import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";

/** Public cards are calculated before pagination and contain no private evidence. */
export function profilePersonalBestSummary(
  results: readonly ProfileResult[],
  histories: readonly SourceHistory[],
) {
  return selectProfilePersonalBests([...results], [], histories).map((candidate) => {
    const row = candidate.value;
    return {
      verified: candidate.verified,
      id: `${row.sport}|${row.surface}|${row.distanceCode}|${candidate.kind === "reported" ? (candidate.value.qualification ?? "") : ""}`,
      sport: row.sport,
      surface: row.surface,
      distance: row.distanceCode,
      mark:
        candidate.kind === "reported"
          ? (candidate.value.displayMark ?? formatDuration(row.finishTimeSeconds))
          : (candidate.value.history?.performance.performance ??
            formatDuration(row.finishTimeSeconds)),
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
