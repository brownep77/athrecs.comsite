import { PotentialResultMatchesPanel } from "@/components/athletes/PotentialResultMatchesPanel";
import { ProfileClaimGuide } from "@/components/athletes/ProfileClaimGuide";
import { ProfileResultsSetup } from "@/components/athletes/ProfileResultsSetup";
import { saveMyProfileSetup } from "@/lib/athrecs/profile-setup-api";
import { profileSetupSchema, setupLines } from "@/lib/athrecs/profile-setup";
import { readProfileDetails } from "@/lib/athrecs/profile-details";
import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
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
        "Create your account, claim your athlete profile and preserve your results and achievements. You choose what to share.",
      url: `${SITE_URL}/join`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/join` }],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { from } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const account = useQuery({
    queryKey: ["my-athlete-account", user?.id],
    queryFn: () => getMyAthleteAccount(),
    enabled: Boolean(user),
    retry: false,
  });
  const ready = Boolean(account.data?.exists);
  const stage = account.data?.claimedProfiles.length ? 3 : user ? 2 : 1;
  const callbackURL = `/join?step=profile${from ? `&from=${from}` : ""}`;

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
          Your first 5K, your fastest marathon, your next sport. Bring your results, PBs and
          achievements together in one athlete profile.
        </p>
        <ol aria-label="Your next steps" className="mt-6 grid gap-2 sm:grid-cols-3">
          {["Create your account", "Find and claim results", "View your profile"].map(
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
          ) : ready && account.data?.emailVerified ? (
            <ProfileReady account={account.data} />
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
          ) : (
            <div>
              <Mail className="size-7 text-accent" aria-hidden="true" />
              <h2 className="mt-3 font-display text-2xl font-semibold">
                One email. Your sporting story.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Add your name, country and location, then verify your email with a six-digit code to
                create your account. No password needed.
              </p>
              <Button
                className="mt-5 w-full sm:w-auto"
                onClick={() =>
                  openAthleteAuth({ mode: "signup", callbackURL, errorCallbackURL: callbackURL })
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
            For every level, from first-timers to lifelong athletes. Add current and previous clubs
            and optional profile links to help find your results as you join.
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
  const [currentClub, setCurrentClub] = useState("");
  const [previousClubs, setPreviousClubs] = useState("");
  const [previousNames, setPreviousNames] = useState("");
  const [profileLinks, setProfileLinks] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !privacy || fullName.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      const setup = profileSetupSchema.parse({
        fullName,
        currentClub,
        previousClubs: setupLines(previousClubs),
        previousNames: setupLines(previousNames),
        sourceUrls: setupLines(profileLinks),
        privacyAcknowledged: true,
      });
      const saved = await saveMyAthleteAccount({
        data: {
          preferences: account.preferences,
          consents: account.consents,
          fullName: fullName.trim(),
          displayName: fullName.trim(),
          clubOrTeam: setup.currentClub,
          profileDetails: {
            ...readProfileDetails(account.profileDetails),
            previousClub: setup.previousClubs[0] ?? "",
          },
          previousNames: setup.previousNames,
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
      await saveMyProfileSetup({ data: setup });
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
          Add your full racing name and first sport. Optional clubs and profile links help us find
          more of your results.
        </p>
      </div>
      <label className="block text-sm font-semibold">
        Your full racing name
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
      <fieldset className="space-y-4 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-semibold">Find more of your results (optional)</legend>
        <label className="block text-sm font-semibold">
          Current club or team
          <input
            className={field}
            maxLength={160}
            value={currentClub}
            disabled={busy}
            onChange={(e) => setCurrentClub(e.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold">
          Previous clubs or teams
          <textarea
            className={`${field} h-auto`}
            rows={2}
            value={previousClubs}
            disabled={busy}
            onChange={(e) => setPreviousClubs(e.target.value)}
            placeholder="One club per line"
          />
        </label>
        <label className="block text-sm font-semibold">
          Previous racing names
          <textarea
            className={`${field} h-auto`}
            rows={2}
            value={previousNames}
            disabled={busy}
            onChange={(e) => setPreviousNames(e.target.value)}
            placeholder="One full name per line"
          />
        </label>
        <label className="block text-sm font-semibold">
          Public profile or result links
          <textarea
            className={`${field} h-auto`}
            rows={3}
            value={profileLinks}
            disabled={busy}
            onChange={(e) => setProfileLinks(e.target.value)}
            placeholder="Power of 10, parkrun or other public HTTPS links, one per line"
          />
        </label>
        <p className="text-xs leading-5 text-muted">
          These links stay private. We’ll notify our team to check your profile and look for more
          results. You can claim suggested results immediately while we check.
        </p>
      </fieldset>
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

function ProfileReady({ account }: { account: AthleteAccountData }) {
  const queryClient = useQueryClient();
  if (!account.claimedProfiles.length)
    return (
      <div className="space-y-5">
        <ProfileResultsSetup account={account} />
        <ProfileClaimGuide
          account={account}
          hideRacingNameForm
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
