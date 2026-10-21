import type { ProfileAchievementSummary } from "@/lib/athrecs/profile-achievement-summary";
import { achievementPalette } from "@/lib/athrecs/achievement-colours";
import { ProfileAward } from "./ProfileAward";
import { Check } from "lucide-react";
import { CalendarYearList } from "./CalendarYearList";

export function AchievementSummary({ summary }: { summary: ProfileAchievementSummary }) {
  const raceWins = summary.raceWins ?? [];
  const colours = achievementPalette([
    ...summary.earned.map(({ id }) => `milestone:${id}`),
    ...summary.progress.map(({ id }) => `progress:${id}`),
    ...raceWins.map(({ id }) => `win:${id}`),
  ]);
  return (
    <section
      aria-label="Achievements and next milestones"
      className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2 className="font-display text-lg font-semibold">Achievements & next milestones</h2>
      <p className="text-xs text-muted">
        Based on eligible results linked to this profile. Missing results can change these totals.
      </p>
      {summary.earned.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Achieved</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {summary.earned.map((achievement) => (
              <li
                key={achievement.id}
                data-earned-achievement={achievement.id}
                style={colours.get(`milestone:${achievement.id}`)}
                className="achievement-label rounded-lg border p-3"
              >
                <p className="flex items-start gap-2 text-sm font-semibold">
                  <ProfileAward kind="milestone" decorative />
                  {achievement.title}
                </p>
                <p className="mt-1 text-xs">{achievement.rule}</p>
                {achievement.calendarYears ? (
                  <CalendarYearList years={achievement.calendarYears} />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : raceWins.length ? null : (
        <p className="text-sm text-muted">
          No eligible completed results are linked yet. Link a completed result to start the
          achievement collection.
        </p>
      )}
      {raceWins.length ? (
        <div className="space-y-2" aria-label="Race wins by sport and distance">
          <h3 className="text-sm font-semibold">Race wins by sport and distance</h3>
          <p className="text-xs text-muted">
            Overall, gender and age-category wins are listed separately. Ticks show checked results.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {raceWins.map((win) => (
              <li
                key={win.id}
                data-race-win={win.kind}
                style={colours.get(`win:${win.id}`)}
                className="achievement-label min-w-0 space-y-1 rounded-lg border p-3"
              >
                <p className="text-xs font-semibold">
                  {win.sport} · {win.label}
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ProfileAward kind="trophy" decorative />
                  {win.distance} · {win.count} {win.count === 1 ? "win" : "wins"}
                </p>
                {win.verifiedCount > 0 ? (
                  <p className="flex items-center gap-1 text-xs">
                    <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    {win.verifiedCount === win.count
                      ? "Verified"
                      : `${win.verifiedCount} of ${win.count} verified`}
                  </p>
                ) : null}
                {win.verifiedCount < win.count ? (
                  <p className="text-xs">{win.count - win.verifiedCount} awaiting verification</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {summary.progress.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Next milestones</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {summary.progress.map((goal) => (
              <li
                key={goal.id}
                data-achievement-progress={goal.id}
                style={colours.get(`progress:${goal.id}`)}
                className="achievement-label space-y-2 rounded-lg border p-3"
              >
                <p className="text-sm font-semibold">{goal.title}</p>
                <p className="text-sm">{goal.remainingLabel} needed</p>
                <progress
                  className="h-2 w-full accent-current"
                  aria-label={`Progress towards ${goal.title}`}
                  value={goal.completed}
                  max={goal.target}
                />
                <p className="text-xs tabular-nums">
                  {goal.completed} of {goal.target} recorded
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
