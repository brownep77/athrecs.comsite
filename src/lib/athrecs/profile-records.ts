import { roadPerformanceCondition } from "./road-performance-conditions.ts";
import { isDisqualified, type ResultDetails } from "./result-details.ts";

export type ProfileResult = {
  city?: string;
  resultId: number;
  editionId: number;
  athleteName?: string;
  eventName: string;
  eventSlug: string;
  sport: string;
  surface: string;
  country: string;
  eventDate: string;
  distanceCode: string;
  distanceKm: number;
  status: string;
  details?: ResultDetails;
  finishTimeSeconds: number | null;
  chipTimeSeconds: number | null;
  gunTimeSeconds: number | null;
  overallPlace: number | null;
  genderPlace?: number | null;
  categoryPlace?: number | null;
  resultGender?: string | null;
  category: string | null;
  sourceUrls: string[];
  resultSource?: string | null;
  sourceResultIds?: number[];
  conflicting?: boolean;
};

export function timingBasis(result: ProfileResult): string {
  if (result.chipTimeSeconds != null && result.finishTimeSeconds === result.chipTimeSeconds)
    return "Chip";
  if (result.gunTimeSeconds != null && result.finishTimeSeconds === result.gunTimeSeconds)
    return "Gun";
  return "Recorded";
}

type PerformanceCategory = Pick<ProfileResult, "sport" | "distanceCode" | "distanceKm" | "surface">;

function comparisonDistanceKm(result: Pick<ProfileResult, "distanceCode" | "distanceKm">): number {
  // Older imports rounded standard race distances to one or two decimal places.
  // Recognise only those exact roundings, keeping genuinely different distances apart.
  const miles = result.distanceCode.match(/^(\d+(?:\.\d+)?)mi$/);
  const standardKm =
    result.distanceCode === "Marathon"
      ? 42.195
      : result.distanceCode === "Half"
        ? 21.0975
        : miles
          ? Number(miles[1]) * 1.609344
          : null;
  return standardKm != null &&
    [1, 2, 3].some((places) => result.distanceKm === Number(standardKm.toFixed(places)))
    ? standardKm
    : result.distanceKm;
}

export function performanceGroup(result: ProfileResult): string {
  return [
    result.sport,
    result.distanceCode,
    comparisonDistanceKm(result),
    result.surface,
    timingBasis(result),
  ].join("|");
}

function personalBestSport(result: Pick<ProfileResult, "sport" | "surface">): string {
  // Road races imported from athletics calendars belong to the same PB category
  // as running road races. Track, parkrun and other sports remain distinct.
  return result.sport === "Athletics" && result.surface === "Road" ? "Running" : result.sport;
}

export function personalBestGroup(result: PerformanceCategory): string {
  // The headline PB is the fastest recorded finish, with its timing basis shown
  // alongside it. Progress uses performanceGroup for comparisons by timing basis.
  return [
    personalBestSport(result),
    result.distanceCode,
    comparisonDistanceKm(result),
    result.surface,
  ].join("|");
}

/** Collapse only identical performances at the same edition. Keep conflicts visible. */
export function combineProfileResults<T extends ProfileResult>(
  results: T[],
): Array<T & { sourceResultIds: number[]; conflicting: boolean }> {
  const groups = new Map<string, T>();
  const editionKeys = new Map<number, Set<string>>();
  const classificationPlaces = new Map<number, { gender: Set<number>; category: Set<number> }>();
  for (const result of results) {
    if (result.details?.profileExcluded) continue;
    const placings = classificationPlaces.get(result.editionId) ?? {
      gender: new Set<number>(),
      category: new Set<number>(),
    };
    if (result.genderPlace != null) placings.gender.add(result.genderPlace);
    if (result.categoryPlace != null) placings.category.add(result.categoryPlace);
    classificationPlaces.set(result.editionId, placings);
    const key = JSON.stringify([
      result.editionId,
      result.status,
      result.finishTimeSeconds,
      result.chipTimeSeconds,
      result.gunTimeSeconds,
      result.overallPlace,
      result.category,
      result.details?.disqualification ?? null,
    ]);
    const keys = editionKeys.get(result.editionId) ?? new Set<string>();
    keys.add(key);
    editionKeys.set(result.editionId, keys);
    const existing = groups.get(key);
    if (existing) {
      // Missing classifications are not disagreements; retain the supplied placing.
      existing.genderPlace ??= result.genderPlace;
      existing.categoryPlace ??= result.categoryPlace;
      existing.resultGender ||= result.resultGender;
      existing.sourceUrls = [...new Set([...existing.sourceUrls, ...result.sourceUrls])];
      existing.sourceResultIds = [
        ...new Set([
          ...(existing.sourceResultIds ?? [existing.resultId]),
          ...(result.sourceResultIds ?? [result.resultId]),
        ]),
      ];
    } else {
      groups.set(key, {
        ...result,
        sourceUrls: [...result.sourceUrls],
        sourceResultIds: result.sourceResultIds ?? [result.resultId],
      });
    }
  }
  return [...groups.values()].map((result) => ({
    ...result,
    sourceResultIds: result.sourceResultIds ?? [result.resultId],
    conflicting:
      (editionKeys.get(result.editionId)?.size ?? 0) > 1 ||
      (classificationPlaces.get(result.editionId)?.gender.size ?? 0) > 1 ||
      (classificationPlaces.get(result.editionId)?.category.size ?? 0) > 1,
  }));
}

export function eligiblePerformance(result: ProfileResult): boolean {
  return (
    !result.details?.profileExcluded &&
    roadPerformanceCondition(result)?.eligible !== false &&
    !isDisqualified(result) &&
    result.status.toLowerCase() === "finished" &&
    !result.conflicting &&
    result.finishTimeSeconds != null &&
    result.finishTimeSeconds > 0 &&
    Number.isFinite(result.finishTimeSeconds) &&
    result.distanceKm > 0 &&
    !/ultra|unknown|tbc|variable|multi/i.test(result.distanceCode) &&
    !/trail|cross.country|^xc$|fell|mountain|mixed|unknown/i.test(result.surface) &&
    ["Running", "Parkrun", "Athletics", "Cycling", "Swimming", "Rowing"].includes(result.sport)
  );
}

export function findPersonalBests<T extends ProfileResult>(results: T[]): T[] {
  const best = new Map<string, T>();
  for (const result of results) {
    if (!eligiblePerformance(result)) continue;
    const key = personalBestGroup(result);
    const previous = best.get(key);
    if (!previous || result.finishTimeSeconds! < previous.finishTimeSeconds!) best.set(key, result);
  }
  return [...best.values()].sort(
    (a, b) =>
      personalBestSport(a).localeCompare(personalBestSport(b)) ||
      a.distanceKm - b.distanceKm ||
      a.surface.localeCompare(b.surface),
  );
}
