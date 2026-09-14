import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectorComparison } from "@/components/admin/collector-comparison";
import { safeUrl } from "@/lib/race-collector/core";
import { reviewGuidance } from "@/lib/race-collector/review";
import type { dashboard } from "@/lib/race-collector/service.server";

type Finding = Awaited<ReturnType<typeof dashboard>>["candidates"][number];

export function CollectorCandidateCard({
  row,
  disabled = false,
  onDecide,
}: {
  row: Finding;
  disabled?: boolean;
  onDecide: (action: "keep" | "dismiss") => void;
}) {
  const c = row.candidate;
  const dismissed = Boolean(row.dismissed_at);
  const kept = !dismissed && Boolean(row.kept_at || row.status === "staged");
  const guidance = reviewGuidance(row);
  const decide = (action: "keep" | "dismiss") => {
    const outcome =
      action === "keep"
        ? "This saves the candidate to Kept. Its information and duplicate checks stay available. It does not publish a race."
        : "This moves the candidate to Dismissed. All information is saved, and you can use Keep to bring it back. Existing races and publication batches stay unchanged.";
    if (
      window.confirm(
        `Are you sure you want to ${action} this candidate?\n\n${c.name}\n${c.date} · ${c.distanceLabel}\n\n${outcome}`,
      )
    )
      onDecide(action);
  };
  return (
    <article className="min-w-0 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-semibold text-fg">{c.name}</h3>
          <p className="mt-1 text-sm text-fg">
            {c.date} · {c.distanceLabel}
          </p>
          <p className="mt-1 text-xs text-muted">
            {[c.city, c.region, c.country].filter(Boolean).join(", ")}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
          {dismissed ? "Dismissed" : kept ? "Kept" : "To decide"}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        {guidance.title}: {guidance.why}
      </p>
      <div className="mt-3 flex gap-2" aria-label="Candidate decision">
        <Button
          size="sm"
          disabled={disabled || kept}
          aria-label={`Keep ${c.name} ${c.distanceLabel} ${c.date}`}
          onClick={() => decide("keep")}
        >
          Keep
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled || dismissed}
          aria-label={`Dismiss ${c.name} ${c.distanceLabel} ${c.date}`}
          onClick={() => decide("dismiss")}
        >
          Dismiss
        </Button>
      </div>
      <details className="mt-4 text-xs leading-5 text-muted">
        <summary className="cursor-pointer font-medium text-fg">
          Race information, sources and checks
        </summary>
        <div className="mt-3 space-y-2 break-words">
          <p>
            {c.distanceKm.toFixed(3)} km · {(c.distanceKm / 1.609344).toFixed(3)} miles
          </p>
          <p>Start: {c.startTime || "Not confirmed"} · Entries: {c.entryStatus}</p>
          <p>Source type: {c.sourceKind} · Surface: {c.surface || "Not confirmed"}</p>
          {safeUrl(c.sourceUrl) && (
            <a href={c.sourceUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 underline">
              Primary programme <ArrowUpRight size={12} />
            </a>
          )}
          <p><strong>Source evidence: </strong>{c.evidence}</p>
          {safeUrl(c.entryUrl) && (
            <a href={c.entryUrl} target="_blank" rel="noreferrer"
              className="inline-block text-emerald-700 underline">Entry page</a>
          )}
          {c.notes.trim() && <p><strong>Collector notes: </strong>{c.notes}</p>}
          <p><strong>Original check: </strong>{row.reason}</p>
          <p>{guidance.next}</p>
          {row.check.changed && (
            <p className="font-medium text-amber-800">
              Latest check: {row.check.reason}. Your Keep or Dismiss decision is retained.
            </p>
          )}
          <CollectorComparison check={row.check} />
          {row.event_id && row.event_slug && (
            <a href={`https://www.runrecs.com/races/${encodeURIComponent(row.event_slug)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 underline">
              Existing event <ArrowUpRight size={12} />
            </a>
          )}
          {row.check.manualReview && (
            <p>
              Kept by reviewer: {row.check.manualReview.kept_snapshot.event.name} ·{" "}
              {row.check.manualReview.kept_snapshot.edition.distance}.{" "}
              {row.check.manualReview.reason}
            </p>
          )}
          {row.kept_at && <p>Kept by {row.kept_by || "a reviewer"} · {new Date(row.kept_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC</p>}
          {row.dismissed_at && (
            <p>Dismissed by {row.dismissed_by || "a reviewer"} · {new Date(row.dismissed_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC</p>
          )}
        </div>
      </details>
    </article>
  );
}
