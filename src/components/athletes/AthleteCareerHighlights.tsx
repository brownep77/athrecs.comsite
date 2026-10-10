import { Award } from "lucide-react";
import { getEditorialAthleteCareer } from "@/data/freddy-richardson";
import { isPublicProfileSource } from "@/lib/athrecs/public-profile-sources";

export function AthleteCareerHighlights({ slug }: { slug: string }) {
  const career = getEditorialAthleteCareer(slug);
  if (!career) return null;

  return (
    <section
      aria-labelledby="career-achievements"
      className="space-y-4 rounded-xl border border-border bg-surface p-4"
    >
      <h2
        id="career-achievements"
        className="flex items-center gap-2 font-display text-lg font-semibold"
      >
        <Award className="size-5 text-accent" aria-hidden="true" />
        Career achievements
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {career.achievements.map((achievement) => {
          const sources = achievement.sources.filter((source) =>
            isPublicProfileSource(source.url, source.label),
          );
          return (
            <article key={achievement.id} className="space-y-2 rounded-lg border border-border p-3">
              <h3 className="text-sm font-semibold">{achievement.title}</h3>
              <p className="text-xs text-muted">{achievement.date}</p>
              <ul className="space-y-1 text-sm tabular-nums">
                {achievement.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
              {sources.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-accent">Sources</summary>
                  <ul className="mt-2 space-y-2">
                    {sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent underline underline-offset-2"
                        >
                          {source.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          );
        })}
      </div>
      {career.reportedHighlights.length > 0 ? (
        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="font-display font-semibold">Reported major race results</h3>
          <p className="text-xs text-muted">
            These results remain outside verified achievements and personal-best calculations.
          </p>
          <div className="space-y-3">
            {career.reportedHighlights.map((race) => (
              <article key={race.id} className="space-y-1 border-l-2 border-border pl-3">
                <h4 className="text-sm font-semibold">{race.title}</h4>
                <p className="text-xs text-muted">{race.date}</p>
                {race.outcomes.map((outcome) => (
                  <p key={outcome} className="text-sm text-muted">
                    {outcome}
                  </p>
                ))}
                {race.sources
                  .filter((source) => isPublicProfileSource(source.url, source.label))
                  .map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-accent underline underline-offset-2"
                    >
                      {source.label} ↗
                    </a>
                  ))}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
