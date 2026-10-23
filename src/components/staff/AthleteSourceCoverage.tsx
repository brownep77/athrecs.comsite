import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAthleteFinderSourceCoverage } from "@/lib/athlete-finder/coverage-api";
import type { SourceCoverageRow } from "@/lib/athlete-finder/coverage";

const count = (value: number | null) =>
  value === null ? "Unknown" : value.toLocaleString("en-GB");
const labels: Record<SourceCoverageRow["coverageState"], string> = {
  stored_rows: "Stored rows available",
  incomplete: "Coverage incomplete",
  needs_extraction: "Extraction / review needed",
  links_only: "Links held; rows not collected",
  no_linked_rows: "No linked stored rows found",
};

export function AthleteSourceCoverage({
  onSelectSource,
}: {
  onSelectSource: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const coverage = useQuery({
    queryKey: ["athlete-finder-source-coverage", q, offset],
    queryFn: () => getAthleteFinderSourceCoverage({ data: { q, offset, limit: 40 } }),
    enabled: open,
    staleTime: 120_000,
    retry: false,
  });
  return (
    <section
      aria-labelledby="source-coverage-heading"
      className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h2 id="source-coverage-heading" className="text-xl font-semibold">
            What do we hold for each source?
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            See which websites have searchable result rows and which have saved links or documents
            awaiting extraction. Registering a source does not mean its participant results have
            been collected.
          </p>
        </div>
        <Button variant="secondary" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Hide source coverage" : "Show source coverage"}
        </Button>
      </div>
      {open && (
        <div className="space-y-4">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setQ(draft.trim());
              setOffset(0);
            }}
          >
            <input
              aria-label="Filter source coverage"
              value={draft}
              maxLength={160}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Website, source name or domain"
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
            <Button type="submit" variant="secondary">
              Filter sources
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={coverage.isFetching}
              onClick={() => void coverage.refetch()}
            >
              Refresh source coverage
            </Button>
          </form>
          {coverage.isPending && (
            <p role="status" className="text-sm">
              Checking stored source coverage…
            </p>
          )}
          {coverage.isFetching && !coverage.isPending && (
            <p role="status" className="text-sm">
              Refreshing source coverage…
            </p>
          )}
          {coverage.isError && (
            <p role="alert" className="text-sm">
              Source coverage could not load.{" "}
              <button className="underline" onClick={() => void coverage.refetch()}>
                Retry
              </button>
            </p>
          )}
          {coverage.data && (
            <>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Profile results", coverage.data.summary.stored.canonicalResults],
                  ["Central archive rows", coverage.data.summary.stored.archiveRows],
                  ["Saved capture rows", coverage.data.summary.stored.captureRows],
                  ["History performances", coverage.data.summary.stored.historyRows],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-elevated p-3">
                    <p className="text-xs text-muted">{label}</p>
                    <p className="text-lg font-semibold">{count(value as number | null)}</p>
                  </div>
                ))}
              </div>
              {coverage.data.issues.length > 0 && (
                <div role="alert" className="space-y-1 rounded-lg border border-border p-3 text-sm">
                  {coverage.data.issues.map((issue) => (
                    <p key={issue.store}>{issue.message}</p>
                  ))}
                </div>
              )}
              <p className="text-xs leading-5 text-muted">
                {coverage.data.summary.registrySources.toLocaleString()} registered sources. Counts
                below group stored evidence by website; overlapping sources can share the same
                counts. Unknown means a collection was unavailable to inspect.
              </p>
              <div className="max-h-[36rem] overflow-auto rounded-lg border border-border">
                <table className="w-full min-w-[740px] text-left text-sm">
                  <caption className="sr-only">Source collection and extraction coverage</caption>
                  <thead className="sticky top-0 bg-elevated">
                    <tr>
                      {["Source website", "Stored evidence", "Collection stage", "Use source"].map(
                        (label) => (
                          <th key={label} className="p-3">
                            {label}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.data.rows.map((row) => (
                      <tr key={row.sourceId} className="border-t border-border align-top">
                        <td className="p-3">
                          <p className="font-semibold">{row.name}</p>
                          <p className="break-words text-xs text-muted">
                            {row.domain || "Domain unavailable"}
                          </p>
                          {row.sharedDomain && (
                            <p className="text-xs text-muted">Shared website totals</p>
                          )}
                        </td>
                        <td className="p-3 text-xs leading-6">
                          <p>Profile results: {count(row.stored.canonicalResults)}</p>
                          <p>Archive rows: {count(row.stored.archiveRows)}</p>
                          <p>Capture rows: {count(row.stored.captureRows)}</p>
                          <p>History performances: {count(row.stored.historyRows)}</p>
                        </td>
                        <td className="p-3 text-xs leading-5">
                          <p className="font-semibold">{labels[row.coverageState]}</p>
                          {row.coverageState === "incomplete" && (
                            <p className="text-muted">
                              Some stored collections could not be checked.
                            </p>
                          )}
                          <p>Saved result links: {count(row.inventory.savedResultLinks)}</p>
                          <p>Known result items: {count(row.inventory.knownResultItems)}</p>
                          <p>
                            Extracted: {count(row.inventory.extractedResultItems)} · Partial:{" "}
                            {count(row.inventory.partialResultItems)}
                          </p>
                          <p>
                            Pending: {count(row.inventory.pendingResultItems)} · Held:{" "}
                            {count(row.inventory.heldResultItems)} · Failed:{" "}
                            {count(row.inventory.failedResultItems)}
                          </p>
                          <p className="mt-1 text-muted">
                            {row.participantCheck === "trt"
                              ? "Single results URL check supported"
                              : "Use existing collector or file import"}
                          </p>
                        </td>
                        <td className="p-3">
                          {row.registrySourceId ? (
                            <button
                              className="min-h-10 py-2 text-left text-sm font-semibold text-cyan-800 underline"
                              onClick={() => onSelectSource(row.registrySourceId!)}
                            >
                              Use source filter
                            </button>
                          ) : (
                            <a
                              href="/admin/event-register"
                              className="inline-block min-h-10 py-2 text-sm underline"
                            >
                              Open event inventory
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!coverage.data.rows.length && (
                <p className="text-sm">
                  {coverage.data.total ? (
                    <>
                      No sources on this page.{" "}
                      <button className="underline" onClick={() => setOffset(0)}>
                        Return to first sources
                      </button>
                    </>
                  ) : coverage.data.stores.inventorySources ? (
                    "No source websites match this filter."
                  ) : (
                    "No matching registered sources were found. The wider source inventory could not be checked."
                  )}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  disabled={!offset}
                  onClick={() => setOffset(Math.max(0, offset - 40))}
                >
                  Previous sources
                </Button>
                <span className="text-xs text-muted">
                  {coverage.data.rows.length
                    ? `${offset + 1}–${offset + coverage.data.rows.length} of ${coverage.data.total}`
                    : coverage.data.total
                      ? `${coverage.data.total} matching sources`
                      : "0 sources"}
                </span>
                <Button
                  variant="secondary"
                  disabled={coverage.data.nextOffset === null}
                  onClick={() => setOffset(coverage.data!.nextOffset!)}
                >
                  Next sources
                </Button>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">How to read this coverage</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                  {coverage.data.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </div>
      )}
    </section>
  );
}
