import { useMemo } from "react";
import { Medal, Trophy, Globe2, Mountain, Flag, Layers } from "lucide-react";
import { buildProfileAchievements, isCompletedResult } from "@/lib/athrecs/profile-achievements";
import { type ProfileResult } from "@/lib/athrecs/profile-records";
import {
  selectProfilePersonalBests,
  type ReportedPersonalBest,
} from "@/lib/athrecs/reported-personal-bests";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { ProfileEventLink } from "./ProfileEventLink";
import { CountryFlag } from "./CountryFlag";
import { RaceWinAchievements } from "./RaceWinAchievements";
import { buildRaceWinAchievements } from "@/lib/athrecs/race-win-achievements";
import type { SourceHistory } from "@/lib/athrecs/source-performance-history";

export function ResultMedal({ result }: { result: ProfileResult }) {
  if (!isCompletedResult(result)) return null;
  return (
    <span
      className="inline-flex shrink-0 text-amber-700 dark:text-amber-300"
      title="Completed event"
    >
      <Medal className="size-4" aria-hidden="true" />
      <span className="sr-only">Completed event · </span>
    </span>
  );
}

const NO_REPORTED_BESTS: readonly ReportedPersonalBest[] = [];
const NO_SOURCE_HISTORIES: readonly SourceHistory[] = [];

export function PersonalBestStrip({
  results,
  reportedBests = NO_REPORTED_BESTS,
}: {
  results: ProfileResult[];
  reportedBests?: readonly ReportedPersonalBest[];
}) {
  const bests = useMemo(
    () => selectProfilePersonalBests(results, reportedBests),
    [results, reportedBests],
  );
  if (!bests.length) return null;
  return (
    <section aria-label="Personal bests" className="space-y-2">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Trophy className="size-4 text-accent" aria-hidden="true" />
        Personal bests
      </h2>
      <div className="flex flex-wrap gap-2">
        {bests.map((candidate) => {
          if (candidate.kind === "reported") {
            const best = candidate.value;
            return (
              <a
                key={`reported-${best.id}`}
                href={best.recordId ? `#reported-result-${best.recordId}` : best.sources[0].url}
                className="min-w-28 flex-1 rounded-lg border border-border bg-accent-soft px-3 py-2 no-underline hover:bg-elevated"
                title={best.note}
              >
                <span className="block text-xs text-muted">
                  {best.sport} · {best.distanceCode}
                </span>
                <strong className="text-lg tabular-nums text-fg">
                  {formatDuration(best.finishTimeSeconds)}
                </strong>
                <span className="ml-2 text-xs font-semibold text-accent">PB*</span>
                <span className="block text-xs text-muted">{best.surface} · Reported time</span>
                <span className="block text-xs text-muted">Reported</span>
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
              result={best}
              className="min-w-28 flex-1 rounded-lg border border-border bg-accent-soft px-3 py-2 no-underline hover:bg-elevated"
            >
              <span className="block text-xs text-muted">
                {best.sport} · {best.distanceCode}
              </span>
              <strong className="text-lg tabular-nums text-fg">
                {formatDuration(best.finishTimeSeconds)}
              </strong>
              <span className="ml-2 text-xs font-semibold text-accent">PB</span>
              <span className="block text-xs text-muted">{best.surface}</span>

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

function AchievementEvidence({ results }: { results: ProfileResult[] }) {
  return (
    <ul className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
      {results.map((result) => (
        <li key={result.resultId} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="tabular-nums text-muted">{formatRaceDateShort(result.eventDate)}</span>
          <ProfileEventLink result={result} className="font-medium text-accent hover:underline">
            {result.eventName}
          </ProfileEventLink>

          {result.sourceUrls[0] ? (
            <a
              href={result.sourceUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
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
  sourceHistories = NO_SOURCE_HISTORIES,
  sourceGender = "",
}: {
  results: ProfileResult[];
  sourceHistories?: readonly SourceHistory[];
  sourceGender?: string;
}) {
  const record = useMemo(() => buildProfileAchievements(results), [results]);
  const wins = useMemo(
    () => buildRaceWinAchievements(results, sourceHistories, sourceGender),
    [results, sourceHistories, sourceGender],
  );
  const showCompletionProgress = record.finishes.length > 0 || wins.length === 0;
  const hasRunning = results.some((result) =>
    ["running", "athletics", "parkrun"].includes(result.sport.trim().toLowerCase()),
  );
  const metrics = [
    {
      label: "Completed events",
      value: record.finishes.length,
      icon: Medal,
      results: record.finishes,
    },
    ...(hasRunning
      ? [
          {
            label: "Marathons",
            value: record.marathons.length,
            icon: Flag,
            results: record.marathons,
          },
          { label: "Ultras", value: record.ultras.length, icon: Mountain, results: record.ultras },
          {
            label: "Marathon majors",
            value: record.completedMajors.length,
            icon: Globe2,
            results: record.completedMajors.flatMap((major) => major.results),
          },
        ]
      : []),
    {
      label: "Sports completed",
      value: record.sports.length,
      icon: Layers,
      results: record.finishes,
    },
  ];
  return (
    <section
      aria-label="Achievements board"
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Achievements board</h2>
      </div>
      <RaceWinAchievements wins={wins} />
      {showCompletionProgress ? (
        <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map(({ label, value, icon: Icon, results: evidence }) => (
            <details key={label} className="min-w-0 rounded-lg bg-elevated p-2">
              <summary className="cursor-pointer list-none">
                <Icon className="mr-1 inline size-4 text-accent" aria-hidden="true" />
                <strong className="mr-1 text-lg tabular-nums">{value}</strong>
                <span className="text-xs text-muted">{label}</span>
                <span className="sr-only"> · Show supporting results</span>
              </summary>
              {evidence.length ? (
                <AchievementEvidence results={evidence} />
              ) : (
                <p className="mt-2 text-xs text-muted">No completed results recorded yet.</p>
              )}
            </details>
          ))}
          <details className="min-w-0 rounded-lg bg-elevated p-2">
            <summary className="cursor-pointer list-none">
              <Globe2 className="mr-1 inline size-4 text-accent" aria-hidden="true" />
              <strong className="mr-1 text-lg tabular-nums">{record.countries.length}</strong>
              <span className="text-xs text-muted">Countries raced in</span>
              <span className="sr-only"> · Show countries</span>
            </summary>
            <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
              {record.countries.map((country) => (
                <div key={country.code} className="flex items-center gap-2">
                  <CountryFlag country={country.name} showName />
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
                  className="rounded-lg border border-border bg-accent-soft p-3"
                  data-achievement={achievement.id}
                >
                  <summary className="flex cursor-pointer list-none items-start gap-2">
                    <Medal className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>
                      <strong className="block text-sm font-medium">{achievement.title}</strong>
                      <span className="text-xs text-muted">View supporting results</span>
                    </span>
                  </summary>

                  <AchievementEvidence results={achievement.results} />
                </details>
              ))}
            </div>
          ) : showCompletionProgress ? (
            <p className="text-sm text-muted">
              Your first recorded finish starts your achievement collection.
            </p>
          ) : null}
          {record.nextFinishTarget && showCompletionProgress ? (
            <div className="space-y-2 rounded-lg bg-elevated p-3 text-sm">
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
                className="h-1.5 w-full accent-accent"
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
                    className={`rounded-lg border p-3 text-sm ${major.results.length ? "border-accent bg-accent-soft" : "border-border"}`}
                  >
                    <strong className="font-medium">{major.name}</strong>
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
  reportedBests = NO_REPORTED_BESTS,
  sourceHistories = NO_SOURCE_HISTORIES,
  sourceGender = "",
}: {
  results: ProfileResult[];
  reportedBests?: readonly ReportedPersonalBest[];
  sourceHistories?: readonly SourceHistory[];
  sourceGender?: string;
}) {
  return (
    <div className="space-y-4">
      <PersonalBestStrip results={results} reportedBests={reportedBests} />
      {results.length > 0 || sourceHistories.length > 0 || !reportedBests.length ? (
        <AchievementsBoard
          results={results}
          sourceHistories={sourceHistories}
          sourceGender={sourceGender}
        />
      ) : null}
    </div>
  );
}
