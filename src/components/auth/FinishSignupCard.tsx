import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SIGNUP_COUNTRIES,
  latestSignupBirthdate,
  signupDetailsError,
  splitProviderName,
  type SignupDetails,
} from "@/lib/auth/signup-details";
import {
  completeMySignupDetails,
  type AthleteAccountData,
} from "@/lib/athrecs/athlete-account-api";

const fieldClass =
  "h-11 w-full min-w-0 rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30";

/**
 * Shown on the account page to athletes who joined straight from Google.
 * Collects the private details used to find their historical results.
 */
export function FinishSignupCard({
  account,
  onSaved,
}: {
  account: AthleteAccountData;
  onSaved?: (updated: AthleteAccountData) => void;
}) {
  const queryClient = useQueryClient();
  const names = splitProviderName(account.authName, account.verifiedEmail);
  const [details, setDetails] = useState<SignupDetails>({
    firstName: names.firstName === "Athlete" ? "" : names.firstName,
    lastName: names.lastName,
    signupCountry: account.country ?? "",
    signupLocation: account.signupLocation ?? "",
    signupDateOfBirth: "",
    signupClubs: "",
  });
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (input: SignupDetails) => completeMySignupDetails({ data: input }),
    onSuccess: (updated) => {
      setError(null);
      queryClient.setQueryData(["my-athlete-account"], updated);
      void queryClient.invalidateQueries({ queryKey: ["my-potential-result-matches"] });
      void queryClient.invalidateQueries({ queryKey: ["my-archive-suggestions"] });
      onSaved?.(updated);
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : "Your details could not be saved."),
  });

  const update = (field: keyof SignupDetails, value: string) =>
    setDetails((current) => ({ ...current, [field]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = signupDetailsError(details);
    if (invalid) {
      setError(invalid.message);
      return;
    }
    save.mutate(details);
  }

  return (
    <section
      aria-labelledby="finish-signup-title"
      className="rounded-xl border-2 border-accent/40 bg-surface p-5 shadow-card"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 size-5 shrink-0 text-accent" aria-hidden="true" />
        <div className="space-y-1">
          <h2 id="finish-signup-title" className="font-display text-xl font-semibold text-fg">
            Finish creating your account
          </h2>
          <p className="text-sm text-muted">
            You're signed in. Add these details so AthRecs can find your race results. They stay
            private and never appear on your public profile.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
        <label className="block space-y-1.5 text-sm font-medium text-fg">
          First name
          <input
            className={fieldClass}
            autoComplete="given-name"
            maxLength={60}
            value={details.firstName}
            onChange={(event) => update("firstName", event.target.value)}
            required
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-fg">
          Last name
          <input
            className={fieldClass}
            autoComplete="family-name"
            maxLength={60}
            value={details.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            required
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-fg">
          Country
          <select
            className={fieldClass}
            autoComplete="country-name"
            value={details.signupCountry}
            onChange={(event) => update("signupCountry", event.target.value)}
            required
          >
            <option value="">Choose your country</option>
            {SIGNUP_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-fg">
          City or town
          <input
            className={fieldClass}
            autoComplete="address-level2"
            maxLength={120}
            value={details.signupLocation}
            onChange={(event) => update("signupLocation", event.target.value)}
            required
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-fg">
          Date of birth
          <input
            className={fieldClass}
            type="date"
            autoComplete="bday"
            min="0001-01-01"
            max={latestSignupBirthdate()}
            value={details.signupDateOfBirth}
            onChange={(event) => update("signupDateOfBirth", event.target.value)}
            required
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-fg sm:row-span-2">
          Clubs you have raced for (optional)
          <textarea
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
            rows={3}
            maxLength={1000}
            placeholder="Current and previous clubs, one per line"
            value={details.signupClubs}
            onChange={(event) => update("signupClubs", event.target.value)}
          />
        </label>
        <div className="space-y-3 sm:col-span-2">
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-50 p-3 text-sm text-red-900"
            >
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full sm:w-auto" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save and find my results
          </Button>
          <p className="text-xs text-muted">
            Your date of birth can only be set once.{" "}
            <Link to="/privacy" className="underline">
              Privacy notice
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}
