import type { ChampionshipMedalSummary } from "@/lib/athrecs/public-athlete-preview";
import { ProfileAward } from "./ProfileAward";
import { AchievementVerification } from "./AchievementVerification";

/** Championship honours are distinct from an event's overall or category place. */
export function AnzChampionshipMedals({ medals }: { medals: readonly ChampionshipMedalSummary[] }) {
  if (!medals.length) return null;
  return (
    <section aria-label="New Zealand championship medals" className="space-y-3">
      <h2 className="font-display text-lg font-semibold">New Zealand championship medals</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {medals.map((medal) => (
          <article
            key={`${medal.year}|${medal.event}|${medal.ageGroup}|${medal.medal}|${medal.performance}`}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2">
              <ProfileAward kind={medal.medal} tier="national" decorative />
              <span className="text-sm font-semibold capitalize">
                {medal.medal} · {medal.year}
              </span>
            </div>
            <strong className="mt-2 block">
              {medal.event} · {medal.performance}
            </strong>
            <p className="mt-1 text-sm text-muted">{medal.ageGroup}</p>
            <AchievementVerification verified />
          </article>
        ))}
      </div>
    </section>
  );
}
