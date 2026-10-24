import { isParkrunResult, PARKRUN_TIMING_LABEL } from "@/lib/athrecs/parkrun-timing";
import { useMemo } from "react";
import {
  profileAchievementResults,
  type AchievementResult,
} from "@/lib/athrecs/profile-history-results";
import { Medal, Globe2, Mountain, Flag, Layers } from "lucide-react";
import { buildProfileAchievements, resultEvidenceLabel } from "@/lib/athrecs/profile-achievements";
import { type ProfileResult } from "@/lib/athrecs/profile-records";
import {
  CHIP_TIME_CAVEAT,
  selectProfilePersonalBests,
  type ReportedPersonalBest,
} from "@/lib/athrecs/reported-personal-bests";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { ProfileEventLink } from "./ProfileEventLink";
import { CountryFlag } from "./CountryFlag";
import { CompetitionHonours } from "./CompetitionHonours";
import { buildCompetitionHonours } from "@/lib/athrecs/competition-honours";
import type { SourceHistory } from "@/lib/athrecs/source-performance-history";
import { achievementPalette } from "@/lib/athrecs/achievement-colours";
import { careerAward, careerTier, type ProfileAwardKind } from "@/lib/athrecs/profile-awards";
import type { CompetitionTier } from "@/lib/athrecs/competition-awards";
import { ProfileAward } from "./ProfileAward";
import { AchievementSummary } from "./AchievementSummary";
import { AchievementVerification } from "./AchievementVerification";
import {
  achievementEvidenceVerified,
  achievementResultVerified,
} from "@/lib/athrecs/achievement-verification";
import { buildProfileAchievementSummary } from "@/lib/athrecs/profile-achievement-summary";
import { CalendarYearList } from "./CalendarYearList";

type BoardHighlight = {
  id: string;
  title: string;
  date: string;
  outcomes: readonly string[];
  sources: readonly { label: string; url: string }[];
  competitionTier?: CompetitionTier;
  awardKind?: ProfileAwardKind;
};

const NO_BOARD_HIGHLIGHTS: readonly BoardHighlight[] = [];

const NO_REPORTED_BESTS: readonly ReportedPersonalBest[] = [];
const NO_SOURCE_HISTORIES: readonly SourceHistory[] = [];

export function PersonalBestStrip({
  results,
  reportedBests = NO_REPORTED_BESTS,
  showEvidence = false,
  sourceHistories = NO_SOURCE_HISTORIES,
}: {
  results: ProfileResult[];
  reportedBests?: readonly ReportedPersonalBest[];
  showEvidence?: boolean;
  sourceHistories?: readonly SourceHistory[];
}) {
  const bests = useMemo(
    () => selectProfilePersonalBests(results, reportedBests, sourceHistories),
    [results, reportedBests, sourceHistories],
  );
  const bestColours = achievementPalette(
    bests.map(
      (candidate) =>
        `pb:${candidate.value.sport}:${candidate.value.surface}:${candidate.value.distanceCode}`,
    ),
  );
  if (!bests.length) return null;
  return (
    <section aria-label="PBs" className="space-y-2">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <ProfileAward kind="personal-best" decorative />
        PBs
      </h2>
      <div className="flex flex-wrap gap-2">
        {bests.map((candidate) => {
          if (candidate.kind === "reported") {
            const best = candidate.value;
            return (
              <a
                key={`reported-${best.id}`}
                style={bestColours.get(`pb:${best.sport}:${best.surface}:${best.distanceCode}`)}
                href={
                  best.recordId
                    ? `#reported-result-${best.recordId}`
                    : showEvidence
                      ? best.sources[0]?.url
                      : undefined
                }
                className="achievement-label min-w-28 flex-1 rounded-lg border border-border bg-accent-soft px-3 py-2 no-underline hover:bg-elevated"
                title={best.note}
              >
                <span className="block text-xs text-muted">
                  {isParkrunResult(best) ? "Parkrun" : best.sport} · {best.distanceCode}
                </span>
                <strong className="text-lg tabular-nums text-fg">
                  {best.displayMark ?? formatDuration(best.finishTimeSeconds)}
                </strong>
                <span className="ml-2 text-xs font-semibold text-accent">
                  {best.qualification ? "Best*" : "PB*"}
                </span>
                <AchievementVerification verified={candidate.verified} />
                <span className="block text-xs text-muted">{best.surface} · Reported time</span>
                {best.qualification ? (
                  <span className="block text-xs text-muted">
                    {best.qualification} · separate from standard PBs
                  </span>
                ) : null}
                <span className="block text-xs text-muted">
                  {isParkrunResult(best)
                    ? PARKRUN_TIMING_LABEL
                    : showEvidence
                      ? CHIP_TIME_CAVEAT
                      : "Reported"}
                </span>
                <span className="block text-xs text-muted">
                  {best.event} · {best.date}
                </span>
              </a>
            );
          }
          const best = candidate.value;
          return (
            <ProfileEventLink
              key={best.resultId}
              style={bestColours.get(`pb:${best.sport}:${best.surface}:${best.distanceCode}`)}
              result={best}
              className="achievement-label min-w-28 flex-1 rounded-lg border border-border bg-accent-soft px-3 py-2 no-underline hover:bg-elevated"
            >
              <span className="block text-xs text-muted">
                {isParkrunResult(best) ? "Parkrun" : best.sport} · {best.distanceCode}
              </span>
              <strong className="text-lg tabular-nums text-fg">
                {best.history?.performance.performance ?? formatDuration(best.finishTimeSeconds)}
              </strong>
              <span className="ml-2 text-xs font-semibold text-accent">PB</span>
              <AchievementVerification verified={candidate.verified} />
              <span className="block text-xs text-muted">{best.surface}</span>
              {isParkrunResult(best) ? (
                <span className="block text-xs text-muted">{PARKRUN_TIMING_LABEL}</span>
              ) : null}
              {best.history ? (
                <span className="block text-xs text-muted">
                  {best.eventName} · {best.eventDate}
                </span>
              ) : null}
              {showEvidence || resultEvidenceLabel(best) === "Athlete-submitted" ? (
                <span className="block text-xs text-muted">
                  {showEvidence ? resultEvidenceLabel(best) : "Reported"}
                </span>
              ) : null}

              <span className="sr-only">
                {" "}
                · {best.eventName} · {formatRaceDateShort(best.eventDate)}
              </span>
            </ProfileEventLink>
          );
        })}
      </div>
    </section>
  );
}

function AchievementEvidence({
  results,
  showEvidence,
}: {
  results: AchievementResult[];
  showEvidence: boolean;
}) {
  return (
    <ul className="mt-3 space-y-2 border-t border-current/20 pt-3 text-xs">
      {results.map((result) => (
        <li key={result.resultId} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="tabular-nums text-muted">
            {result.history?.performance.dateLabel ||
              (result.eventDate.length === 10
                ? formatRaceDateShort(result.eventDate)
                : result.history?.performance.yearLabel || result.eventDate)}
          </span>
          <ProfileEventLink result={result} className="font-medium underline underline-offset-2">
            {result.eventName}
          </ProfileEventLink>
          {result.history ? (
            <span>
              {result.distanceCode} · {result.history.performance.performance || "Recorded finish"}
            </span>
          ) : null}

          <AchievementVerification verified={achievementResultVerified(result)} />
          {showEvidence && result.sourceUrls[0] ? (
            <a
              href={result.sourceUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Source
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function AchievementsBoard({
  results,
  highlights = NO_BOARD_HIGHLIGHTS,
  showEvidence = false,
  sourceHistories = NO_SOURCE_HISTORIES,
  sourceGender = "",
}: {
  results: ProfileResult[];
  highlights?: readonly BoardHighlight[];
  showEvidence?: boolean;
  sourceHistories?: readonly SourceHistory[];
  sourceGender?: string;
}) {
  const achievementResults = useMemo(
    () => profileAchievementResults(results, sourceHistories, { includeUnreviewedHistory: true }),
    [results, sourceHistories],
  );
  const record = useMemo(
    () => buildProfileAchievements(achievementResults, new Date(), { includeRecordedYears: true }),
    [achievementResults],
  );
  const honours = useMemo(
    () => buildCompetitionHonours(results, sourceHistories, sourceGender),
    [results, sourceHistories, sourceGender],
  );
  const showCompletionProgress = record.finishes.length > 0 || honours.length === 0;
  const hasRunning = achievementResults.some((result) =>
    ["running", "athletics", "parkrun"].includes(result.sport.trim().toLowerCase()),
  );
  const metrics = [
    {
      id: "finishes",
      label: record.finishes.some((result) => result.history?.sport === "Athletics")
        ? "Completed performances"
        : "Completed events",
      value: record.finishes.length,
      icon: Medal,
      results: record.finishes,
      verified: achievementEvidenceVerified(record.finishes),
    },
    ...record.distanceFinishes.map((distance) => ({
      id: distance.id,
      label: distance.plural.charAt(0).toUpperCase() + distance.plural.slice(1),
      value: distance.results.length,
      icon: Flag,
      results: distance.results,
      verified: achievementEvidenceVerified(distance.results),
    })),
    ...(hasRunning
      ? [
          {
            id: "marathons",
            label: "Marathons",
            value: record.marathons.length,
            icon: Flag,
            results: record.marathons,
            verified: achievementEvidenceVerified(record.marathons),
          },
          {
            id: "ultras",
            label: "Ultras",
            value: record.ultras.length,
            icon: Mountain,
            results: record.ultras,
            verified: achievementEvidenceVerified(record.ultras),
          },
          {
            id: "majors",
            label: "Marathon majors",
            value: record.completedMajors.length,
            icon: Globe2,
            results: record.completedMajors.flatMap((major) => major.results),
            verified:
              record.completedMajors.length > 0 &&
              record.completedMajors.every((major) =>
                major.results.some(achievementResultVerified),
              ),
          },
        ]
      : []),
    {
      id: "sports",
      label: "Sports completed",
      value: record.sports.length,
      icon: Layers,
      results: record.finishes,
      verified:
        record.sports.length === 1
          ? record.finishes.some(achievementResultVerified)
          : (record.milestones.find((milestone) => milestone.id === "sports")?.verified ?? false),
    },
  ];
  const colours = achievementPalette([
    ...metrics.map(({ id }) => `metric:${id}`),
    "metric:countries",
    "progress:finishes",
    ...record.milestones.map(({ id }) => `milestone:${id}`),
    ...record.majors.map(({ id }) => `major:${id}`),
    ...highlights.map(({ id }) => `career:${id}`),
  ]);
  return (
    <section
      aria-label="Achievements board"
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Achievements board</h2>
      </div>
      {highlights.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {highlights.map((highlight) => (
            <article
              key={highlight.id}
              data-achievement={highlight.id}
              style={colours.get(`career:${highlight.id}`)}
              className="achievement-label space-y-2 rounded-lg border border-border p-3"
            >
              <h3 className="flex items-center gap-2 font-semibold">
                <ProfileAward
                  kind={careerAward(highlight)}
                  tier={careerTier(highlight)}
                  label={highlight.title}
                  decorative
                />
                {highlight.title}
              </h3>
              <p className="text-sm">{highlight.date}</p>
              {highlight.outcomes.map((outcome) => (
                <p key={outcome} className="text-sm">
                  {outcome}
                </p>
              ))}
              {showEvidence ? (
                <details className="text-xs">
                  <summary className="cursor-pointer">Sources</summary>
                  <ul className="mt-2 space-y-1">
                    {highlight.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
      <CompetitionHonours honours={honours} showEvidence={showEvidence} />
      {showCompletionProgress ? (
        <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map(({ id, label, value, verified, icon: Icon, results: evidence }) => (
            <details
              key={id}
              className="achievement-label min-w-0 rounded-lg border p-2"
              style={colours.get(`metric:${id}`)}
            >
              <summary className="cursor-pointer list-none">
                <Icon className="mr-1 inline size-4" aria-hidden="true" />
                <strong className="mr-1 text-lg tabular-nums">{value}</strong>
                <span className="text-xs">{label}</span>
                {value > 0 ? <AchievementVerification verified={verified} /> : null}
                <span className="sr-only"> · Show supporting results</span>
              </summary>
              {evidence.length ? (
                <AchievementEvidence results={evidence} showEvidence={showEvidence} />
              ) : (
                <p className="mt-2 text-xs text-muted">No completed results recorded yet.</p>
              )}
            </details>
          ))}
          <details
            className="achievement-label min-w-0 rounded-lg border p-2"
            style={colours.get("metric:countries")}
          >
            <summary className="cursor-pointer list-none">
              <Globe2 className="mr-1 inline size-4" aria-hidden="true" />
              <strong className="mr-1 text-lg tabular-nums">{record.countries.length}</strong>
              <span className="text-xs">Countries raced in</span>
              {record.countries.length > 0 ? (
                <AchievementVerification
                  verified={record.countries.every((country) =>
                    country.results.some(achievementResultVerified),
                  )}
                />
              ) : null}
              <span className="sr-only"> · Show countries</span>
            </summary>
            <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
              {record.countries.map((country) => (
                <div key={country.code} className="flex items-center gap-2">
                  <CountryFlag country={country.name} showName />
                  <AchievementVerification
                    verified={country.results.some(achievementResultVerified)}
                  />
                </div>
              ))}
              {!record.countries.length ? "No race countries recorded yet." : null}
            </div>
          </details>
        </div>
      ) : null}
      <details>
        <summary className="cursor-pointer text-sm font-medium">
          Milestones ({record.milestones.length})
        </summary>
        <div className="mt-3 space-y-3">
          {record.milestones.length ? (
            <div className="grid items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {record.milestones.map((achievement) => (
                <details
                  key={achievement.id}
                  className="achievement-label rounded-lg border p-3"
                  style={colours.get(`milestone:${achievement.id}`)}
                  data-achievement={achievement.id}
                >
                  <summary className="flex cursor-pointer list-none items-start gap-2">
                    <ProfileAward kind="milestone" />
                    <span>
                      <strong className="block text-sm font-medium">{achievement.title}</strong>
                      <AchievementVerification verified={achievement.verified} />
                      <span className="text-xs">View supporting results</span>
                    </span>
                  </summary>
                  {achievement.calendarYears ? (
                    <CalendarYearList years={achievement.calendarYears} />
                  ) : null}
                  <AchievementEvidence results={achievement.results} showEvidence={showEvidence} />
                </details>
              ))}
            </div>
          ) : showCompletionProgress ? (
            <p className="text-sm text-muted">
              Your first recorded finish starts your achievement collection.
            </p>
          ) : null}
          {record.nextFinishTarget && showCompletionProgress ? (
            <div
              className="achievement-label space-y-2 rounded-lg border p-3 text-sm"
              style={colours.get("progress:finishes")}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span>
                  Next milestone ·{" "}
                  {record.nextFinishTarget === 1
                    ? "First recorded finish"
                    : `${record.nextFinishTarget} recorded finishes`}
                </span>
                <span className="text-xs tabular-nums text-muted">
                  {record.finishes.length} / {record.nextFinishTarget}
                </span>
              </div>
              <progress
                className="h-1.5 w-full accent-current"
                aria-label="Progress towards the next finish milestone"
                value={record.finishes.length}
                max={record.nextFinishTarget}
              />
            </div>
          ) : null}
          {hasRunning ? (
            <details className="border-t border-border pt-3">
              <summary className="cursor-pointer text-sm font-medium">
                Marathon majors journey · {record.completedMajors.length} / {record.majors.length}
              </summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {record.majors.map((major) => (
                  <div
                    key={major.id}
                    className="achievement-label rounded-lg border p-3 text-sm"
                    style={major.results.length ? colours.get(`major:${major.id}`) : undefined}
                  >
                    <strong className="font-medium">{major.name}</strong>
                    {major.results.length > 0 ? (
                      <AchievementVerification
                        verified={major.results.some(achievementResultVerified)}
                      />
                    ) : null}
                    <p className="mt-1 text-xs text-muted">
                      {major.results.length
                        ? "Completed in this record"
                        : "No qualifying result linked"}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </details>
    </section>
  );
}

export function ProfileRecordHighlights({
  results,
  highlights = NO_BOARD_HIGHLIGHTS,
  reportedBests = NO_REPORTED_BESTS,
  sourceHistories = NO_SOURCE_HISTORIES,
  sourceGender = "",
  showEvidence = false,
  compact = false,
}: {
  results: ProfileResult[];
  highlights?: readonly BoardHighlight[];
  reportedBests?: readonly ReportedPersonalBest[];
  sourceHistories?: readonly SourceHistory[];
  sourceGender?: string;
  showEvidence?: boolean;
  compact?: boolean;
}) {
  const summary = useMemo(
    () => buildProfileAchievementSummary(results, sourceHistories, new Date(), sourceGender),
    [results, sourceHistories, sourceGender],
  );
  return (
    <div className="space-y-4">
      <AchievementSummary summary={summary} />
      <PersonalBestStrip
        results={results}
        reportedBests={reportedBests}
        showEvidence={showEvidence}
        sourceHistories={sourceHistories}
      />
      {results.length > 0 || sourceHistories.length > 0 || !reportedBests.length ? (
        compact ? (
          <details className="rounded-xl border border-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Achievements & milestones
            </summary>
            <p className="my-3 text-xs text-muted">
              Based on the eligible results linked to this profile.
            </p>
            <AchievementsBoard
              results={results}
              highlights={highlights}
              sourceHistories={sourceHistories}
              sourceGender={sourceGender}
              showEvidence={showEvidence}
            />
          </details>
        ) : (
          <AchievementsBoard
            results={results}
            highlights={highlights}
            sourceHistories={sourceHistories}
            sourceGender={sourceGender}
            showEvidence={showEvidence}
          />
        )
      ) : null}
    </div>
  );
}
