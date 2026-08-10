import type { ResultSeed } from "./types";
import { resultsA } from "./results-a";
import { resultsB } from "./results-b";
import { resultsRn2025B1 } from "./results-rn2025-b1";

export const results: ResultSeed[] = [...resultsA, ...resultsB, ...resultsRn2025B1];
