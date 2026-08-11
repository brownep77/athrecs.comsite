import type { AthleteSeed } from "./types";
import { athletesRn2025B4A } from "./athletes-rn2025-b4a";
import { athletesRn2025B4B } from "./athletes-rn2025-b4b";

/** 98 new profiles from official Run Norwich 2025 places 301–400. */
export const athletesRn2025B4: AthleteSeed[] = [
  ...athletesRn2025B4A,
  ...athletesRn2025B4B,
];
