import { safeUrl } from "@/lib/race-collector/core";
import type { CatalogueMatch, PendingEdition } from "@/lib/race-collector/matching";

export function CollectorComparison({
  check,
}: {
  check: {
    matches: CatalogueMatch[];
    matchCount: number;
    pending: PendingEdition[];
    related?: { name: string; date: string; distanceLabel: string }[];
  };
}) {
  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border bg-slate-50 p-3 text-xs leading-5">
      <p className="font-semibold text-fg">Catalogue comparison</p>
      {!check.matches.length && (
        <p className="text-muted">
          No likely catalogue match found by name, former slug, source or entry link. Check the
          primary programme before adding.
        </p>
      )}
      {check.related?.map((row, i) => (
        <p key={i} className="text-amber-800">
          Same programme in this scan: {row.name} · {row.date} · {row.distanceLabel}. Confirm these
          distances belong under one event name.
        </p>
      ))}
      {check.matches.map((match, index) => (
        <details key={match.event.id} open={index === 0}>
          <summary className="cursor-pointer font-medium text-fg">
            {match.confidence === "identity"
              ? match.equivalent
                ? "Existing fixture"
                : "Existing event"
              : match.equivalent
                ? "Possible duplicate"
                : "Possible event match"}
            : {match.event.name}
          </summary>
          <div className="mt-1 space-y-1 text-muted">
            <p>{[match.event.city, match.event.country].filter(Boolean).join(", ")}</p>
            <ul className="list-disc pl-4">
              {match.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            {match.differences.map((difference) => (
              <p key={difference} className="text-amber-800">
                {difference}
              </p>
            ))}
            {match.confidence === "possible" && (
              <p className="font-medium text-amber-800">
                Name similarity is a suggestion; the event identity still needs confirmation.
              </p>
            )}
            {match.editions.map((edition, i) => (
              <div
                key={`${edition.date}-${edition.distance}-${i}`}
                className="border-t border-border pt-1"
              >
                <span className="text-fg">
                  {edition.date} · {edition.distance} · {edition.distanceKm.toFixed(3)} km
                </span>
                {edition.source && safeUrl(edition.source) && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      className="text-emerald-700 underline"
                      href={edition.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Saved source
                    </a>
                  </>
                )}
                {edition.entryUrl && safeUrl(edition.entryUrl) && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      className="text-emerald-700 underline"
                      href={edition.entryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Saved entry page
                    </a>
                  </>
                )}
              </div>
            ))}
            {match.editionCount > match.editions.length && (
              <p>
                Showing the {match.editions.length} closest of {match.editionCount} fixtures in the
                checked period.
              </p>
            )}
            <a
              className="inline-block font-medium text-emerald-700 underline"
              href={`https://www.runrecs.com/races/${encodeURIComponent(match.event.slug)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open existing event
            </a>
          </div>
        </details>
      ))}
      {check.matchCount > check.matches.length && (
        <p className="text-muted">
          Showing {check.matches.length} of {check.matchCount} possible events. Multiple identities
          require review.
        </p>
      )}
      {check.pending.map((pending, i) => (
        <p key={`${pending.batchId}-${i}`} className="text-amber-800">
          Pending publication: {pending.name || pending.eventSlug} · {pending.date}
          {pending.distanceKm != null ? ` · ${pending.distanceKm.toFixed(3)} km` : ""}. Check
          Publication review before adding another copy.
        </p>
      ))}
    </div>
  );
}
