import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  EyeOff,
  LayoutGrid,
  List,
  Loader2,
  Medal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import {
  hideResultFromMyProfile,
  restoreResultToMyProfile,
} from "@/lib/athrecs/athlete-profile-results-api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";

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
    mutationFn: (resultId: number) => hideResultFromMyProfile({ data: { resultId } }),
    onSuccess: async () => {
      setConfirmingResultId(null);
      setMessage("Result removed from your profile. The official record is unchanged.");
      await refreshProfileResults();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const restoreResult = useMutation({
    mutationFn: (resultId: number) => restoreResultToMyProfile({ data: { resultId } }),
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
              Fastest claimed performance
            </p>
            <h2 className="font-display text-2xl font-semibold text-fg">Personal bests</h2>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-card">
            {personalBests.map((result) => (
              <Link
                key={`${result.distanceCode}-${result.resultId}`}
                to="/races/$slug"
                params={{ slug: result.eventSlug }}
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
                </span>
                <span className="text-xs text-muted">
                  {formatRaceDateShort(result.eventDate)}
                  {result.overallPlace != null ? ` · Place ${result.overallPlace}` : ""}
                </span>
              </Link>
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
            <div className="inline-flex rounded-lg border border-border bg-surface p-1" aria-label="Result view">
              <button
                type="button"
                onClick={() => chooseView("list")}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition ${
                  viewMode === "list" ? "bg-accent text-white" : "text-muted hover:bg-elevated hover:text-fg"
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
                  viewMode === "cards" ? "bg-accent text-white" : "text-muted hover:bg-elevated hover:text-fg"
                }`}
                aria-pressed={viewMode === "cards"}
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
                Cards
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <p className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-accent" role="status">
            {message}
          </p>
        ) : null}

        {results.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Award className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-fg">
              {hiddenResults.length ? "All results are removed from this profile" : "No results have been added yet"}
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
            results={results}
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
            results={results}
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
                    {formatRaceDateShort(result.eventDate)} · {result.distanceCode} · {result.athleteName}
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
        Removing a result here only changes this private profile and its automatic bio. It never deletes the official result, claim or athlete identity from ATHRECS.
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
          <Link
            to="/races/$slug"
            params={{ slug: result.eventSlug }}
            className="block truncate text-sm font-semibold text-fg no-underline hover:text-accent hover:underline"
          >
            {result.eventName}
          </Link>
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
            <Link to="/races/$slug" params={{ slug: result.eventSlug }}>
              View
            </Link>
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
        <article key={result.resultId} className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                to="/races/$slug"
                params={{ slug: result.eventSlug }}
                className="block truncate font-semibold text-fg no-underline hover:text-accent hover:underline"
              >
                {result.eventName}
              </Link>
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
              <Link to="/races/$slug" params={{ slug: result.eventSlug }}>
                View
              </Link>
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

function findPersonalBests(results: AthleteResult[]): AthleteResult[] {
  const best = new Map<string, AthleteResult>();
  for (const result of results) {
    if (result.finishTimeSeconds == null) continue;
    const current = best.get(result.distanceCode);
    if (
      !current ||
      current.finishTimeSeconds == null ||
      result.finishTimeSeconds < current.finishTimeSeconds
    ) {
      best.set(result.distanceCode, result);
    }
  }
  return [...best.values()].sort(
    (a, b) =>
      distanceRank(a.distanceCode) - distanceRank(b.distanceCode) ||
      a.distanceCode.localeCompare(b.distanceCode),
  );
}

function distanceRank(distance: string): number {
  const normalized = distance.toLowerCase().replaceAll(" ", "");
  const known: Record<string, number> = {
    "1mile": 1,
    "5k": 2,
    "5km": 2,
    "5mile": 3,
    "10k": 4,
    "10km": 4,
    "10mile": 5,
    "halfmarathon": 6,
    "21.1k": 6,
    "21.1km": 6,
    marathon: 7,
  };
  return known[normalized] ?? 100;
}
