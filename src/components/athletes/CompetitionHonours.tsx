import type { CompetitionHonour } from "@/lib/athrecs/competition-honours";
import { ProfileAward } from "./ProfileAward";
import { isPublicProfileSource } from "@/lib/athrecs/public-profile-sources";
import { isWmmSource } from "@/lib/athrecs/profile-source-presentation";
import { resultCredit } from "@/lib/athrecs/result-credit";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { profileDisciplineLabel } from "@/lib/athrecs/profile-timeline";

export function CompetitionHonours({
  honours,
  showEvidence = false,
}: {
  honours: CompetitionHonour[];
  showEvidence?: boolean;
}) {
  if (!honours.length) return null;
  return (
    <section aria-label="Competition honours" className="space-y-3">
      <h3 className="text-sm font-semibold">Competition honours</h3>
      <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {honours.map((honour) => (
          <details
            key={honour.id}
            data-competition-honour={honour.id}
            className="rounded-lg border border-border bg-surface p-3"
          >
            <summary className="flex cursor-pointer list-none items-start gap-2">
              <ProfileAward kind={honour.kind} tier={honour.tier} label={honour.title} decorative />
              <span>
                <strong className="block text-sm">{honour.title}</strong>
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
                  · View evidence
                </span>
              </span>
            </summary>
            <ul className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
              {honour.evidence.map((row) => (
                <li key={row.key}>
                  <strong className="block">{row.event}</strong>
                  <span>
                    {formatRaceDateShort(row.date)} · {profileDisciplineLabel(row.discipline)}
                  </span>
                  {row.sources
                    .filter(
                      ({ url, provider }) =>
                        showEvidence ||
                        (isPublicProfileSource(url, provider) && !isWmmSource(provider, [url])),
                    )
                    .map(({ url, provider }) => (
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
