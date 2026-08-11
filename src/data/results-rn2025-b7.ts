import type { ResultSeed } from "./types";
import { resultsRn2025B7P1 } from "./results-rn2025-b7p1";
import { resultsRn2025B7P2 } from "./results-rn2025-b7p2";
import { resultsRn2025B7P3 } from "./results-rn2025-b7p3";
import { resultsRn2025B7P4 } from "./results-rn2025-b7p4";

/** Official chip times for Run Norwich 2025 places 701–900. */
export const resultsRn2025B7: ResultSeed[] = [
  ...resultsRn2025B7P1,
  ...resultsRn2025B7P2,
  ...resultsRn2025B7P3,
  ...resultsRn2025B7P4,
];
