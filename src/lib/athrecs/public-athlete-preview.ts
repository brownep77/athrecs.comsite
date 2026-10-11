import { buildProfileTimeline } from "./profile-timeline";
import {
  combineResultsHistory,
  sourceHistorySports,
  type ResultsHistoryEntry,
} from "./profile-history-results";
import { reportedResultSortDate } from "./profile-result-presentation";
import { publicAthleteBio } from "./public-athlete-bio";
import { isPublicProfileSource } from "./public-profile-sources";
import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";
import type { ReportedRaceRecord } from "./reported-race-history";
import type { SourceNationality } from "./source-nationality";
import { isWmmSource } from "./profile-source-presentation";

export const PUBLIC_PROFILE_RESULT_LIMIT = 5;

export type PublicAthletePreview = {
  slug: string;
  displayName: string;
  athleteNumber: string;
  club: string | null;
  nationality: string | null;
  nationalitySource: SourceNationality | null;
  sports: string[];
  biography: string[];
  biographySources: { label: string; url: string }[];
  entries: ResultsHistoryEntry[];
  reportedRecords: ReportedRaceRecord[];
  totalResults: number;
  searchIndexable: boolean;
};

/** The only anonymous DTO: deduplicate and cap all sources together before serialization. */
export function buildPublicAthletePreview(input: {
  slug: string;
  displayName: string;
  athleteNumber: string;
  club?: string | null;
  country?: string | null;
  nationality?: string | null;
  nationalitySource?: SourceNationality | null;
  sports?: readonly string[];
  biography?: readonly string[];
  biographySources?: readonly { label: string; url: string }[];
  results: readonly ProfileResult[];
  histories: readonly SourceHistory[];
  reportedRecords?: readonly ReportedRaceRecord[];
  searchIndexable: boolean;
}): PublicAthletePreview {
  const timeline = buildProfileTimeline(input.results, input.histories);
  const sports = [
    ...new Set([
      ...(input.sports ?? []),
      ...timeline.results.map((result) => result.sport),
      ...sourceHistorySports(input.histories),
    ]),
  ];
  const combined = [
    ...combineResultsHistory(timeline.results, timeline.history),
    ...(input.reportedRecords ?? []).map((result) => ({ kind: "reported" as const, result })),
  ];
  const date = (entry: (typeof combined)[number]) =>
    entry.kind === "reported"
      ? reportedResultSortDate(entry.result)
      : entry.kind === "recorded"
        ? entry.result.eventDate
        : entry.result.performance.date || String(entry.result.performance.year);
  const recent = combined
    .sort((a, b) => date(b).localeCompare(date(a)))
    .slice(0, PUBLIC_PROFILE_RESULT_LIMIT);
  return {
    slug: input.slug,
    displayName: input.displayName,
    athleteNumber: input.athleteNumber,
    club: input.club ?? null,
    nationality: input.nationality ?? null,
    nationalitySource:
      input.nationalitySource &&
      !isWmmSource(input.nationalitySource.provider, [input.nationalitySource.sourceUrl]) &&
      isPublicProfileSource(input.nationalitySource.sourceUrl, input.nationalitySource.provider)
        ? input.nationalitySource
        : null,
    sports,
    biography: input.biography
      ? [...input.biography]
      : [
          publicAthleteBio({
            name: input.displayName,
            sport: sports.includes("Athletics") ? "Athletics" : sports[0],
            country: input.country,
            club: input.club,
          }),
        ],
    biographySources: (input.biographySources ?? []).filter((source) =>
      isPublicProfileSource(source.url, source.label),
    ),
    entries: recent.filter((entry): entry is ResultsHistoryEntry => entry.kind !== "reported"),
    reportedRecords: recent.flatMap((entry) => (entry.kind === "reported" ? [entry.result] : [])),
    totalResults: combined.length,
    searchIndexable: input.searchIndexable,
  };
}
