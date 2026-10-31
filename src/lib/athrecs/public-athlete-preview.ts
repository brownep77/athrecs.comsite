import type { ChannelNative } from "./english-channel";
import { buildProfileTimeline } from "./profile-timeline";
import { publicProfileStatuses } from "./athlete-profile-roles";
import type { BiographyPresentation } from "./biography-presentation";
import {
  buildProfileAchievementSummary,
  type ProfileAchievementSummary,
} from "./profile-achievement-summary";
import {
  combineResultsHistory,
  sourceHistorySports,
  type ResultsHistoryEntry,
} from "./profile-history-results";
import { reportedResultSortDate } from "./profile-result-presentation";
import { publicAthleteBio } from "./public-athlete-bio";
import { withoutProfileEvidence } from "./profile-evidence";
import {
  profileResultLicenceCredits,
  type PublicResultLicenceCreditId,
} from "./public-result-licence";
import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";
import type { ReportedRaceRecord } from "./reported-race-history";
import type { SourceNationality } from "./source-nationality";
import type { PublicProfileDetails } from "./profile-details";
import type { AnzMedal } from "../anz/core";
import { publicAthleteCareer, type PublicCareerSummary } from "./public-athlete-career";
import {
  profilePersonalBestSummary,
  type PersonalBestSummary,
} from "./profile-personal-best-summary";
import {
  publicAthleteResultPage,
  PUBLIC_PROFILE_RESULT_LIMIT,
} from "./public-athlete-result-pages";
export { PUBLIC_PROFILE_RESULT_LIMIT } from "./public-athlete-result-pages";

export type ChampionshipMedalSummary = Pick<
  AnzMedal,
  "year" | "event" | "ageGroup" | "performance" | "medal"
>;

export type PublicAthletePreview = {
  slug: string;
  displayName: string;
  athleteNumber: string;
  club: string | null;
  clubSlug?: string | null;
  nationality: string | null;
  nationalitySource: SourceNationality | null;
  details?: PublicProfileDetails;
  sports: string[];
  profileStatuses?: string[];
  biography: string[];
  biographyPresentation?: BiographyPresentation;
  channelArchive?: ChannelNative;
  biographySources: { label: string; url: string }[];
  careerSummary: PublicCareerSummary | null;
  achievements?: ProfileAchievementSummary;
  personalBests?: PersonalBestSummary;
  championshipMedals?: ChampionshipMedalSummary[];
  publicLicenceCredits?: PublicResultLicenceCreditId[];
  entries: ResultsHistoryEntry[];
  reportedRecords: ReportedRaceRecord[];
  totalResults: number;
  resultPage?: number;
  resultPages?: number;
  searchIndexable: boolean;
};

/** The only anonymous DTO: deduplicate and cap all sources together before serialization. */
export function buildPublicAthletePreview(input: {
  slug: string;
  displayName: string;
  athleteNumber: string;
  club?: string | null;
  clubSlug?: string | null;
  country?: string | null;
  nationality?: string | null;
  nationalitySource?: SourceNationality | null;
  details?: PublicProfileDetails;
  sports?: readonly string[];
  profileRoles?: readonly string[];
  biography?: readonly string[];
  biographyPresentation?: BiographyPresentation;
  channelArchive?: ChannelNative;
  biographySources?: readonly { label: string; url: string }[];
  results: readonly ProfileResult[];
  histories: readonly SourceHistory[];
  /** Already matched to visible completed results by publicAnzMedals on the server. */
  anzMedals?: readonly AnzMedal[];
  reportedRecords?: readonly ReportedRaceRecord[];
  searchIndexable: boolean;
  allowResultPagination?: boolean;
  resultPage?: number;
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
  const resultPages = input.allowResultPagination
    ? Math.max(1, Math.ceil(combined.length / PUBLIC_PROFILE_RESULT_LIMIT))
    : 1;
  const resultPage = input.allowResultPagination
    ? Math.min(publicAthleteResultPage(input.resultPage), resultPages)
    : 1;
  const offset = (resultPage - 1) * PUBLIC_PROFILE_RESULT_LIMIT;
  const recent = combined
    .sort((a, b) => date(b).localeCompare(date(a)))
    .slice(offset, offset + PUBLIC_PROFILE_RESULT_LIMIT);
  return withoutProfileEvidence({
    slug: input.slug,
    displayName: input.displayName,
    athleteNumber: input.athleteNumber,
    club: input.club ?? null,
    clubSlug: input.club ? (input.clubSlug ?? null) : null,
    nationality: input.nationality ?? null,
    nationalitySource: null,
    ...(input.channelArchive ? { channelArchive: input.channelArchive } : {}),
    publicLicenceCredits: profileResultLicenceCredits(input.histories),
    ...(input.details ? { details: input.details } : {}),
    sports,
    profileStatuses: publicProfileStatuses(input.profileRoles),
    achievements: buildProfileAchievementSummary(timeline.results, input.histories),
    personalBests: profilePersonalBestSummary(timeline.results, input.histories),
    championshipMedals: (input.anzMedals ?? []).map(
      ({ year, event, ageGroup, performance, medal }) => ({
        year,
        event,
        ageGroup,
        performance,
        medal,
      }),
    ),
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
    biographySources: [],
    ...(input.biography?.length && input.biographyPresentation
      ? { biographyPresentation: input.biographyPresentation }
      : {}),
    careerSummary:
      input.biography?.length === 0
        ? null
        : publicAthleteCareer(
            input.displayName,
            combined.filter((entry): entry is ResultsHistoryEntry => entry.kind !== "reported"),
            // Only approved unclaimed histories expose older public results.
            // Owner-shared previews retain their existing result limit.
            input.allowResultPagination === true,
          ),
    entries: recent.filter((entry): entry is ResultsHistoryEntry => entry.kind !== "reported"),
    reportedRecords: recent.flatMap((entry) => (entry.kind === "reported" ? [entry.result] : [])),
    totalResults: combined.length,
    resultPage,
    resultPages,
    searchIndexable: input.searchIndexable,
  });
}
