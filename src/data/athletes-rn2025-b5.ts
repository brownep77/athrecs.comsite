import type { AthleteSeed } from "./types";
import { athletesRn2025B5A } from "./athletes-rn2025-b5a";
import { athletesRn2025B5B } from "./athletes-rn2025-b5b";

/** 99 new profiles from official Run Norwich 2025 places 401–500. */
export const athletesRn2025B5: AthleteSeed[] = [
  ...athletesRn2025B5A,
  ...athletesRn2025B5B,
];
