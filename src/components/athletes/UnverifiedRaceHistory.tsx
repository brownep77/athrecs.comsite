import { getUnverifiedRaceRecords } from "@/data/unverified-race-histories";
import { Badge } from "@/components/ui/badge";

export function UnverifiedRaceHistory({ slug }: { slug: string }) {
  const records = getUnverifiedRaceRecords(slug);
  if (!records.length) return null;

  return (
    <section
      id="unverified-results"
      aria-labelledby="unverified-results-heading"
      className="space-y-3"
    >
      <h2 id="unverified-results-heading" className="font-display text-lg font-semibold">
        Unverified results ({records.length})
      </h2>
      <p className="max-w-prose text-sm text-muted">
        * Unverified: source-reported entries with unresolved details, explained alongside each
        account. Participation may be documented even when the official race name or result is
        unknown. These entries do not count towards verified finishes, personal bests or
        achievements.
      </p>
      <div className="space-y-3">
        {records.map((record) => (
          <article key={record.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-fg">
                {record.event} · {record.distance}
              </h3>
              <Badge variant="outline">* Unverified</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              {record.reportedDate} · {record.location}
            </p>
            <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Reported time / status</dt>
                <dd className="font-semibold tabular-nums">{record.reportedTime}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Reported place</dt>
                <dd>{record.reportedPlace}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-muted">{record.uncertainty}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {record.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center text-xs text-accent underline"
                >
                  {source.label} ↗
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
