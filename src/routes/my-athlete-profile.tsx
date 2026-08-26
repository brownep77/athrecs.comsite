import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  LogIn,
  Medal,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  getMyAthleteAccount,
  type AthleteAccountData,
} from "@/lib/athrecs/athlete-account-api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";

export const Route = createFileRoute("/my-athlete-profile")({
  head: () => ({
    meta: [
      { title: "My private Athlete Profile | ATHRECS.com" },
      {
        name: "description",
        content: "View your private claimed results and personal bests on ATHRECS.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: MyAthleteProfilePage,
});

type ClaimedResult = AthleteAccountData["claimedResults"][number];

function MyAthleteProfilePage() {
  const { user, isPending: sessionPending } = useCurrentUserState();
  const account = useQuery({
    queryKey: ["my-athlete-account"],
    queryFn: () => getMyAthleteAccount(),
    enabled: Boolean(user),
    retry: false,
  });

  const personalBests = useMemo(
    () => findPersonalBests(account.data?.claimedResults ?? []),
    [account.data?.claimedResults],
  );

  function startSignIn() {
    openAthleteAuth({
      mode: "signin",
      callbackURL: "/my-athlete-profile",
      errorCallbackURL: "/my-athlete-profile",
    });
  }

  if (sessionPending) return <LoadingCard label="Checking your private profile…" />;

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <ProfileHero />
        <section className="rounded-2xl border border-border bg-surface p-7 text-center shadow-card">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-fg">
            Sign in to view your profile
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Ordinary athlete profiles and claimed results are private. Sign in with the account
            that claimed the results.
          </p>
          <Button className="mt-5" type="button" onClick={startSignIn}>
            <LogIn className="size-4" aria-hidden="true" />
            Sign in or create account
          </Button>
        </section>
      </div>
    );
  }

  if (account.isLoading) return <LoadingCard label="Building your private profile…" />;

  if (account.isError || !account.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="rounded-xl border border-red-500/30 bg-red-50 p-5 text-sm text-red-900">
          Your private Athlete Profile could not be loaded. Refresh the page to try again.
        </section>
        <Button asChild variant="secondary">
          <Link to="/athlete-account">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Athlete Account
          </Link>
        </Button>
      </div>
    );
  }

  const data = account.data;
  const profileName = data.displayName || data.fullName || data.authName || "My Athlete Profile";
  const results = data.claimedResults;
  const recentResults = results.slice(0, 12);
  const olderResults = results.slice(12);
  const eventCount = new Set(results.map((result) => result.eventSlug)).size;
  const distanceCount = new Set(results.map((result) => result.distanceCode)).size;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-7 text-white md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                  <LockKeyhole className="mr-1 size-3.5" aria-hidden="true" />
                  Private profile
                </Badge>
                {data.claimedProfiles.length ? (
                  <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                    <CheckCircle2 className="mr-1 size-3.5" aria-hidden="true" />
                    Results claimed
                  </Badge>
                ) : null}
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
                {profileName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Your claimed identities, results and personal bests in one clean private view.
                Ordinary athlete profiles are not visible to the public.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to="/claim-results" search={{ resultId: undefined }}>
                  Claim another result
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/athlete-account">
                  <UserRound className="size-4" aria-hidden="true" />
                  Edit Athlete Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Claimed results"
          value={results.length}
          detail="Results linked to you"
        />
        <StatCard
          icon={UserRound}
          label="Linked identities"
          value={data.claimedProfiles.length}
          detail="Private athlete records"
        />
        <StatCard
          icon={CalendarDays}
          label="Events"
          value={eventCount}
          detail="Distinct race series"
        />
        <StatCard
          icon={Medal}
          label="Distances"
          value={distanceCount}
          detail="Distances represented"
        />
      </section>

      {data.claimedProfiles.length ? (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-fg">Linked athlete identities</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            These records are joined inside your account but remain hidden from public athlete
            search and public profile pages.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.claimedProfiles.map((profile) => (
              <Badge key={profile.athleteId} className="border-accent/30 bg-accent-soft text-fg">
                <CheckCircle2 className="mr-1 size-3.5" aria-hidden="true" />
                {profile.athleteName}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {results.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Award className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-fg">
            No results have been added yet
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Find a matched result in your Athlete Account, confirm it, and it will appear here
            immediately.
          </p>
          <Button asChild className="mt-5">
            <Link to="/athlete-account">
              Find my results <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      ) : (
        <>
          {personalBests.length ? (
            <section className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-subtle">
                  Fastest claimed performance
                </p>
                <h2 className="font-display text-2xl font-semibold text-fg">Personal bests</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {personalBests.map((result) => (
                  <Link
                    key={`${result.distanceCode}-${result.resultId}`}
                    to="/races/$slug"
                    params={{ slug: result.eventSlug }}
                    className="rounded-2xl border border-border bg-surface p-5 no-underline shadow-card transition hover:border-accent"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Badge variant="accent">{result.distanceCode}</Badge>
                      <Medal className="size-5 text-accent" aria-hidden="true" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-semibold tabular-nums text-fg">
                      {formatDuration(result.finishTimeSeconds)}
                    </p>
                    <p className="mt-2 font-medium text-fg">{result.eventName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatRaceDateShort(result.eventDate)}
                      {result.overallPlace != null ? ` · Place ${result.overallPlace}` : ""}
                    </p>
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
              <Badge variant="outline">
                {results.length} result{results.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {recentResults.map((result) => (
                <ResultCard key={result.resultId} result={result} />
              ))}
            </div>

            {olderResults.length ? (
              <details className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-fg">
                  Show {olderResults.length} older result{olderResults.length === 1 ? "" : "s"}
                </summary>
                <div className="grid gap-3 border-t border-border p-4 md:grid-cols-2 md:p-5">
                  {olderResults.map((result) => (
                    <ResultCard key={result.resultId} result={result} />
                  ))}
                </div>
              </details>
            ) : null}
          </section>
        </>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-4 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <LockKeyhole className="size-4 text-accent" aria-hidden="true" />
          Only you and authorised ATHRECS staff can view this profile.
        </span>
        <Button asChild variant="secondary" size="sm">
          <Link to="/athlete-account">Manage privacy and account details</Link>
        </Button>
      </section>
    </div>
  );
}

function ProfileHero() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-7 text-white md:px-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
          <LockKeyhole className="size-4" aria-hidden="true" />
          My ATHRECS
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold">Private Athlete Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          A clean, signed-in view of your claimed athlete identities, results and personal bests.
        </p>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Trophy;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
        <Icon className="size-5 text-accent" aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </article>
  );
}

function ResultCard({ result }: { result: ClaimedResult }) {
  return (
    <Link
      to="/races/$slug"
      params={{ slug: result.eventSlug }}
      className="rounded-xl border border-border bg-surface p-4 no-underline transition hover:border-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-fg">{result.eventName}</p>
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
    </Link>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-card">
        <Loader2 className="mx-auto mb-2 size-5 animate-spin" aria-hidden="true" />
        {label}
      </section>
    </div>
  );
}

function findPersonalBests(results: ClaimedResult[]): ClaimedResult[] {
  const best = new Map<string, ClaimedResult>();
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
