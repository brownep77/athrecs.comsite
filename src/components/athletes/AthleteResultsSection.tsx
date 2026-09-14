import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ExternalLink,
  Award,
  EyeOff,
  LayoutGrid,
  List,
  Loader2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ProfileEventLink } from "./ProfileEventLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import {
  hideResultFromMyProfile,
  restoreResultToMyProfile,
} from "@/lib/athrecs/athlete-profile-results-api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";

import { findPersonalBests, timingBasis } from "@/lib/athrecs/profile-records";

type AthleteResult = AthleteAccountData["claimedResults"][number];
type ResultViewMode = "list" | "cards";

const RESULT_VIEW_PREFERENCE = "athrecs-private-profile-result-view";

export function AthleteResultsSection({
  results,
  hiddenResults,
}: {
  results: AthleteResult[];
  hiddenResults: AthleteResult[];
}) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ResultViewMode>("list");
  const [confirmingResultId, setConfirmingResultId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("All years");
  const [distance, setDistance] = useState("All distances");
  const [surface, setSurface] = useState("All surfaces");
  const [country, setCountry] = useState("All countries");
  const [page, setPage] = useState(0);
  const years = [...new Set(results.map((result) => result.eventDate.slice(0, 4)))]
    .sort()
    .reverse();
  const distances = [...new Set(results.map((result) => result.distanceCode))].sort();
  const surfaces = [...new Set(results.map((result) => result.surface))].filter(Boolean).sort();
  const countries = [...new Set(results.map((result) => result.country))].filter(Boolean).sort();
  const filtered = results.filter(
    (result) =>
      (!query ||
        `${result.eventName} ${result.athleteName}`.toLowerCase().includes(query.toLowerCase())) &&
      (year === "All years" || result.eventDate.startsWith(year)) &&
      (distance === "All distances" || result.distanceCode === distance) &&
      (surface === "All surfaces" || result.surface === surface) &&
      (country === "All countries" || result.country === country),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 30));
  const activePage = Math.min(page, pageCount - 1);
  const shown = filtered.slice(activePage * 30, (activePage + 1) * 30);
  const personalBests = useMemo(() => findPersonalBests(results), [results]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RESULT_VIEW_PREFERENCE);
      if (stored === "list" || stored === "cards") setViewMode(stored);
    } catch {
      // Local storage is an optional presentation preference only.
    }
  }, []);

  function chooseView(nextMode: ResultViewMode) {
    setViewMode(nextMode);
    try {
      window.localStorage.setItem(RESULT_VIEW_PREFERENCE, nextMode);
    } catch {
      // The compact list still works when storage is blocked.
    }
  }

  async function refreshProfileResults() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-profile-result-visibility"] }),
      queryClient.invalidateQueries({ queryKey: ["my-athlete-bio"] }),
    ]);
  }

  const hideResult = useMutation({
    mutationFn: (resultId: number) =>
      Promise.all(
        (results.find((result) => result.resultId === resultId)?.sourceResultIds ?? [resultId]).map(
          (id) => hideResultFromMyProfile({ data: { resultId: id } }),
        ),
      ),
    onSuccess: async () => {
      setConfirmingResultId(null);
      setMessage("Result removed from your profile. The official record is unchanged.");
      await refreshProfileResults();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const restoreResult = useMutation({
    mutationFn: (resultId: number) =>
      Promise.all(
        (
          hiddenResults.find((result) => result.resultId === resultId)?.sourceResultIds ?? [
            resultId,
          ]
        ).map((id) => restoreResultToMyProfile({ data: { resultId: id } })),
      ),
    onSuccess: async () => {
      setMessage("Result restored to your profile.");
      await refreshProfileResults();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const hideBusyId = hideResult.isPending ? hideResult.variables : null;
  const restoreBusyId = restoreResult.isPending ? restoreResult.variables : null;

  return (
    <div className="space-y-6">
      {personalBests.length ? (
        <section className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Fastest comparable linked performances
            </p>
            <h2 className="font-display text-2xl font-semibold text-fg">Personal bests</h2>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-card">
            {personalBests.map((result) => (
              <ProfileEventLink
                key={`${result.distanceCode}-${result.resultId}`}
                result={result}
                className="grid gap-2 px-4 py-3 no-underline transition hover:bg-elevated sm:grid-cols-[7rem_8rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <Badge variant="accent" className="w-fit">
                  {result.distanceCode}
                </Badge>
                <span className="font-semibold tabular-nums text-fg">
                  {formatDuration(result.finishTimeSeconds)}
                </span>
                <span className="min-w-0 truncate text-sm font-medium text-fg">
                  {result.eventName}
                  <span className="mt-1 block text-xs font-normal text-muted">
                    {result.sport} · {result.surface} · {timingBasis(result)}
                  </span>
                </span>
                <span className="text-xs text-muted">
                  {formatRaceDateShort(result.eventDate)}
                  {result.overallPlace != null ? ` · Place ${result.overallPlace}` : ""}
                </span>
              </ProfileEventLink>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Most recent first
            </p>
            <h2 className="font-display text-2xl font-semibold text-fg">My results</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {results.length} result{results.length === 1 ? "" : "s"}
            </Badge>
            <div
              className="inline-flex rounded-lg border border-border bg-surface p-1"
              aria-label="Result view"
            >
              <button
                type="button"
                onClick={() => chooseView("list")}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition ${
                  viewMode === "list"
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-elevated hover:text-fg"
                }`}
                aria-pressed={viewMode === "list"}
              >
                <List className="size-4" aria-hidden="true" />
                List
              </button>
              <button
                type="button"
                onClick={() => chooseView("cards")}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition ${
                  viewMode === "cards"
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-elevated hover:text-fg"
                }`}
                aria-pressed={viewMode === "cards"}
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
                Cards
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="search"
            aria-label="Search your results"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search results"
            className="h-11 min-w-0 rounded-lg border border-border bg-surface px-3 text-sm"
          />
          {[
            { label: "Year", value: year, options: ["All years", ...years], change: setYear },
            {
              label: "Distance",
              value: distance,
              options: ["All distances", ...distances],
              change: setDistance,
            },
            {
              label: "Surface",
              value: surface,
              options: ["All surfaces", ...surfaces],
              change: setSurface,
            },
            {
              label: "Country",
              value: country,
              options: ["All countries", ...countries],
              change: setCountry,
            },
          ].map((filter) => (
            <select
              key={filter.label}
              aria-label={filter.label}
              value={filter.value}
              onChange={(event) => {
                filter.change(event.target.value);
                setPage(0);
              }}
              className="h-11 min-w-0 rounded-lg border border-border bg-surface px-3 text-sm"
            >
              {filter.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))}
        </div>
        {results.some((result) => result.conflicting) ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            Some sources report different details for the same event. Those entries remain visible
            and are excluded from personal bests until checked.
          </p>
        ) : null}
        {results.length > 0 && filtered.length === 0 ? (
          <p className="rounded-xl bg-elevated p-5 text-sm">
            No results match these filters.{" "}
            <button
              type="button"
              className="font-semibold text-accent"
              onClick={() => {
                setQuery("");
                setYear("All years");
                setDistance("All distances");
                setSurface("All surfaces");
                setCountry("All countries");
                setPage(0);
              }}
            >
              Clear filters
            </button>
          </p>
        ) : null}
        {message ? (
          <p
            className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-accent"
            role="status"
          >
            {message}
          </p>
        ) : null}

        {results.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Award className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-fg">
              {hiddenResults.length
                ? "All results are removed from this profile"
                : "No results have been added yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              {hiddenResults.length
                ? "The records remain safely stored in ATHRECS. Restore any result from the section below."
                : "Find a matched result in your Athlete Account, confirm it, and it will appear here immediately."}
            </p>
            {!hiddenResults.length ? (
              <Button asChild className="mt-5">
                <Link to="/athlete-account">
                  Find my results <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </section>
        ) : viewMode === "list" ? (
          <CompactResultList
            results={shown}
            confirmingResultId={confirmingResultId}
            busyResultId={hideBusyId ?? null}
            onAskRemove={(resultId) => {
              setMessage(null);
              setConfirmingResultId(resultId);
            }}
            onCancelRemove={() => setConfirmingResultId(null)}
            onRemove={(resultId) => hideResult.mutate(resultId)}
          />
        ) : (
          <ResultCardGrid
            results={shown}
            confirmingResultId={confirmingResultId}
            busyResultId={hideBusyId ?? null}
            onAskRemove={(resultId) => {
              setMessage(null);
              setConfirmingResultId(resultId);
            }}
            onCancelRemove={() => setConfirmingResultId(null)}
            onRemove={(resultId) => hideResult.mutate(resultId)}
          />
        )}
      </section>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <Button
            variant="secondary"
            disabled={activePage === 0}
            onClick={() => setPage(activePage - 1)}
          >
            Previous
          </Button>
          <span>
            Page {activePage + 1} of {pageCount} · {filtered.length} results
          </span>
          <Button
            variant="secondary"
            disabled={activePage + 1 >= pageCount}
            onClick={() => setPage(activePage + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
      {hiddenResults.length ? (
        <details className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-fg">
            <span className="inline-flex items-center gap-2">
              <EyeOff className="size-4 text-accent" aria-hidden="true" />
              Removed from my profile
            </span>
            <Badge variant="outline">{hiddenResults.length}</Badge>
          </summary>
          <div className="divide-y divide-border border-t border-border">
            {hiddenResults.map((result) => (
              <div
                key={result.resultId}
                className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">{result.eventName}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatRaceDateShort(result.eventDate)} · {result.distanceCode} ·{" "}
                    {result.athleteName}
                  </p>
                </div>
                <p className="font-semibold tabular-nums text-fg">
                  {formatDuration(result.finishTimeSeconds)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={restoreResult.isPending}
                  onClick={() => {
                    setMessage(null);
                    restoreResult.mutate(result.resultId);
                  }}
                >
                  {restoreBusyId === result.resultId ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="size-4" aria-hidden="true" />
                  )}
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      <p className="flex items-start gap-2 text-xs leading-5 text-muted">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        Removing a result here only changes this private profile and its automatic bio. It never
        deletes the official result, claim or athlete identity from ATHRECS.
      </p>
    </div>
  );
}

function CompactResultList({
  results,
  confirmingResultId,
  busyResultId,
  onAskRemove,
  onCancelRemove,
  onRemove,
}: ResultCollectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="hidden grid-cols-[minmax(0,1fr)_8rem_7rem_auto] gap-3 border-b border-border bg-elevated px-4 py-2 text-xs font-semibold uppercase tracking-wider text-subtle md:grid">
        <span>Event</span>
        <span>Time</span>
        <span>Place</span>
        <span className="text-right">Actions</span>
      </div>
      <div className="divide-y divide-border">
        {results.map((result) => (
          <ResultRow
            key={result.resultId}
            result={result}
            confirming={confirmingResultId === result.resultId}
            busy={busyResultId === result.resultId}
            onAskRemove={onAskRemove}
            onCancelRemove={onCancelRemove}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function ResultRow({
  result,
  confirming,
  busy,
  onAskRemove,
  onCancelRemove,
  onRemove,
}: ResultItemProps) {
  return (
    <article className="px-4 py-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem_7rem_auto] md:items-center">
        <div className="min-w-0">
          <ProfileEventLink
            result={result}
            className="block truncate text-sm font-semibold text-fg no-underline hover:text-accent hover:underline"
          >
            {result.eventName}
          </ProfileEventLink>
          <p className="mt-0.5 text-xs text-muted">
            {formatRaceDateShort(result.eventDate)} · {result.distanceCode}
            {result.category ? ` · ${result.category}` : ""} · {result.athleteName}
          </p>
        </div>
        <div>
          <p className="font-semibold tabular-nums text-fg">
            {formatDuration(result.finishTimeSeconds)}
          </p>
          <p className="text-xs text-subtle md:hidden">Finish time</p>
        </div>
        <div>
          <p className="text-sm text-fg">
            {result.overallPlace != null ? result.overallPlace : "—"}
          </p>
          <p className="text-xs text-subtle md:hidden">Overall place</p>
        </div>
        <div className="flex flex-wrap justify-start gap-2 md:justify-end">
          <Button asChild size="sm" variant="secondary">
            <ProfileEventLink result={result}>View</ProfileEventLink>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            className="text-red-700 hover:text-red-800"
            onClick={() => onAskRemove(result.resultId)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
      <ResultSourceLinks result={result} />
      {confirming ? (
        <RemoveConfirmation
          result={result}
          busy={busy}
          onCancel={onCancelRemove}
          onConfirm={() => onRemove(result.resultId)}
        />
      ) : null}
    </article>
  );
}

function ResultCardGrid(props: ResultCollectionProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {props.results.map((result) => (
        <article
          key={result.resultId}
          className="rounded-xl border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <ProfileEventLink
                result={result}
                className="block truncate font-semibold text-fg no-underline hover:text-accent hover:underline"
              >
                {result.eventName}
              </ProfileEventLink>
              <p className="mt-1 text-xs text-muted">
                {formatRaceDateShort(result.eventDate)} · {result.distanceCode}
                {result.category ? ` · ${result.category}` : ""}
              </p>
              <p className="mt-2 text-xs text-subtle">{result.athleteName}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums text-fg">
                {formatDuration(result.finishTimeSeconds)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {result.overallPlace != null ? `Place ${result.overallPlace}` : "Place unavailable"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-border pt-3">
            <Button asChild size="sm" variant="secondary">
              <ProfileEventLink result={result}>View</ProfileEventLink>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={props.busyResultId === result.resultId}
              className="text-red-700 hover:text-red-800"
              onClick={() => props.onAskRemove(result.resultId)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Remove
            </Button>
          </div>
          <ResultSourceLinks result={result} />
          {props.confirmingResultId === result.resultId ? (
            <RemoveConfirmation
              result={result}
              busy={props.busyResultId === result.resultId}
              onCancel={props.onCancelRemove}
              onConfirm={() => props.onRemove(result.resultId)}
            />
          ) : null}
        </article>
      ))}
    </div>
  );
}

function RemoveConfirmation({
  result,
  busy,
  onCancel,
  onConfirm,
}: {
  result: AthleteResult;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-3 text-sm text-amber-950">
      <div>
        <p className="font-semibold">Remove {result.eventName} from your profile?</p>
        <p className="mt-0.5 text-xs">
          The official result stays in ATHRECS and can be restored later.
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" disabled={busy} onClick={onConfirm}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? "Removing…" : "Remove from profile"}
        </Button>
      </div>
    </div>
  );
}

type ResultCollectionProps = {
  results: AthleteResult[];
  confirmingResultId: number | null;
  busyResultId: number | null;
  onAskRemove: (resultId: number) => void;
  onCancelRemove: () => void;
  onRemove: (resultId: number) => void;
};

type ResultItemProps = {
  result: AthleteResult;
  confirming: boolean;
  busy: boolean;
  onAskRemove: (resultId: number) => void;
  onCancelRemove: () => void;
  onRemove: (resultId: number) => void;
};

function ResultSourceLinks({ result }: { result: AthleteResult }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <span>
        {result.sport} · {result.surface} · {timingBasis(result)}
      </span>
      {result.status !== "finished" ? <span>{result.status}</span> : null}
      {result.conflicting ? (
        <span className="font-semibold text-amber-800">Check source details</span>
      ) : null}
      {result.sourceUrls.map((url, index) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1 font-semibold text-accent"
        >
          Source{result.sourceUrls.length > 1 ? ` ${index + 1}` : ""}
          <ExternalLink className="size-3.5" />
        </a>
      ))}
    </div>
  );
}
