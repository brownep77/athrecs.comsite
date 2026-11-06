import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resumeFinOnboarding } from "@/lib/athrecs/fin-onboarding-api";
import { FinResultResearchPanel } from "@/components/athletes/FinResultResearchPanel";
import type { AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import { openAthleteAuth } from "@/lib/auth/client";

type ContinuationAccount = Pick<AthleteAccountData, "emailVerified" | "exists">;

/** Mount with an account-specific key so a session change clears recovered details. */
export function FinSignupContinuation({
  continuation,
  account,
  callbackURL,
}: {
  continuation: string;
  account: ContinuationAccount | null;
  callbackURL: string;
}) {
  const resume = useMutation({
    mutationFn: () => resumeFinOnboarding({ data: { continuation } }),
    retry: false,
    gcTime: 0,
  });
  const result = resume.data;
  const verifyEmail = () =>
    openAthleteAuth({ mode: "code", callbackURL, errorCallbackURL: callbackURL });
  const actionClass = "h-auto w-full min-w-0 whitespace-normal py-3 sm:w-auto";

  return (
    <section
      aria-labelledby="fin-continuation-heading"
      aria-live="polite"
      aria-busy={resume.isPending}
      className="space-y-4 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        {result?.status === "ready" ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        ) : (
          <Search className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        )}
        <div className="min-w-0 space-y-2">
          <h2 id="fin-continuation-heading" className="font-display text-xl font-semibold">
            Continue your AthRecs search
          </h2>
          {!account ? (
            <p className="text-sm leading-6 text-muted">
              Create your account or sign in below to open the search you started in chat.
            </p>
          ) : !account.emailVerified ? (
            <p className="text-sm leading-6 text-muted">
              Verify your email below, then pick up your saved search here.
            </p>
          ) : result?.status === "ready" ? (
            <p className="text-sm leading-6 text-muted">
              {result.accountStatus === "verified_new_signup"
                ? "Your account is ready."
                : "Welcome back."}{" "}
              Here are the search details you shared. Check any matches before requesting a profile
              claim.
            </p>
          ) : result?.status === "unavailable" ? (
            <p role="status" className="text-sm leading-6 text-muted">
              This saved search is no longer available. You can still use your account to find and
              review your results.
            </p>
          ) : result?.status === "verify_email" ? (
            <p role="status" className="text-sm leading-6 text-muted">
              Please verify your email to open this saved search.
            </p>
          ) : (
            <p className="text-sm leading-6 text-muted">
              You’re signed in. Open the search details you shared in chat and choose your next
              step.
            </p>
          )}
        </div>
      </div>

      {account?.emailVerified && result?.status === "ready" ? (
        <>
          <dl className="grid gap-3 rounded-xl border border-border bg-surface p-4 text-sm sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="font-semibold">Racing name</dt>
              <dd className="mt-1 break-words text-muted">{result.racingName}</dd>
            </div>
            {result.eventName ? (
              <div className="min-w-0">
                <dt className="font-semibold">Event you mentioned</dt>
                <dd className="mt-1 break-words text-muted">{result.eventName}</dd>
              </div>
            ) : null}
            {result.year !== null ? (
              <div>
                <dt className="font-semibold">Year you mentioned</dt>
                <dd className="mt-1 text-muted">{result.year}</dd>
              </div>
            ) : null}
          </dl>
          {result.eventName || result.year !== null ? (
            <p className="text-sm leading-6 text-muted">
              The event and year are saved here as a reminder. Choose any filters again in the
              result search.
            </p>
          ) : null}
          {!account.exists ? (
            <p className="text-sm leading-6 text-muted">
              Add your racing name and main sport in the form below to set up your private profile.
              You can then review stored matches.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {account.exists ? (
              <Button asChild className={actionClass}>
                <Link to="/athlete-account" search={{ section: "potential" }}>
                  Review stored results{" "}
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button asChild className={actionClass}>
                <a href="#private-profile-setup">
                  Set up my private profile{" "}
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              </Button>
            )}
            <Button asChild variant="secondary" className={actionClass}>
              <Link to="/athletes" search={{ q: result.racingName }}>
                Find matching athlete profiles
              </Link>
            </Button>
          </div>
          <FinResultResearchPanel
            continuation={continuation}
            eventName={result.eventName}
            year={result.year}
            accountExists={account.exists}
          />
        </>
      ) : account?.emailVerified && result?.status === "unavailable" ? (
        <Button asChild className={actionClass}>
          {account.exists ? (
            <Link to="/athlete-account" search={{ section: "potential" }}>
              Find my results
            </Link>
          ) : (
            <a href="#private-profile-setup">Set up my private profile</a>
          )}
        </Button>
      ) : account?.emailVerified && result?.status === "verify_email" ? (
        <Button type="button" className={actionClass} onClick={verifyEmail}>
          Verify with an email code
        </Button>
      ) : account?.emailVerified ? (
        <div className="space-y-3">
          {resume.isError ? (
            <p role="alert" className="text-sm leading-6 text-red-700">
              We couldn’t open your saved search. Please try again. Your account is still available
              below.
            </p>
          ) : null}
          <Button
            type="button"
            className={actionClass}
            disabled={resume.isPending}
            onClick={() => resume.mutate()}
          >
            {resume.isPending ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            )}
            {resume.isPending
              ? "Opening your search…"
              : resume.isError
                ? "Try again"
                : "Continue my search"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
