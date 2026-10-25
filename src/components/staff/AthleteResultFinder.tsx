import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Database, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listFixtureSources } from "@/lib/athrecs/api";
import { searchAthleteSourceResults } from "@/lib/athlete-finder/api";
import { findPossibleAthleteProfiles } from "@/lib/athlete-finder/identity-review-api";
import {
  finderSearchSchema,
  type FinderRow,
  type FinderSearchInput,
  type FinderStoreKind,
} from "@/lib/athlete-finder/core";
import { AthleteSourceCheck } from "./AthleteSourceCheck";
import { AthleteSourceCoverage } from "./AthleteSourceCoverage";
import { FinderAddToProfile } from "./FinderAddToProfile";
import {
  finderProfileSource,
  type FinderProfileReceipt,
} from "@/lib/athlete-finder/add-to-profile";

const finderInputClass =
  "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg";
const collectionLabels: Record<FinderStoreKind, string> = {
  canonical: "Profile results",
  archive: "Central archive",
  capture: "Saved race captures",
  history: "Athlete histories",
};

function finderSourceLink(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function reviewLink(row: FinderRow): { href: string; label: string } | null {
  if (row.archiveEntryId !== null)
    return {
      href: `/admin/result-archive#entry=${row.archiveEntryId}`,
      label: "Review archive row",
    };
  if (row.captureId !== null)
    return {
      href: `/admin/result-archive#capture=${encodeURIComponent(row.captureId)}&name=${encodeURIComponent(row.name)}`,
      label: "Open saved race rows",
    };
  if (row.athleteId !== null)
    return {
      href: `/admin/athlete-tools?section=review&athleteId=${row.athleteId}`,
      label: "Review athlete results",
    };
  return null;
}

function MatchRow({
  row,
  onAdd,
  receipt,
}: {
  row: FinderRow;
  onAdd: () => void;
  receipt?: FinderProfileReceipt;
}) {
  const review = reviewLink(row);
  const source = finderSourceLink(row.sourceUrl);
  return (
    <tr className="border-t border-border align-top">
      <td className="p-3">
        <p className="font-semibold">{row.name}</p>
        <p className="text-xs text-muted">{row.club || "Club not recorded"}</p>
      </td>
      <td className="p-3">
        <p>{row.event || "Event not recorded"}</p>
        <p className="text-xs text-muted">
          {[row.date?.slice(0, 10), row.distance].filter(Boolean).join(" · ") ||
            "Date / distance not recorded"}
        </p>
      </td>
      <td className="p-3">
        <p className="whitespace-pre-line font-mono text-xs">
          {row.performance ||
            (row.finishSeconds === null ? "Not recorded" : `${row.finishSeconds} seconds`)}
        </p>
        {row.status && <p className="mt-1 text-xs text-muted">{row.status}</p>}
      </td>
      <td className="p-3 text-xs">
        <p className="font-medium">{collectionLabels[row.kind]}</p>
        <p className="mt-1 break-words text-muted">{row.reviewState}</p>
        <p className="mt-1 break-words text-muted">{row.rowLocator}</p>
        {source && (
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block underline"
          >
            {row.sourceName || "Source page"}
          </a>
        )}
      </td>
      <td className="p-3">
        {receipt ? (
          <p className="mb-2 text-xs font-semibold text-green-800">Added to {receipt.name}</p>
        ) : finderProfileSource(row) ? (
          <Button className="mb-2" variant="secondary" onClick={onAdd}>
            {row.resultId ? "View profile attachment" : "Add to profile"}
          </Button>
        ) : row.athleteId ? (
          <p className="mb-2 text-xs font-semibold">Already attached to {row.name}'s profile</p>
        ) : null}
        {review ? (
          <a
            href={review.href}
            className="inline-block min-h-10 py-2 text-sm font-semibold text-cyan-800 underline"
          >
            {review.label}
          </a>
        ) : (
          <span className="text-xs text-muted">Review source evidence</span>
        )}
      </td>
    </tr>
  );
}

export function AthleteResultFinder({
  initialName = "",
  initialSource = "",
}: {
  initialName?: string;
  initialSource?: string;
}) {
  const [name, setName] = useState(initialName);
  const [aliasesText, setAliasesText] = useState("");
  const [club, setClub] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [sourceId, setSourceId] = useState(initialSource);
  const [kind, setKind] = useState<FinderStoreKind | "all">("all");
  const [validation, setValidation] = useState("");
  const [addingRow, setAddingRow] = useState<FinderRow | null>(null);
  const [addedRows, setAddedRows] = useState<Record<string, FinderProfileReceipt>>({});
  const [submitted, setSubmitted] = useState<FinderSearchInput | null>(null);
  const registry = useQuery({
    queryKey: ["admin-fixture-sources"],
    queryFn: () => listFixtureSources(),
    staleTime: 300_000,
  });
  const search = useMutation({
    mutationFn: (input: FinderSearchInput) => searchAthleteSourceResults({ data: input }),
  });
  const identityReview = useQuery({
    queryKey: ["staff-athlete-identity-review", submitted?.q, submitted?.aliases, submitted?.club],
    enabled: Boolean(submitted),
    retry: false,
    staleTime: 60_000,
    queryFn: () =>
      findPossibleAthleteProfiles({
        data: {
          name: submitted!.q,
          aliases: submitted!.aliases ?? [],
          club: submitted!.club ?? "",
        },
      }),
  });
  const aliases = aliasesText
    .split(/[;\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const results = !search.isPending && !search.isError ? search.data : undefined;
  function run(input: FinderSearchInput) {
    const parsed = finderSearchSchema.safeParse(input);
    if (!parsed.success) {
      setValidation(parsed.error.issues[0]?.message ?? "Check the search fields.");
      return;
    }
    setValidation("");
    setSubmitted(parsed.data);
    search.mutate(parsed.data);
  }
  return (
    <div className="min-w-0 space-y-6">
      {addingRow && (
        <FinderAddToProfile
          key={addingRow.key}
          row={addingRow}
          onClose={() => setAddingRow(null)}
          onSaved={(receipt) => {
            setAddedRows((previous) => ({ ...previous, [addingRow.key]: receipt }));
            if (submitted) search.mutate(submitted);
          }}
        />
      )}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-800">
            Staff · Source collection
          </p>
          <h1 className="font-display text-3xl font-semibold">Athlete result finder</h1>
          <p className="text-sm leading-6 text-muted">
            Find an athlete across stored profile results, central archive rows, saved race captures
            and imported histories. Then check a supported results page for anything we have not
            collected.
          </p>
        </div>
        <Button asChild variant="secondary">
          <a href="/admin/result-archive">Collected results</a>
        </Button>
      </header>

      <section
        aria-labelledby="stored-search-heading"
        className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
      >
        <div>
          <h2 id="stored-search-heading" className="flex items-center gap-2 text-xl font-semibold">
            <Database aria-hidden="true" className="size-5" />
            Search collected results
          </h2>
          <p className="mt-1 text-sm text-muted">
            This searches data already held by AthRecs. No external search account is needed.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            run({
              q: name,
              aliases,
              club,
              yearFrom: yearFrom ? Number(yearFrom) : undefined,
              yearTo: yearTo ? Number(yearTo) : undefined,
              sourceId: sourceId || undefined,
              kind,
              offset: 0,
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">
              Athlete name
              <input
                className={finderInputClass}
                required
                maxLength={160}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                placeholder="Name as it appears in results"
              />
            </label>
            <label className="text-sm font-medium">
              Other racing names <span className="font-normal text-muted">(optional)</span>
              <input
                className={finderInputClass}
                maxLength={1300}
                value={aliasesText}
                onChange={(event) => setAliasesText(event.target.value)}
                placeholder="Separate up to 8 names with semicolons"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium">
              Club filter <span className="font-normal text-muted">(optional)</span>
              <input
                className={finderInputClass}
                maxLength={160}
                value={club}
                onChange={(event) => setClub(event.target.value)}
                placeholder="Leave blank to include every club"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm font-medium">
                From year
                <input
                  className={finderInputClass}
                  type="number"
                  min={1800}
                  max={2200}
                  value={yearFrom}
                  onChange={(event) => setYearFrom(event.target.value)}
                  placeholder="Any"
                />
              </label>
              <label className="text-sm font-medium">
                To year
                <input
                  className={finderInputClass}
                  type="number"
                  min={1800}
                  max={2200}
                  value={yearTo}
                  onChange={(event) => setYearTo(event.target.value)}
                  placeholder="Any"
                />
              </label>
            </div>
            <label className="text-sm font-medium">
              Source website
              <select
                className={finderInputClass}
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
              >
                <option value="">All stored sources</option>
                {initialSource &&
                  !registry.data?.sources.some((source) => source.source_id === initialSource) && (
                    <option value={initialSource}>{initialSource}</option>
                  )}
                {registry.data?.sources.map((source) => (
                  <option key={source.source_id} value={source.source_id}>
                    {source.source_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Collection
              <select
                className={finderInputClass}
                value={kind}
                onChange={(event) => setKind(event.target.value as FinderStoreKind | "all")}
              >
                <option value="all">All four collections</option>
                {Object.entries(collectionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={search.isPending}>
              <Search aria-hidden="true" className="size-4" />
              {search.isPending ? "Searching stored results…" : "Search stored results"}
            </Button>
            <p className="text-xs text-muted">
              Names suggest possible matches. Check the athlete, race and source before linking a
              result.
            </p>
          </div>
          {registry.isError && (
            <p className="text-sm text-muted">
              The source list could not load. You can still search all stored sources.
            </p>
          )}
          {validation && (
            <p role="alert" className="text-sm text-red-800">
              {validation}
            </p>
          )}
        </form>
        {submitted && (
          <section
            aria-labelledby="identity-review-heading"
            data-testid="identity-review"
            className="space-y-3 rounded-lg border border-amber-300 p-3"
            aria-live="polite"
          >
            <h3 id="identity-review-heading" className="font-semibold">
              Recorded aliases and possible profile matches
            </h3>
            <p className="text-xs text-muted">
              Initials, common short names and recorded racing names are flagged for review. Club
              history can support a match; it does not establish identity. Nothing is merged
              automatically.
            </p>
            {identityReview.isFetching && (
              <p role="status" className="text-sm">
                Checking name variants and club history…
              </p>
            )}
            {identityReview.isError && (
              <p role="alert" className="text-sm">
                Profile matching could not finish. Stored result search is separate.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => identityReview.refetch()}
                >
                  Retry profile matching
                </button>
              </p>
            )}
            {!identityReview.isFetching && !identityReview.isError && identityReview.data && (
              <>
                {identityReview.data.message && (
                  <p className="text-sm font-medium">{identityReview.data.message}</p>
                )}
                {!identityReview.data.candidates.length && !identityReview.data.message && (
                  <p className="text-sm">
                    No possible profiles were returned. This does not confirm that a new profile is
                    needed.
                  </p>
                )}
                <ul className="grid gap-3 md:grid-cols-2">
                  {identityReview.data.candidates.map((candidate) => (
                    <li
                      key={candidate.id}
                      className="min-w-0 space-y-2 rounded-lg border border-border bg-surface p-3"
                    >
                      <a
                        className="font-semibold underline"
                        href={`/admin/athlete-tools?section=review&athleteId=${candidate.id}`}
                      >
                        {candidate.name}
                      </a>
                      <div className="flex flex-wrap gap-1">
                        {candidate.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-950"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                      {candidate.weak && (
                        <p className="text-xs font-semibold">
                          Weak name match — could be a different person.
                        </p>
                      )}
                      <p className="text-xs text-muted">
                        {candidate.clubs.length
                          ? candidate.clubs
                              .map(
                                (c) =>
                                  `${c.name}${c.relationship === "historical" ? " (historical)" : " (recorded)"}`,
                              )
                              .join(" · ")
                          : "No club history recorded"}
                      </p>
                      {candidate.clubMatch && (
                        <p className="text-xs font-semibold">{candidate.clubMatch}</p>
                      )}
                      {!!candidate.aliases.length && (
                        <p className="break-words text-xs">
                          Recorded names: {candidate.aliases.join(" / ")}
                        </p>
                      )}
                      {candidate.managed && (
                        <p className="text-xs">
                          Account-managed profile — ownership needs separate review.
                        </p>
                      )}
                      <button
                        type="button"
                        className="min-h-10 text-left text-xs font-semibold underline"
                        disabled={search.isPending}
                        onClick={() => {
                          const otherNames = [
                            ...new Set([
                              submitted.q,
                              ...(submitted.aliases ?? []),
                              ...candidate.aliases,
                            ]),
                          ]
                            .filter((n) => n !== candidate.name)
                            .slice(0, 8);
                          setName(candidate.name);
                          setAliasesText(otherNames.join("; "));
                          setClub("");
                          run({
                            ...submitted,
                            q: candidate.name,
                            aliases: otherNames,
                            club: "",
                            offset: 0,
                          });
                        }}
                      >
                        Search recorded names across clubs
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
        {search.isPending && (
          <p role="status" className="text-sm">
            Searching the selected stored collections…
          </p>
        )}
        {search.isError && (
          <p role="alert" className="text-sm text-red-800">
            The search could not finish.{" "}
            {search.error instanceof Error ? search.error.message : "Try again."}
          </p>
        )}
        {results && (
          <div className="space-y-4" aria-live="polite">
            <div>
              <h3 className="font-semibold">
                {results.rows.length.toLocaleString()} stored matches on this page for{" "}
                {results.query.names.join(" / ")}
              </h3>
              <p className="mt-1 text-xs text-muted">
                The same performance can appear in more than one collection. These are source
                observations, not a count of unique races.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {results.stores.map((store) => (
                <div key={store.kind} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-semibold">{collectionLabels[store.kind]}</p>
                  <p>
                    {store.status === "searched"
                      ? `${store.returned} shown${store.hasMore ? " · more available" : ""}`
                      : "Search incomplete"}
                  </p>
                  {store.message && <p className="mt-1 text-xs text-muted">{store.message}</p>}
                </div>
              ))}
            </div>
            {!results.rows.length && (
              <p className="rounded-lg bg-elevated p-3 text-sm">
                No matching rows were returned from the available stored data. Try another racing
                name or remove filters. A saved link or an unextracted document cannot confirm that
                the athlete has no results.
              </p>
            )}
            {!!results.rows.length && (
              <div className="max-h-[36rem] overflow-auto rounded-lg border border-border">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <caption className="sr-only">
                    Possible athlete matches in stored collections
                  </caption>
                  <thead className="sticky top-0 bg-elevated">
                    <tr>
                      {["Athlete", "Race", "Recorded performance", "Source evidence", "Review"].map(
                        (label) => (
                          <th key={label} className="p-3">
                            {label}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row) => (
                      <MatchRow
                        key={row.key}
                        row={row}
                        receipt={addedRows[row.key]}
                        onAdd={() => setAddingRow(row)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {submitted && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  disabled={!submitted.offset}
                  onClick={() =>
                    run({
                      ...submitted,
                      offset: Math.max(0, (submitted.offset ?? 0) - results.pageSize),
                    })
                  }
                >
                  Previous page
                </Button>
                <span className="text-xs text-muted">
                  Up to {results.pageSize} rows per collection per page
                </span>
                <Button
                  variant="secondary"
                  disabled={!results.hasMore || results.nextOffset === null}
                  onClick={() => run({ ...submitted, offset: results.nextOffset ?? 0 })}
                >
                  Next page
                </Button>
              </div>
            )}
            {!!results.notes.length && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">
                  Search coverage and matching notes
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                  {results.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </section>
      <AthleteSourceCheck name={name} aliases={aliases} club={club} />
      <AthleteSourceCoverage
        onSelectSource={(id) => {
          setSourceId(id);
          document
            .getElementById("stored-search-heading")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </div>
  );
}
