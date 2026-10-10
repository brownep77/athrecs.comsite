import type { ProfileResult } from "./profile-records";
import type { SourceHistory, SourcePerformance } from "./source-performance-history";
import { countryFlag } from "./country-flags.ts";

export type HistoryResult = {
  key: string;
  sport: "Running" | "Athletics" | "Triathlon" | "Duathlon";
  performance: SourcePerformance;
};

function historySport(discipline: string): HistoryResult["sport"] {
  // Explicit multisport labels take priority over distances within a race leg.
  if (/\btriathlon\b/i.test(discipline)) return "Triathlon";
  if (/\bduathlon\b/i.test(discipline)) return "Duathlon";
  // World Athletics uses these unqualified names for track events.
  if (/^(?:mile|2 miles)$/i.test(discipline.trim())) return "Athletics";
  if (/^mile road$/i.test(discipline.trim())) return "Running";
  return /^(?:marathon|half(?: marathon)?|\d+(?:\.\d+)?\s*(?:k(?:m)?|kilometres|kilometers)|\d+(?:\.\d+)?\s*(?:mi|mile|miles))(?: road)?$/i.test(
    discipline.trim().replace(/\s*\(short course\)$/i, ""),
  )
    ? "Running"
    : "Athletics";
}

/** Sport labels include visible legacy histories as well as additional marks. */
export function sourceHistorySports(histories: readonly SourceHistory[]): HistoryResult["sport"][] {
  return [
    ...new Set(
      histories.flatMap((history) =>
        history.performances
          .filter((performance) => !performance.profileExcluded)
          .map((performance) => historySport(performance.discipline)),
      ),
    ),
  ];
}

export function historyResultAnchor(key: string): string {
  return `history-result-${encodeURIComponent(key)}`;
}

/** Use supplied geography, never the athlete's nationality or a guessed city match. */
export function historyResultCountry(row: SourcePerformance): string {
  if (row.country) return countryFlag(row.country).name;
  const direct = countryFlag(row.venue);
  if (direct.code) return direct.name;
  const suffix = row.venue.includes(",") ? row.venue.split(",").at(-1)?.trim() : "";
  const flag = countryFlag(suffix);
  return flag.code ? flag.name : "";
}

/** A completion icon records an accepted finish, not a podium medal or source-verification. */
export function isCompletedHistoryResult(row: SourcePerformance, today = new Date()): boolean {
  if (
    !["source_verified", "verified_by_administrator"].includes(row.verificationStatus ?? "") ||
    row.profileExcluded ||
    row.disqualification ||
    /\b(?:DNF|DNS|DQ|DSQ|NM|NH|retired|withdrawn)\b/i.test(row.performance) ||
    /conflicting (?:source|details|result)/i.test(row.notes ?? "")
  )
    return false;
  const mark = row.performance.trim();
  const positiveMark =
    /^(?:\d+:)*\d+(?:\.\d+)?(?:\((?:\d+:)*\d+(?:\.\d+)?\))?[iwc]*$/i.test(mark) &&
    /[1-9]/.test(mark);
  // Some accepted relay reports establish a finish/place but omit the team time.
  if (!positiveMark && !(mark === "" && /^[1-9]\d*$/.test(row.place))) return false;
  if (row.date) {
    const day = Date.parse(`${row.date}T00:00:00Z`);
    return (
      Number.isFinite(day) &&
      new Date(day).toISOString().slice(0, 10) === row.date &&
      day <= today.getTime()
    );
  }
  const years = (row.yearLabel || String(row.year)).match(/\b\d{4}\b/g)?.map(Number) ?? [];
  return years.length > 0 && Math.max(...years) <= today.getUTCFullYear();
}

export type AchievementResult = ProfileResult & { history?: HistoryResult };

/** Display-only projection: no fabricated DB records, dates, timing bases or podium places. */
export function profileAchievementResults(
  results: readonly ProfileResult[],
  histories: readonly SourceHistory[],
): AchievementResult[] {
  const normal = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const distance = (s: string) => normal(s).replace(/^half marathon$/, "half");
  const history = additionalHistoryResults(histories).filter(
    ({ performance: row }) =>
      !results.some(
        (r) =>
          r.eventDate === row.date &&
          distance(r.distanceCode) === distance(row.discipline) &&
          ((row.eventSlug && r.eventSlug === row.eventSlug) ||
            normal(r.eventName) === normal(row.meeting) ||
            r.sourceUrls.some((url) => row.sourceUrls.includes(url))),
      ),
  );
  return [
    ...results,
    ...history.map((entry, index): AchievementResult => {
      const row = entry.performance;
      const code = row.discipline.trim();
      const km = /^marathon$/i.test(code)
        ? 42.195
        : /^half(?: marathon)?$/i.test(code)
          ? 21.0975
          : /^(\d+(?:\.\d+)?)\s*k(?:m)?$/i.exec(code);
      const distanceKm = typeof km === "number" ? km : km ? Number(km[1]) : 0;
      // Unknown/ambiguous years remain unknown for calendar-year and date-window milestones.
      const year = row.yearLabel || String(row.year);
      return {
        history: entry,
        resultId: -(index + 1),
        editionId: 0,
        eventName: row.meeting,
        eventSlug: row.eventSlug ?? "",
        sport: entry.sport,
        surface:
          entry.sport === "Running"
            ? "Road"
            : entry.sport === "Athletics"
              ? /jump|shot|^sp\d|discus|javelin|hammer/i.test(code)
                ? "Field"
                : "Track"
              : "",
        country: historyResultCountry(row),
        eventDate: row.date || (/^\d{4}$/.test(year) ? year : ""),
        distanceCode: code,
        distanceKm,
        status: "finished",
        finishTimeSeconds: null,
        chipTimeSeconds: null,
        gunTimeSeconds: null,
        overallPlace: null,
        category: row.ageGroup || null,
        sourceUrls: row.sourceUrls,
        resultSource: row.verificationStatus,
        details: { disqualification: row.disqualification },
      };
    }),
  ];
}

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
              sport: historySport(performance.discipline),
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
