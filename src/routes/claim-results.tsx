import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  Loader2,
  LogIn,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  getClaimableResult,
  listMyResultClaims,
  submitResultClaim,
  withdrawResultClaim,
  type ResultClaimStatus,
  type ResultClaimVerificationMethod,
} from "@/lib/athrecs/result-claims-api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";

export const Route = createFileRoute("/claim-results")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search.resultId;
    const resultId = typeof raw === "number" ? raw : Number(raw);
    return {
      resultId: Number.isInteger(resultId) && resultId > 0 ? resultId : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Claim your race results | ATHRECS.com" },
      {
        name: "description",
        content: "Sign in to claim an ATHRECS race result and track its ownership status.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: ClaimResultsPage,
});

const METHOD_LABELS: Record<ResultClaimVerificationMethod, string> = {
  bib: "Bib number or race details",
  official_email: "Race-entry email",
  club_confirmation: "Running club confirmation",
  other: "Other evidence",
};

const STATUS_LABELS: Record<ResultClaimStatus, string> = {
  pending: "Pending review",
  needs_info: "More information needed",
  approved: "Approved",
  rejected: "Not approved",
  withdrawn: "Withdrawn",
};

function statusClass(status: ResultClaimStatus): string {
  if (status === "approved") return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  if (status === "pending") return "border-sky-500/30 bg-sky-50 text-sky-900";
  if (status === "needs_info") return "border-amber-500/30 bg-amber-50 text-amber-900";
  return "border-border bg-elevated text-muted";
}

function ClaimResultsPage() {
  const { resultId } = Route.useSearch();
  const { user, isPending: sessionPending } = useCurrentUserState();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<ResultClaimVerificationMethod>("bib");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const result = useQuery({
    queryKey: ["claimable-result", resultId],
    queryFn: () => getClaimableResult({ data: { resultId: resultId as number } }),
    enabled: resultId !== undefined,
    retry: false,
  });

  const myClaims = useQuery({
    queryKey: ["my-result-claims", user?.id],
    queryFn: () => listMyResultClaims(),
    enabled: Boolean(user),
    retry: false,
  });

  const currentClaim = myClaims.data?.find((claim) => claim.resultId === resultId);

  useEffect(() => {
    if (currentClaim?.status !== "needs_info") return;
    setMethod(currentClaim.verificationMethod);
    setEvidenceText(currentClaim.evidenceText);
    setEvidenceUrl(currentClaim.evidenceUrl ?? "");
  }, [currentClaim]);

  const submitClaim = useMutation({
    mutationFn: () =>
      submitResultClaim({
        data: {
          resultId: resultId as number,
          verificationMethod: method,
          evidenceText,
          evidenceUrl,
          declarationAccepted: declaration,
        },
      }),
    onSuccess: (response) => {
      setMessage(
        response.alreadyOwned
          ? "This athlete profile is already linked to your account."
          : response.status === "approved"
            ? "Claim approved. This athlete profile is now linked to your account."
            : "A competing claim was found. ATHRECS staff will review it before ownership changes.",
      );
      setDeclaration(false);
      void queryClient.invalidateQueries({ queryKey: ["my-result-claims"] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const withdrawClaim = useMutation({
    mutationFn: (claimId: number) => withdrawResultClaim({ data: { claimId } }),
    onSuccess: () => {
      setMessage("Claim withdrawn. You can submit it again later if needed.");
      void queryClient.invalidateQueries({ queryKey: ["my-result-claims"] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  function startSignIn() {
    setMessage(null);
    const callbackURL = `${window.location.pathname}${window.location.search}`;
    openAthleteAuth({
      mode: "signin",
      callbackURL,
      errorCallbackURL: callbackURL,
    });
  }

  const activeClaim =
    currentClaim?.status === "pending" || currentClaim?.status === "needs_info"
      ? currentClaim
      : null;

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="border-b border-border bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-6 text-white md:px-7">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Athlete ownership
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
            Claim your race results
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            A single uncontested claim is linked automatically. ATHRECS staff review is used only
            when another account claims the same athlete profile.
          </p>
        </div>
        <div className="grid gap-4 p-5 text-sm md:grid-cols-3 md:p-7">
          <ClaimStep
            number="1"
            title="Choose a result"
            detail="Open your athlete profile and select Claim this result."
          />
          <ClaimStep
            number="2"
            title="Confirm ownership"
            detail="Sign in and optionally provide a bib number or other verification detail."
          />
          <ClaimStep
            number="3"
            title="Conflict check"
            detail="A single claim is linked automatically. Two or more claimants go to staff review."
          />
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent-soft p-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">Your Athlete Account</h2>
          <p className="mt-1 text-sm text-muted">
            {user
              ? "You are signed in. Complete your private Entry Passport or continue with the claim below."
              : "Create or sign in to your secure Athlete Account before claiming. Your account and any private evidence are attached to the claim."}
          </p>
        </div>
        {sessionPending ? (
          <Loader2 className="size-5 animate-spin text-accent" aria-label="Checking account" />
        ) : user ? (
          <Button asChild variant="secondary">
            <Link to="/athlete-account">
              <UserRound className="size-4" aria-hidden="true" /> My Athlete Account
            </Link>
          </Button>
        ) : (
          <Button type="button" onClick={startSignIn}>
            <LogIn className="size-4" aria-hidden="true" />
            Sign in or create account
          </Button>
        )}
      </section>

      {!resultId ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-5 text-accent" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold text-fg">
                Choose the result first
              </h2>
              <p className="text-sm text-muted">
                Search for your athlete profile, open it and select the result you want to claim.
              </p>
              <Button asChild variant="secondary">
                <Link to="/athletes">Find my athlete profile</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : result.isLoading ? (
        <section className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-card">
          <Loader2 className="mx-auto mb-2 size-5 animate-spin" aria-hidden="true" />
          Loading result…
        </section>
      ) : result.isError || !result.data ? (
        <section className="rounded-xl border border-red-500/30 bg-red-50 p-5 text-sm text-red-900">
          This result could not be found. Return to the athlete profile and try again.
        </section>
      ) : (
        <section className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-subtle">
                Selected result
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-fg">
                {result.data.athleteName}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {result.data.eventName} · {formatRaceDateShort(result.data.eventDate)} ·{" "}
                {result.data.distanceCode}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-semibold tabular text-fg">
                {formatDuration(result.data.finishTimeSeconds)}
              </p>
              {result.data.overallPlace != null ? (
                <p className="text-xs text-subtle">Place {result.data.overallPlace}</p>
              ) : null}
            </div>
          </div>

          {sessionPending ? (
            <p className="text-sm text-muted">Checking your account…</p>
          ) : !user ? (
            <div className="space-y-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
              <div>
                <h3 className="font-semibold text-fg">Sign in before claiming</h3>
                <p className="mt-1 text-sm text-muted">
                  Use email and password, Google, or another available provider. Any evidence you
                  choose to add remains private to you and ATHRECS staff.
                </p>
              </div>
              <Button type="button" onClick={startSignIn}>
                <LogIn className="size-4" aria-hidden="true" />
                Sign in or create account
              </Button>
            </div>
          ) : activeClaim?.status === "pending" ? (
            <ClaimState
              status={activeClaim.status}
              note="Another account has claimed this athlete profile, so staff review is required before ownership changes."
            >
              <Button
                type="button"
                variant="secondary"
                disabled={withdrawClaim.isPending}
                onClick={() => withdrawClaim.mutate(activeClaim.claimId)}
              >
                Withdraw claim
              </Button>
            </ClaimState>
          ) : currentClaim?.status === "approved" ? (
            <ClaimState status="approved" note="This athlete profile is linked to your account." />
          ) : (
            <form
              className="space-y-4 border-t border-border pt-5"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage(null);
                submitClaim.mutate();
              }}
            >
              {currentClaim?.status === "needs_info" ? (
                <ClaimState
                  status="needs_info"
                  note={currentClaim.staffNote || "ATHRECS staff need another verification detail."}
                />
              ) : currentClaim?.status === "rejected" ? (
                <ClaimState
                  status="rejected"
                  note={
                    currentClaim.staffNote || "You can correct the information and submit again."
                  }
                />
              ) : null}

              <label className="block space-y-1.5 text-sm font-medium text-fg">
                How can we verify this result?
                <select
                  value={method}
                  onChange={(event) =>
                    setMethod(event.target.value as ResultClaimVerificationMethod)
                  }
                  className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {Object.entries(METHOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-fg">
                Verification detail <span className="font-normal text-subtle">(optional)</span>
                <textarea
                  value={evidenceText}
                  onChange={(event) => setEvidenceText(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="For example: bib 428, club name, entry name, or a short explanation staff can check."
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                />
                <span className="block text-xs font-normal text-subtle">
                  You may leave this blank. It can help staff if another account submits a competing
                  claim.
                </span>
                <span className="block text-xs font-normal text-subtle">
                  Do not include passwords, payment details or identity-document numbers.
                </span>
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-fg">
                Evidence link <span className="font-normal text-subtle">(optional)</span>
                <input
                  type="url"
                  inputMode="url"
                  value={evidenceUrl}
                  onChange={(event) => setEvidenceUrl(event.target.value)}
                  placeholder="https://official-results.example/…"
                  className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                />
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-border bg-elevated p-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={(event) => setDeclaration(event.target.checked)}
                  className="mt-0.5 size-4 rounded border-border"
                />
                <span>
                  I confirm this is my result and the information supplied is accurate. I understand
                  ATHRECS may review or reject competing or conflicting claims.
                </span>
              </label>

              <Button type="submit" disabled={submitClaim.isPending || !declaration}>
                {submitClaim.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileCheck2 className="size-4" aria-hidden="true" />
                )}
                {submitClaim.isPending
                  ? "Submitting…"
                  : currentClaim
                    ? "Resubmit claim"
                    : "Claim this result"}
              </Button>
            </form>
          )}

          {message ? (
            <p
              className="rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent"
              role="status"
            >
              {message}
            </p>
          ) : null}
        </section>
      )}

      {user ? <MyClaims claims={myClaims.data ?? []} loading={myClaims.isLoading} /> : null}
    </div>
  );
}

function ClaimStep({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
        {number}
      </span>
      <div>
        <p className="font-semibold text-fg">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{detail}</p>
      </div>
    </div>
  );
}

function ClaimState({
  status,
  note,
  children,
}: {
  status: ResultClaimStatus;
  note: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 rounded-lg border p-4 ${statusClass(status)}`}>
      <div className="flex items-center gap-2 font-semibold">
        {status === "approved" ? (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        ) : (
          <CircleAlert className="size-4" aria-hidden="true" />
        )}
        {STATUS_LABELS[status]}
      </div>
      <p className="text-sm">{note}</p>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

function MyClaims({
  claims,
  loading,
}: {
  claims: Awaited<ReturnType<typeof listMyResultClaims>>;
  loading: boolean;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-semibold text-fg">My claims</h2>
        <p className="mt-1 text-sm text-muted">Only you and ATHRECS staff can see this list.</p>
      </div>
      {loading ? (
        <p className="text-sm text-muted">Loading claims…</p>
      ) : claims.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-7 text-center text-sm text-muted">
          You have not submitted any result claims yet.
        </p>
      ) : (
        <div className="grid gap-2">
          {claims.map((claim) => (
            <article
              key={claim.claimId}
              className="rounded-xl border border-border bg-surface p-4 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-fg">{claim.eventName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {claim.athleteName} · {formatRaceDateShort(claim.eventDate)} ·{" "}
                    {claim.distanceCode}
                  </p>
                </div>
                <Badge className={statusClass(claim.status)}>{STATUS_LABELS[claim.status]}</Badge>
              </div>
              {claim.staffNote ? (
                <p className="mt-3 rounded-lg bg-elevated px-3 py-2 text-sm text-muted">
                  Staff: {claim.staffNote}
                </p>
              ) : null}
              <Link
                to="/athletes/$slug"
                params={{ slug: claim.athleteSlug }}
                className="mt-2 inline-flex min-h-11 items-center text-xs font-medium text-accent no-underline hover:underline"
              >
                View athlete profile <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
