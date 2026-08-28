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
import { publicFigureAthletes, publicFigureEditions, publicFigureSeries } from "./public-figures";
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
  ...publicFigureAthletes,
];
export const athletes = rawAthletes.map((athlete) => ({
  ...athlete,
  club_slug: clubSlugAliases[athlete.club_slug] ?? athlete.club_slug,
  second_club_slug: athlete.second_club_slug
    ? (clubSlugAliases[athlete.second_club_slug] ?? athlete.second_club_slug)
    : undefined,
}));
import { results } from "./results";
export { results };
import { seriesList as coreSeries } from "./series";
import { editions as coreEditions } from "./editions";
import { runabcEditions, runabcSeries } from "./runabc";
import { ironman703Editions, ironman703Series } from "./ironman-703-calendar";
import { multiSportEditions, multiSportSeries } from "./multisport";
import { parkrunSeries } from "./parkrun-uk";
import { worldAthleticsEditions, worldAthleticsSeries } from "./world-athletics";
import { worldTriathlonEditions, worldTriathlonSeries } from "./world-triathlon";
import { mrdMarathonEditions, mrdMarathonSeries } from "./mrd-marathons";
import { mrdEuMarathonEditions, mrdEuMarathonSeries } from "./mrd-marathons-eu";
import { mrdIntlMarathonEditions, mrdIntlMarathonSeries } from "./mrd-marathons-intl";
import {
  aimsEuropeEditions,
  aimsEuropeSeries,
  aimsEuropeSeriesOverrides,
} from "./aims-europe-road-races";
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
import { afghanistanRaceEditions, afghanistanRaceSeries } from "./afghanistan-races";
import { albaniaRaceEditions, albaniaRaceSeries } from "./albania-races";
import { westernBalkansRaceEditions, westernBalkansRaceSeries } from "./western-balkans-races";
import {
  franceSpainPortugalRaceEditions,
  franceSpainPortugalRaceSeries,
} from "./france-spain-portugal-races";
import {
  belgiumNetherlandsRaceEditions,
  belgiumNetherlandsRaceSeries,
} from "./belgium-netherlands-races";
import {
  belgiumComprehensiveRaceEditions,
  belgiumComprehensiveRaceSeries,
  belgiumComprehensiveReplacementSlugs,
} from "./belgium-races-comprehensive";
import {
  netherlandsFullRaceEditions,
  netherlandsFullRaceSeries,
} from "./netherlands-full-running-calendar";
import {
  englandAthleticsRunEventsEditions,
  englandAthleticsRunEventsSeries,
} from "./england-athletics-runevents";
import {
  englandAthleticsUkFixturesEditions,
  englandAthleticsUkFixturesSeries,
} from "./england-athletics-uk-fixtures";
import { ukFiveKEditions, ukFiveKSeries } from "./uk-5k-races";
import { continuedFiveKEditions, continuedFiveKSeries } from "./five-k-races-uk-ireland-next";
import { dailyFiveKEditions, dailyFiveKSeries } from "./five-k-races-uk-ireland-daily";
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
import {
  dailyHalfTenMileEditions,
  dailyHalfTenMileExistingSeriesEditions,
  dailyHalfTenMileSeries,
} from "./half-ten-mile-races-uk-ireland-daily-followup";
import {
  prominentUkIrelandEditions,
  prominentUkIrelandSeries,
} from "./uk-ireland-prominent-races-2026-2027";
import {
  verifiedNonStandardDistanceEditions,
  verifiedNonStandardDistanceSeries,
} from "./non-standard-races-uk-ireland";
import {
  germanyEnduranceRaceEditions,
  germanyEnduranceRaceSeries,
} from "./germany-endurance-races";
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
  ...(afghanistanRaceSeries as Series[]),
  ...(albaniaRaceSeries as Series[]),
  ...(westernBalkansRaceSeries as Series[]),
  ...(franceSpainPortugalRaceSeries as Series[]),
  ...(belgiumComprehensiveRaceSeries as Series[]),
  ...(belgiumNetherlandsRaceSeries as Series[]),
  ...(netherlandsFullRaceSeries as Series[]),
  ...(englandAthleticsRunEventsSeries as Series[]),
  ...(englandAthleticsUkFixturesSeries as Series[]),
  ...(verifiedAllSportSeries as Series[]),
  ...(verifiedGlobalSeries as Series[]),
  ...(verifiedUkSeries as Series[]),
  ...(ukFiveKSeries as Series[]),
  ...(continuedFiveKSeries as Series[]),
  ...(dailyFiveKSeries as Series[]),
  ...(verifiedFiveMileSeries as Series[]),
  ...(verifiedTenKFollowupSeries as Series[]),
  ...(verifiedTenMileSeries as Series[]),
  ...(verifiedHalfMarathonFollowupSeries as Series[]),
  ...(verifiedHalfToTwentyMileSeries as Series[]),
  ...(dailyHalfTenMileSeries as Series[]),
  ...(prominentUkIrelandSeries as Series[]),
  ...(verifiedNonStandardDistanceSeries as Series[]),
  ...(germanyEnduranceRaceSeries as Series[]),
  ...(runabcSeries as Series[]),
  ...(ironman703Series as Series[]),
  ...(multiSportSeries as Series[]),
  ...(parkrunSeries as Series[]),
  ...(worldAthleticsSeries as Series[]),
  ...(worldTriathlonSeries as Series[]),
  ...(mrdMarathonSeries as Series[]),
  ...(mrdEuMarathonSeries as Series[]),
  ...(mrdIntlMarathonSeries as Series[]),
  ...(aimsEuropeSeries as Series[]),
  ...(comradesSeries as Series[]),
  ...(twoOceansSeries as Series[]),
  ...(publicFigureSeries as Series[]),
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
  ...aimsEuropeSeriesOverrides[series.slug],
}));

const mergedEditions = [
  ...aimsEuropeEditions.filter((edition) => usedSlugs.has(edition.seriesSlug)),
  ...(coreEditions as Edition[]),
  ...(raceCollectionEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(marathonDesSablesEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(afghanistanRaceEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(albaniaRaceEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(westernBalkansRaceEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(franceSpainPortugalRaceEditions as Edition[]).filter((edition) =>
    usedSlugs.has(edition.seriesSlug),
  ),
  ...(belgiumComprehensiveRaceEditions as Edition[]).filter((edition) =>
    usedSlugs.has(edition.seriesSlug),
  ),
  ...(belgiumNetherlandsRaceEditions as Edition[]).filter(
    (edition) =>
      usedSlugs.has(edition.seriesSlug) &&
      !belgiumComprehensiveReplacementSlugs.has(edition.seriesSlug),
  ),
  ...(netherlandsFullRaceEditions as Edition[]).filter((edition) =>
    usedSlugs.has(edition.seriesSlug),
  ),
  ...(englandAthleticsRunEventsEditions as Edition[]).filter((edition) =>
    usedSlugs.has(edition.seriesSlug),
  ),
  ...(englandAthleticsUkFixturesEditions as Edition[]).filter((edition) =>
    usedSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedAllSportEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedGlobalEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(verifiedUkEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(ukFiveKEditions as Edition[]),
  ...(continuedFiveKEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(dailyFiveKEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(verifiedFiveMileEditions as Edition[]),
  ...(verifiedTenKFollowupEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedTenMileEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(verifiedHalfMarathonFollowupEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedHalfToTwentyMileEditions as Edition[]),
  ...(dailyHalfTenMileEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(dailyHalfTenMileExistingSeriesEditions as Edition[]),
  ...(prominentUkIrelandEditions as Edition[]).filter((edition) =>
    usedSlugs.has(edition.seriesSlug),
  ),
  ...(verifiedNonStandardDistanceEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(germanyEnduranceRaceEditions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(runabcEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(ironman703Editions as Edition[]).filter((edition) =>
    extraSlugs.has(edition.seriesSlug),
  ),
  ...(multiSportEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(worldAthleticsEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(worldTriathlonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(mrdMarathonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(mrdEuMarathonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(mrdIntlMarathonEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(comradesEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(twoOceansEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),
  ...(publicFigureEditions as Edition[]),
];

const retainedResultEditionKeys = new Set(
  results.map((result) => `${result.eventSlug}|${result.date}|${result.distance}`),
);

export const editions: Edition[] = (() => {
  const seen = new Set<string>();
  const seenExact = new Set<string>();
  const unique: Edition[] = [];
  const pushEdition = (edition: Edition) => {
    const matchingEntryOptions =
      entryOptions[`${edition.seriesSlug}|${edition.date}|${edition.distance}`];
    if (!matchingEntryOptions) {
      unique.push(edition);
      return;
    }
    const primary =
      matchingEntryOptions.find((option) => option.isPrimary) ?? matchingEntryOptions[0];
    unique.push({
      ...edition,
      entryUrl: primary.entryUrl,
      entryOptions: matchingEntryOptions,
    });
  };

  for (const sourceEdition of mergedEditions) {
    const sourceKey = `${sourceEdition.seriesSlug}|${sourceEdition.date}|${sourceEdition.distance}`;
    const edition = {
      ...sourceEdition,
      ...editionOverrides[sourceKey],
    };
    const exactKey = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
    const key = edition.publishAllDistances ? exactKey : `${edition.seriesSlug}|${edition.date}`;
    if (seenExact.has(exactKey) || seen.has(key)) continue;
    seenExact.add(exactKey);
    seen.add(key);
    pushEdition(edition);
  }

  // A retained result must always have an exact edition dependency. The normal
  // card-level dedupe still applies to every other fixture, but a result-backed
  // distance cannot be discarded merely because another distance shares its date.
  for (const sourceEdition of mergedEditions) {
    const sourceKey = `${sourceEdition.seriesSlug}|${sourceEdition.date}|${sourceEdition.distance}`;
    const edition = {
      ...sourceEdition,
      ...editionOverrides[sourceKey],
    };
    const exactKey = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
    if (!retainedResultEditionKeys.has(exactKey) || seenExact.has(exactKey)) continue;
    seenExact.add(exactKey);
    pushEdition(edition);
  }

  return unique;
})();

export { raceGroupDefinitions, raceGroupMemberships };

export { catalogueMetadata } from "./catalogue-metadata";