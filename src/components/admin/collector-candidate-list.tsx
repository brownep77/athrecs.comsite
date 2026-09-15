import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CollectorCandidateCard, type CollectorFinding } from "./collector-candidate-card";
import {
  REVIEW_BATCH_LIMIT,
  reviewGuidance,
  type BulkFindingActionInput,
} from "@/lib/race-collector/review";
import type { BulkFindingResult } from "@/lib/race-collector/bulk-actions.server";

type Choice = "keep" | "dismiss";
type Selected = {
  id: string;
  label: string;
  choice: Choice;
  publishable: boolean;
  blockingReason: string;
};
function selectedFinding(row: CollectorFinding, choice: Choice): Selected {
  return {
    id: row.id,
    label: `${row.candidate.name} · ${row.candidate.date} · ${row.candidate.distanceLabel}`,
    choice,
    publishable:
      row.status === "review" && !row.dismissed_at && !row.batch_id && !row.check.changed,
    blockingReason:
      row.publication_status === "published"
        ? "Already published to RunRecs. No further publication is needed."
        : row.dismissed_at
          ? "This candidate is dismissed. Use Keep to restore it before publication."
          : row.batch_id
            ? "Already in a publication batch. Open Publication review to check its status."
            : row.status !== "review"
              ? reviewGuidance(row).why
              : row.check.changed
                ? `The record checks have changed. ${row.check.reason}. Review the latest checks in Race information, sources and checks.`
                : "",
  };
}

export function CollectorCandidateList({
  rows,
  disabled = false,
  onDecide,
  onBulkAction,
}: {
  rows: CollectorFinding[];
  disabled?: boolean;
  onDecide: (id: string, action: Choice) => void;
  onBulkAction: (input: Omit<BulkFindingActionInput, "runId">) => Promise<BulkFindingResult>;
}) {
  const [choices, setChoices] = useState<Record<string, Selected>>({});
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const publicationHelpId = useId();
  const selected = Object.values(choices).map((item) => {
    const latest = rows.find((row) => row.id === item.id);
    return latest ? selectedFinding(latest, item.choice) : item;
  });
  const keep = selected.filter((item) => item.choice === "keep");
  const dismiss = selected.filter((item) => item.choice === "dismiss");
  const blocked = keep.filter((item) => !item.publishable);
  const readyCount = keep.length - blocked.length;
  const busy = disabled || pending;
  const forget = (ids: string[]) =>
    setChoices((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => !ids.includes(id))),
    );
  const select = (row: CollectorFinding, choice: Choice) => {
    setNotice("");
    setError("");
    setChoices((current) => {
      if (current[row.id]?.choice === choice)
        return Object.fromEntries(Object.entries(current).filter(([id]) => id !== row.id));
      if (!current[row.id] && Object.keys(current).length >= REVIEW_BATCH_LIMIT) return current;
      return { ...current, [row.id]: selectedFinding(row, choice) };
    });
  };
  const act = async (action: BulkFindingActionInput["action"]) => {
    const items = action === "dismiss" ? dismiss : keep;
    if (busy || submitting.current || !items.length || (action === "publish" && blocked.length))
      return;
    const outcome =
      action === "publish"
        ? "These races will go live on RunRecs. Confirming also confirms that you checked their dates, distances and start venues against the linked primary programmes. Duplicate and alias checks run again; if any candidate fails, nothing in this selection is published."
        : action === "keep"
          ? "These candidates will be saved to Kept, with all information retained. This does not publish them."
          : "These candidates will move to Dismissed. All information is retained and they can be kept again. Published races and publication batches stay unchanged.";
    const list = items
      .slice(0, 10)
      .map((item) => item.label)
      .join("\n");
    const more =
      items.length > 10 ? `\n…and ${items.length - 10} more shown in Selected candidates.` : "";
    if (
      !window.confirm(
        `Are you sure you want to ${action} ${items.length} selected candidates?\n\n${list}${more}\n\n${outcome}`,
      )
    )
      return;
    submitting.current = true;
    setPending(true);
    setError("");
    setNotice("");
    try {
      const result = await onBulkAction({
        action,
        ids: items.map((item) => item.id),
        confirmed: true,
        sourcesReviewed: action === "publish",
      });
      forget(items.map((item) => item.id));
      setNotice(
        action === "publish"
          ? `${result.published} candidates ${result.reused ? "already published" : "published"} to RunRecs.`
          : `${items.length} candidates ${action === "keep" ? "saved to Kept" : "dismissed"}. All information is retained.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this selection. Please retry.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };
  return (
    <div className="space-y-3">
      <div
        className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-10 space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm md:top-[calc(env(safe-area-inset-top)+4.5rem)]"
        aria-label="Bulk candidate actions"
      >
        <p className="text-sm font-medium text-fg">
          {keep.length} selected to keep · {dismiss.length} selected to dismiss
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy || !keep.length} onClick={() => void act("keep")}>
            Keep selected ({keep.length})
          </Button>
          <Button
            size="sm"
            disabled={busy || !keep.length || Boolean(blocked.length)}
            aria-describedby={publicationHelpId}
            onClick={() => void act("publish")}
          >
            Publish selected ({keep.length})
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy || !dismiss.length}
            onClick={() => void act("dismiss")}
          >
            Dismiss selected ({dismiss.length})
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy || !selected.length}
            onClick={() => setChoices({})}
          >
            Clear selection
          </Button>
        </div>
        <p className="text-sm text-fg">
          Keep saves candidates for later. Publish selected makes them live on RunRecs.
        </p>
        <p
          id={publicationHelpId}
          aria-live="polite"
          className={blocked.length ? "text-sm font-medium text-amber-800" : "text-sm text-muted"}
        >
          {busy
            ? "Please wait while your selection is updated."
            : !keep.length
              ? "To publish, click Select to keep on each race. Opening Kept does not select its races."
              : blocked.length
                ? `Publish selected is unavailable: ${readyCount} ready to publish, ${blocked.length} blocked. The races and reasons are listed below.`
                : `${readyCount} selected ${readyCount === 1 ? "race is" : "races are"} ready for your final source check. Click Publish selected, then confirm to make them live.`}
        </p>
        {blocked.length > 0 && readyCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => forget(blocked.map((item) => item.id))}
          >
            Select only ready races ({readyCount})
          </Button>
        )}
        {keep.length > 0 && (
          <p className="text-xs text-muted">
            Select up to {REVIEW_BATCH_LIMIT} candidates. Selections stay as you change pages or
            filters within this scan.
          </p>
        )}
        {selected.length > 0 && (
          <details className="text-xs text-muted">
            <summary className="cursor-pointer">Selected candidates ({selected.length})</summary>
            <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-4">
              {selected.map((item) => (
                <li key={item.id}>
                  {item.label} — {item.choice}
                  {item.choice === "keep" && !item.publishable ? " · not ready to publish" : ""}
                </li>
              ))}
            </ul>
          </details>
        )}
        {pending && (
          <p role="status" className="text-sm text-muted">
            Saving your selection…
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-emerald-700">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-amber-800">
            {error}
          </p>
        )}
      </div>
      {blocked.length > 0 && (
        <section
          aria-label="Races blocking publication"
          className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <h3 className="font-semibold">Why publication is blocked</h3>
          <p>
            Every selected race must be ready. Deselect the races below to publish the others. Their
            information and Keep decisions are retained.
          </p>
          <ul className="max-h-64 space-y-3 overflow-y-auto break-words">
            {blocked.map((item) => (
              <li key={item.id}>
                <p className="font-medium">{item.label}</p>
                <p>{item.blockingReason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {rows.map((row) => (
        <CollectorCandidateCard
          key={row.id}
          row={row}
          disabled={busy}
          selection={choices[row.id]?.choice}
          selectionFull={selected.length >= REVIEW_BATCH_LIMIT}
          onSelect={(choice) => select(row, choice)}
          onDecide={(action) => {
            forget([row.id]);
            onDecide(row.id, action);
          }}
        />
      ))}
    </div>
  );
}
