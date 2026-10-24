import { isParkrunResult } from "./parkrun-timing.ts";
import type { ProfileResult } from "./profile-records";
import type { SourceHistory, SourcePerformance } from "./source-performance-history";
import { countryFlag } from "./country-flags.ts";
import { sourceHistorySport } from "./source-history-sport.ts";
import { hasFixedDurationDistanceMark, hasMinutePrecisionTime } from "./performance-timing.ts";
import type { Sport } from "./types";
import {
  historicalDistance,
  historicalMark,
  historicalPbEligible,
  historicalTime,
} from "./history-performance.ts";

export type HistoryResult = {
  key: string;
  sport: Sport | "Unclassified";
  performance: SourcePerformance & { displaySport?: Sport | "Unclassified" };
};

/** Preserve an explicit source trail label instead of treating every distance as road. */
export function isTrailHistoryResult(row: SourcePerformance): boolean {
  return (
    /\btrail\b/i.test(row.discipline) ||
    row.labels.some((label) => /^(?:trail|trail running)$/i.test(label.trim()))
  );
}

const crossCountryDiscipline = /\b(?:cross[ -]country|xc)\b/i;
export function isCrossCountryHistoryResult(row: SourcePerformance): boolean {
  return (
    crossCountryDiscipline.test(row.discipline) ||
    crossCountryDiscipline.test(row.meeting ?? "") ||
    /^(?:Z|\d+(?:\.\d+)?[KM]?)XCL?$/i.test(row.discipline.trim()) ||
    row.labels.some((label) => /^(?:cross[ -]country|xc)$/i.test(label.trim()))
  );
}

/** A distance identifies the discipline, not the course surface. */
export function historyResultSurface(
  row: SourcePerformance,
  sport: HistoryResult["sport"],
): string {
  if (sport === "Walking") {
    const surfaces = [
      ...new Set(
        row.labels
          .filter((label) => /^(?:road|track)$/i.test(label.trim()))
          .map((label) => (/^track$/i.test(label.trim()) ? "Track" : "Road")),
      ),
    ];
    return surfaces.length === 1 ? surfaces[0] : "Unknown";
  }
  if (sport === "Running" || sport === "Parkrun") {
    const surfaces = new Set<string>();
    if (isCrossCountryHistoryResult(row)) surfaces.add("Cross Country");
    if (isTrailHistoryResult(row)) surfaces.add("Trail");
    for (const [pattern, surface] of [
      [/\broad\b/i, "Road"],
      [/\bmulti[ -]terrain\b/i, "Multi-terrain"],
      [/\bfell\b/i, "Fell"],
      [/\bmountain\b/i, "Mountain"],
    ] as const) {
      if (
        (pattern.test(row.discipline) &&
          !(
            surface === "Road" &&
            /\b(?:off[ -]?road|non[ -]?road|not(?: an?)? road)\b/i.test(row.discipline)
          )) ||
        row.labels.some((label) =>
          new RegExp(`^(?:${pattern.source})(?: running)?$`, "i").test(label.trim()),
        )
      )
        surfaces.add(surface);
    }
    // Conflicting labels cannot establish a surface either.
    return surfaces.size === 1 ? [...surfaces][0] : "Unknown";
  }
  if (sport !== "Athletics") return "";
  if (/pentathlon|heptathlon|decathlon/i.test(row.discipline)) return "Combined events";
  return /jump|shot|^sp\d|discus|javelin|hammer/i.test(row.discipline) ? "Field" : "Track";
}

function historySport(
  discipline: string,
  provider?: string,
  meeting?: string,
): HistoryResult["sport"] {
  return sourceHistorySport(discipline, provider, meeting) ?? "Unclassified";
}

/** Sport labels include visible legacy histories as well as additional marks. */
export function sourceHistorySports(histories: readonly SourceHistory[]): Sport[] {
  return [
    ...new Set(
      histories.flatMap((history) =>
        history.performances
          .filter((performance) => !performance.profileExcluded)
          .map((performance) =>
            performance.displaySport === "Unclassified"
              ? null
              : (performance.displaySport ??
                sourceHistorySport(performance.discipline, history.provider, performance.meeting)),
          )
          .filter((sport): sport is Sport => sport !== null),
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
    row.syntheticTest ||
    row.profileExcluded ||
    row.disqualification ||
    /\b(?:DNF|DNS|DQ|DSQ|NM|NH|retired|withdrawn)\b/i.test(row.performance) ||
    /conflicting (?:source|details|result)/i.test(row.notes ?? "")
  )
    return false;
  const mark = row.performance.trim();
  const positiveMark =
    hasFixedDurationDistanceMark(mark, row.discipline) ||
    hasMinutePrecisionTime(mark) ||
    (/^(?:\d+:)*\d+(?:\.\d+)?a?(?:\((?:\d+:)*\d+(?:\.\d+)?\))?[aiwc]*$/i.test(mark) &&
      /[1-9]/.test(mark));
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
  options: { includeUnreviewedHistory?: boolean } = {},
): AchievementResult[] {
  const normal = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const distance = (s: string) => normal(s).replace(/^half marathon$/, "half");
  const history = additionalHistoryResults(histories, options.includeUnreviewedHistory).filter(
    ({ performance: row }) =>
      !results.some(
        (r) =>
          r.eventDate === row.date &&
          distance(r.distanceCode) === distance(row.discipline) &&
          ((row.eventSlug && r.eventSlug === row.eventSlug) ||
            normal(r.eventName) === normal(row.meeting) ||
            (r.sourceKeys ?? r.sourceUrls).some((key) =>
              (row.sourceKeys ?? row.sourceUrls).includes(key),
            )),
      ),
  );
  const conflictKey = ({ performance: row, sport }: HistoryResult) =>
    JSON.stringify([
      row.date,
      sport,
      historicalDistance(row.discipline, sport).code,
      normal(row.meeting),
      normal(row.labels.find((label) => /^round:/i.test(label)) ?? ""),
    ]);
  const marks = new Map<string, Set<string>>();
  for (const entry of history) {
    const key = conflictKey(entry);
    const values = marks.get(key) ?? new Set<string>();
    const mark = historicalMark(entry.performance);
    values.add(mark ? JSON.stringify([mark.seconds, mark.aided]) : entry.performance.performance);
    marks.set(key, values);
  }
  return [
    ...results,
    ...history.map((entry, index): AchievementResult => {
      const row = entry.performance;
      const parkrun = isParkrunResult({
        sport: entry.sport,
        eventName: row.meeting,
        distanceCode: row.discipline,
      });
      const distance = historicalDistance(row.discipline, entry.sport);
      const mark = historicalMark(row);
      const conflicting = Boolean(row.date) && (marks.get(conflictKey(entry))?.size ?? 0) > 1;
      const timed =
        !conflicting && isCompletedHistoryResult(row) && historicalPbEligible(row) && !mark?.aided;
      // Unknown/ambiguous years remain unknown for calendar-year and date-window milestones.
      const year = row.yearLabel || String(row.year);
      return {
        history: entry,
        resultId: -(index + 1),
        editionId: 0,
        eventName: row.meeting,
        eventSlug: row.eventSlug ?? "",
        sport: parkrun ? "Parkrun" : entry.sport,
        surface: parkrun ? "Parkrun" : historyResultSurface(row, entry.sport),
        country: historyResultCountry(row),
        eventDate: row.date || (/^\d{4}$/.test(year) ? year : ""),
        distanceCode: distance.code,
        distanceKm: distance.km,
        status: "finished",
        conflicting,
        finishTimeSeconds: timed ? (mark?.seconds ?? null) : null,
        chipTimeSeconds:
          !parkrun && timed && row.timing?.chip ? historicalTime(row.timing.chip) : null,
        gunTimeSeconds:
          !parkrun && timed && row.timing?.gun ? historicalTime(row.timing.gun) : null,
        overallPlace: null,
        category: row.ageGroup || null,
        sourceUrls: row.sourceUrls,
        resultSource: row.verificationStatus,
        details: {
          disqualification: row.disqualification,
          verificationStatus: row.verificationStatus,
          note: row.notes,
        },
      };
    }),
  ];
}

export type ResultsHistoryEntry =
  { kind: "recorded"; result: ProfileResult } | { kind: "history"; result: HistoryResult };

/** Published additional marks retain their precision while verification is pending. */
export function additionalHistoryResults(
  histories: readonly SourceHistory[],
  includeUnreviewed = false,
): HistoryResult[] {
  return histories.flatMap((history) =>
    history.performances.flatMap((performance, index) =>
      (includeUnreviewed || performance.verificationStatus !== undefined) &&
      !performance.profileExcluded
        ? [
            {
              key: `${history.provider}:${history.externalId}:${index}`,
              sport:
                performance.displaySport ??
                historySport(performance.discipline, history.provider, performance.meeting),
              performance: {
                ...performance,
                providerName: performance.providerName || history.provider,
              },
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
