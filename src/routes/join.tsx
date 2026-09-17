import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Loader2,
  LockKeyhole,
  Mail,
  Medal,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  ATHLETE_SPORTS,
  getMyAthleteAccount,
  saveMyAthleteAccount,
  type AthleteAccountData,
  type AthleteSportCode,
} from "@/lib/athrecs/athlete-account-api";
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
  validateSearch: (search: Record<string, unknown>): { from?: Platform; step?: "profile" } => ({
    from:
      typeof search.from === "string" && Object.hasOwn(platforms, search.from)
        ? (search.from as Platform)
        : undefined,
    step: search.step === "profile" ? "profile" : undefined,
  }),
  head: () => ({
    meta: siteGraphMeta({
      title: "Join ATHRECS | Every athlete has a story",
      description:
        "Follow ATHRECS, create your athlete profile and bring your sports, results and achievements together. Your profile starts private.",
      url: `${SITE_URL}/join`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/join` }],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { from, step } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const account = useQuery({
    queryKey: ["my-athlete-account", user?.id],
    queryFn: () => getMyAthleteAccount(),
    enabled: Boolean(user),
    retry: false,
  });
  const ready = Boolean(account.data?.exists);
  const stage = ready ? 3 : user || step === "profile" ? 2 : 1;
  const callbackURL = `/join?step=profile${from ? `&from=${from}` : ""}`;

  function continueToAccount() {
    void navigate({ to: "/join", search: { from, step: "profile" }, resetScroll: false });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-2 sm:py-5">
      <section className="rounded-3xl border border-border bg-elevated/50 p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          For the athlete in you
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Every athlete has a story.
          <br />
          <span className="text-accent">Start yours here.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Your first 5K, your fastest marathon, your next sport. Bring your results, personal bests
          and achievements together in one athlete profile.
        </p>
        <ol aria-label="Your next steps" className="mt-6 grid gap-2 sm:grid-cols-3">
          {["Follow ATHRECS", "Create your profile", "Make it yours"].map((label, index) => (
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
          ))}
        </ol>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
        <section
          className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7"
          aria-live="polite"
        >
          {isPending || (user && account.isLoading) ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Checking your account…
            </p>
          ) : user && account.isError ? (
            <div role="alert">
              <p>We couldn’t load your profile. Please try again.</p>
              <Button className="mt-4" onClick={() => void account.refetch()}>
                Try again
              </Button>
            </div>
          ) : ready ? (
            <ProfileReady />
          ) : user && account.data ? (
            account.data.emailVerified ? (
              <QuickProfileForm key={user.id} account={account.data} />
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
          ) : stage === 1 ? (
            <div>
              <Heart className="size-7 text-accent" aria-hidden="true" />
              <h2 className="mt-3 font-display text-2xl font-semibold">
                Follow along{from ? ` on ${platforms[from]}` : ""}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Follow the ATHRECS account on the post or social profile that brought you here for
                athlete stories, achievements and updates. Then come back to create your own
                profile.
              </p>
              <Button className="mt-5 w-full sm:w-auto" onClick={continueToAccount}>
                I’m following — continue <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <button
                type="button"
                onClick={continueToAccount}
                className="mt-3 block min-h-11 text-sm font-medium text-muted underline underline-offset-4"
              >
                Skip for now and create my profile
              </button>
              <p className="mt-2 text-xs text-subtle">
                Already following? Continue above. Following is optional.
              </p>
            </div>
          ) : (
            <div>
              <Mail className="size-7 text-accent" aria-hidden="true" />
              <h2 className="mt-3 font-display text-2xl font-semibold">
                One email. Your sporting story.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                We’ll email you a six-digit sign-in code. Then add your name and sport to start your
                private profile. No password needed.
              </p>
              <Button
                className="mt-5 w-full sm:w-auto"
                onClick={() =>
                  openAthleteAuth({ mode: "code", callbackURL, errorCallbackURL: callbackURL })
                }
              >
                Create my profile with email <ArrowRight className="size-4" aria-hidden="true" />
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
              <span>Your results, personal bests and achievements.</span>
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

function QuickProfileForm({ account }: { account: AthleteAccountData }) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(account.fullName || "");
  const [sport, setSport] = useState<AthleteSportCode>("Running");
  const [privacy, setPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !privacy || fullName.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      const saved = await saveMyAthleteAccount({
        data: {
          preferences: account.preferences,
          consents: account.consents,
          fullName: fullName.trim(),
          displayName: fullName.trim(),
          privacyAcknowledged: true,
          sports: [
            {
              sportCode: sport,
              isPrimary: true,
              experienceLevel: null,
              disciplines: [],
              preferredDistances: [],
              preferredSurfaces: [],
              trainingSessionsPerWeek: null,
              trainingHoursPerWeek: null,
              weeklyDistanceKm: null,
              eventsPerYear: null,
              goals: "",
              coachName: "",
            },
          ],
        },
      });
      queryClient.setQueryData(["my-athlete-account", account.userId], saved);
      await queryClient.invalidateQueries({ queryKey: ["my-athlete-account"] });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "We couldn’t save your profile. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const field =
    "mt-2 h-12 w-full rounded-xl border border-border bg-bg px-3 text-sm outline-none focus:ring-2 focus:ring-accent/30";
  return (
    <form onSubmit={(event) => void save(event)} className="space-y-5">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
          <Check className="size-4" aria-hidden="true" />
          Email verified
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Let’s start your profile</h2>
        <p className="mt-2 text-sm text-muted">
          Just your name and first sport. Add everything else when you’re ready.
        </p>
      </div>
      <label className="block text-sm font-semibold">
        Your name
        <input
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          minLength={2}
          maxLength={120}
          required
          disabled={busy}
          className={field}
        />
      </label>
      <div className="text-sm font-semibold">
        <label htmlFor="recruitment-main-sport" className="block">
          Your main sport
        </label>
        <select
          id="recruitment-main-sport"
          value={sport}
          onChange={(event) => setSport(event.target.value as AthleteSportCode)}
          disabled={busy}
          className={field}
        >
          {ATHLETE_SPORTS.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          checked={privacy}
          onChange={(event) => setPrivacy(event.target.checked)}
          disabled={busy}
          className="mt-1 size-4 shrink-0 accent-primary"
          required
        />
        <span>
          I’ve read the{" "}
          <Link to="/privacy" target="_blank" className="text-accent underline">
            privacy notice
          </Link>{" "}
          and understand my profile starts private.
        </span>
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button
        className="w-full sm:w-auto"
        disabled={busy || !privacy || fullName.trim().length < 2}
        type="submit"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="size-4" aria-hidden="true" />
        )}
        Create my private profile
      </Button>
      <p className="text-xs text-muted">
        This does not sign you up for marketing emails or make your profile public.
      </p>
    </form>
  );
}

function ProfileReady() {
  return (
    <div>
      <CheckCircle2 className="size-8 text-accent" aria-hidden="true" />
      <h2 className="mt-3 font-display text-2xl font-semibold">Your profile is ready</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Start with your results, then add the details that make this profile yours. You control your
        sharing settings.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/athlete-account">
            Find and add my results <ArrowRight className="size-4" aria-hidden="true" />
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
