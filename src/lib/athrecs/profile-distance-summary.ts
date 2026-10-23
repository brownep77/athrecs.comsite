import { achievementResultVerified } from "./achievement-verification.ts";
import { historicalMark, historicalTime } from "./history-performance.ts";
import { historicalRatingTimingConsistent } from "./performance-rating.ts";
import {
  isCompletedHistoryResult,
  profileAchievementResults,
  type AchievementResult,
} from "./profile-history-results.ts";
import type { ProfileResult } from "./profile-records";
import { isDisqualified } from "./result-details.ts";
import type { SourceHistory } from "./source-performance-history";

export type ParticipationTally = {
  completedRaces: number;
  distanceKm: number;
  unknownDistanceRaces: number;
  racePoints: number;
  distancePoints: number;
  ultraBonusPoints: number;
  totalPoints: number;
  verifiedRaces: number;
  verifiedTotalPoints: number;
};

/** A derived completion tick does not change any stored result verification. */
export type DistanceSummaryFinish = AchievementResult & { participationVerified: boolean };
export type SeasonParticipationTally = ParticipationTally & { year: number };
export type ProfileDistanceSummary = {
  finishes: DistanceSummaryFinish[];
  allTime: ParticipationTally;
  seasons: SeasonParticipationTally[];
  currentSeason: SeasonParticipationTally;
  seasonYear: number;
};

const normal = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Per-event bonus: never apply thresholds to cumulative season/career kilometres. */
export function ultraParticipationBonus(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 42.195) return 0;
  return (
    2 * Math.max(0, distanceKm - 42.195) +
    Math.max(0, distanceKm - 100) +
    Math.max(0, distanceKm - 160.9344)
  );
}

/** Seasons and the future-result cutoff use the site's UK calendar. */
export function distanceSummaryToday(today: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(today);
  const part = (type: string) => parts.find((entry) => entry.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function exactDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

function datedBefore(result: AchievementResult, day: string): boolean {
  if (exactDay(result.eventDate)) {
    if (result.eventDate > day) return false;
  } else if (/^\d{4}$/.test(result.eventDate)) {
    // A partial current year cannot establish that a race has already happened.
    if (result.eventDate >= day.slice(0, 4)) return false;
  } else return false;
  const end = result.history?.performance.endDate;
  return !end || (exactDay(end) && end >= result.eventDate && end <= day);
}

function distanceFromCode(value: string, suppliedKm = 0): number | null {
  const code = normal(value);
  if (/^(?:half|half marathon|hm)$/.test(code)) return 21.0975;
  if (/^(?:full )?marathon$/.test(code)) return 42.195;
  if (code === "parkrun") return 5;
  const upperM = value.trim().match(/^(\d+(?:\.\d+)?)\s*M$/);
  if (upperM) {
    if (suppliedKm === 0) return null;
    const milesKm = Number(upperM[1]) * 1.609344;
    if (
      [milesKm, ...[1, 2, 3].map((places) => Number(milesKm.toFixed(places)))].includes(suppliedKm)
    )
      return milesKm;
  }
  const numeric = code.match(/^(\d+(?:\.\d+)?)\s*(k|km|m|metres|meters|mi|miles?)$/);
  if (!numeric) return null;
  return (
    Number(numeric[1]) *
    (/^(?:mi|mile|miles)$/.test(numeric[2])
      ? 1.609344
      : /^(?:m|metres|meters)$/.test(numeric[2])
        ? 0.001
        : 1)
  );
}

function knownDistance(result: AchievementResult): number {
  if (!Number.isFinite(result.distanceKm) || result.distanceKm < 0) return 0;
  const standard = distanceFromCode(result.distanceCode, result.distanceKm);
  if (result.distanceKm === 0) return standard ?? 0;
  // Restore only explicit standard-distance roundings already accepted for PBs.
  return standard != null &&
    [1, 2, 3].some((places) => result.distanceKm === Number(standard.toFixed(places)))
    ? standard
    : result.distanceKm;
}

function runningKind(result: AchievementResult): string | null {
  const sport = normal(result.sport);
  if (sport === "parkrun" || normal(result.surface) === "parkrun") return "parkrun";
  if (sport !== "running" && sport !== "athletics") return null;
  if (sport === "athletics" && /field|combined/i.test(result.surface)) return null;
  return /track/i.test(result.surface) ? "track" : "running";
}

function qualified(result: AchievementResult): boolean {
  const row = result.history?.performance;
  const qualifications = [result.distanceCode, row?.discipline, ...(row?.labels ?? [])].join(" ");
  return (
    !/\b(?:relay|split|intermediate|stage|team|short[ -]course)\b|\bmulti(?:day|[ -]day|stage|[ -]stage)\b/i.test(
      qualifications,
    ) &&
    !/\brelay\b|\b(?:team|stage)\s+(?:total|time|result)\b|\bmulti[ -]?stage\b/i.test(
      result.eventName,
    )
  );
}

function inScope(result: AchievementResult): boolean {
  const kind = runningKind(result);
  if (!kind || !qualified(result)) return false;
  if (!Number.isFinite(result.distanceKm) || result.distanceKm < 0) return false;
  const km = knownDistance(result);
  const explicit = distanceFromCode(result.distanceCode, result.distanceKm);
  if (km > 0 && explicit != null && Math.abs(km - explicit) > 0.0000001) return false;
  if (km > 0) return km >= 5;
  // A completed running race of unknown length earns completion points only.
  return normal(result.sport) === "running" || kind === "parkrun";
}

function complete(result: AchievementResult, day: string): boolean {
  if (
    result.conflicting ||
    isDisqualified(result) ||
    !datedBefore(result, day) ||
    /conflicting (?:source|details|result)|not legal/i.test(result.details?.note ?? "")
  )
    return false;
  const row = result.history?.performance;
  if (row)
    return (
      historicalRatingTimingConsistent(row) &&
      isCompletedHistoryResult(row, new Date(`${day}T23:59:59.999Z`))
    );
  if (
    result.finishTimeSeconds != null &&
    (!Number.isFinite(result.finishTimeSeconds) || result.finishTimeSeconds <= 0)
  )
    return false;
  return /^(?:finished|fin)$/i.test(result.status.trim());
}

function roundKey(result: AchievementResult): string {
  return normal(
    result.history?.performance.labels.find((label) => /^round:/i.test(label)) ??
      result.displayRound ??
      "",
  ).replace(/^round:\s*/, "");
}

function distanceKey(result: AchievementResult): string {
  const km = distanceFromCode(result.distanceCode, result.distanceKm) ?? knownDistance(result);
  return km > 0 ? String(km) : normal(result.distanceCode);
}

function sameRace(a: AchievementResult, b: AchievementResult): boolean {
  if (roundKey(a) && roundKey(b) && roundKey(a) !== roundKey(b)) return false;
  if (a.editionId > 0 && a.editionId === b.editionId) return true;
  if (
    a.eventDate !== b.eventDate ||
    runningKind(a) !== runningKind(b) ||
    distanceKey(a) !== distanceKey(b)
  )
    return false;
  if (a.eventSlug && b.eventSlug && a.eventSlug === b.eventSlug) return true;
  if (!a.eventName || normal(a.eventName) !== normal(b.eventName)) return false;
  // Generic weekly-event names need their explicit venue to identify the course.
  if (/^(?:parkrun|5k|5km|race|road race)$/i.test(a.eventName.trim())) {
    const venue = (result: AchievementResult) =>
      normal(result.history?.performance.venue ?? result.city ?? "");
    return Boolean(venue(a)) && venue(a) === venue(b);
  }
  return true;
}

function markSeconds(result: AchievementResult): number | null {
  return result.history
    ? (historicalMark(result.history.performance)?.seconds ?? null)
    : result.finishTimeSeconds;
}

function timingClaims(result: AchievementResult): Map<string, number> {
  const claims = new Map<string, number>();
  const timing = result.history?.performance.timing;
  const chip = timing?.chip ? historicalTime(timing.chip) : result.chipTimeSeconds;
  const gun = timing?.gun ? historicalTime(timing.gun) : result.gunTimeSeconds;
  if (chip != null && chip > 0 && Number.isFinite(chip)) claims.set("chip", chip);
  if (gun != null && gun > 0 && Number.isFinite(gun)) claims.set("gun", gun);
  const mark = markSeconds(result);
  if (mark != null && mark > 0 && Number.isFinite(mark)) {
    const basis = timing?.basis;
    if (basis && basis !== "unknown") claims.set(basis, mark);
    else if (![...claims.values()].includes(mark)) claims.set("unknown", mark);
  }
  return claims;
}

function contradictory(group: AchievementResult[], day: string): boolean {
  if (group.some((result) => !complete(result, day))) return true;
  if (new Set(group.map((result) => result.eventDate)).size > 1) return true;
  if (new Set(group.map(runningKind)).size > 1) return true;
  const gender = (result: AchievementResult) => {
    const supplied = normal(result.resultGender ?? "");
    if (/^(?:m|male|men|man)$/.test(supplied)) return "men";
    if (/^(?:f|w|female|women|woman)$/.test(supplied)) return "women";
    return null;
  };
  if (new Set(group.map(gender).filter(Boolean)).size > 1) return true;
  const surface = (result: AchievementResult) => {
    const supplied = normal(result.surface).replace(/[-_ ]+/g, " ");
    return /^(?:|unknown|tbc)$/.test(supplied) ? null : supplied;
  };
  if (new Set(group.map(surface).filter(Boolean)).size > 1) return true;
  const knownDistances = new Set(group.map(knownDistance).filter((km) => km > 0));
  if (knownDistances.size > 1) return true;
  for (let i = 0; i < group.length; i++) {
    const claims = timingClaims(group[i]);
    for (let j = i + 1; j < group.length; j++) {
      const other = timingClaims(group[j]);
      for (const [basis, time] of claims) {
        if (other.has(basis) && other.get(basis) !== time) return true;
        if (basis === "unknown" && other.size && ![...other.values()].includes(time)) return true;
      }
      const unknown = other.get("unknown");
      if (unknown != null && claims.size && ![...claims.values()].includes(unknown)) return true;
    }
  }
  return false;
}

function tally(finishes: readonly DistanceSummaryFinish[]): ParticipationTally {
  const distance = finishes.reduce((total, result) => total + knownDistance(result), 0);
  const bonus = finishes.reduce(
    (total, result) => total + ultraParticipationBonus(knownDistance(result)),
    0,
  );
  const verified = finishes.filter((result) => result.participationVerified);
  return {
    completedRaces: finishes.length,
    distanceKm: round(distance),
    unknownDistanceRaces: finishes.filter((result) => knownDistance(result) === 0).length,
    racePoints: finishes.length * 10,
    distancePoints: round(distance),
    ultraBonusPoints: round(bonus),
    totalPoints: round(finishes.length * 10 + distance + bonus),
    verifiedRaces: verified.length,
    verifiedTotalPoints: round(
      verified.length * 10 +
        verified.reduce((total, result) => {
          const km = knownDistance(result);
          return total + km + ultraParticipationBonus(km);
        }, 0),
    ),
  };
}

/**
 * Derive profile totals from the full visible record, before pagination. Project
 * histories separately so a source disagreement cannot disappear behind an
 * existing recorded row. No sources or stored verification are rewritten.
 */
export function buildProfileDistanceSummary(
  results: readonly ProfileResult[],
  histories: readonly SourceHistory[] = [],
  today = new Date(),
): ProfileDistanceSummary {
  const day = distanceSummaryToday(today);
  const seasonYear = Number(day.slice(0, 4));
  const historyResultBase = Math.min(0, ...results.map((result) => result.resultId));
  const projectedHistory = histories
    .flatMap((history) =>
      history.performances.flatMap((performance, index) =>
        performance.syntheticTest || performance.profileExcluded
          ? []
          : profileAchievementResults([], [{ ...history, performances: [performance] }], {
              includeUnreviewedHistory: true,
            }).map((result) => ({
              ...result,
              history: result.history
                ? { ...result.history, key: `${history.provider}:${history.externalId}:${index}` }
                : undefined,
            })),
      ),
    )
    .map((result, index) => ({ ...result, resultId: historyResultBase - index - 1 }));
  const candidates = [
    ...results,
    // Project one row at a time: the legacy projection's early conflict marks
    // must not let a discarded synthetic/split row poison a valid completion.
    ...projectedHistory,
  ].filter(
    (result: AchievementResult) =>
      !result.details?.syntheticTest &&
      !result.details?.profileExcluded &&
      !result.history?.performance.syntheticTest &&
      inScope(result),
  );
  const groups: AchievementResult[][] = [];
  // Explicit rounds are grouped first. A later unlabelled capture may join a
  // unique compatible round, but must never bridge a heat and a final.
  for (const result of [...candidates].sort(
    (a, b) => Number(Boolean(roundKey(b))) - Number(Boolean(roundKey(a))),
  )) {
    let matches = groups.filter(
      (group) =>
        group.some((entry) => sameRace(entry, result)) &&
        (!roundKey(result) ||
          group.every((entry) => !roundKey(entry) || roundKey(entry) === roundKey(result))),
    );
    if (!roundKey(result) && matches.some((group) => group.some((entry) => roundKey(entry)))) {
      const compatible = matches.filter((group) => !contradictory([...group, result], day));
      if (compatible.length !== 1) continue;
      matches = compatible;
    }
    if (!matches.length) groups.push([result]);
    else {
      matches[0].push(result, ...matches.slice(1).flat());
      for (const merged of matches.slice(1)) groups.splice(groups.indexOf(merged), 1);
    }
  }
  const finishes = groups
    .flatMap((group): DistanceSummaryFinish[] => {
      if (contradictory(group, day)) return [];
      // A supplied time takes precedence over an untimed completion. Prefer a
      // canonical recorded row on a tie; source evidence remains on its own row.
      const representative = [...group].sort(
        (a, b) =>
          Number(markSeconds(b) != null) - Number(markSeconds(a) != null) ||
          Number(Boolean(a.history)) - Number(Boolean(b.history)),
      )[0];
      return [
        {
          ...representative,
          distanceKm: group.map(knownDistance).find((km) => km > 0) ?? 0,
          participationVerified: group.some(achievementResultVerified),
        },
      ];
    })
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate) || a.distanceKm - b.distanceKm);
  const years = [...new Set(finishes.map((result) => Number(result.eventDate.slice(0, 4))))];
  if (!years.includes(seasonYear)) years.push(seasonYear);
  const seasons = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      ...tally(finishes.filter((result) => Number(result.eventDate.slice(0, 4)) === year)),
    }));
  return {
    finishes,
    allTime: tally(finishes),
    seasons,
    currentSeason: seasons.find((season) => season.year === seasonYear)!,
    seasonYear,
  };
}
