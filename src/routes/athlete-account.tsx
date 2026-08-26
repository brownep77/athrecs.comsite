import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  Dumbbell,
  Goal,
  HeartPulse,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPin,
  Save,
  ShieldCheck,
  Shirt,
  Smartphone,
  UserRound,
  Utensils,
  Watch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signIn, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  ATHLETE_SPORTS,
  getMyAthleteAccount,
  saveMyAthleteAccount,
  type AthleteAccountData,
  type AthleteAccountInput,
  type AthleteExperienceLevel,
  type AthleteProductPreferences,
  type AthleteSportCode,
  type AthleteSportProfile,
} from "@/lib/athrecs/athlete-account-api";
import { cn } from "@/lib/utils";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";

export const Route = createFileRoute("/athlete-account")({
  head: () => ({
    meta: [
      { title: "My Athlete Account | ATHRECS.com" },
      {
        name: "description",
        content: "Manage your private ATHRECS Entry Passport, sports, training and preferences.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AthleteAccountPage,
});

const EQUIPMENT = [
  "Running shoes",
  "Trail shoes",
  "Bike",
  "Helmet",
  "Wetsuit",
  "Goggles",
  "GPS watch",
  "Heart-rate monitor",
  "Gym equipment",
  "Other",
];
const NUTRITION = [
  "Energy gels",
  "Electrolytes",
  "Carbohydrate drinks",
  "Protein / recovery",
  "Caffeine products",
  "Bars / chews",
  "Supplements",
  "None",
];
const TECHNOLOGY_DEVICES = [
  "GPS watch",
  "Smartwatch",
  "Heart-rate strap",
  "Bike computer",
  "Power meter",
  "Foot pod",
  "Smart trainer",
  "Phone only",
];
const TECHNOLOGY_APPS = [
  "Strava",
  "Garmin Connect",
  "COROS",
  "Polar Flow",
  "Suunto",
  "Apple Fitness",
  "TrainingPeaks",
  "Zwift",
  "Komoot",
  "Other",
];
const CLOTHING = [
  "Tops / vests",
  "Shorts",
  "Tights / leggings",
  "Jackets",
  "Socks",
  "Sports bras",
  "Cycling kit",
  "Swimwear",
  "Compression kit",
];
const RECOVERY = [
  "Foam roller",
  "Massage gun",
  "Compression boots",
  "Sports massage",
  "Ice / cold therapy",
  "Sauna / heat",
  "Mobility / yoga",
  "Sleep tracking",
];
const PURCHASE_CHANNELS = [
  "Online retailers",
  "Local sports shops",
  "Brand direct",
  "Event expos",
  "Club partners",
  "Second-hand",
];
const PURCHASE_PRIORITIES = [
  "Price",
  "Performance",
  "Comfort",
  "Durability",
  "Sustainability",
  "Brand",
  "Reviews",
  "Professional recommendation",
];

function accountToForm(account: AthleteAccountData): AthleteAccountInput {
  return {
    fullName: account.fullName,
    displayName: account.displayName,
    dateOfBirth: account.dateOfBirth,
    country: account.country,
    region: account.region,
    city: account.city,
    postcode: account.postcode,
    nationality: account.nationality,
    clubOrTeam: account.clubOrTeam,
    preferredLanguage: account.preferredLanguage,
    privacyAcknowledged: account.privacyAcknowledged,
    sports: account.sports.map((sport) => ({ ...sport })),
    preferences: { ...account.preferences },
    consents: { ...account.consents },
  };
}

function AthleteAccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [signingIn, setSigningIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (isPending) {
    return <LoadingCard label="Checking your Athlete Account…" />;
  }

  if (!user) {
    async function startSignIn() {
      setSigningIn(true);
      setMessage(null);
      try {
        await signIn("grok-google", {
          callbackURL: "/athlete-account",
          errorCallbackURL: "/athlete-account",
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Google sign-in failed");
        setSigningIn(false);
      }
    }

    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <AccountHero />
        <section className="rounded-2xl border border-border bg-surface p-6 text-center shadow-card md:p-10">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <LogIn className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-fg">
            Sign in or create your account
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Continue with Google to create a secure ATHRECS Athlete Account. Google supplies the
            verified email; you choose which optional sport and product details to add.
          </p>
          <Button
            className="mt-5"
            type="button"
            disabled={signingIn}
            onClick={() => void startSignIn()}
          >
            {signingIn ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {signingIn ? "Opening Google…" : "Continue with Google"}
          </Button>
          {message ? (
            <p className="mt-4 text-sm text-red-700" role="alert">
              {message}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5" aria-hidden="true" /> No password to create
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" aria-hidden="true" /> Private by default
            </span>
            <Link to="/privacy" className="font-medium text-accent">
              How ATHRECS uses your data
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return <SignedInAccount />;
}

function SignedInAccount() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AthleteAccountInput | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const account = useQuery({
    queryKey: ["my-athlete-account"],
    queryFn: () => getMyAthleteAccount(),
    retry: false,
  });

  useEffect(() => {
    if (account.data) setForm(accountToForm(account.data));
  }, [account.data]);

  const save = useMutation({
    mutationFn: (input: AthleteAccountInput) => saveMyAthleteAccount({ data: input }),
    onSuccess: (updated) => {
      setForm(accountToForm(updated));
      setMessage("Your Athlete Account has been saved.");
      queryClient.setQueryData(["my-athlete-account"], updated);
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  if (account.isLoading) return <LoadingCard label="Loading your Entry Passport…" />;
  if (account.isError || !account.data) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-50 p-5 text-sm text-red-900">
        Your Athlete Account could not be loaded. Refresh the page to try again.
      </p>
    );
  }
  if (!form) return <LoadingCard label="Preparing your Entry Passport…" />;

  const completion = accountCompletion(form, account.data.verifiedEmail);
  const updatePreference = <K extends keyof AthleteProductPreferences>(
    key: K,
    value: AthleteProductPreferences[K],
  ) =>
    setForm(
      (current) => current && { ...current, preferences: { ...current.preferences, [key]: value } },
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AccountHero />

      <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 shadow-card sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-900">
              <BadgeCheck className="mr-1 size-3.5" aria-hidden="true" /> Google email verified
            </Badge>
            <span className="text-sm font-medium text-fg">{account.data.verifiedEmail}</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Profile completion: <strong className="text-fg">{completion}%</strong>. Optional
            sections improve your Entry Passport and any analytics you approve.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
            <div className="h-full rounded-full bg-accent" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={() => void signOut("/")}>
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </Button>
      </section>

      {account.data.claimedProfiles.length || account.data.claimCount ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-fg">Claimed results</h2>
              <p className="mt-1 text-sm text-muted">
                {account.data.claimedProfiles.length} linked athlete profile
                {account.data.claimedProfiles.length === 1 ? "" : "s"} · {account.data.claimCount}{" "}
                claim{account.data.claimCount === 1 ? "" : "s"} submitted
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/claim-results" search={{ resultId: undefined }}>
                Manage claims
              </Link>
            </Button>
          </div>
          {account.data.claimedProfiles.length ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {account.data.claimedProfiles.map((profile) => (
                  <Badge key={profile.athleteId} className="border-accent/30 bg-accent-soft text-fg">
                    {profile.athleteName} · Private profile
                  </Badge>
                ))}
              </div>
              {account.data.claimedResults.length ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {account.data.claimedResults.map((result) => (
                    <Link
                      key={result.resultId}
                      to="/races/$slug"
                      params={{ slug: result.eventSlug }}
                      className="rounded-lg border border-border p-3 no-underline hover:border-accent"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-fg">{result.eventName}</p>
                          <p className="mt-1 text-xs text-muted">
                            {formatRaceDateShort(result.eventDate)} · {result.distanceCode}
                            {result.category ? ` · ${result.category}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums text-fg">
                            {formatDuration(result.finishTimeSeconds)}
                          </p>
                          {result.overallPlace != null ? (
                            <p className="mt-1 text-xs text-muted">Place {result.overallPlace}</p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          save.mutate(form);
        }}
      >
        <AccountSection
          icon={UserRound}
          title="Identity and Entry Passport"
          description="Full name and verified email are required. Everything else in this section is optional and private."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Full name"
              required
              value={form.fullName}
              onChange={(value) => setForm({ ...form, fullName: value })}
              autoComplete="name"
            />
            <TextField
              label="Verified email"
              required
              value={account.data.verifiedEmail}
              disabled
              help="Managed by your signed-in Google account."
            />
            <TextField
              label="Display name"
              value={form.displayName ?? ""}
              onChange={(value) => setForm({ ...form, displayName: value })}
              help="Optional name you prefer ATHRECS staff to use."
            />
            <TextField
              label="Date of birth"
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(value) => setForm({ ...form, dateOfBirth: value })}
              autoComplete="bday"
            />
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-fg">
            <MapPin className="size-4 text-accent" aria-hidden="true" /> Location and affiliation
            <OptionalLabel />
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TextField
              label="Country"
              value={form.country ?? ""}
              onChange={(value) => setForm({ ...form, country: value })}
              autoComplete="country-name"
            />
            <TextField
              label="Region / county / state"
              value={form.region ?? ""}
              onChange={(value) => setForm({ ...form, region: value })}
              addressLevel="1"
            />
            <TextField
              label="City / town"
              value={form.city ?? ""}
              onChange={(value) => setForm({ ...form, city: value })}
              addressLevel="2"
            />
            <TextField
              label="Postcode"
              value={form.postcode ?? ""}
              onChange={(value) => setForm({ ...form, postcode: value })}
              autoComplete="postal-code"
            />
            <TextField
              label="Nationality"
              value={form.nationality ?? ""}
              onChange={(value) => setForm({ ...form, nationality: value })}
            />
            <TextField
              label="Club or team"
              value={form.clubOrTeam ?? ""}
              onChange={(value) => setForm({ ...form, clubOrTeam: value })}
            />
            <TextField
              label="Preferred language"
              value={form.preferredLanguage ?? ""}
              onChange={(value) => setForm({ ...form, preferredLanguage: value })}
            />
          </div>
        </AccountSection>

        <AccountSection
          icon={Goal}
          title="Sports and training"
          description="Add every sport that is relevant to you, then optionally describe disciplines, distances, training and goals."
          optional
        >
          <ChoiceGrid
            label="Your sports"
            choices={[...ATHLETE_SPORTS]}
            selected={form.sports.map((sport) => sport.sportCode)}
            onChange={(codes) =>
              setForm({
                ...form,
                sports: codes.map((code, index) => {
                  const current = form.sports.find((sport) => sport.sportCode === code);
                  return current ?? emptySport(code as AthleteSportCode, index === 0);
                }),
              })
            }
          />
          {form.sports.length ? (
            <div className="mt-5 grid gap-4">
              {form.sports.map((sport) => (
                <SportEditor
                  key={sport.sportCode}
                  sport={sport}
                  onChange={(next) =>
                    setForm({
                      ...form,
                      sports: form.sports.map((item) =>
                        item.sportCode === sport.sportCode
                          ? next
                          : next.isPrimary
                            ? { ...item, isPrimary: false }
                            : item,
                      ),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted">
              No sport selected yet. You can save the account without adding one.
            </p>
          )}
        </AccountSection>

        <ProductSection
          icon={Dumbbell}
          title="Equipment"
          description="What equipment do you use for your sports?"
          choices={EQUIPMENT}
          selected={form.preferences.equipmentItems}
          onSelected={(value) => updatePreference("equipmentItems", value)}
          brandLabel="Brands used"
          brands={form.preferences.equipmentBrands}
          onBrands={(value) => updatePreference("equipmentBrands", value)}
          extraLabel="Models used"
          extras={form.preferences.equipmentModels}
          onExtras={(value) => updatePreference("equipmentModels", value)}
          notes={form.preferences.equipmentNotes}
          onNotes={(value) => updatePreference("equipmentNotes", value)}
        />

        <ProductSection
          icon={Utensils}
          title="Sports nutrition"
          description="Products you choose around training and racing. Do not include medical diagnoses."
          choices={NUTRITION}
          selected={form.preferences.nutritionProducts}
          onSelected={(value) => updatePreference("nutritionProducts", value)}
          brandLabel="Nutrition brands used"
          brands={form.preferences.nutritionBrands}
          onBrands={(value) => updatePreference("nutritionBrands", value)}
          notes={form.preferences.nutritionNotes}
          onNotes={(value) => updatePreference("nutritionNotes", value)}
        />

        <ProductSection
          icon={Smartphone}
          title="Technology"
          description="Devices, platforms and training apps you use."
          choices={TECHNOLOGY_DEVICES}
          selected={form.preferences.technologyDevices}
          onSelected={(value) => updatePreference("technologyDevices", value)}
          secondaryChoices={TECHNOLOGY_APPS}
          secondaryLabel="Apps and platforms"
          secondarySelected={form.preferences.technologyApps}
          onSecondary={(value) => updatePreference("technologyApps", value)}
          brandLabel="Technology brands used"
          brands={form.preferences.technologyBrands}
          onBrands={(value) => updatePreference("technologyBrands", value)}
          notes={form.preferences.technologyNotes}
          onNotes={(value) => updatePreference("technologyNotes", value)}
        />

        <AccountSection
          icon={Shirt}
          title="Clothing"
          description="Optional clothing types, brands, general sizing and fit preference."
          optional
        >
          <ChoiceGrid
            label="Clothing used"
            choices={CLOTHING}
            selected={form.preferences.clothingItems}
            onChange={(value) => updatePreference("clothingItems", value)}
          />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <CsvField
              label="Clothing brands used"
              values={form.preferences.clothingBrands}
              onChange={(value) => updatePreference("clothingBrands", value)}
            />
            <TextField
              label="General clothing size"
              value={form.preferences.clothingSize}
              onChange={(value) => updatePreference("clothingSize", value)}
            />
            <SelectField
              label="Preferred fit"
              value={form.preferences.clothingFit ?? ""}
              onChange={(value) =>
                updatePreference(
                  "clothingFit",
                  (value || null) as AthleteProductPreferences["clothingFit"],
                )
              }
              options={[
                ["", "Not specified"],
                ["relaxed", "Relaxed"],
                ["regular", "Regular"],
                ["fitted", "Fitted"],
                ["compression", "Compression"],
                ["varies", "Varies"],
              ]}
            />
          </div>
          <NotesField
            value={form.preferences.clothingNotes}
            onChange={(value) => updatePreference("clothingNotes", value)}
          />
        </AccountSection>

        <ProductSection
          icon={HeartPulse}
          title="Recovery"
          description="Recovery products and methods you choose to use."
          choices={RECOVERY}
          selected={form.preferences.recoveryProducts}
          onSelected={(value) => updatePreference("recoveryProducts", value)}
          brandLabel="Recovery brands used"
          brands={form.preferences.recoveryBrands}
          onBrands={(value) => updatePreference("recoveryBrands", value)}
          notes={form.preferences.recoveryNotes}
          onNotes={(value) => updatePreference("recoveryNotes", value)}
        />

        <AccountSection
          icon={Watch}
          title="Buying preferences"
          description="Optional information about how you choose and buy sports products."
          optional
        >
          <ChoiceGrid
            label="Where you buy"
            choices={PURCHASE_CHANNELS}
            selected={form.preferences.purchaseChannels}
            onChange={(value) => updatePreference("purchaseChannels", value)}
          />
          <div className="mt-5">
            <ChoiceGrid
              label="What matters when choosing products"
              choices={PURCHASE_PRIORITIES}
              selected={form.preferences.purchasePriorities}
              onChange={(value) => updatePreference("purchasePriorities", value)}
            />
          </div>
          <div className="mt-5 max-w-sm">
            <SelectField
              label="Approximate annual sports spend"
              value={form.preferences.annualSportsSpendBand ?? ""}
              onChange={(value) =>
                updatePreference(
                  "annualSportsSpendBand",
                  (value || null) as AthleteProductPreferences["annualSportsSpendBand"],
                )
              }
              options={[
                ["", "Not specified"],
                ["prefer_not_to_say", "Prefer not to say"],
                ["under_250", "Under £250"],
                ["250_499", "£250–£499"],
                ["500_999", "£500–£999"],
                ["1000_1999", "£1,000–£1,999"],
                ["2000_plus", "£2,000 or more"],
              ]}
            />
          </div>
        </AccountSection>

        <AccountSection
          icon={ShieldCheck}
          title="Privacy and consent centre"
          description="Saving your account does not automatically opt you into research or marketing. Change these choices at any time."
        >
          <div className="grid gap-3">
            <ConsentChoice
              checked={form.consents.performanceInsights}
              onChange={(checked) =>
                setForm({ ...form, consents: { ...form.consents, performanceInsights: checked } })
              }
              title="Performance and habit insights"
              description="Allow ATHRECS to analyse your sport, training and race habits to show you insights."
            />
            <ConsentChoice
              checked={form.consents.personalisation}
              onChange={(checked) =>
                setForm({ ...form, consents: { ...form.consents, personalisation: checked } })
              }
              title="Personalised ATHRECS experience"
              description="Allow ATHRECS to use your choices to improve which events and content you see."
            />
            <ConsentChoice
              checked={form.consents.productResearch}
              onChange={(checked) =>
                setForm({ ...form, consents: { ...form.consents, productResearch: checked } })
              }
              title="Anonymous product research"
              description="Allow optional kit, nutrition, technology and clothing choices to be used in aggregated research."
            />
            <ConsentChoice
              checked={form.consents.marketing}
              onChange={(checked) =>
                setForm({ ...form, consents: { ...form.consents, marketing: checked } })
              }
              title="Marketing emails"
              description="Allow ATHRECS to send relevant news, product information or partner offers by email."
            />
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
            <input
              type="checkbox"
              required
              checked={form.privacyAcknowledged}
              onChange={(event) => setForm({ ...form, privacyAcknowledged: event.target.checked })}
              className="mt-1 size-4 accent-[var(--color-accent)]"
            />
            <span>
              <strong className="block text-sm text-fg">Required privacy acknowledgement</strong>
              <span className="mt-1 block text-sm leading-5 text-muted">
                I have read the{" "}
                <Link to="/privacy" className="font-medium text-accent">
                  Athlete Account privacy notice
                </Link>{" "}
                and understand that required account identity is separate from optional analytics,
                research and marketing choices.
              </span>
            </span>
          </label>
        </AccountSection>

        <div className="sticky bottom-16 z-30 rounded-xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur-md md:bottom-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={cn(
                "text-sm",
                message?.includes("saved") ? "text-emerald-700" : "text-muted",
              )}
              role="status"
            >
              {message ?? "Required: verified email, full name and privacy acknowledgement."}
            </p>
            <Button
              type="submit"
              disabled={save.isPending || !form.fullName.trim() || !form.privacyAcknowledged}
            >
              {save.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {save.isPending ? "Saving…" : "Save Athlete Account"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function AccountHero() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-5 py-7 text-white md:px-8 md:py-9">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
          <ShieldCheck className="size-4" aria-hidden="true" /> Private Entry Passport
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold">My Athlete Account</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Keep your identity, claimed results, sports, training, kit and preferences together.
          Private account data is not added to your public athlete profile automatically.
        </p>
      </div>
    </section>
  );
}

function AccountSection({
  icon: Icon,
  title,
  description,
  optional = false,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-fg">{title}</h2>
            {optional ? <OptionalLabel /> : null}
          </div>
          <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function ProductSection({
  icon,
  title,
  description,
  choices,
  selected,
  onSelected,
  secondaryChoices,
  secondaryLabel,
  secondarySelected,
  onSecondary,
  brandLabel,
  brands,
  onBrands,
  extraLabel,
  extras,
  onExtras,
  notes,
  onNotes,
}: {
  icon: typeof Dumbbell;
  title: string;
  description: string;
  choices: string[];
  selected: string[];
  onSelected: (value: string[]) => void;
  secondaryChoices?: string[];
  secondaryLabel?: string;
  secondarySelected?: string[];
  onSecondary?: (value: string[]) => void;
  brandLabel: string;
  brands: string[];
  onBrands: (value: string[]) => void;
  extraLabel?: string;
  extras?: string[];
  onExtras?: (value: string[]) => void;
  notes: string;
  onNotes: (value: string) => void;
}) {
  return (
    <AccountSection icon={icon} title={title} description={description} optional>
      <ChoiceGrid
        label={`Types of ${title.toLowerCase()}`}
        choices={choices}
        selected={selected}
        onChange={onSelected}
      />
      {secondaryChoices && secondarySelected && onSecondary ? (
        <div className="mt-5">
          <ChoiceGrid
            label={secondaryLabel ?? "Other choices"}
            choices={secondaryChoices}
            selected={secondarySelected}
            onChange={onSecondary}
          />
        </div>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <CsvField label={brandLabel} values={brands} onChange={onBrands} />
        {extraLabel && extras && onExtras ? (
          <CsvField label={extraLabel} values={extras} onChange={onExtras} />
        ) : null}
      </div>
      <NotesField value={notes} onChange={onNotes} />
    </AccountSection>
  );
}

function SportEditor({
  sport,
  onChange,
}: {
  sport: AthleteSportProfile;
  onChange: (sport: AthleteSportProfile) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-fg">{sport.sportCode}</h3>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="radio"
            name="primary-sport"
            checked={sport.isPrimary}
            onChange={() => onChange({ ...sport, isPrimary: true })}
            className="size-4 accent-[var(--color-accent)]"
          />{" "}
          Primary sport
        </label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Experience"
          value={sport.experienceLevel ?? ""}
          onChange={(value) =>
            onChange({
              ...sport,
              experienceLevel: (value || null) as AthleteExperienceLevel | null,
            })
          }
          options={[
            ["", "Not specified"],
            ["new", "New to the sport"],
            ["recreational", "Recreational"],
            ["club", "Club athlete"],
            ["competitive", "Competitive"],
            ["elite", "Elite"],
            ["coach", "Coach"],
            ["other", "Other"],
          ]}
        />
        <NumberField
          label="Sessions per week"
          value={sport.trainingSessionsPerWeek}
          min={0}
          max={30}
          step={1}
          onChange={(value) => onChange({ ...sport, trainingSessionsPerWeek: value })}
        />
        <NumberField
          label="Training hours per week"
          value={sport.trainingHoursPerWeek}
          min={0}
          max={168}
          step={0.5}
          onChange={(value) => onChange({ ...sport, trainingHoursPerWeek: value })}
        />
        <NumberField
          label="Distance per week (km)"
          value={sport.weeklyDistanceKm}
          min={0}
          max={2000}
          step={0.1}
          onChange={(value) => onChange({ ...sport, weeklyDistanceKm: value })}
        />
        <NumberField
          label="Events per year"
          value={sport.eventsPerYear}
          min={0}
          max={500}
          step={1}
          onChange={(value) => onChange({ ...sport, eventsPerYear: value })}
        />
        <TextField
          label="Coach name"
          value={sport.coachName}
          onChange={(value) => onChange({ ...sport, coachName: value })}
        />
        <CsvField
          label="Disciplines"
          values={sport.disciplines}
          onChange={(value) => onChange({ ...sport, disciplines: value })}
          placeholder="e.g. road, track, sprint"
        />
        <CsvField
          label="Preferred distances"
          values={sport.preferredDistances}
          onChange={(value) => onChange({ ...sport, preferredDistances: value })}
          placeholder="e.g. 5K, marathon"
        />
        <CsvField
          label="Preferred surfaces"
          values={sport.preferredSurfaces}
          onChange={(value) => onChange({ ...sport, preferredSurfaces: value })}
          placeholder="e.g. road, trail"
        />
      </div>
      <label className="mt-4 block text-sm font-medium text-fg">
        Goals <span className="font-normal text-subtle">(optional)</span>
        <textarea
          value={sport.goals}
          onChange={(event) => onChange({ ...sport, goals: event.target.value })}
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
          placeholder="Targets, preferred events or what you want to improve"
        />
      </label>
    </div>
  );
}

function ChoiceGrid({
  label,
  choices,
  selected,
  onChange,
}: {
  label: string;
  choices: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const set = new Set(selected);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-fg">
        {label} <span className="font-normal text-subtle">(optional)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const active = set.has(choice);
          const nextSelection = () => {
            if (active) return selected.filter((item) => item !== choice);
            if (choice === "None") return ["None"];
            return [...selected.filter((item) => item !== "None"), choice];
          };
          return (
            <button
              key={choice}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(nextSelection())}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-accent bg-accent-soft font-medium text-fg"
                  : "border-border bg-bg text-muted hover:text-fg",
              )}
            >
              {active ? <Check className="size-3.5" aria-hidden="true" /> : null}
              {choice}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ConsentChoice({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-bg p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-[var(--color-accent)]"
      />
      <span>
        <strong className="block text-sm text-fg">
          {title} <span className="font-normal text-subtle">(optional)</span>
        </strong>
        <span className="mt-1 block text-sm leading-5 text-muted">{description}</span>
      </span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  type = "text",
  help,
  autoComplete,
  addressLevel,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  help?: string;
  autoComplete?: string;
  addressLevel?: "1" | "2";
  placeholder?: string;
}) {
  const resolvedAutoComplete = addressLevel ? `address-level${addressLevel}` : autoComplete;
  return (
    <label className="block text-sm font-medium text-fg">
      {label}{" "}
      {required ? (
        <span className="text-red-700">*</span>
      ) : (
        <span className="font-normal text-subtle">(optional)</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        disabled={disabled}
        autoComplete={resolvedAutoComplete}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
      />
      {help ? <span className="mt-1 block text-xs font-normal text-subtle">{help}</span> : null}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block text-sm font-medium text-fg">
      {label} <span className="font-normal text-subtle">(optional)</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : Number(event.target.value))
        }
        min={min}
        max={max}
        step={step}
        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block text-sm font-medium text-fg">
      {label} <span className="font-normal text-subtle">(optional)</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function CsvField({
  label,
  values,
  onChange,
  placeholder = "Separate items with commas",
}: {
  label: string;
  values: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(() => values.join(", "));
  return (
    <TextField
      label={label}
      value={text}
      onChange={(value) => {
        setText(value);
        onChange(
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        );
      }}
      placeholder={placeholder}
      help="Separate multiple answers with commas."
      autoComplete="off"
    />
  );
}

function NotesField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-4 block text-sm font-medium text-fg">
      Anything else <span className="font-normal text-subtle">(optional)</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-1.5 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        placeholder="Optional context, preferences or products not listed above"
      />
    </label>
  );
}

function OptionalLabel() {
  return <Badge className="border-border bg-elevated text-subtle">Optional</Badge>;
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="flex min-h-[24rem] items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm text-muted shadow-card">
      <Loader2 className="size-5 animate-spin text-accent" aria-hidden="true" />
      {label}
    </div>
  );
}

function emptySport(sportCode: AthleteSportCode, isPrimary: boolean): AthleteSportProfile {
  return {
    sportCode,
    isPrimary,
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
  };
}

function accountCompletion(form: AthleteAccountInput, email: string): number {
  let score = form.fullName.trim() && email ? 35 : 0;
  if (form.sports.length) score += 15;
  if (
    form.sports.some(
      (sport) => sport.trainingSessionsPerWeek != null || sport.trainingHoursPerWeek != null,
    )
  )
    score += 10;
  if (form.country || form.city || form.clubOrTeam) score += 10;
  if (form.preferences.equipmentItems.length || form.preferences.equipmentBrands.length) score += 5;
  if (form.preferences.nutritionProducts.length) score += 5;
  if (form.preferences.technologyDevices.length || form.preferences.technologyApps.length)
    score += 5;
  if (form.preferences.clothingItems.length || form.preferences.clothingBrands.length) score += 5;
  if (form.preferences.recoveryProducts.length) score += 5;
  if (Object.values(form.consents).some(Boolean)) score += 5;
  return Math.min(score, 100);
}
