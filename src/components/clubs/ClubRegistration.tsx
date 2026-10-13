import { useId, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";
import {
  getMyClubRegistrations,
  saveClubRegistration,
  withdrawClubRegistration,
} from "@/lib/clubs/registration-api";
import {
  CLUB_SPORTS,
  CLUB_STATUS_LABELS,
  clubDetailsSchema,
  clubSaveSchema,
  type ClubApplication,
  type ClubDetails,
} from "@/lib/clubs/registration";
import type { ClubListItem } from "@/lib/athrecs/types";

export const clubPanel =
  "space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card md:p-6";
export const clubInput =
  "mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-base";
export function ClubError({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
      {error instanceof Error ? error.message : String(error)}
    </p>
  ) : null;
}
export function ClubField({
  label,
  value,
  onChange,
  hint,
  type = "text",
  multiline = false,
  max = 160,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  type?: string;
  multiline?: boolean;
  max?: number;
}) {
  const id = useId();
  const props = {
    id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    maxLength: max,
    className: clubInput,
    "aria-describedby": hint ? `${id}-hint` : undefined,
  };
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {multiline ? <textarea {...props} rows={4} /> : <input {...props} type={type} />}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
export function ClubCheck({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0"
      />
      <span>{children}</span>
    </label>
  );
}
export function ClubSignIn({ path }: { path: string }) {
  return (
    <section className={clubPanel}>
      <h2 className="font-semibold">Sign in to register your club</h2>
      <p>Use your own AthRecs account. Your club role and authority are checked separately.</p>
      <Button onClick={() => openAthleteAuth({ callbackURL: path, errorCallbackURL: path })}>
        Sign in or create account
      </Button>
    </section>
  );
}
export function ClubRegistration({
  club,
  missing,
  applicationId,
}: {
  club?: ClubListItem;
  missing: boolean;
  applicationId?: string;
}) {
  const { user, isPending } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["my-club-registrations", user?.id],
    queryFn: () => getMyClubRegistrations(),
    enabled: !!user && IS_ATHRECS_SITE,
    retry: false,
    gcTime: 0,
  });
  const path = `/clubs/register${applicationId ? `?application=${encodeURIComponent(applicationId)}` : club ? `?club=${encodeURIComponent(club.slug)}` : "?missing=true"}`;
  if (!IS_ATHRECS_SITE)
    return (
      <a href={`https://www.athrecs.com${path}`} className="text-accent underline">
        Register your club on AthRecs
      </a>
    );
  if (isPending) return <p role="status">Checking your account…</p>;
  if (!user) return <ClubSignIn path={path} />;
  if (query.isPending) return <p role="status">Loading your club registrations…</p>;
  if (query.isError)
    return (
      <>
        <ClubError error={query.error} />
        <Button onClick={() => void query.refetch()}>Retry</Button>
      </>
    );
  const existing = query.data.applications.find((a) =>
    applicationId ? a.id === applicationId : !!club && a.club_id === club.id,
  );
  if (applicationId && !existing)
    return (
      <p role="alert">
        This application is not available to your account.{" "}
        <Link to="/clubs/account" className="underline">
          My club registrations
        </Link>
      </p>
    );
  if (!club && !missing && !existing)
    return (
      <p>
        <Link to="/clubs" className="text-accent underline">
          Find your club in the directory first.
        </Link>
      </p>
    );
  if (existing && !["draft", "needs_changes", "pending"].includes(existing.status))
    return <ApplicationSummary app={existing} />;
  return (
    <ClubRegistrationForm
      key={`${user.id}-${applicationId ?? club?.id ?? "new"}`}
      initial={existing}
      club={club}
      email={query.data.email}
      emailVerified={query.data.emailVerified}
      userId={user.id}
    />
  );
}

function ClubRegistrationForm({
  initial,
  club,
  email,
  emailVerified,
  userId,
}: {
  initial?: ClubApplication;
  club?: ClubListItem;
  email: string;
  emailVerified: boolean;
  userId: string;
}) {
  const client = useQueryClient();
  const [saved, setSaved] = useState(initial);
  const [details, setDetails] = useState<ClubDetails>(
    initial?.details ??
      clubDetailsSchema.parse({
        clubName: club?.name ?? "",
        city: club?.city ?? "",
        county: club?.county ?? "",
        country: club?.country ?? "",
        website: club?.website?.startsWith("https:") ? club.website : "",
        sports:
          club?.sports.filter((s) => CLUB_SPORTS.includes(s as (typeof CLUB_SPORTS)[number])) ?? [],
      }),
  );
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const clubId = saved?.club_id ?? club?.id ?? null;
  const set = <K extends keyof ClubDetails>(key: K, value: ClubDetails[K]) =>
    setDetails((prev) => ({ ...prev, [key]: value }));
  const save = useMutation({
    mutationFn: (submit: boolean) => {
      const parsed = clubSaveSchema.safeParse({
        id: saved?.id,
        revision: saved?.revision,
        clubId,
        details,
        submit,
      });
      if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(" "));
      return saveClubRegistration({ data: parsed.data });
    },
    onSuccess: (result, submit) => {
      setSaved(result);
      setReceipt(
        submit
          ? "Application submitted. Your club representative details are awaiting staff verification."
          : "Draft saved. You can return from My club registrations.",
      );
      client.setQueryData(
        ["my-club-registrations", userId],
        (prev: Awaited<ReturnType<typeof getMyClubRegistrations>> | undefined) =>
          prev
            ? {
                ...prev,
                applications: [result, ...prev.applications.filter((a) => a.id !== result.id)],
              }
            : prev,
      );
    },
  });
  const field = (key: keyof ClubDetails, label: string, hint?: string, multiline = false) => (
    <ClubField
      label={label}
      value={String(details[key])}
      onChange={(v) => set(key, v as never)}
      hint={hint}
      multiline={multiline}
      max={
        multiline
          ? 2000
          : ["website", "evidenceUrl"].includes(key)
            ? 1000
            : key === "phone"
              ? 40
              : key === "clubEmail"
                ? 254
                : 160
      }
    />
  );
  function next() {
    setError("");
    if (
      step === 1 &&
      !clubId &&
      (!details.clubName || !details.city || !details.country || !details.sports.length)
    )
      return setError("Enter the club name, town/city, country and at least one sport.");
    if (
      step === 2 &&
      (details.representativeName.trim().length < 2 || details.representativeRole.trim().length < 2)
    )
      return setError("Enter your full name and club role.");
    setStep((s) => Math.min(4, s + 1));
  }
  return (
    <div className="space-y-4">
      {saved?.review_message && (
        <section className={clubPanel}>
          <h2 className="font-semibold">Message from the reviewer</h2>
          <p>{saved.review_message}</p>
        </section>
      )}
      <nav aria-label="Club registration steps" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {["Your club", "Your details", "Proof of authority", "Review & submit"].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setError("");
              setStep(i + 1);
            }}
            aria-current={step === i + 1 ? "step" : undefined}
            className={`min-h-12 rounded-lg border p-3 text-left text-sm ${step === i + 1 ? "border-accent bg-accent-soft font-semibold" : "border-border"}`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </nav>
      <form
        className={clubPanel}
        onSubmit={(e) => {
          e.preventDefault();
          setReceipt("");
          setError("");
          if (step < 4) next();
          else save.mutate(true);
        }}
      >
        <p className="text-sm text-muted">
          Step {step} of 4 · {saved ? CLUB_STATUS_LABELS[saved.status] : "New application"}
        </p>
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">Confirm your club</h2>
            {clubId ? (
              <div className="rounded-lg bg-elevated p-4">
                <p className="font-semibold">{saved?.club_name ?? club?.name}</p>
                <p className="text-sm">
                  {[details.city, details.country].filter(Boolean).join(", ")}
                </p>
                <Link to="/clubs" className="text-sm text-accent underline">
                  Choose a different club
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted">
                  First{" "}
                  <Link to="/clubs" className="underline">
                    search the directory
                  </Link>
                  . Missing clubs are reviewed before a listing is added.
                </p>
                {field("clubName", "Club name")}
                {field("city", "Town or city")}
                {field("county", "County (optional)")}
                {field("country", "Country")}
                <fieldset className="space-y-2">
                  <legend className="mb-2 text-sm font-semibold">Club sports</legend>
                  {CLUB_SPORTS.map((sport) => (
                    <ClubCheck
                      key={sport}
                      checked={details.sports.includes(sport)}
                      onChange={(checked) =>
                        set(
                          "sports",
                          checked
                            ? [...details.sports, sport]
                            : details.sports.filter((s) => s !== sport),
                        )
                      }
                    >
                      {sport}
                    </ClubCheck>
                  ))}
                </fieldset>
              </>
            )}
            {field(
              "website",
              "Official club website (optional)",
              "A public HTTPS website or official club page.",
            )}
            <label className="block text-sm font-semibold">
              Affiliation status
              <select
                value={details.affiliation}
                onChange={(e) => set("affiliation", e.target.value as ClubDetails["affiliation"])}
                className={clubInput}
              >
                <option value="unknown">Not known / to be checked</option>
                <option value="affiliated">Affiliated</option>
                <option value="unaffiliated">Unaffiliated</option>
              </select>
            </label>
            {details.affiliation === "affiliated" && (
              <>
                {field("governingBody", "Governing body")}
                {field("affiliationNumber", "Club affiliation number (if known)")}
              </>
            )}
            <p className="text-sm text-muted">
              Affiliated and unaffiliated clubs can apply. A directory listing or affiliation is
              separate from permission to manage the club.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">Identify the club representative</h2>
            {field("representativeName", "Your full name")}
            {field(
              "representativeRole",
              "Your role in the club",
              "For example secretary, chair, membership officer or authorised administrator.",
            )}
            <p className="rounded-lg bg-elevated p-3 text-sm">
              Account email: <strong className="break-all">{email}</strong> ·{" "}
              {emailVerified ? "Verified" : "Verification required before submission"}
            </p>
            {field(
              "clubEmail",
              "Official club contact email (optional)",
              "This is supporting information. It is not automatically verified by submitting the form.",
            )}
            {field(
              "phone",
              "Contact phone (optional)",
              "Only for follow-up about this application.",
            )}
            <p className="text-sm text-muted">
              Your representative and contact details are private to you and authorised AthRecs
              reviewers.
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold">Show your authority to represent the club</h2>
            <label className="block text-sm font-semibold">
              How can we check your role?
              <select
                className={clubInput}
                value={details.verificationMethod}
                onChange={(e) =>
                  set("verificationMethod", e.target.value as ClubDetails["verificationMethod"])
                }
              >
                <option value="officer_page">
                  I am named on a public club or governing-body page
                </option>
                <option value="club_contact">
                  Confirm with the club through its official contact
                </option>
              </select>
            </label>
            {field(
              "evidenceUrl",
              details.verificationMethod === "officer_page"
                ? "Page showing your club role"
                : "Official contact or governing-body page",
              "Public HTTPS page only; never a private document-sharing link or sign-in link.",
            )}
            {field(
              "authorityDetails",
              "Explain your authority and how we can confirm it",
              "Tell us who appointed you and where the club can confirm this. At least 30 characters. Do not include member lists, passwords, passport numbers or identity documents.",
              true,
            )}
            <p className="text-sm text-muted">
              A reviewer checks the club and your authority independently. Additional evidence may
              be requested through your application if the information does not establish your role.
            </p>
          </>
        )}
        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold">Review your registration</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-semibold">Club</dt>
                <dd>
                  {saved?.club_name ?? club?.name ?? details.clubName} · {details.country}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Representative</dt>
                <dd>
                  {details.representativeName} · {details.representativeRole}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Email</dt>
                <dd className="break-all">{email}</dd>
              </div>
              <div>
                <dt className="font-semibold">Evidence reference</dt>
                <dd className="break-all">
                  {details.evidenceUrl || details.website || "Not yet provided"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Authority</dt>
                <dd className="whitespace-pre-wrap break-words">
                  {details.authorityDetails || "Not yet provided"}
                </dd>
              </div>
            </dl>
            <ClubCheck checked={details.adultConfirmed} onChange={(v) => set("adultConfirmed", v)}>
              I am aged 18 or over.
            </ClubCheck>
            <ClubCheck
              checked={details.authorityConfirmed}
              onChange={(v) => set("authorityConfirmed", v)}
            >
              I am authorised to represent this club and the information I have supplied is
              accurate.
            </ClubCheck>
            <ClubCheck
              checked={details.privacyAcknowledged}
              onChange={(v) => set("privacyAcknowledged", v)}
            >
              I have read the{" "}
              <Link to="/privacy" hash="club-registration" className="text-accent underline">
                club registration privacy notice
              </Link>
              . Registration does not grant ownership of athletes’ profiles or permission to publish
              their private information.
            </ClubCheck>
            {!emailVerified && (
              <p role="alert">
                Verify your account email before submitting. You can save a draft now.
              </p>
            )}
            <p className="text-sm text-muted">
              Submission enters a review queue. It does not immediately grant club access, add
              members or send invitations.
            </p>
          </>
        )}
        <ClubError error={error || save.error} />
        {receipt && (
          <p role="status" className="rounded-lg bg-accent-soft p-3">
            {receipt}
          </p>
        )}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            disabled={save.isPending}
            onClick={() => {
              setReceipt("");
              setError("");
              save.mutate(false);
            }}
          >
            Save draft
          </Button>
          <Button type="submit" disabled={save.isPending || (step === 4 && !emailVerified)}>
            {save.isPending ? "Saving…" : step < 4 ? "Continue" : "Submit for verification"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ApplicationSummary({ app }: { app: ClubApplication }) {
  return (
    <section className={clubPanel}>
      <div className="flex flex-wrap justify-between gap-2">
        <h2 className="font-semibold">{app.club_name ?? app.details.clubName}</h2>
        <span className="rounded-full bg-elevated px-3 py-1 text-sm">
          {CLUB_STATUS_LABELS[app.status]}
        </span>
      </div>
      {app.review_message && <p>{app.review_message}</p>}
      {app.status === "approved" && (
        <p className="text-sm text-muted">
          Your authority to represent this club has been approved. Athlete uploads are a separate
          facility and are not enabled by this registration step.
        </p>
      )}
      {app.club_slug && (
        <Link to="/clubs/$slug" params={{ slug: app.club_slug }} className="text-accent underline">
          View club listing
        </Link>
      )}
    </section>
  );
}
export function MyClubRegistrations() {
  const { user, isPending } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["my-club-registrations", user?.id],
    queryFn: () => getMyClubRegistrations(),
    enabled: !!user && IS_ATHRECS_SITE,
    retry: false,
    gcTime: 0,
  });
  const withdraw = useMutation({
    mutationFn: (app: ClubApplication) =>
      withdrawClubRegistration({ data: { id: app.id, revision: app.revision } }),
    onSuccess: () => query.refetch(),
  });
  if (!IS_ATHRECS_SITE)
    return <a href="https://www.athrecs.com/clubs/account">Open club registrations on AthRecs</a>;
  if (isPending) return <p role="status">Checking account…</p>;
  if (!user) return <ClubSignIn path="/clubs/account" />;
  return (
    <div className="space-y-4">
      <ClubError error={query.error || withdraw.error} />
      {query.isError && <Button onClick={() => void query.refetch()}>Retry</Button>}
      {query.isPending && <p role="status">Loading registrations…</p>}
      {query.data?.applications.length === 0 && (
        <p className={clubPanel}>
          No club registrations yet. Find your club in the directory to get started.
        </p>
      )}
      {query.data?.applications.map((app) => (
        <div key={app.id}>
          <ApplicationSummary app={app} />
          {["draft", "pending", "needs_changes"].includes(app.status) && (
            <div className="my-3 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/clubs/register" search={{ application: app.id }}>
                  Open application
                </Link>
              </Button>
              <Button
                variant="secondary"
                disabled={withdraw.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      "Withdraw this club application? You can contact AthRecs if you need to apply again.",
                    )
                  )
                    withdraw.mutate(app);
                }}
              >
                Withdraw application
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
