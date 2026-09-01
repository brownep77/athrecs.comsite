import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
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
import { AthleteBioCard } from "@/components/athletes/AthleteBioCard";
import { AthleteResultsSection } from "@/components/athletes/AthleteResultsSection";
import { ProfilePhotoUploader } from "@/components/athletes/ProfilePhotoUploader";
import { ShareProfileCard } from "@/components/athletes/ShareProfileCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  getMyAthleteAccount,
} from "@/lib/athrecs/athlete-account-api";
import { getMyProfileResultVisibility } from "@/lib/athrecs/athlete-profile-results-api";
import { sportIsInPublicSiteScope } from "@/lib/site-scope";

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


function MyAthleteProfilePage() {
  const { user, isPending: sessionPending } = useCurrentUserState();
  const queryClient = useQueryClient();
  const account = useQuery({
    queryKey: ["my-athlete-account"],
    queryFn: () => getMyAthleteAccount(),
    enabled: Boolean(user),
    retry: false,
  });

  const resultVisibility = useQuery({
    queryKey: ["my-profile-result-visibility"],
    queryFn: () => getMyProfileResultVisibility(),
    enabled: Boolean(user),
    retry: false,
  });
  const hiddenResultIdSet = useMemo(
    () => new Set(resultVisibility.data?.hiddenResultIds ?? []),
    [resultVisibility.data?.hiddenResultIds],
  );
  const profileResults = useMemo(() => {
    const allResults = (account.data?.claimedResults ?? []).filter((result) =>
      sportIsInPublicSiteScope(result.sport),
    );
    return {
      visible: allResults.filter((result) => !hiddenResultIdSet.has(result.resultId)),
      hidden: allResults.filter((result) => hiddenResultIdSet.has(result.resultId)),
    };
  }, [account.data?.claimedResults, hiddenResultIdSet]);

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

  if (account.isLoading || resultVisibility.isLoading)
    return <LoadingCard label="Building your private profile…" />;

  if (account.isError || !account.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="rounded-xl border border-red-500/30 bg-red-50 p-5 text-sm text-red-900">
          Your private Athlete Profile could not be loaded. Refresh the page to try again.
          {account.error instanceof Error && account.error.message ? (
            <span className="mt-2 block text-xs opacity-80">{account.error.message}</span>
          ) : null}
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
  const results = profileResults.visible;
  const hiddenResults = profileResults.hidden;
  const eventCount = new Set(results.map((result) => result.eventSlug)).size;
  const distanceCount = new Set(results.map((result) => result.distanceCode)).size;
  const primarySport =
    data.sports.find((sport) => sport.isPrimary && sportIsInPublicSiteScope(sport.sportCode)) ??
    data.sports.find((sport) => sportIsInPublicSiteScope(sport.sportCode));
  const location = [data.city, data.region, data.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-card">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-7 text-white md:px-8 md:py-9">
          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            <ProfilePhotoUploader
              displayName={profileName}
              photoUrl={data.profilePhotoUrl}
              uploadAvailable={data.profilePhotoUploadAvailable}
              onChanged={() => {
                void queryClient.invalidateQueries({ queryKey: ["my-athlete-account"] });
              }}
            />

            <div className="min-w-0">
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

              <h1 className="mt-3 truncate font-display text-3xl font-semibold md:text-5xl">
                {profileName}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
                {primarySport ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    {primarySport.sportCode}
                  </span>
                ) : null}
                {data.clubOrTeam ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    {data.clubOrTeam}
                  </span>
                ) : null}
                {location ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    {location}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                A private record of your claimed identities, performances and personal bests. Your
                photograph and ordinary athlete profile are not published publicly.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
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
        </div>
      </section>

      <section className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:-mt-10 md:px-6">
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

      <AthleteBioCard />

      <ShareProfileCard />

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

      <AthleteResultsSection results={results} hiddenResults={hiddenResults} />

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
