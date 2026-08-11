import type { ResultSeed } from "./types";
import { resultsRn2025B6P1 } from "./results-rn2025-b6p1";
import { resultsRn2025B6P2 } from "./results-rn2025-b6p2";
import { resultsRn2025B6P3 } from "./results-rn2025-b6p3";
import { resultsRn2025B6P4 } from "./results-rn2025-b6p4";

export const resultsRn2025B6: ResultSeed[] = [
  ...resultsRn2025B6P1,
  ...resultsRn2025B6P2,
  ...resultsRn2025B6P3,
  ...resultsRn2025B6P4,
];
