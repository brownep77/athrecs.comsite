/** Norfolk multi-sport catalogue - fixtures, clubs, real TRT athletes & results. */

export type {
  Sport,
  Series,
  Edition,
  ClubSeed,
  AthleteSeed,
  ResultSeed,
  RaceGroupCode,
  RaceGroupDefinition,
  RaceGroupMembershipSeed,
  EntryOptionSeed,
  EntryOptionStatus,
  EntryOptionType,
} from "./types";
import { clubs as rawClubs } from "./clubs";
import { athleticsIrelandClubs } from "./clubs-athletics-ireland";
import { belfastClubs } from "./clubs-belfast";
import { triathlonIrelandClubs } from "./clubs-triathlon-ireland";
import { welshAthleticsClubs } from "./clubs-welsh-athletics";
import { auditedClubAdditions, clubEnrichment, clubSlugAliases } from "./club-enrichment";
import { athletes as athletesBase } from "./athletes";
import { athletesRn2025B1 } from "./athletes-rn2025-b1";
import { athletesRn2025B2 } from "./athletes-rn2025-b2";
import { athletesRn2025B3 } from "./athletes-rn2025-b3";
import { athletesRn2025B4 } from "./athletes-rn2025-b4";
import { athletesRn2025B5 } from "./athletes-rn2025-b5";
import { athletesRn2025B6 } from "./athletes-rn2025-b6";
import { athletesRn2025B7 } from "./athletes-rn2025-b7";
import { athletesRn2025B8 } from "./athletes-rn2025-b8";
const rawAthletes = [
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
export const athletes = rawAthletes.map((athlete) => ({
  ...athlete,
  club_slug: clubSlugAliases[athlete.club_slug] ?? athlete.club_slug,
  second_club_slug: athlete.second_club_slug
    ? (clubSlugAliases[athlete.second_club_slug] ?? athlete.second_club_slug)
    : undefined,
}));
export { results } from "./results";
import { seriesList as coreSeries } from "./series";
import { editions as coreEditions } from "./editions";
import { runabcEditions, runabcSeries } from "./runabc";
import { multiSportEditions, multiSportSeries } from "./multisport";
import { parkrunSeries } from "./parkrun-uk";
import { worldAthleticsEditions, worldAthleticsSeries } from "./world-athletics";
import { worldTriathlonEditions, worldTriathlonSeries } from "./world-triathlon";
import { mrdMarathonEditions, mrdMarathonSeries } from "./mrd-marathons";
import { mrdEuMarathonEditions, mrdEuMarathonSeries } from "./mrd-marathons-eu";
import { mrdIntlMarathonEditions, mrdIntlMarathonSeries } from "./mrd-marathons-intl";
import { comradesEditions, comradesSeries } from "./comrades";
import { twoOceansEditions, twoOceansSeries } from "./two-oceans";
import { marathonDesSablesEditions, marathonDesSablesSeries } from "./marathon-des-sables";
import { editionOverrides, entryOptions, eventSlugAliases, seriesOverrides } from "./entry-options";
import {
  raceCollectionEditions,
  raceCollectionSeries,
  raceGroupDefinitions,
  raceGroupMemberships,
} from "./race-collections";
import { verifiedUkEditions, verifiedUkSeries } from "./verified-races-uk";
import { verifiedAllSportEditions, verifiedAllSportSeries } from "./verified-all-sport";
import { verifiedGlobalEditions, verifiedGlobalSeries } from "./verified-global-fixtures";
import { ukFiveKEditions, ukFiveKSeries } from "./uk-5k-races";
import { continuedFiveKEditions, continuedFiveKSeries } from "./five-k-races-uk-ireland-next";
import { verifiedFiveMileEditions, verifiedFiveMileSeries } from "./five-mile-races-uk-ireland";
import {
  verifiedTenKFollowupEditions,
  verifiedTenKFollowupSeries,
} from "./ten-k-races-uk-ireland-followup";
import { verifiedTenMileEditions, verifiedTenMileSeries } from "./ten-mile-races-uk-ireland";
import {
  verifiedHalfMarathonFollowupEditions,
  verifiedHalfMarathonFollowupSeries,
} from "./half-marathons-uk-ireland-followup";
import {
  verifiedHalfToTwentyMileEditions,
  verifiedHalfToTwentyMileSeries,
} from "./half-to-20-mile-races-uk-ireland";
import type { ClubSeed, Edition, Series } from "./types";

function canonicalClubSport(sport: string): string {
  return /^(?:trackandfield|track\s*(?:&|and)\s*field)$/i.test(sport.trim()) ? "Athletics" : sport;
}

const rawClubSeeds: ClubSeed[] = [
  ...rawClubs,
  ...athleticsIrelandClubs,
  ...belfastClubs,
  ...triathlonIrelandClubs,
  ...welshAthleticsClubs,
  ...auditedClubAdditions,
];

const mergedClubs = new Map<string, ClubSeed>();
for (const sourceClub of rawClubSeeds) {
  const canonicalSlug = clubSlugAliases[sourceClub.slug] ?? sourceClub.slug;
  const enrichment = clubEnrichment[sourceClub.slug];
  const existing = mergedClubs.get(canonicalSlug);
  const candidate: ClubSeed = {
    ...sourceClub,
    ...enrichment,
    slug: canonicalSlug,
    sports: [...new Set(sourceClub.sports.map(canonicalClubSport))],
  };
  if (!existing) {
    mergedClubs.set(canonicalSlug, candidate);
    continue;
  }
  mergedClubs.set(canonicalSlug, {
    ...existing,
    ...(enrichment?.official_source ? { summary: sourceClub.summary } : {}),
    ...enrichment,
    slug: canonicalSlug,
    sports: [...new Set([...existing.sports, ...candidate.sports])],
    source_names: [
      ...new Set([
        ...(existing.source_names ?? []),
        ...(candidate.source_names ?? []),
        sourceClub.name,
      ]),
    ],
    website: enrichment?.website ?? existing.website ?? candidate.website,
  });
}

export const clubs: ClubSeed[] = [...mergedClubs.values()];
export { clubSlugAliases };

function normName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const coreNameKeys = new Set(coreSeries.map((series) => normName(series.name)));
const usedSlugs = new Set(coreSeries.map((series) => series.slug));
const extraSeries: Series[] = [];
for (const series of [
  ...(raceCollectionSeries as Series[]),
  ...(marathonDesSablesSeries as Series[]),
  ...(verifiedAllSportSeries as Series[]),
  ...(verifiedGlobalSeries as Series[]),
  ...(verifiedUkSeries as Series[]),
  ...(ukFiveKSeries as Series[]),
  ...(continuedFiveKSeries as Series[]),
  ...(verifiedFiveMileSeries as Series[]),
  ...(verifiedTenKFollowupSeries as Series[]),
  ...(verifiedTenMileSeries as Series[]),
  ...(verifiedHalfMarathonFollowupSeries as Series[]),
  ...(verifiedHalfToTwentyMileSeries as Series[]),
  ...(runabcSeries as Series[]),
  ...(multiSportSeries as Series[]),
  ...(parkrunSeries as Series[]),
  ...(worldAthleticsSeries as Series[]),
  ...(worldTriathlonSeries as Series[]),
  ...(mrdMarathonSeries as Series[]),
  ...(mrdEuMarathonSeries as Series[]),
  ...(mrdIntlMarathonSeries as Series[]),
  ...(comradesSeries as Series[]),
  ...(twoOceansSeries as Series[]),
]) {
  if (eventSlugAliases[series.slug]) continue;
  const key = normName(seriesOverrides[series.slug]?.name ?? series.name);
  if (usedSlugs.has(series.slug) || coreNameKeys.has(key)) continue;
  usedSlugs.add(series.slug);
  coreNameKeys.add(key);
  extraSeries.push(series);
}
const extraSlugs = new Set(extraSeries.map((series) => series.slug));

export const seriesList: Series[] = [...coreSeries, ...extraSeries].map((series) => ({
  ...series,
  ...seriesOverrides[series.slug],
}));

const mergedEditions = [
  ...(coreEditions as Edition[]),
  ...(raceCollectionEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(marathonDesSablesEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedAllSportEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedGlobalEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(verifiedUkEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(ukFiveKEditions as Edition[]),
  ...(continuedFiveKEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(verifiedFiveMileEditions as Edition[]),
  ...(verifiedTenKFollowupEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedTenMileEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(verifiedHalfMarathonFollowupEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedHalfToTwentyMileEditions as Edition[]),
  ...(runabcEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(multiSportEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(worldAthleticsEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(worldTriathlonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(mrdMarathonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(mrdEuMarathonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(mrdIntlMarathonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(comradesEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(twoOceansEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
];

export const editions: Edition[] = (() => {
  const seen = new Set<string>();
  const unique: Edition[] = [];
  for (const sourceEdition of mergedEditions) {
    const sourceKey = `${sourceEdition.seriesSlug}|${sourceEdition.date}|${sourceEdition.distance}`;
    const edition = {
      ...sourceEdition,
      ...editionOverrides[sourceKey],
    };
    const key = `${edition.seriesSlug}|${edition.date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const matchingEntryOptions =
      entryOptions[`${edition.seriesSlug}|${edition.date}|${edition.distance}`];
    if (!matchingEntryOptions) {
      unique.push(edition);
      continue;
    }
    const primary =
      matchingEntryOptions.find((option) => option.isPrimary) ?? matchingEntryOptions[0];
    unique.push({
      ...edition,
      entryUrl: primary.entryUrl,
      entryOptions: matchingEntryOptions,
    });
  }
  return unique;
})();

export { raceGroupDefinitions, raceGroupMemberships };

export { catalogueMetadata } from "./catalogue-metadata";
