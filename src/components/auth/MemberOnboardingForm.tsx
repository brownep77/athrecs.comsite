import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ATHLETE_SPORTS,
  saveMyAthleteAccount,
  type AthleteAccountData,
  type AthleteAccountInput,
} from "@/lib/athrecs/athlete-account-api";
import { completeMyOnboarding } from "@/lib/athrecs/member-onboarding-api";
import {
  MEMBER_ROLES,
  onboardingSchema,
  safeOnboardingReturnTo,
  type MemberOnboarding,
} from "@/lib/athrecs/member-onboarding";

const descriptions: Record<keyof typeof MEMBER_ROLES, string> = {
  athlete: "Bring your sporting history together.",
  coach: "Support athletes and their progress.",
  club: "Represent your club and its community.",
  organiser: "Help athletes discover your events.",
  timing: "Contribute race timing and results.",
  supporter: "Follow the sports and people you love.",
  staff_request: "Request access to the AthRecs team.",
};
const limits = {
  country: 100,
  nationality: 100,
  dateOfBirth: 10,
  postcode: 30,
  clubOrTeam: 160,
  parkrunId: 40,
  powerOf10Url: 300,
  fingerprintEvent: 160,
  fingerprintYear: 4,
  fingerprintDistance: 40,
  fingerprintTime: 20,
} as const;
type DetailKey = keyof typeof limits;

export function MemberOnboardingForm({
  account,
  initial,
  returnTo,
}: {
  account: AthleteAccountData;
  initial: MemberOnboarding | null;
  returnTo?: string;
}) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const namesMatch = initial && `${initial.firstName} ${initial.lastName}` === account.fullName;
  const [firstName, setFirstName] = useState(namesMatch ? initial.firstName : "");
  const [lastName, setLastName] = useState(namesMatch ? initial.lastName : "");
  const [roles, setRoles] = useState<MemberOnboarding["roles"]>(initial?.roles ?? ["athlete"]);
  const [organisation, setOrganisation] = useState(initial?.organisation ?? "");
  const [form, setForm] = useState<AthleteAccountInput>({ ...account });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const saving = useRef(false);
  const revision = useRef(account.updatedAt ?? null);
  const athlete = roles.includes("athlete");
  const fieldClass =
    "mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-base text-fg shadow-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-sm";
  function field(label: string, key: DetailKey, required = false, type = "text") {
    return (
      <label className="block text-sm font-semibold">
        {label}
        <input
          className={fieldClass}
          type={type}
          autoComplete={
            key === "country"
              ? "country-name"
              : key === "dateOfBirth"
                ? "bday"
                : key === "postcode"
                  ? "postal-code"
                  : undefined
          }
          value={form[key] ?? ""}
          maxLength={limits[key]}
          required={required}
          onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        />
      </label>
    );
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    const identity = onboardingSchema.safeParse({ firstName, lastName, roles, organisation });
    if (!identity.success) {
      setError("Please check your first and last names and choose at least one role.");
      return;
    }
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await saveMyAthleteAccount({
        data: {
          ...form,
          expectedUpdatedAt: revision.current,
          fullName: `${identity.data.firstName} ${identity.data.lastName}`,
          displayName: form.displayName || `${identity.data.firstName} ${identity.data.lastName}`,
        },
      });
      revision.current = saved.updatedAt;
      client.setQueryData(["my-athlete-account", account.userId], saved);
      const completed = await completeMyOnboarding({ data: identity.data });
      client.setQueryData(["member-onboarding", account.userId], completed);
      await client.invalidateQueries({ queryKey: ["my-athlete-account"] });
      const destination = safeOnboardingReturnTo(returnTo);
      if (destination) await navigate({ href: destination, replace: true });
      else await navigate({ to: "/join", search: {}, replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "We couldn’t save your details. Please try again.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <form
      aria-label="Complete your profile"
      onSubmit={(event) => void submit(event)}
      className="space-y-7"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <UserRound className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">
            Make yourself at home
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Complete your profile
          </h2>
        </div>
      </div>
      <p className="max-w-xl text-sm leading-6 text-muted">
        Save your details once. You can update them later. We’ll use your athlete details to suggest
        results for you to confirm.
      </p>
      <fieldset disabled={busy} className="space-y-6">
        <legend className="mb-4 flex items-center gap-3 text-base font-semibold">
          <span className="flex size-7 items-center justify-center rounded-full bg-fg text-xs text-white">
            1
          </span>
          How will you use AthRecs?
        </legend>
        <p className="text-sm text-muted">You can be more than one. Choose every role that fits.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(MEMBER_ROLES).map(([key, label]) => (
            <label
              key={key}
              className={`relative flex min-h-24 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition hover:border-accent focus-within:ring-4 focus-within:ring-accent/10 ${roles.includes(key as keyof typeof MEMBER_ROLES) ? "border-accent bg-accent-soft/50 shadow-sm" : "border-border bg-surface"}`}
            >
              <input
                type="checkbox"
                aria-label={label}
                className="mt-1 size-4 shrink-0 accent-primary"
                checked={roles.includes(key as keyof typeof MEMBER_ROLES)}
                onChange={(event) =>
                  setRoles(
                    event.target.checked
                      ? [...roles, key as keyof typeof MEMBER_ROLES]
                      : roles.filter((role) => role !== key),
                  )
                }
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-5">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted" aria-hidden="true">
                  {descriptions[key as keyof typeof MEMBER_ROLES]}
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="flex gap-2 rounded-xl bg-elevated/70 p-3 text-xs leading-5 text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          <span>
            Role choices do not grant staff or organisation access. AthRecs staff access requires an
            administrator’s approval; club and event authority must be verified separately.
          </span>
        </p>
        {account.fullName && !namesMatch ? (
          <p className="text-sm">
            Your saved name is {account.fullName}. Please confirm your first and last names below.
          </p>
        ) : null}
        <div className="border-t border-border pt-6">
          <h3 className="mb-5 flex items-center gap-3 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-fg text-xs text-white">
              2
            </span>
            Your details
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First names
              <input
                className={fieldClass}
                autoComplete="given-name"
                required
                maxLength={60}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input
                className={fieldClass}
                autoComplete="family-name"
                required
                maxLength={60}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
            {field("Country of residence", "country", true)}
            {athlete ? (
              <>
                <label className="block text-sm font-semibold">
                  Main sport
                  <select
                    aria-label="Main sport"
                    className={fieldClass}
                    value={form.sports.find((sport) => sport.isPrimary)?.sportCode ?? ""}
                    required
                    onChange={(event) => {
                      const code = event.target.value as (typeof ATHLETE_SPORTS)[number];
                      const existing = form.sports.find((sport) => sport.sportCode === code);
                      setForm({
                        ...form,
                        sports: [
                          ...form.sports
                            .filter((sport) => sport.sportCode !== code)
                            .map((sport) => ({ ...sport, isPrimary: false })),
                          existing
                            ? { ...existing, isPrimary: true }
                            : {
                                sportCode: code,
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
                      });
                    }}
                  >
                    <option value="">Choose your sport</option>
                    {ATHLETE_SPORTS.map((sport) => (
                      <option key={sport}>{sport}</option>
                    ))}
                  </select>
                </label>
                {field("Nationality", "nationality", true)}
                {field("Date of birth", "dateOfBirth", true, "date")}
                {field("Postcode / ZIP / area (private)", "postcode", true)}
                {field("Current club or team (optional)", "clubOrTeam")}
              </>
            ) : null}
          </div>
        </div>
        {roles.some((role) =>
          ["coach", "club", "organiser", "timing", "staff_request"].includes(role),
        ) ? (
          <label className="block text-sm font-semibold">
            Organisation / business (optional)
            <input
              className={fieldClass}
              maxLength={160}
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
            />
          </label>
        ) : null}
        {athlete ? (
          <details className="group rounded-2xl border border-border bg-elevated/30 p-5" open>
            <summary className="cursor-pointer font-semibold text-accent">
              Help find your results — optional
            </summary>
            <p className="mt-2 text-sm leading-6 text-muted">
              A previous racing name, athlete link or one familiar race can help us find the right
              records. You’ll check any matches before claiming them.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Previous racing names (one per line)
                <textarea
                  className={fieldClass}
                  value={(form.previousNames ?? []).join("\n")}
                  onChange={(event) =>
                    setForm({ ...form, previousNames: event.target.value.split("\n") })
                  }
                />
              </label>
              {field("parkrun barcode", "parkrunId")}
              {field("Power of 10 profile link", "powerOf10Url", false, "url")}
              {field("A race you completed", "fingerprintEvent")}
              {field("Race year", "fingerprintYear")}
              {field("Distance", "fingerprintDistance")}
              {field("Finish time", "fingerprintTime")}
            </div>
          </details>
        ) : null}
        <details className="rounded-2xl border border-border bg-elevated/30 p-5">
          <summary className="cursor-pointer font-semibold text-accent">
            Your kit and nutrition — optional
          </summary>
          <p className="my-3 text-sm text-muted">
            These preferences are not used to verify results and do not opt you into marketing.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["equipmentBrands", "Trainer / equipment brands"],
                ["equipmentModels", "Trainer models"],
                ["clothingBrands", "Sports clothing brands"],
                ["nutritionBrands", "Nutrition brands"],
                ["nutritionProducts", "Nutrition products"],
                ["technologyDevices", "Watch / devices"],
                ["technologyApps", "Training apps"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm font-semibold">
                {label} (comma separated)
                <input
                  className={fieldClass}
                  maxLength={600}
                  value={form.preferences[key].join(",")}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      preferences: { ...form.preferences, [key]: event.target.value.split(",") },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </details>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-primary"
            required
            checked={form.privacyAcknowledged}
            onChange={(event) => setForm({ ...form, privacyAcknowledged: event.target.checked })}
          />
          <span>
            I have read the{" "}
            <Link to="/privacy" target="_blank" className="underline">
              privacy notice
            </Link>
            . My existing sharing and marketing choices will be preserved.
          </span>
        </label>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
        <div className="space-y-3 border-t border-border pt-5">
          <Button
            className="min-h-12 w-full rounded-xl px-6 shadow-sm sm:w-auto"
            type="submit"
            disabled={busy || !roles.length}
          >
            {busy
              ? "Saving…"
              : athlete
                ? "Save profile and find my results"
                : "Save profile and continue"}
            {!busy ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
          </Button>
          <p className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
            You control what you share on your public profile.
          </p>
        </div>
      </fieldset>
    </form>
  );
}
