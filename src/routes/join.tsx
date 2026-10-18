import { MemberOnboardingForm } from "@/components/auth/MemberOnboardingForm";
import { getMyOnboarding } from "@/lib/athrecs/member-onboarding-api";
import { safeOnboardingReturnTo } from "@/lib/athrecs/member-onboarding";
import { PotentialResultMatchesPanel } from "@/components/athletes/PotentialResultMatchesPanel";
import { ProfileClaimGuide } from "@/components/athletes/ProfileClaimGuide";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  Medal,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAthleteAccount, type AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

const platforms = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  strava: "Strava",
} as const;
type Platform = keyof typeof platforms;

export const Route = createFileRoute("/join")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { from?: Platform; step?: "profile" | "edit"; returnTo?: string } => ({
    from:
      typeof search.from === "string" && Object.hasOwn(platforms, search.from)
        ? (search.from as Platform)
        : undefined,
    step: search.step === "profile" || search.step === "edit" ? search.step : undefined,
    returnTo: safeOnboardingReturnTo(search.returnTo),
  }),
  head: () => ({
    meta: siteGraphMeta({
      title: "Join ATHRECS | Every athlete has a story",
      description:
        "Create your account, claim your athlete profile and preserve your results and achievements. You choose what to share.",
      url: `${SITE_URL}/join`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/join` }],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { from, step, returnTo } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const account = useQuery({
    queryKey: ["my-athlete-account", user?.id],
    queryFn: () => getMyAthleteAccount(),
    enabled: Boolean(user),
    retry: false,
  });
  const onboarding = useQuery({
    queryKey: ["member-onboarding", user?.id],
    queryFn: () => getMyOnboarding(),
    enabled: Boolean(user),
    retry: false,
  });
  const ready = Boolean(account.data?.exists && onboarding.data && step !== "edit");
  const stage = ready ? 3 : user ? 2 : 1;
  const callbackURL = `/join?step=profile${from ? `&from=${from}` : ""}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-2 sm:py-5">
      <section className="rounded-3xl border border-border bg-elevated/50 p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Your place in sport
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Every sporting story belongs here.
          <br />
          <span className="text-accent">Start yours here.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Whether you compete, coach, run a club or bring race day to life, there’s a place for you
          here. Start with a few details and make AthRecs your own.
        </p>
        <ol aria-label="Your next steps" className="mt-6 grid gap-2 sm:grid-cols-3">
          {["Create your account", "Choose your roles & details", "Make AthRecs yours"].map(
            (label, index) => (
              <li
                key={label}
                aria-current={stage === index + 1 ? "step" : undefined}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${stage === index + 1 ? "border-accent/40 bg-accent-soft" : "border-border bg-surface"}`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-fg">
                  {index + 1}
                </span>
                {label}
              </li>
            ),
          )}
        </ol>
      </section>

      {onboarding.data ? (
        <Link to="/join" search={{ step: "edit" }} className="underline">
          Edit your details and roles
        </Link>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
        <section
          className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7"
          aria-live="polite"
        >
          {isPending || (user && (account.isLoading || onboarding.isLoading)) ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Checking your account…
            </p>
          ) : user && (account.isError || onboarding.isError) ? (
            <div role="alert">
              <p>We couldn’t load your profile. Please try again.</p>
              <Button
                className="mt-4"
                onClick={() => void Promise.all([account.refetch(), onboarding.refetch()])}
              >
                Try again
              </Button>
            </div>
          ) : ready && account.data?.emailVerified ? (
            onboarding.data?.roles.includes("athlete") ? (
              <ProfileReady account={account.data} />
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Your details are saved</h2>
                <p>Organisation and staff permissions require separate approval.</p>
                <Link to="/clubs/register" className="block underline">
                  Register a club
                </Link>
                <Link to="/athlete-account" className="block underline">
                  Manage your account
                </Link>
                <Link to="/" className="block underline">
                  Continue to AthRecs
                </Link>
              </div>
            )
          ) : user && account.data ? (
            account.data.emailVerified ? (
              <MemberOnboardingForm
                key={user.id}
                account={account.data}
                initial={onboarding.data ?? null}
                returnTo={returnTo}
              />
            ) : (
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Verify your email to continue
                </h2>
                <p className="mt-3 text-sm text-muted">
                  Use an email code to verify your account before saving your profile.
                </p>
                <Button
                  className="mt-5"
                  onClick={() => openAthleteAuth({ mode: "code", callbackURL })}
                >
                  Verify with an email code
                </Button>
              </div>
            )
          ) : (
            <div>
              <Mail className="size-7 text-accent" aria-hidden="true" />
              <h2 className="mt-3 font-display text-2xl font-semibold">
                One email. Your sporting story.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                We’ll email you a six-digit sign-in code. Then choose how you use AthRecs and
                complete your profile. No password needed.
              </p>
              <Button
                className="mt-5 w-full sm:w-auto"
                onClick={() =>
                  openAthleteAuth({ mode: "code", callbackURL, errorCallbackURL: callbackURL })
                }
              >
                Create my account with email <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <button
                type="button"
                onClick={() =>
                  openAthleteAuth({ mode: "signin", callbackURL, errorCallbackURL: callbackURL })
                }
                className="mt-3 block min-h-11 text-sm font-medium text-accent underline underline-offset-4"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </section>
        <aside className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-semibold">A home for your progress</h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3">
              <UserRound className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <span>One athlete ID across your sports.</span>
            </li>
            <li className="flex gap-3">
              <Medal className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <span>Your results, PBs and achievements.</span>
            </li>
            <li className="flex gap-3">
              <LockKeyhole className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <span>Private by default. You choose what to share.</span>
            </li>
          </ul>
          <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted">
            For every level, from first-timers to lifelong athletes. You can add result links and
            find existing performances after creating your profile.
          </p>
          <Link
            to="/athletes"
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent"
          >
            Explore athlete profiles <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}

function ProfileReady({ account }: { account: AthleteAccountData }) {
  const queryClient = useQueryClient();
  if (!account.claimedProfiles.length)
    return (
      <div className="space-y-5">
        <ProfileClaimGuide
          account={account}
          showSteps={false}
          onNameSaved={() => {
            void queryClient.invalidateQueries({ queryKey: ["my-athlete-account"] });
          }}
        />
        {account.fullName.trim() ? <PotentialResultMatchesPanel /> : null}
      </div>
    );
  return (
    <div>
      <CheckCircle2 className="size-8 text-accent" aria-hidden="true" />
      <h2 className="mt-3 font-display text-2xl font-semibold">Your profile is linked</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Review your results, add anything missing and keep your achievements together. You choose
        what to share.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/athlete-account" search={{ section: "races" }}>
            Review my results <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/my-athlete-profile">View my profile</Link>
        </Button>
      </div>
      <Link
        to="/athlete-account"
        className="mt-3 inline-flex min-h-11 items-center text-sm text-accent underline"
      >
        Add sports, photo and profile details
      </Link>
    </div>
  );
}
