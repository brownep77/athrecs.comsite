import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  History,
  Loader2,
  LockKeyhole,
  LogIn,
  Search,
  ShieldCheck,
  Trophy,
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
} from "@/lib/athrecs/result-claims-api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { sportIsInPublicSiteScope } from "@/lib/site-scope";

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
        content:
          "Confirm a matched ATHRECS result and add it to your private Athlete Profile immediately.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClaimResultsPage,
});

const STATUS_LABELS: Record<ResultClaimStatus, string> = {
  pending: "Conflict review",
  needs_info: "Conflict clarification",
  approved: "Added to profile",
  rejected: "Not approved",
  withdrawn: "Withdrawn",
};

function statusClass(status: ResultClaimStatus): string {
  if (status === "approved") {
    return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  }
  if (status === "pending") return "border-sky-500/30 bg-sky-50 text-sky-900";
  if (status === "needs_info") return "border-amber-500/30 bg-amber-50 text-amber-900";
  if (status === "rejected") return "border-red-500/30 bg-red-50 text-red-900";
  return "border-border bg-elevated text-muted";
}

function ClaimResultsPage() {
  const { resultId } = Route.useSearch();
  const { user, isPending: sessionPending } = useCurrentUserState();
  const queryClient = useQueryClient();
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceUrl2, setEvidenceUrl2] = useState("");
  const [evidenceUrl3, setEvidenceUrl3] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [claimCompleted, setClaimCompleted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const result = useQuery({
    queryKey: ["claimable-result", resultId],
    queryFn: () => getClaimableResult({ data: { resultId: resultId as number } }),
    enabled: Boolean(user && resultId !== undefined),
    retry: false,
  });

  const myClaims = useQuery({
    queryKey: ["my-result-claims", user?.id],
    queryFn: () => listMyResultClaims(),
    enabled: Boolean(user),
    retry: false,
  });

  const siteClaims = (myClaims.data ?? []).filter((claim) =>
    sportIsInPublicSiteScope(claim.sport),
  );
  const currentClaim = siteClaims.find((claim) => claim.resultId === resultId);
  const hasPrivateProfile = siteClaims.some((claim) => claim.status === "approved");

  useEffect(() => {
    setClaimCompleted(false);
    setDeclaration(false);
    setMessage(null);
    setEvidenceUrl("");
    setEvidenceUrl2("");
    setEvidenceUrl3("");
  }, [resultId]);

  useEffect(() => {
    if (currentClaim?.status !== "needs_info") return;
    setEvidenceUrl(currentClaim.evidenceUrl ?? "");
    setEvidenceUrl2(currentClaim.evidenceUrl2 ?? "");
    setEvidenceUrl3(currentClaim.evidenceUrl3 ?? "");
  }, [currentClaim]);

  const submitClaim = useMutation({
    mutationFn: () =>
      submitResultClaim({
        data: {
          resultId: resultId as number,
          evidenceUrl,
          evidenceUrl2,
          evidenceUrl3,
          declarationAccepted: declaration,
        },
      }),
    onSuccess: (response) => {
      setMessage(
        response.alreadyOwned
          ? "This athlete identity is already linked to your private profile."
          : response.status === "approved"
            ? "Result added to your private Athlete Profile."
            : "Another account has claimed this athlete identity, so ATHRECS will review the conflict.",
      );
      setDeclaration(false);
      if (response.status === "approved" || response.alreadyOwned) setClaimCompleted(true);
      void queryClient.invalidateQueries({ queryKey: ["my-result-claims"] });
      void queryClient.invalidateQueries({ queryKey: ["my-athlete-account"] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const withdrawClaim = useMutation({
    mutationFn: (claimId: number) => withdrawResultClaim({ data: { claimId } }),
    onSuccess: () => {
      setMessage("Claim withdrawn. You can add this result again later.");
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
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-6 text-white md:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Private and secure
              </div>
              <h1 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                {resultId ? "Add this result to your profile" : "Claim your race results"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Confirm a matched result once and it is added immediately. Evidence is optional;
                only genuine ownership conflicts are held for review.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user && hasPrivateProfile ? (
                <Button asChild variant="secondary">
                  <Link to="/my-athlete-profile">
                    <UserRound className="size-4" aria-hidden="true" />
                    My private profile
                  </Link>
                </Button>
              ) : null}
              {user ? (
                <Button asChild variant="secondary">
                  <Link to="/athlete-account">My Athlete Account</Link>
                </Button>
              ) : sessionPending ? (
                <Loader2 className="size-5 animate-spin text-cyan-300" aria-label="Checking account" />
              ) : (
                <Button type="button" variant="secondary" onClick={startSignIn}>
                  <LogIn className="size-4" aria-hidden="true" />
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {!resultId ? (
        <section className="grid gap-5 rounded-2xl border border-border bg-surface p-5 shadow-card md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Search className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">
              Find results matched to your name
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              Open your private Athlete Account to see conservative name matches. Participant lists
              and ordinary athlete profiles are not made public.
            </p>
          </div>
          <Button asChild>
            <Link to="/athlete-account">
              Find my results <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      ) : sessionPending ? (
        <LoadingCard label="Checking your Athlete Account…" />
      ) : !user ? (
        <section className="space-y-4 rounded-2xl border border-accent/30 bg-accent-soft p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface text-accent">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">
              Sign in to view and claim this match
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              The athlete name and result are kept inside the secure claim journey.
            </p>
          </div>
          <Button type="button" onClick={startSignIn}>
            <LogIn className="size-4" aria-hidden="true" />
            Sign in or create account
          </Button>
        </section>
      ) : result.isLoading ? (
        <LoadingCard label="Loading your matched result…" />
      ) : result.isError || !result.data || !sportIsInPublicSiteScope(result.data.sport) ? (
        <section className="rounded-xl border border-red-500/30 bg-red-50 p-5 text-sm text-red-900">
          <h2 className="font-semibold">This match is no longer available</h2>
          <p className="mt-1">
            Return to your private Athlete Account and choose one of the current suggested matches.
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link to="/athlete-account">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to my matches
            </Link>
          </Button>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="border-b border-border bg-elevated p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-subtle">
                  Matched result
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-fg">
                  {result.data.eventName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {result.data.athleteName} · {formatRaceDateShort(result.data.eventDate)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="accent">{result.data.distanceCode}</Badge>
                  {result.data.category ? <Badge variant="outline">{result.data.category}</Badge> : null}
                  {result.data.bib ? <Badge variant="outline">Bib {result.data.bib}</Badge> : null}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface px-5 py-4 text-right">
                <p className="font-display text-2xl font-semibold tabular-nums text-fg">
                  {formatDuration(result.data.finishTimeSeconds)}
                </p>
                <p className="mt-1 text-xs text-subtle">
                  {result.data.overallPlace != null
                    ? `Overall place ${result.data.overallPlace}`
                    : "Place unavailable"}
                </p>
              </div>
            </div>
            <Link
              to="/races/$slug"
              params={{ slug: result.data.eventSlug }}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent no-underline hover:underline"
            >
              View event page <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-4 p-5 md:p-7">
            {activeClaim?.status === "pending" ? (
              <ClaimState
                status={activeClaim.status}
                title="This claim needs an identity check"
                note="Another account has already claimed this athlete identity. The existing owner will not be changed while ATHRECS reviews the conflict."
              >
                <Button
                  type="button"
                  variant="secondary"
                  disabled={withdrawClaim.isPending}
                  onClick={() => withdrawClaim.mutate(activeClaim.claimId)}
                >
                  {withdrawClaim.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  Withdraw claim
                </Button>
              </ClaimState>
            ) : currentClaim?.status === "approved" || claimCompleted ? (
              <ClaimState
                status="approved"
                title="Result added"
                note="This result and the linked athlete identity are now part of your private Athlete Profile."
              >
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link to="/my-athlete-profile">
                      <Trophy className="size-4" aria-hidden="true" />
                      View my private profile
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link to="/athlete-account">Find another result</Link>
                  </Button>
                </div>
              </ClaimState>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setMessage(null);
                  if (!declaration) {
                    setMessage("Tick the confirmation box to confirm this is your result.");
                    return;
                  }
                  submitClaim.mutate();
                }}
              >
                {currentClaim?.status === "needs_info" ? (
                  <ClaimState
                    status="needs_info"
                    title="A competing claim needs clarification"
                    note={
                      currentClaim.staffNote ||
                      "ATHRECS needs to resolve another account's claim to this athlete identity."
                    }
                  />
                ) : currentClaim?.status === "rejected" ? (
                  <ClaimState
                    status="rejected"
                    title="This claim was not approved"
                    note={
                      currentClaim.staffNote ||
                      "You can confirm the result again or add optional links that help distinguish the athlete identity."
                    }
                  />
                ) : null}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm text-fg">
                  <input
                    type="checkbox"
                    checked={declaration}
                    onChange={(event) => {
                      setDeclaration(event.target.checked);
                      if (event.target.checked && message?.startsWith("Tick the confirmation")) {
                        setMessage(null);
                      }
                    }}
                    className="mt-0.5 size-5 rounded border-border"
                  />
                  <span>
                    <strong className="block">This is my result</strong>
                    <span className="mt-1 block text-muted">
                      Add it to my private Athlete Profile immediately unless another account has
                      already claimed this athlete identity.
                    </span>
                  </span>
                </label>

                <details className="rounded-xl border border-border bg-elevated">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-fg">
                    Optional evidence links
                    <span className="ml-2 font-normal text-subtle">
                      Not required · add up to three
                    </span>
                  </summary>
                  <div className="grid gap-3 border-t border-border p-4 md:grid-cols-3">
                    <EvidenceLinkField
                      number={1}
                      value={evidenceUrl}
                      onChange={setEvidenceUrl}
                    />
                    <EvidenceLinkField
                      number={2}
                      value={evidenceUrl2}
                      onChange={setEvidenceUrl2}
                    />
                    <EvidenceLinkField
                      number={3}
                      value={evidenceUrl3}
                      onChange={setEvidenceUrl3}
                    />
                  </div>
                </details>

                {message ? (
                  <p
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-accent"
                    role="status"
                  >
                    {message}
                  </p>
                ) : null}

                <Button type="submit" size="lg" className="w-full" disabled={submitClaim.isPending}>
                  {submitClaim.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <FileCheck2 className="size-4" aria-hidden="true" />
                  )}
                  {submitClaim.isPending ? "Adding result…" : "Add this result to my profile"}
                </Button>

                <p className="text-center text-xs text-subtle">
                  No evidence is needed. Your ordinary athlete profile remains private.
                </p>
              </form>
            )}

            {message && (currentClaim?.status === "approved" || claimCompleted) ? (
              <p
                className="rounded-lg border border-emerald-500/30 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                role="status"
              >
                {message}
              </p>
            ) : null}
          </div>
        </section>
      )}

      {user ? (
        <ClaimHistory
          claims={siteClaims}
          loading={myClaims.isLoading}
          compact={Boolean(resultId)}
        />
      ) : null}
    </div>
  );
}

function EvidenceLinkField({
  number,
  value,
  onChange,
}: {
  number: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-fg">
      Link {number}
      <input
        type="url"
        inputMode="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://official-results.example/…"
        className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-card">
      <Loader2 className="mx-auto mb-2 size-5 animate-spin" aria-hidden="true" />
      {label}
    </section>
  );
}

function ClaimState({
  status,
  title,
  note,
  children,
}: {
  status: ResultClaimStatus;
  title: string;
  note: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`space-y-3 rounded-xl border p-4 ${statusClass(status)}`}>
      <div className="flex items-center gap-2 font-semibold">
        {status === "approved" ? (
          <CheckCircle2 className="size-5" aria-hidden="true" />
        ) : (
          <CircleAlert className="size-5" aria-hidden="true" />
        )}
        {title}
      </div>
      <p className="text-sm">{note}</p>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

function ClaimHistory({
  claims,
  loading,
  compact,
}: {
  claims: Awaited<ReturnType<typeof listMyResultClaims>>;
  loading: boolean;
  compact: boolean;
}) {
  if (loading) return <LoadingCard label="Loading your claim history…" />;

  return (
    <details
      open={!compact}
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
          <History className="size-5 text-accent" aria-hidden="true" />
          Claim history
        </span>
        <Badge variant="outline">{claims.length}</Badge>
      </summary>
      <div className="border-t border-border p-4 md:p-5">
        {claims.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-7 text-center text-sm text-muted">
            You have not claimed any results yet.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {claims.map((claim) => (
              <article key={claim.claimId} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{claim.eventName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatRaceDateShort(claim.eventDate)} · {claim.distanceCode}
                    </p>
                  </div>
                  <Badge className={statusClass(claim.status)}>{STATUS_LABELS[claim.status]}</Badge>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-semibold tabular-nums text-fg">
                      {formatDuration(claim.finishTimeSeconds)}
                    </p>
                    <p className="mt-1 text-xs text-subtle">{claim.athleteName}</p>
                  </div>
                  {claim.status === "approved" ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/my-athlete-profile">View in profile</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/claim-results" search={{ resultId: claim.resultId }}>
                        Open claim
                      </Link>
                    </Button>
                  )}
                </div>
                {claim.staffNote ? (
                  <p className="mt-3 rounded-lg bg-elevated px-3 py-2 text-xs text-muted">
                    {claim.staffNote}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
