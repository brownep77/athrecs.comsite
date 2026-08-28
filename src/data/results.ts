import type { ResultSeed } from "./types";
import { resultsA } from "./results-a";
import { resultsB } from "./results-b";
import { resultsRn2025B1 } from "./results-rn2025-b1";
import { resultsRn2025B2 } from "./results-rn2025-b2";
import { resultsRn2025B3 } from "./results-rn2025-b3";
import { resultsRn2025B4 } from "./results-rn2025-b4";
import { resultsRn2025B5 } from "./results-rn2025-b5";
import { resultsRn2025B6 } from "./results-rn2025-b6";
import { resultsRn2025B7 } from "./results-rn2025-b7";
import { resultsRn2025B8 } from "./results-rn2025-b8";
import { publicFigureResults } from "./public-figures";

const rawResults: ResultSeed[] = [
  ...resultsA,
  ...resultsB,
  ...resultsRn2025B1,
  ...resultsRn2025B2,
  ...resultsRn2025B3,
  ...resultsRn2025B4,
  ...resultsRn2025B5,
  ...resultsRn2025B6,
  ...resultsRn2025B7,
  ...resultsRn2025B8,
  ...publicFigureResults,
];

function resultKey(result: ResultSeed): string {
  return `${result.eventSlug}|${result.date}|${result.distance}|${result.athleteSlug}`;
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

function mergeField<K extends keyof ResultSeed>(
  key: string,
  field: K,
  existing: ResultSeed,
  incoming: ResultSeed,
): ResultSeed[K] {
  const left = existing[field];
  const right = incoming[field];
  if (hasValue(left) && hasValue(right) && left !== right) {
    throw new Error(
      `Conflicting duplicate result seed: ${key} (${String(field)} ${String(left)} vs ${String(right)})`,
    );
  }
  return (hasValue(left) ? left : right) as ResultSeed[K];
}

function sourcePriority(result: ResultSeed): number {
  const kind = result.resultSource?.trim().toLowerCase();
  if (kind === "official") return 4;
  if (/\.(?:csv|pdf)(?:$|[?#])/i.test(result.source)) return 3;
  if (kind === "partner" || kind === "official organiser") return 2;
  if (kind === "athlete") return 1;
  return 0;
}

/**
 * Combine genuinely complementary copies of the same result without guessing.
 * Every performance and identity field must agree where both rows provide it.
 * The higher-authority source supplies resultSource/source, while stable IDs,
 * bibs and performance metadata are retained from either copy.
 *
 * This currently resolves the audited Run Norwich 2025 Heidi Bacon overlap:
 * the earlier live export supplies source_id and age/gender metrics, while the
 * official PDF batch supplies bib 784. Both record place 560 and 44:50.
 */
function mergeCompatibleResult(existing: ResultSeed, incoming: ResultSeed): ResultSeed {
  const key = resultKey(existing);
  const preferredSource =
    sourcePriority(incoming) > sourcePriority(existing) ? incoming : existing;
  return {
    eventSlug: existing.eventSlug,
    date: existing.date,
    distance: existing.distance,
    athleteSlug: existing.athleteSlug,
    source_id: mergeField(key, "source_id", existing, incoming),
    place: mergeField(key, "place", existing, incoming) ?? null,
    time: mergeField(key, "time", existing, incoming) ?? "",
    finishTimeSeconds: mergeField(key, "finishTimeSeconds", existing, incoming),
    chipTimeSeconds: mergeField(key, "chipTimeSeconds", existing, incoming),
    gunTimeSeconds: mergeField(key, "gunTimeSeconds", existing, incoming),
    bib: mergeField(key, "bib", existing, incoming),
    status: mergeField(key, "status", existing, incoming),
    genderPlace: mergeField(key, "genderPlace", existing, incoming),
    category: mergeField(key, "category", existing, incoming),
    categoryPlace: mergeField(key, "categoryPlace", existing, incoming),
    ageOnDay: mergeField(key, "ageOnDay", existing, incoming),
    ageGradePct: mergeField(key, "ageGradePct", existing, incoming),
    openRating: mergeField(key, "openRating", existing, incoming),
    ageGradeRating: mergeField(key, "ageGradeRating", existing, incoming),
    resultSource:
      preferredSource.resultSource ?? existing.resultSource ?? incoming.resultSource,
    source: preferredSource.source,
  };
}

const resultByKey = new Map<string, ResultSeed>();
for (const result of rawResults) {
  const key = resultKey(result);
  const existing = resultByKey.get(key);
  resultByKey.set(key, existing ? mergeCompatibleResult(existing, result) : result);
}

/** Canonical participant result rows, unique by event edition and athlete. */
export const results: ResultSeed[] = [...resultByKey.values()];
