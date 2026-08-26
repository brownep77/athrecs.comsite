import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  MessageSquareMore,
  ShieldX,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listStaffResultClaims,
  revokeAthleteOwnership,
  reviewResultClaim,
  type ResultClaimListItem,
  type ResultClaimStatus,
} from "@/lib/athrecs/result-claims-api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";

export const Route = createFileRoute("/admin/result-claims")({
  head: () => ({
    meta: [
      { title: "Result claims — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminResultClaimsPage,
});

const STATUS_LABELS: Record<ResultClaimStatus | "all", string> = {
  all: "All claims",
  pending: "Pending",
  needs_info: "Needs information",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function statusClass(status: ResultClaimStatus): string {
  if (status === "approved") return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  if (status === "pending") return "border-sky-500/30 bg-sky-50 text-sky-900";
  if (status === "needs_info") return "border-amber-500/30 bg-amber-50 text-amber-900";
  if (status === "rejected") return "border-red-500/30 bg-red-50 text-red-900";
  return "border-border bg-elevated text-muted";
}

function AdminResultClaimsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ResultClaimStatus | "all">("pending");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const claims = useQuery({
    queryKey: ["staff-result-claims", status],
    queryFn: () => listStaffResultClaims({ data: { status } }),
    refetchInterval: 30_000,
  });
  const allClaims = useQuery({
    queryKey: ["staff-result-claims", "all"],
    queryFn: () => listStaffResultClaims({ data: { status: "all" } }),
    refetchInterval: 30_000,
  });

  const review = useMutation({
    mutationFn: ({
      claimId,
      action,
    }: {
      claimId: number;
      action: "approve" | "reject" | "needs_info";
    }) =>
      reviewResultClaim({
        data: { claimId, action, staffNote: notes[claimId] ?? "" },
      }),
    onSuccess: (result) => {
      setMessage(
        `Claim ${result.claimId} updated to ${STATUS_LABELS[result.status].toLowerCase()}.`,
      );
      setNotes((current) => ({ ...current, [result.claimId]: "" }));
      void queryClient.invalidateQueries({ queryKey: ["staff-result-claims"] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const revoke = useMutation({
    mutationFn: (claimId: number) =>
      revokeAthleteOwnership({
        data: { claimId, staffNote: notes[claimId] ?? "" },
      }),
    onSuccess: (result) => {
      setMessage(`Ownership from claim ${result.claimId} was revoked.`);
      setNotes((current) => ({ ...current, [result.claimId]: "" }));
      void queryClient.invalidateQueries({ queryKey: ["staff-result-claims"] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const counts = (allClaims.data ?? []).reduce(
    (summary, claim) => {
      summary[claim.status] += 1;
      return summary;
    },
    { pending: 0, needs_info: 0, approved: 0, rejected: 0, withdrawn: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">
            Athlete verification
          </p>
          <h1 className="font-display text-2xl font-semibold text-fg md:text-3xl">
            Result claim review
          </h1>
          <p className="max-w-3xl text-sm text-muted">
            Uncontested claims are approved automatically. This queue is only for genuine ownership
            conflicts, where optional evidence links may help staff decide between claimants.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/admin">Back to admin</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Pending" value={counts.pending} tone="sky" />
        <SummaryCard label="Needs info" value={counts.needs_info} tone="amber" />
        <SummaryCard label="Approved" value={counts.approved} tone="green" />
        <SummaryCard label="Rejected" value={counts.rejected} tone="red" />
        <SummaryCard label="Withdrawn" value={counts.withdrawn} />
      </div>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-card">
        <label className="text-sm font-medium text-fg" htmlFor="claim-status-filter">
          Show
        </label>
        <select
          id="claim-status-filter"
          value={status}
          onChange={(event) => setStatus(event.target.value as ResultClaimStatus | "all")}
          className="h-11 rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" onClick={() => void claims.refetch()}>
          Refresh queue
        </Button>
        {message ? (
          <p
            className="w-full rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent"
            role="status"
          >
            {message}
          </p>
        ) : null}
      </section>

      {claims.isLoading ? (
        <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-card">
          <Loader2 className="mx-auto mb-2 size-5 animate-spin" aria-hidden="true" />
          Loading claim queue…
        </p>
      ) : claims.isError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-50 p-4 text-sm text-red-900">
          The claim queue could not be loaded. Refresh to try again.
        </p>
      ) : claims.data?.length ? (
        <div className="grid gap-4">
          {claims.data.map((claim) => (
            <ClaimReviewCard
              key={claim.claimId}
              claim={claim}
              note={notes[claim.claimId] ?? ""}
              onNote={(value) => setNotes((current) => ({ ...current, [claim.claimId]: value }))}
              onReview={(action) => review.mutate({ claimId: claim.claimId, action })}
              onRevoke={() => revoke.mutate(claim.claimId)}
              busy={
                (review.isPending && review.variables?.claimId === claim.claimId) ||
                (revoke.isPending && revoke.variables === claim.claimId)
              }
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No {status === "all" ? "result claims" : STATUS_LABELS[status].toLowerCase()} in this
          queue.
        </p>
      )}
    </div>
  );
}

function ClaimReviewCard({
  claim,
  note,
  onNote,
  onReview,
  onRevoke,
  busy,
}: {
  claim: ResultClaimListItem;
  note: string;
  onNote: (value: string) => void;
  onReview: (action: "approve" | "reject" | "needs_info") => void;
  onRevoke: () => void;
  busy: boolean;
}) {
  const reviewable = claim.status === "pending" || claim.status === "needs_info";
  const revokable = claim.status === "approved";
  const conflict =
    claim.conflictReason || claim.existingOwnerEmail || (claim.competingClaimCount ?? 0) > 0;
  const evidenceLinks = [claim.evidenceUrl, claim.evidenceUrl2, claim.evidenceUrl3].filter(
    (url): url is string => Boolean(url),
  );

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4 md:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-fg">{claim.athleteName}</h2>
            <Badge className={statusClass(claim.status)}>{STATUS_LABELS[claim.status]}</Badge>
            {conflict ? (
              <Badge className="border-red-500/30 bg-red-50 text-red-900">Conflict check</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted">
            {claim.eventName} · {formatRaceDateShort(claim.eventDate)} · {claim.distanceCode}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold tabular text-fg">
            {formatDuration(claim.finishTimeSeconds)}
          </p>
          <p className="text-xs text-subtle">
            {claim.overallPlace != null ? `Place ${claim.overallPlace}` : "Place unavailable"}
            {claim.bib ? ` · Bib ${claim.bib}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] md:p-5">
        <div className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Claim ID" value={String(claim.claimId)} />
            <Info label="Claimant email" value={claim.claimantEmail} />
            <Info label="Claim basis" value="Athlete self-confirmation" />
            <Info label="Submitted" value={new Date(claim.submittedAt).toLocaleString("en-GB")} />
          </dl>

          <div className="rounded-lg border border-border bg-elevated p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Optional evidence links
            </p>
            {evidenceLinks.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {evidenceLinks.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border bg-bg px-3 text-xs font-medium text-accent no-underline hover:underline"
                  >
                    Open evidence link {index + 1}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No evidence was supplied. Evidence is not required for an uncontested claim.
              </p>
            )}
            {claim.evidenceText ? (
              <details className="mt-3 text-sm text-muted">
                <summary className="cursor-pointer font-medium text-fg">
                  Legacy written detail
                </summary>
                <p className="mt-2 whitespace-pre-wrap">{claim.evidenceText}</p>
              </details>
            ) : null}
          </div>

          {conflict ? (
            <div className="rounded-lg border border-red-500/30 bg-red-50 p-3 text-sm text-red-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="size-4" aria-hidden="true" />
                Manual identity check required
              </div>
              {claim.conflictReason ? <p className="mt-1">{claim.conflictReason}</p> : null}
              {claim.existingOwnerEmail ? (
                <p className="mt-1">Existing owner: {claim.existingOwnerEmail}</p>
              ) : null}
              {(claim.competingClaimCount ?? 0) > 0 ? (
                <p className="mt-1">
                  {claim.competingClaimCount} competing active claim
                  {claim.competingClaimCount === 1 ? "" : "s"}.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to="/races/$slug" params={{ slug: claim.eventSlug }}>
                Event page
              </Link>
            </Button>
            {claim.sourceUrl ? (
              <Button asChild variant="secondary">
                <a href={claim.sourceUrl} target="_blank" rel="noreferrer">
                  Result source <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1.5 text-sm font-medium text-fg">
            Staff note
            <textarea
              value={note}
              onChange={(event) => onNote(event.target.value)}
              disabled={!reviewable && !revokable}
              rows={6}
              maxLength={2000}
              placeholder="Decision reason or information the athlete needs to provide…"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          {claim.staffNote ? (
            <p className="rounded-lg bg-elevated px-3 py-2 text-xs text-muted">
              Previous staff note: {claim.staffNote}
            </p>
          ) : null}
          {reviewable ? (
            <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              <Button
                type="button"
                disabled={busy || Boolean(claim.existingOwnerEmail && claim.status !== "approved")}
                onClick={() => onReview("approve")}
              >
                <UserRoundCheck className="size-4" aria-hidden="true" />
                Approve
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !note.trim()}
                onClick={() => onReview("needs_info")}
              >
                <MessageSquareMore className="size-4" aria-hidden="true" />
                Need info
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !note.trim()}
                onClick={() => onReview("reject")}
              >
                <ShieldX className="size-4" aria-hidden="true" />
                Reject
              </Button>
            </div>
          ) : revokable ? (
            <Button
              type="button"
              variant="secondary"
              disabled={busy || !note.trim()}
              onClick={onRevoke}
            >
              <ShieldX className="size-4" aria-hidden="true" />
              Revoke ownership
            </Button>
          ) : (
            <p className="rounded-lg bg-elevated px-3 py-2 text-sm text-muted">
              This claim is closed; no further staff action is available.
            </p>
          )}
          {busy ? (
            <p className="flex items-center gap-2 text-xs text-subtle">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Saving review…
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-1 break-words text-fg">{value}</dd>
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
  tone?: "default" | "sky" | "amber" | "green" | "red";
}) {
  const tones = {
    default: "border-border bg-surface",
    sky: "border-sky-500/30 bg-sky-50",
    amber: "border-amber-500/30 bg-amber-50",
    green: "border-emerald-500/30 bg-emerald-50",
    red: "border-red-500/30 bg-red-50",
  };
  return (
    <div className={`rounded-xl border p-4 shadow-card ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular text-fg">{value}</p>
    </div>
  );
}
