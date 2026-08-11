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

export const results: ResultSeed[] = [
  ...resultsA,
  ...resultsB,
  ...resultsRn2025B1,
  ...resultsRn2025B2,
  ...resultsRn2025B3,
  ...resultsRn2025B4,
  ...resultsRn2025B5,
  ...resultsRn2025B6,
  ...resultsRn2025B7,
];
