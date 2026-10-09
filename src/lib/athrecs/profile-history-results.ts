import type { ProfileResult } from "./profile-records";
import type { SourceHistory, SourcePerformance } from "./source-performance-history";

export type HistoryResult = {
  key: string;
  sport: "Running" | "Athletics";
  performance: SourcePerformance;
};

export type ResultsHistoryEntry =
  { kind: "recorded"; result: ProfileResult } | { kind: "history"; result: HistoryResult };

/** Additional marks retain their original precision and layout after verification. */
export function additionalHistoryResults(histories: readonly SourceHistory[]): HistoryResult[] {
  return histories.flatMap((history) =>
    history.performances.flatMap((performance, index) =>
      performance.verificationStatus !== undefined && !performance.profileExcluded
        ? [
            {
              key: `${history.provider}:${history.externalId}:${index}`,
              sport:
                /^(?:marathon|half(?: marathon)?|\d+(?:\.\d+)?\s*k(?:m)?|\d+(?:\.\d+)?\s*(?:mi|mile|miles))$/i.test(
                  performance.discipline.trim(),
                )
                  ? ("Running" as const)
                  : ("Athletics" as const),
              performance,
            },
          ]
        : [],
    ),
  );
}

export function resultHistoryYear(entry: ResultsHistoryEntry): string {
  return entry.kind === "recorded"
    ? entry.result.eventDate.slice(0, 4)
    : entry.result.performance.yearLabel || String(entry.result.performance.year);
}

export function combineResultsHistory(
  results: readonly ProfileResult[],
  history: readonly HistoryResult[],
): ResultsHistoryEntry[] {
  const entries: ResultsHistoryEntry[] = [
    ...results.map((result) => ({ kind: "recorded" as const, result })),
    ...history.map((result) => ({ kind: "history" as const, result })),
  ];
  const date = (entry: ResultsHistoryEntry) =>
    entry.kind === "recorded"
      ? entry.result.eventDate
      : entry.result.performance.date || String(entry.result.performance.year);
  // A missing day stays year-only; sorting never manufactures a displayed date.
  return entries.sort((a, b) => date(b).localeCompare(date(a)));
}
