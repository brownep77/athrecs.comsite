import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { getDbStatus } from "@/lib/athrecs/api";
import {
  getPendingFixtureReview,
  refreshPendingFixtureReview,
  releasePendingFixtures,
} from "@/lib/athrecs/fixture-review-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/fixture-review")({
  component: PendingFixtureReviewPage,
});

type ReviewFilter = "releasable" | "pending" | "all";

const ALL = "all";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function PendingFixtureReviewPage() {
  const queryClient = useQueryClient();
  const [reviewStatus, setReviewStatus] = useState<ReviewFilter>("releasable");
  const [sourceId, setSourceId] = useState(ALL);
  const [blockReason, setBlockReason] = useState(ALL);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("Safe historical metadata release");
  const [message, setMessage] = useState<string | null>(null);

  const dbStatus = useQuery({
    queryKey: ["admin-db-status"],
    queryFn: () => getDbStatus(),
  });
  const queue = useQuery({
    queryKey: ["fixture-review", reviewStatus, sourceId, blockReason, offset],
    queryFn: () =>
      getPendingFixtureReview({
        data: {
          reviewStatus,
          sourceId: sourceId === ALL ? undefined : sourceId,
          blockReason: blockReason === ALL ? undefined : blockReason,
          offset,
          limit: 100,
        },
      }),
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshPendingFixtureReview(),
    onSuccess: (result) => {
      setSelected(new Set());
      setOffset(0);
      setMessage(
        `Review queue refreshed: ${result.counts.staged.toLocaleString()} candidates checked, ${result.counts.blocked.toLocaleString()} held and ${result.counts.eligible.toLocaleString()} already eligible.`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const releaseMutation = useMutation({
    mutationFn: () =>
      releasePendingFixtures({
        data: {
          batchId: queue.data!.batch.id,
          candidateIds: [...selected],
          note,
        },
      }),
    onSuccess: (result) => {
      const publication = result.publication;
      setSelected(new Set());
      setMessage(
        publication
          ? `Released ${result.approved.toLocaleString()} reviewed candidates: ${publication.publishedEvents.toLocaleString()} new events and ${publication.publishedEditions.toLocaleString()} edition distances published. ${publication.duplicatesFoundDuringPublish.toLocaleString()} late duplicate${publication.duplicatesFoundDuringPublish === 1 ? " was" : "s were"} skipped.`
          : `No candidates were released. ${result.held.length.toLocaleString()} remain held after the final policy check.`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const rows = queue.data?.rows ?? [];
  const visibleReleasable = rows
    .filter((row) => row.reviewStatus === "releasable")
    .map((row) => row.id);
  const allVisibleSelected =
    visibleReleasable.length > 0 && visibleReleasable.every((id) => selected.has(id));

  function changeFilter(update: () => void) {
    update();
    setOffset(0);
    setSelected(new Set());
  }

  function toggleCandidate(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleReleasable.forEach((id) => next.delete(id));
      else visibleReleasable.forEach((id) => next.add(id));
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">
            Fixture administration
          </p>
          <h1 className="font-display text-2xl font-semibold text-fg md:text-3xl">
            Pending fixture review and release
          </h1>
          <p className="max-w-3xl text-sm text-muted">
            Review collected historical editions held by the original strict metadata policy.
            Restricted sources and missing identity facts stay blocked. Every approved release is
            rechecked against the live catalogue and written to the audit log.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to admin
          </Link>
        </Button>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">Review controls</h2>
            <p className="mt-1 text-xs text-subtle">
              Refreshing re-evaluates all 5,315 workbook candidates against current source approvals
              and the live event catalogue.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={refreshMutation.isPending || releaseMutation.isPending}
            onClick={() => refreshMutation.mutate()}
          >
            <RefreshCw
              className={`size-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {refreshMutation.isPending ? "Refreshing…" : "Refresh review queue"}
          </Button>
        </div>

        {queue.data && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Safe to review" value={queue.data.counts.releasable} tone="ready" />
            <SummaryCard label="Still blocked" value={queue.data.counts.pending} tone="held" />
            <SummaryCard label="Approved" value={queue.data.counts.approved} tone="approved" />
            <SummaryCard label="Audit actions" value={queue.data.counts.actions} />
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-3">
          <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Review status
            <select
              value={reviewStatus}
              onChange={(event) =>
                changeFilter(() => setReviewStatus(event.target.value as ReviewFilter))
              }
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="releasable">Safe to review</option>
              <option value="pending">Still blocked</option>
              <option value="all">All held candidates</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Source
            <select
              value={sourceId}
              onChange={(event) => changeFilter(() => setSourceId(event.target.value))}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value={ALL}>All sources</option>
              {(queue.data?.sources ?? []).map((source) => (
                <option key={source.source_id} value={source.source_id}>
                  {source.source_id} · {source.releasable} safe / {source.total} held
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Block reason
            <select
              value={blockReason}
              onChange={(event) => changeFilter(() => setBlockReason(event.target.value))}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value={ALL}>All reasons</option>
              {(queue.data?.reasons ?? []).map((reason) => (
                <option key={reason.reason} value={reason.reason}>
                  {reason.reason} · {reason.count}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto] lg:items-end">
          <label className="space-y-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Audit note
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <Button
            type="button"
            disabled={
              selected.size === 0 ||
              selected.size > 250 ||
              dbStatus.data?.persistent !== true ||
              releaseMutation.isPending ||
              refreshMutation.isPending
            }
            onClick={() => releaseMutation.mutate()}
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            {releaseMutation.isPending
              ? "Rechecking and releasing…"
              : `Release ${selected.size.toLocaleString()} selected`}
          </Button>
        </div>

        {dbStatus.data && !dbStatus.data.persistent && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Connect Neon before releasing fixtures so the publication and audit trail are durable.
          </p>
        )}
        {message && (
          <p className="rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent">
            {message}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">Review queue</h2>
            <p className="mt-1 text-xs text-subtle">
              {queue.data
                ? `${queue.data.counts.filtered.toLocaleString()} matching candidates · showing ${
                    queue.data.rows.length
                  } from ${offset + 1}`
                : "Refresh the queue if no staged workbook batch appears."}
            </p>
          </div>
          {visibleReleasable.length > 0 && (
            <Button type="button" size="sm" variant="secondary" onClick={toggleVisible}>
              {allVisibleSelected ? "Clear visible selection" : "Select visible safe rows"}
            </Button>
          )}
        </div>

        {queue.isLoading && <p className="text-sm text-muted">Loading review queue…</p>}
        {queue.isError && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            The review queue could not be loaded. Refresh the page or rebuild the queue.
          </p>
        )}
        {queue.data && rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            No candidates match these filters.
          </p>
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[84rem] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
                <tr>
                  <th className="w-12 px-3 py-2 font-medium">Select</th>
                  <th className="px-3 py-2 font-medium">Event</th>
                  <th className="px-3 py-2 font-medium">Edition</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Review</th>
                  <th className="px-3 py-2 font-medium">Warnings / blockers</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const releasable = row.reviewStatus === "releasable";
                  return (
                    <tr key={row.id} className="border-t border-border align-top">
                      <td className="px-3 py-3">
                        {releasable ? (
                          <input
                            type="checkbox"
                            checked={selected.has(row.id)}
                            onChange={() => toggleCandidate(row.id)}
                            aria-label={`Select ${row.eventName}`}
                            className="size-4 accent-accent"
                          />
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </td>
                      <td className="max-w-sm px-3 py-3">
                        <p className="font-medium text-fg">{row.eventName}</p>
                        <p className="mt-1 text-xs text-subtle">
                          {row.sport} · {[row.city, row.country].filter(Boolean).join(", ") || "—"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="tabular text-fg">{row.eventDate || "No date"}</p>
                        <p className="mt-1 text-xs text-subtle">
                          {row.distances.join(", ") || "No distance"}
                        </p>
                      </td>
                      <td className="max-w-xs px-3 py-3">
                        {isHttpUrl(row.sourceUrl) ? (
                          <a
                            href={row.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 break-all text-xs font-medium text-accent no-underline hover:underline"
                          >
                            {row.sourceId}
                            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-xs text-subtle">{row.sourceId}</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          className={
                            releasable
                              ? "border-emerald-500/30 bg-emerald-50 text-emerald-900"
                              : "border-amber-500/30 bg-amber-50 text-amber-900"
                          }
                        >
                          {releasable ? "Safe to review" : "Held"}
                        </Badge>
                        {row.reviewPolicy && (
                          <p className="mt-1 text-xs text-subtle">{row.reviewPolicy}</p>
                        )}
                      </td>
                      <td className="max-w-xl px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.warnings.map((warning) => (
                            <Badge key={`warning-${warning}`} variant="outline">
                              {warning}
                            </Badge>
                          ))}
                          {row.blockReasons.map((reason) => (
                            <Badge
                              key={`block-${reason}`}
                              className="border-amber-500/30 bg-amber-50 text-amber-900"
                            >
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {queue.data && queue.data.counts.filtered > queue.data.limit && (
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={offset === 0}
              onClick={() => {
                setSelected(new Set());
                setOffset(Math.max(0, offset - queue.data!.limit));
              }}
            >
              Previous
            </Button>
            <p className="text-xs text-subtle">
              {offset + 1}–{Math.min(offset + queue.data.rows.length, queue.data.counts.filtered)}{" "}
              of {queue.data.counts.filtered.toLocaleString()}
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={offset + queue.data.limit >= queue.data.counts.filtered}
              onClick={() => {
                setSelected(new Set());
                setOffset(offset + queue.data!.limit);
              }}
            >
              Next
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 text-sm shadow-card md:p-5">
        <h2 className="font-display text-lg font-semibold text-fg">What remains blocked</h2>
        <p className="mt-2 text-muted">
          Missing dates, distances or countries; critical sport or surface conflicts; cancelled or
          unverified editions; invalid provenance; catalogue duplicates; and sources that are
          disabled or absent from the approved registry. This workflow never overrides those
          protections.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "ready" | "held" | "approved";
}) {
  const classes = {
    default: "border-border bg-surface text-fg",
    ready: "border-emerald-500/30 bg-emerald-50 text-emerald-950",
    held: "border-amber-500/30 bg-amber-50 text-amber-950",
    approved: "border-sky-500/30 bg-sky-50 text-sky-950",
  }[tone];
  return (
    <div className={`rounded-xl border p-4 ${classes}`}>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular">{value.toLocaleString()}</p>
    </div>
  );
}
