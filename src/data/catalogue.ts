/** Norfolk multi-sport catalogue - fixtures, clubs, real TRT athletes & results. */

export type {
  Sport,
  Series,
  Edition,
  ClubSeed,
  AthleteSeed,
  ResultSeed,
} from "./types";

export { clubs } from "./clubs";
import { athletes as athletesBase } from "./athletes";
import { athletesRn2025B1 } from "./athletes-rn2025-b1";
export const athletes = [...athletesBase, ...athletesRn2025B1];
export { results } from "./results";
export { seriesList } from "./series";
export { editions } from "./editions";
export { catalogueMetadata } from "./catalogue-metadata";
