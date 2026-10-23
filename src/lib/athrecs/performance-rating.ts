import { historicalMark, historicalTime } from "./history-performance.ts";
import { isCompletedResult } from "./profile-achievements.ts";
import type { AchievementResult } from "./profile-history-results.ts";
import type { SourcePerformance } from "./source-performance-history.ts";
import { roadPerformanceCondition } from "./road-performance-conditions.ts";
import {
  PERFORMANCE_REFERENCE_STANDARDS,
  PERFORMANCE_STANDARDS_VERSION,
  type PerformanceRatingCategory,
  type PerformanceRatingDistance,
} from "./performance-rating-standards.ts";

export type {
  PerformanceRatingCategory,
  PerformanceRatingDistance,
} from "./performance-rating-standards.ts";

export type PerformanceRatingComparison =
  "road-standard" | "course-unadjusted" | "distance-only-estimate";

export type PerformanceReferenceMethod =
  "published-road-standard" | "interpolated-distance-estimate" | "short-distance-extrapolation";

export type PerformanceRatingReference = {
  seconds: number;
  /** True for either interpolated or extrapolated distance estimates. */
  interpolated: boolean;
  extrapolated: boolean;
  method: PerformanceReferenceMethod;
};

export type PerformanceRating = {
  /** Full precision is retained for ordering; display rounding never breaks a tie. */
  score: number;
  displayScore: number;
  distance: PerformanceRatingDistance;
  group: string;
  category: PerformanceRatingCategory;
  comparison: PerformanceRatingComparison;
  interpolated: boolean;
  extrapolated: boolean;
  referenceMethod: PerformanceReferenceMethod;
  finishTimeSeconds: number;
  benchmarkSeconds: number;
  standardsVersion: string;
};

const excludedDistance =
  /\b(?:relay|split|intermediate|leg|stage|unknown|variable|tbc|timed|hour|hours)\b|\d\s*h(?:r|rs)?\b/i;
const invalidQualification = /\b(?:short[ -]course|assisted|aided|relay|split|intermediate)\b/i;
const invalidNote =
  /conflicting (?:source|details|result)|contradictory|not legal|invalid (?:time|distance)/i;

function agreesWithDistance(supplied: number, exact: number): boolean {
  return (
    supplied === 0 ||
    [exact, +exact.toFixed(1), +exact.toFixed(2), +exact.toFixed(3)].some(
      (value) => Math.abs(value - supplied) < 1e-9,
    )
  );
}

/** Exact distance identity; catalogue roundings are recognised only for a named distance. */
export function performanceRatingDistance(code: string, km = 0): PerformanceRatingDistance | null {
  if (!Number.isFinite(km) || km < 0 || excludedDistance.test(code)) return null;
  const name = code.trim();
  const special = /^(?:half|half marathon)$/i.test(name)
    ? PERFORMANCE_REFERENCE_STANDARDS.find((standard) => standard.key === "Half")
    : /^(?:full )?marathon$/i.test(name)
      ? PERFORMANCE_REFERENCE_STANDARDS.find((standard) => standard.key === "Marathon")
      : /^parkrun$/i.test(name)
        ? PERFORMANCE_REFERENCE_STANDARDS.find((standard) => standard.key === "5K")
        : /^(?:mile|road mile|mile road)$/i.test(name)
          ? PERFORMANCE_REFERENCE_STANDARDS.find((standard) => standard.key === "1mi")
          : undefined;
  if (special)
    return agreesWithDistance(km, special.km)
      ? { key: special.key, label: special.label, km: special.km }
      : null;

  const numeric = /^(\d+(?:\.\d+)?)\s*(k|km|mi|miles?|m)$/i.exec(name);
  if (numeric) {
    const value = Number(numeric[1]);
    const unit = numeric[2];
    // Uppercase M can mean either metres or miles. Only supplied km can disambiguate.
    if (unit === "M" && km === 0) return null;
    const miles = /^mi/i.test(unit) || (unit === "M" && agreesWithDistance(km, value * 1.609344));
    const metres = /^m$/i.test(unit) && !miles;
    const exact = value * (miles ? 1.609344 : metres ? 0.001 : 1);
    if (exact < 1 || !Number.isFinite(exact) || !agreesWithDistance(km, exact)) return null;
    const standard = PERFORMANCE_REFERENCE_STANDARDS.find(
      (entry) => Math.abs(entry.km - exact) < 1e-9,
    );
    return standard
      ? { key: standard.key, label: standard.label, km: standard.km }
      : { key: `${exact}K`, label: miles ? `${value} miles` : `${exact}K`, km: exact };
  }
  // A generic ultra label may carry an explicit fixed distance in the catalogue.
  // Never turn unknown, variable or fixed-duration events into an invented distance.
  if (/^ultra(?:[ -]?marathon)?$/i.test(name) && km > 42.195) {
    const standard = PERFORMANCE_REFERENCE_STANDARDS.find(
      (entry) => Math.abs(entry.km - km) < 1e-9,
    );
    return standard
      ? { key: standard.key, label: standard.label, km: standard.km }
      : { key: `${km}K`, label: `${km}K`, km };
  }
  return null;
}

/** The result's explicit classification takes precedence over a profile source fact. */
export function performanceRatingCategory(
  resultGender?: string | null,
  sourceGender = "",
): PerformanceRatingCategory | null {
  const supplied = resultGender?.trim() || sourceGender.trim();
  if (/^(?:m|male|men|man)$/i.test(supplied)) return "men";
  if (/^(?:f|w|female|women|woman)$/i.test(supplied)) return "women";
  return null;
}

/** Modelled distances are AthRecs estimates, never additional official standards. */
export function performanceRatingReference(
  km: number,
  category: PerformanceRatingCategory,
): PerformanceRatingReference | null {
  if (!Number.isFinite(km) || km < 1 || km > 200) return null;
  const exact = PERFORMANCE_REFERENCE_STANDARDS.find((entry) => Math.abs(entry.km - km) < 1e-9);
  if (exact)
    return {
      seconds: exact[category],
      interpolated: false,
      extrapolated: false,
      method: "published-road-standard",
    };
  const upperIndex = PERFORMANCE_REFERENCE_STANDARDS.findIndex((entry) => entry.km > km);
  if (upperIndex < 0) return null;
  // Below the mile, extend only the first mile-to-5K segment down to 1K.
  // Keeping this model separate prevents changing any existing 5K+ reference.
  const extrapolated = upperIndex === 0;
  const lower = PERFORMANCE_REFERENCE_STANDARDS[extrapolated ? 0 : upperIndex - 1];
  const upper = PERFORMANCE_REFERENCE_STANDARDS[extrapolated ? 1 : upperIndex];
  const proportion = Math.log(km / lower.km) / Math.log(upper.km / lower.km);
  return {
    seconds: Math.exp(
      Math.log(lower[category]) + proportion * Math.log(upper[category] / lower[category]),
    ),
    interpolated: true,
    extrapolated,
    method: extrapolated ? "short-distance-extrapolation" : "interpolated-distance-estimate",
  };
}

function surfaceGroup(result: AchievementResult): string {
  if (result.sport.trim().toLowerCase() === "parkrun") return "parkrun";
  const surface = result.surface.trim().toLowerCase();
  if (surface === "road") return "road";
  if (/track|indoor|outdoor/.test(surface)) return "track";
  if (/cross[ -]?country|^xc$/.test(surface)) return "cross-country";
  if (/fell/.test(surface)) return "fell";
  if (/mountain/.test(surface)) return "mountain";
  if (/trail/.test(surface)) return "trail";
  return surface || "unknown";
}

/**
 * An explicitly selected timing column must be a valid time and agree with the
 * main mark. Different chip/gun times with an unknown basis are not a conflict.
 * A missing main time cannot establish a disagreement; the caller still checks
 * the source's independent completion and mark eligibility.
 */
export function historicalRatingTimingConsistent(row: SourcePerformance): boolean {
  const basis = row.timing?.basis;
  if (basis !== "chip" && basis !== "gun") return true;
  const declared = row.timing?.[basis];
  if (declared === undefined) return true;
  const seconds = historicalTime(declared);
  if (seconds === null) return false;
  const main = historicalMark(row);
  return main === null || main.seconds === seconds;
}

/**
 * Per-time AthRecs score on fixed open standards. It does not age-grade, verify a
 * source, or create a public ranking. The same version scores old and new results.
 */
export function ratePerformance(
  result: AchievementResult,
  sourceGender = "",
  today = new Date(),
): PerformanceRating | null {
  if (
    !/^(?:running|athletics|parkrun)$/i.test(result.sport.trim()) ||
    !isCompletedResult(result, today) ||
    invalidNote.test(result.details?.note ?? "") ||
    /\b(?:short[ -]course|assisted course|aided course)\b/i.test(result.details?.note ?? "") ||
    invalidQualification.test(`${result.distanceCode} ${result.displayRound ?? ""}`) ||
    /\b(?:relay|split|intermediate)\b/i.test(result.eventName) ||
    roadPerformanceCondition(result)?.eligible === false
  )
    return null;
  const row = result.history?.performance;
  if (
    row &&
    (invalidNote.test(row.notes ?? "") ||
      row.labels.some((label) => invalidQualification.test(label)) ||
      invalidQualification.test(row.discipline))
  )
    return null;
  const mark = row ? historicalMark(row) : null;
  if (row && (!mark || mark.aided || !historicalRatingTimingConsistent(row))) return null;
  const seconds = row ? mark!.seconds : result.finishTimeSeconds;
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const category = performanceRatingCategory(result.resultGender, sourceGender);
  if (!category) return null;
  const distance = performanceRatingDistance(result.distanceCode, result.distanceKm);
  if (!distance) return null;
  const reference = performanceRatingReference(distance.km, category);
  if (!reference) return null;
  const surface = surfaceGroup(result);
  const comparison: PerformanceRatingComparison = reference.interpolated
    ? "distance-only-estimate"
    : surface === "road"
      ? "road-standard"
      : surface === "parkrun"
        ? "course-unadjusted"
        : "distance-only-estimate";
  const score = (1000 * reference.seconds) / seconds;
  return {
    score,
    displayScore: Math.round(score),
    distance,
    group: `${surface}|${distance.key}|${category}`,
    category,
    comparison,
    interpolated: reference.interpolated,
    extrapolated: reference.extrapolated,
    referenceMethod: reference.method,
    finishTimeSeconds: seconds,
    benchmarkSeconds: reference.seconds,
    standardsVersion: PERFORMANCE_STANDARDS_VERSION,
  };
}
