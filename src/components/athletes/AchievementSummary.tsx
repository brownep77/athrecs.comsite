import type { ProfileAchievementSummary } from "@/lib/athrecs/profile-achievement-summary";
import { achievementPalette } from "@/lib/athrecs/achievement-colours";
import { ProfileAward } from "./ProfileAward";

export function AchievementSummary({ summary }: { summary: ProfileAchievementSummary }) {
  const colours = achievementPalette([
    ...summary.earned.map(({ id }) => `milestone:${id}`),
    ...summary.progress.map(({ id }) => `progress:${id}`),
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
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted">
          No eligible completed results are linked yet. Link a completed result to start the
          achievement collection.
        </p>
      )}
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
