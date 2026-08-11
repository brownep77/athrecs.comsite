import type { ResultSeed } from "./types";
import { resultsRn2025B8P1 } from "./results-rn2025-b8p1";
import { resultsRn2025B8P2 } from "./results-rn2025-b8p2";
import { resultsRn2025B8P3 } from "./results-rn2025-b8p3";
import { resultsRn2025B8P4 } from "./results-rn2025-b8p4";

export const resultsRn2025B8: ResultSeed[] = [
  ...resultsRn2025B8P1,
  ...resultsRn2025B8P2,
  ...resultsRn2025B8P3,
  ...resultsRn2025B8P4,
];
