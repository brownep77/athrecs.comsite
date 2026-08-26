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

function resultSignature(result: ResultSeed): string {
  return JSON.stringify({
    source_id: result.source_id ?? null,
    place: result.place,
    time: result.time,
    finishTimeSeconds: result.finishTimeSeconds ?? null,
    chipTimeSeconds: result.chipTimeSeconds ?? null,
    gunTimeSeconds: result.gunTimeSeconds ?? null,
    bib: result.bib ?? null,
    status: result.status ?? null,
    genderPlace: result.genderPlace ?? null,
    category: result.category ?? null,
    categoryPlace: result.categoryPlace ?? null,
    ageOnDay: result.ageOnDay ?? null,
    ageGradePct: result.ageGradePct ?? null,
    openRating: result.openRating ?? null,
    ageGradeRating: result.ageGradeRating ?? null,
    resultSource: result.resultSource ?? null,
    source: result.source,
  });
}

const resultByKey = new Map<string, ResultSeed>();
for (const result of rawResults) {
  const key = resultKey(result);
  const existing = resultByKey.get(key);
  if (!existing) {
    resultByKey.set(key, result);
    continue;
  }
  if (resultSignature(existing) !== resultSignature(result)) {
    throw new Error(`Conflicting duplicate result seed: ${key}`);
  }
}

/** Canonical participant result rows, unique by event edition and athlete. */
export const results: ResultSeed[] = [...resultByKey.values()];
