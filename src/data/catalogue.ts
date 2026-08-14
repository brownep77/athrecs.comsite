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
import { athletesRn2025B7 } from "./athletes-rn2025-b7";
import { athletesRn2025B8 } from "./athletes-rn2025-b8";
export const athletes = [
  ...athletesBase,
  ...athletesRn2025B1,
  ...athletesRn2025B2,
  ...athletesRn2025B3,
  ...athletesRn2025B4,
  ...athletesRn2025B5,
  ...athletesRn2025B6,
  ...athletesRn2025B7,
  ...athletesRn2025B8,
];
export { results } from "./results";
import { seriesList as coreSeries } from "./series";
import { editions as coreEditions } from "./editions";
import { runabcEditions, runabcSeries } from "./runabc";
import { multiSportEditions, multiSportSeries } from "./multisport";
import { parkrunSeries } from "./parkrun-uk";
import { worldAthleticsEditions, worldAthleticsSeries } from "./world-athletics";
import { worldTriathlonEditions, worldTriathlonSeries } from "./world-triathlon";
import { mrdMarathonEditions, mrdMarathonSeries } from "./mrd-marathons";
import type { Edition, Series } from "./types";

function normName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const coreNameKeys = new Set(coreSeries.map((series) => normName(series.name)));
const usedSlugs = new Set(coreSeries.map((series) => series.slug));
const extraSeries: Series[] = [];
for (const series of [
  ...(runabcSeries as Series[]),
  ...(multiSportSeries as Series[]),
  ...(parkrunSeries as Series[]),
  ...(worldAthleticsSeries as Series[]),
  ...(worldTriathlonSeries as Series[]),
  ...(mrdMarathonSeries as Series[]),
]) {
  const key = normName(series.name);
  if (usedSlugs.has(series.slug) || coreNameKeys.has(key)) continue;
  usedSlugs.add(series.slug);
  coreNameKeys.add(key);
  extraSeries.push(series);
}
const extraSlugs = new Set(extraSeries.map((series) => series.slug));

export const seriesList: Series[] = [...coreSeries, ...extraSeries];

const mergedEditions = [
  ...(coreEditions as Edition[]),
  ...(runabcEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(multiSportEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(worldAthleticsEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(worldTriathlonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(mrdMarathonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
];

export const editions: Edition[] = (() => {
  const seen = new Set<string>();
  const unique: Edition[] = [];
  for (const edition of mergedEditions) {
    const key = `${edition.seriesSlug}|${edition.date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(edition);
  }
  return unique;
})();

export { catalogueMetadata } from "./catalogue-metadata";
