import { ClaimIdentityGate } from "./ClaimIdentityGate";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitResultClaim, type ResultClaimListItem } from "@/lib/athrecs/result-claims-api";
import type { ProfileResultReview } from "@/lib/athrecs/profile-result-review";
import { resultIssues, type DraftResult } from "@/lib/athlete-workspace/core";
import { formatDuration } from "@/lib/athrecs/format";
import { distanceResultStyle } from "@/lib/athrecs/profile-colours";
import { ResultRaceHeading } from "./ResultRaceHeading";

const emptyResult = (): DraftResult => ({
  index: 1,
  race: "",
  date: "",
  distance: "",
  time: "",
  timingBasis: "unspecified",
  sourceUrl: "",
  bib: "",
  place: "",
});
export function ProfileResultConfirmation(
  props: Parameters<typeof ProfileResultConfirmationBody>[0],
) {
  return (
    <ClaimIdentityGate>
      <ProfileResultConfirmationBody {...props} />
    </ClaimIdentityGate>
  );
}
function ProfileResultConfirmationBody({
  resultId,
  invitation,
  athleteName,
  review,
  claim,
  onReload,
  onDecline,
}: {
  resultId: number;
  invitation?: string;
  athleteName: string;
  review: ProfileResultReview;
  claim?: ResultClaimListItem;
  onReload: () => void;
  onDecline?: () => void;
}) {
  const client = useQueryClient();
  const [included, setIncluded] = useState(
    () => new Set(review.rows.filter((row) => !row.excluded).map((row) => row.key)),
  );
  const [additions, setAdditions] = useState<DraftResult[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyResult);
  const [draftError, setDraftError] = useState("");
  const [evidence, setEvidence] = useState(claim?.evidenceUrl ?? "");
  const [requestId] = useState(() => crypto.randomUUID());
  const [limit, setLimit] = useState(50);
  const [query, setQuery] = useState("");
  const [guardian, setGuardian] = useState(claim?.claimantRole === "guardian");
  const submit = useMutation({
    mutationFn: () =>
      submitResultClaim({
        data: {
          resultId,
          invitation: claim ? undefined : invitation,
          declarationAccepted: true,
          claimantRole: guardian ? "guardian" : "athlete",
          evidenceUrl: evidence,
          evidenceUrl2: claim?.evidenceUrl2 ?? undefined,
          evidenceUrl3: claim?.evidenceUrl3 ?? undefined,
          review: { requestId, snapshot: review.snapshot, includedKeys: [...included], additions },
        },
      }),
    onSuccess: async () => {
      await Promise.all(
        [
          "my-athlete-account",
          "my-result-claims",
          "my-open-claim-invitations",
          "my-profile-result-visibility",
          "my-potential-result-matches",
          "my-athlete-bio",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
    },
  });
  const toggle = (key: string) =>
    setIncluded((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const filtered = review.rows.filter((row) =>
    `${row.race} ${row.date} ${row.distance}`.toLowerCase().includes(query.toLowerCase()),
  );
  const removed = review.rows.length - included.size;
  const buttonLabel =
    removed === 0 && !additions.length
      ? "Confirm all results are mine"
      : `Confirm my ${included.size + additions.length} selected results`;
  if (submit.isSuccess)
    return (
      <section
        role="status"
        className="space-y-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-950"
      >
        <CheckCircle2 className="size-8" aria-hidden="true" />
        <h2 className="text-2xl font-semibold">
          {submit.data.status === "approved"
            ? "Claim complete"
            : "Profile and results confirmation saved"}
        </h2>
        <p>
          {submit.data.confirmation?.included} existing results confirmed ·{" "}
          {submit.data.confirmation?.excluded} removed · {submit.data.confirmation?.added} missing
          results submitted for review.
        </p>
        <p>
          {submit.data.status === "approved"
            ? "Your profile is linked to your account. Your confirmation is separate from independent result verification and photo or ID checks."
            : "Your profile claim is awaiting an ownership check. You do not need to claim each result separately."}{" "}
          You’ll receive one summary email for this confirmation.
        </p>
        {submit.data.status === "approved" ? (
          <p>
            Your automatic biography, achievements and medals now reflect your saved results. Awards
            and PBs follow the existing result checks. Your own biography stays unchanged.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/my-athlete-profile">View my private profile</Link>
          </Button>
          <Button variant="secondary" onClick={onReload}>
            Review results again
          </Button>
          <Button asChild variant="secondary">
            <Link to="/athlete-account" search={{ section: "potential" }}>
              Find more of my results
            </Link>
          </Button>
        </div>
      </section>
    );
  return (
    <section
      id="confirm-profile-claim"
      aria-label="Review and confirm your profile results"
      className="scroll-mt-24 space-y-5 rounded-2xl border border-accent/40 bg-surface p-5 shadow-card md:p-7"
    >
      <div>
        <p className="text-sm font-semibold text-accent">
          Claim your profile · Review once · Confirm once
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Are these your results, {athleteName}?</h2>
        <p className="mt-2 text-sm text-muted">
          Registration creates your account. You must also claim your athlete profile to manage its
          results. Review the list, remove anything that is not yours and add any missing results
          before confirming. Straightforward, uncontested matches link immediately without waiting
          for staff approval. We notify the team afterwards. Staff check conflicts, discrepancies,
          protected profiles and child or guardian claims.
        </p>
        {claim?.status === "approved" ? (
          <p role="status" className="mt-2 font-semibold text-emerald-800">
            Claim complete — your profile is linked. You can review your result selection below.
          </p>
        ) : null}
        {review.lastConfirmedAt ? (
          <p className="mt-2 text-sm">
            Previous review saved {new Date(review.lastConfirmedAt).toLocaleDateString("en-GB")}.
            New results need a new confirmation.
          </p>
        ) : null}
        {claim?.status === "pending" ? (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
            Your earlier claim is saved. Confirm the reviewed selection below to complete an
            eligible claim. Claims with a review flag stay with staff.
          </p>
        ) : null}
        {claim?.staffNote ? (
          <p role="status" className="mt-2 text-sm">
            Staff note: {claim.staffNote}
          </p>
        ) : null}
        {claim?.conflictReason ? (
          <p className="mt-2 text-sm text-amber-800">{claim.conflictReason}</p>
        ) : null}
      </div>
      <fieldset disabled={submit.isPending} className="space-y-5">
        <legend className="sr-only">Choose the results that belong to you</legend>
        {onDecline ? (
          <Button variant="secondary" onClick={onDecline}>
            Not my profile
          </Button>
        ) : null}
        <div className="rounded-xl border border-accent/30 bg-accent-soft p-4">
          <p className="font-semibold">
            {included.size} selected · {removed} removed · {additions.length} to add
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={guardian}
              onChange={(event) => setGuardian(event.target.checked)}
              className="mt-1"
            />
            I am claiming for a child as their parent or guardian. Staff will check my authority and
            consent privately.
          </label>
          <p className="mt-3 text-sm">
            {guardian
              ? "By pressing confirm, I declare that I am authorised to claim this child's profile and selected results."
              : "By pressing confirm, I declare that this is my athlete profile and the selected results are mine."}{" "}
            One summary email covers this confirmation. This does not verify timing, source evidence
            or identity documents.
          </p>
          <Button
            className="mt-3 h-auto min-h-12 w-full whitespace-normal py-3"
            disabled={adding || (!included.size && !additions.length)}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? "Saving your confirmation…" : buttonLabel}
          </Button>
          {adding ? (
            <p className="mt-2 text-sm">
              Add or cancel the open result before confirming. Straightforward, uncontested matches
              link immediately; staff check conflicts, discrepancies, protected profiles and child
              or guardian claims.
            </p>
          ) : null}
          {!included.size && !additions.length ? (
            <p className="mt-2 text-sm">
              If none of these results are yours,{" "}
              <Link to="/athlete-account" search={{ section: "potential" }} className="underline">
                choose a different profile
              </Link>
              .
            </p>
          ) : null}
        </div>
        {submit.isError ? (
          <div role="alert" className="space-y-2 rounded-lg border border-red-300 p-3 text-red-800">
            <p>
              {submit.error instanceof Error
                ? submit.error.message
                : "Your confirmation could not be saved."}
            </p>
            <Button variant="secondary" onClick={onReload}>
              Reload results
            </Button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => setIncluded(new Set(review.rows.map((row) => row.key)))}
          >
            Select all {review.rows.length} results
          </Button>
          {query.trim() ? (
            <Button
              variant="secondary"
              onClick={() =>
                setIncluded((previous) => new Set([...previous, ...filtered.map((row) => row.key)]))
              }
            >
              Select all {filtered.length} matching results
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => setIncluded(new Set())}>
            Clear selection
          </Button>
          <Button
            variant="secondary"
            disabled={adding || additions.length >= 250}
            onClick={() => setAdding(true)}
          >
            <Plus className="size-4" />
            Add a missing result
          </Button>
        </div>
        {adding ? (
          <form
            className="space-y-3 rounded-xl border border-border p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const issues = resultIssues(draft);
              if (issues.length) {
                setDraftError(issues.join(". "));
                return;
              }
              setAdditions((previous) => [...previous, { ...draft, index: previous.length + 1 }]);
              setAdding(false);
              setDraft(emptyResult());
              setDraftError("");
            }}
          >
            <h3 className="font-semibold">Add a missing result</h3>
            <p className="text-sm text-muted">
              It joins this confirmation and goes to our team for checking. Enter the facts shown in
              the result; leave optional fields empty when unknown.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["race", "Race name", "text"],
                  ["date", "Race date", "date"],
                  ["distance", "Distance (e.g. 10K)", "text"],
                  ["time", "Finish time (HH:MM:SS or MM:SS)", "text"],
                  ["sourceUrl", "Results page link", "url"],
                  ["bib", "Bib (optional)", "text"],
                  ["place", "Overall place (optional)", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className="space-y-1 text-sm">
                  <span className="block">{label}</span>
                  <input
                    required={!["bib", "place"].includes(key)}
                    type={type}
                    value={draft[key]}
                    maxLength={key === "sourceUrl" ? 2000 : 200}
                    onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                    className="h-11 w-full rounded-lg border border-border bg-bg px-3"
                  />
                </label>
              ))}
              <label className="space-y-1 text-sm">
                <span className="block">Time type</span>
                <select
                  aria-label="Time type"
                  value={draft.timingBasis}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      timingBasis: event.target.value as DraftResult["timingBasis"],
                    })
                  }
                  className="h-11 w-full rounded-lg border border-border bg-bg px-3"
                >
                  <option value="unspecified">Unknown</option>
                  <option value="chip">Chip time</option>
                  <option value="gun">Gun time</option>
                </select>
              </label>
            </div>
            {draftError ? (
              <p role="alert" className="text-sm text-red-700">
                {draftError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button type="submit">Add to my confirmation</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAdding(false);
                  setDraft(emptyResult());
                  setDraftError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
        {additions.length ? (
          <ul className="space-y-2" aria-label="Missing results to submit">
            {additions.map((row, index) => (
              <li
                key={index}
                className="distance-result flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                style={distanceResultStyle(row.distance)}
              >
                <div className="min-w-0 flex-1">
                  <ResultRaceHeading
                    race={row.race}
                    distance={row.distance}
                    date={row.date}
                    performance={row.time}
                  />
                  <p className="text-sm">Added for review</p>
                </div>
                <Button
                  variant="secondary"
                  aria-label={`Remove added result ${row.race}`}
                  onClick={() =>
                    setAdditions((previous) =>
                      previous
                        .filter((_, i) => i !== index)
                        .map((r, i) => ({ ...r, index: i + 1 })),
                    )
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <label className="block space-y-1 text-sm">
          <span>Search this result list</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(50);
            }}
            className="h-11 w-full rounded-lg border border-border bg-bg px-3"
            placeholder="Race, date or distance"
          />
        </label>
        <p className="text-sm text-muted">
          Showing {Math.min(limit, filtered.length)} of {filtered.length} matching results.
          Confirmation includes your selection across the whole list, including results outside this
          view. Removal is reversible and keeps the original race record.
        </p>
        <ul className="space-y-3" aria-label="Stored results to confirm">
          {filtered.slice(0, limit).map((row) => (
            <li
              key={row.key}
              className="distance-result flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              style={distanceResultStyle(row.distance)}
            >
              <input
                type="checkbox"
                checked={included.has(row.key)}
                onChange={() => toggle(row.key)}
                aria-label={`Select ${row.race || "Recorded performance"} ${row.date}`}
                className="size-5 shrink-0 accent-primary"
              />
              <div className="min-w-0 flex-1">
                <ResultRaceHeading
                  race={row.race}
                  distance={row.distance}
                  date={row.date}
                  performance={row.performance || row.status}
                />
                {row.alternatePerformances?.length ? (
                  <p className="text-xs text-muted">
                    Also recorded as: {row.alternatePerformances.join(" · ")}
                  </p>
                ) : null}
                <p className="text-xs text-muted">
                  {row.chip !== null ? `Chip ${formatDuration(row.chip)} · ` : ""}
                  {row.gun !== null
                    ? `Gun ${formatDuration(row.gun)}`
                    : row.chip === null
                      ? "Time type as recorded; not inferred"
                      : ""}
                </p>
                <p className="text-xs text-muted">
                  {[
                    row.club ? `Recorded club: ${row.club}` : null,
                    row.bib ? `Bib ${row.bib}` : null,
                    row.category,
                    row.age ? `Age at race: ${row.age}` : null,
                    row.place ? `Overall place ${row.place}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {included.has(row.key) ? "Selected" : "Removed from selection"}
                </p>
              </div>
              <Button
                variant="secondary"
                aria-label={`${included.has(row.key) ? "Remove" : "Restore"} ${row.race} ${row.date}`}
                onClick={() => toggle(row.key)}
              >
                {included.has(row.key) ? (
                  <X className="size-4" aria-hidden="true" />
                ) : (
                  <RotateCcw className="size-4" aria-hidden="true" />
                )}
                {included.has(row.key) ? "Remove" : "Restore"}
              </Button>
            </li>
          ))}
        </ul>
        {filtered.length > limit ? (
          <Button variant="secondary" onClick={() => setLimit((n) => n + 50)}>
            Show 50 more
          </Button>
        ) : null}
        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-sm font-semibold">
            Optional evidence link for your profile claim
          </summary>
          <label className="mt-2 block text-sm">
            Private supporting link
            <input
              type="url"
              value={evidence}
              onChange={(event) => setEvidence(event.target.value)}
              maxLength={2000}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-bg px-3"
              placeholder="https://"
            />
          </label>
        </details>
        <p className="text-xs text-muted">
          Your declaration confirms which results you recognise. It does not change chip or gun
          times, source verification, identity checks or profile sharing settings.
        </p>
      </fieldset>
    </section>
  );
}
