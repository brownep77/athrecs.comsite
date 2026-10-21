import type { CompetitionHonour } from "@/lib/athrecs/competition-honours";
import { ProfileAward } from "./ProfileAward";
import { AchievementVerification } from "./AchievementVerification";
import { resultCredit } from "@/lib/athrecs/result-credit";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { profileDisciplineLabel } from "@/lib/athrecs/profile-timeline";
import { achievementPalette } from "@/lib/athrecs/achievement-colours";

export function CompetitionHonours({
  honours,
  showEvidence = false,
}: {
  honours: CompetitionHonour[];
  showEvidence?: boolean;
}) {
  if (!honours.length) return null;
  const colours = achievementPalette(honours.map((honour) => `honour:${honour.id}`));
  return (
    <section aria-label="Competition honours" className="space-y-3">
      <h3 className="text-sm font-semibold">Competition honours</h3>
      <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {honours.map((honour) => (
          <details
            key={honour.id}
            data-competition-honour={honour.id}
            className="achievement-label rounded-lg border border-border bg-surface p-3"
            style={colours.get(`honour:${honour.id}`)}
          >
            <summary className="flex cursor-pointer list-none items-start gap-2">
              <ProfileAward kind={honour.kind} tier={honour.tier} label={honour.title} decorative />
              <span>
                <strong className="block text-sm">{honour.title}</strong>
                <AchievementVerification verified={honour.evidence.every((row) => row.verified)} />
                <span className="block text-xs text-muted">{honour.scope}</span>
                <span className="mt-1 block text-xs font-medium">
                  {honour.evidence.length}{" "}
                  {honour.kind === "participation"
                    ? honour.evidence.length === 1
                      ? "championship appearance"
                      : "championship appearances"
                    : honour.evidence.length === 1
                      ? "result"
                      : "results"}{" "}
                  · {showEvidence ? "View evidence" : "View results"}
                </span>
              </span>
            </summary>
            <ul className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
              {honour.evidence.map((row) => (
                <li key={row.key}>
                  <strong className="block">{row.event}</strong>
                  <AchievementVerification verified={row.verified} />
                  <span>
                    {formatRaceDateShort(row.date)} · {profileDisciplineLabel(row.discipline)}
                  </span>
                  {showEvidence &&
                    row.sources.map(({ url, provider }) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-accent underline"
                      >
                        {resultCredit(url, provider)?.name ?? "Source"}
                      </a>
                    ))}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
