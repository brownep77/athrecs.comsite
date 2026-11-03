import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EditorialStandings } from "@/lib/athrecs/editorial";
import { getPublicRaceResults } from "@/lib/athrecs/public-results-api";
import { RoadResultsBoard } from "@/components/races/RoadResultsBoard";
import { RecordedRoadResults } from "@/components/races/RecordedRoadResults";

function EditionStandings({ slug }: { slug: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState("");
  const query = useQuery({
    queryKey: ["report-edition-results", slug, term, page],
    queryFn: () => getPublicRaceResults({ data: { editionId: slug, q: term, page } }),
    staleTime: 60_000,
  });
  const field = query.data;
  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setTerm(search.trim());
        }}
      >
        <label className="min-w-0 flex-1 text-sm font-semibold">
          Find a runner
          <input
            type="search"
            value={search}
            maxLength={120}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Athlete, bib or club"
            className="mt-1 block h-11 w-full rounded border border-border bg-bg px-3 text-base font-normal"
          />
        </label>
        <button className="min-h-11 rounded bg-primary px-4 font-semibold text-primary-fg">
          Search
        </button>
      </form>
      {query.isPending ? (
        <p role="status">Loading recorded results…</p>
      ) : query.isError ? (
        <p role="alert">
          Couldn’t load the results.{" "}
          <button
            type="button"
            className="text-accent underline"
            onClick={() => void query.refetch()}
          >
            Try again
          </button>
        </p>
      ) : field ? (
        <>
          <p className="text-sm text-muted">
            {field.edition.result_count.toLocaleString("en-GB")} performances recorded on AthRecs.
            This archive covers part of the field.
            {field.timingCredit && <> Results from {field.timingCredit}.</>}
          </p>
          <RecordedRoadResults results={field.results} caption={field.edition.event_name} />
          {(page > 1 || field.hasMore) && (
            <nav aria-label="Recorded results pages" className="flex items-center justify-between">
              <button
                className="min-h-11 text-accent disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                className="min-h-11 text-accent disabled:opacity-40"
                disabled={!field.hasMore}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      ) : (
        <p>No public results have been recorded for this edition yet.</p>
      )}
      <a href={`/results/${slug}`} className="text-sm font-semibold text-accent underline">
        Open the AthRecs race archive
      </a>
    </div>
  );
}

export function ReportStandings({
  standings: s,
  links,
}: {
  standings: EditorialStandings;
  links?: Record<string, string>;
}) {
  const [archive, setArchive] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative isolate overflow-hidden border-t-4 border-[#1daaa5] bg-[#102e38] px-4 py-5 text-white sm:px-6">
        {s.artwork && (
          <img
            alt=""
            src={s.artwork}
            className="absolute inset-y-0 right-0 -z-10 h-full w-1/3 object-cover opacity-60"
          />
        )}
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#a4eee1]">
          Road running · {s.distance === "Marathon" ? "42.195" : "21.0975"} km
        </p>
        <p className="mt-2 text-3xl font-bold leading-tight tracking-tight">
          {s.race} <i className="font-serif font-normal text-[#a4eee1]">{s.distance}</i>
        </p>
      </div>
      <div className="space-y-4 p-3 sm:p-5">
        {s.editionSlug && (
          <div role="group" aria-label="Choose results" className="flex flex-wrap gap-2">
            {[false, true].map((v) => (
              <button
                type="button"
                key={String(v)}
                aria-pressed={archive === v}
                onClick={() => setArchive(v)}
                className="min-h-11 rounded border border-border px-3 text-sm font-semibold aria-pressed:bg-primary aria-pressed:text-primary-fg"
              >
                {v ? "Search recorded field" : "Professional results"}
              </button>
            ))}
          </div>
        )}
        {archive && s.editionSlug ? (
          <EditionStandings slug={s.editionSlug} />
        ) : (
          <>
            <p className="text-sm font-medium text-muted">{s.credit}</p>
            <RoadResultsBoard
              rows={s.rows.map((row) => ({ ...row, profile: links?.[row.name] }))}
              caption={s.credit}
              timing={s.timing}
              anchors={s.anchors}
            />
          </>
        )}
      </div>
    </div>
  );
}
