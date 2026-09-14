export type ProfileResult = {
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
  finishTimeSeconds: number | null;
  chipTimeSeconds: number | null;
  gunTimeSeconds: number | null;
  overallPlace: number | null;
  category: string | null;
  sourceUrls: string[];
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

export function performanceGroup(result: ProfileResult): string {
  return [
    result.sport,
    result.distanceCode,
    result.distanceKm,
    result.surface,
    timingBasis(result),
  ].join("|");
}

/** Collapse only identical performances at the same edition. Keep conflicts visible. */
export function combineProfileResults<T extends ProfileResult>(
  results: T[],
): Array<T & { sourceResultIds: number[]; conflicting: boolean }> {
  const groups = new Map<string, T>();
  const editionKeys = new Map<number, Set<string>>();
  for (const result of results) {
    const key = JSON.stringify([
      result.editionId,
      result.status,
      result.finishTimeSeconds,
      result.chipTimeSeconds,
      result.gunTimeSeconds,
      result.overallPlace,
      result.category,
    ]);
    const keys = editionKeys.get(result.editionId) ?? new Set<string>();
    keys.add(key);
    editionKeys.set(result.editionId, keys);
    const existing = groups.get(key);
    if (existing) {
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
    conflicting: (editionKeys.get(result.editionId)?.size ?? 0) > 1,
  }));
}

export function eligiblePerformance(result: ProfileResult): boolean {
  return (
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
    const key = performanceGroup(result);
    const previous = best.get(key);
    if (!previous || result.finishTimeSeconds! < previous.finishTimeSeconds!) best.set(key, result);
  }
  return [...best.values()].sort(
    (a, b) =>
      a.sport.localeCompare(b.sport) ||
      a.distanceKm - b.distanceKm ||
      a.surface.localeCompare(b.surface),
  );
}
