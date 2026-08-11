/** Norfolk multi-sport catalogue - fixtures, clubs, real TRT athletes & results. */

export type { Sport, Series, Edition, ClubSeed, AthleteSeed, ResultSeed } from "./types";
export { clubs } from "./clubs";
import { athletes as athletesBase } from "./athletes";
import { athletesRn2025B1 } from "./athletes-rn2025-b1";
import { athletesRn2025B2 } from "./athletes-rn2025-b2";
import { athletesRn2025B3 } from "./athletes-rn2025-b3";
import { athletesRn2025B4 } from "./athletes-rn2025-b4";
import { athletesRn2025B5 } from "./athletes-rn2025-b5";
import { athletesRn2025B6 } from "./athletes-rn2025-b6";
export const athletes = [
  ...athletesBase,
  ...athletesRn2025B1,
  ...athletesRn2025B2,
  ...athletesRn2025B3,
  ...athletesRn2025B4,
  ...athletesRn2025B5,
  ...athletesRn2025B6,
];
export { results } from "./results";
export { seriesList } from "./series";
export { editions } from "./editions";
export { catalogueMetadata } from "./catalogue-metadata";
