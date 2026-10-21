import { buildProfileAchievements, type ProfileAchievement } from "./profile-achievements.ts";
import { profileAchievementResults } from "./profile-history-results.ts";
import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";
import { buildRaceWinAchievements, type RaceWinAchievement } from "./race-win-achievements.ts";

export type RaceWinSummary = Pick<
  RaceWinAchievement,
  "id" | "sport" | "distance" | "kind" | "label"
> & {
  count: number;
  verifiedCount: number;
};

export type AchievementProgress = {
  id: string;
  title: string;
  completed: number;
  target: number;
  remaining: number;
  remainingLabel: string;
};

export type ProfileAchievementSummary = {
  earned: Pick<ProfileAchievement, "id" | "title" | "rule" | "calendarYears" | "verified">[];
  progress: AchievementProgress[];
  raceWins: RaceWinSummary[];
};

/** Derive totals from the complete visible record, before result pagination. */
export function buildProfileAchievementSummary(
  results: readonly ProfileResult[],
  histories: readonly SourceHistory[] = [],
  today = new Date(),
  sourceGender = "",
): ProfileAchievementSummary {
  const record = buildProfileAchievements(
    profileAchievementResults(
      results.filter((result) => !result.details?.profileExcluded),
      histories,
      { includeUnreviewedHistory: true },
    ),
    today,
    { includeRecordedYears: true },
  );
  const progress: AchievementProgress[] = [];
  const add = (
    id: string,
    completed: number,
    levels: number[],
    singular: string,
    plural: string,
  ) => {
    const target = levels.find((level) => level > completed);
    if (target === undefined) return;
    const remaining = target - completed;
    progress.push({
      id,
      title: target === 1 ? `First recorded ${singular}` : `${target} ${plural}`,
      completed,
      target,
      remaining,
      remainingLabel: `${remaining} more ${remaining === 1 ? singular : plural}`,
    });
  };
  add("finishes", record.finishes.length, [1, 5, 10, 25, 50, 100, 250, 500], "finish", "finishes");
  if (record.marathons.length)
    add("marathons", record.marathons.length, [1, 5, 10, 20, 25, 50, 100], "marathon", "marathons");
  if (record.ultras.length)
    add("ultras", record.ultras.length, [1, 5, 10, 25, 50, 100], "ultra", "ultras");
  if (record.countries.length)
    add(
      "countries",
      record.countries.length,
      [2, 5, 10, 25, 50],
      "different country",
      "different countries",
    );
  if (record.sports.length === 1) add("sports", 1, [2], "different sport", "different sports");
  if (record.calendarYears.length)
    add(
      "years",
      record.calendarYears.length,
      [2, 3, 5, 10, 15, 20, 25, 30, 40, 50],
      "calendar year with a finish",
      "calendar years with a finish",
    );
  return {
    earned: record.milestones.map(({ id, title, rule, calendarYears, verified }) => ({
      id,
      title,
      rule,
      verified,
      ...(calendarYears ? { calendarYears } : {}),
    })),
    progress,
    // Counts only: full histories, source URLs and research notes stay out of the public summary.
    raceWins: buildRaceWinAchievements(
      results.filter((result) => !result.details?.profileExcluded),
      histories,
      sourceGender,
      today,
    ).map(({ id, sport, distance, kind, label, results: wins }) => ({
      id,
      sport,
      distance,
      kind,
      label,
      count: wins.length,
      verifiedCount: wins.filter((win) => win.verified).length,
    })),
  };
}
