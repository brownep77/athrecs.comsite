import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMyAthleteAccount, type AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import { saveMyClaimIdentity } from "@/lib/athrecs/result-matching-settings-api";
import { missingClaimIdentity } from "@/lib/athrecs/result-matching-settings";

export function ClaimIdentityGate({ children }: { children: ReactNode }) {
  const account = useQuery({
    queryKey: ["my-athlete-account"],
    queryFn: () => getMyAthleteAccount(),
    retry: false,
  });
  if (account.isPending)
    return <p role="status">Checking the details needed to claim your profile…</p>;
  if (account.isError)
    return (
      <div role="alert">
        <p>Your details could not be checked.</p>
        <Button onClick={() => void account.refetch()}>Try again</Button>
      </div>
    );
  if (!missingClaimIdentity(account.data).length) return <>{children}</>;
  return <ClaimIdentityForm account={account.data} />;
}
function ClaimIdentityForm({ account }: { account: AthleteAccountData }) {
  const client = useQueryClient();
  const [fullName, setName] = useState(account.fullName);
  const [dateOfBirth, setDob] = useState(account.dateOfBirth);
  const [nationality, setNationality] = useState(account.nationality);
  const [privacyAcknowledged, setPrivacy] = useState(false);
  const save = useMutation({
    mutationFn: () =>
      saveMyClaimIdentity({ data: { fullName, dateOfBirth, nationality, privacyAcknowledged } }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["my-athlete-account"] }),
        client.invalidateQueries({ queryKey: ["my-potential-result-matches"] }),
        client.invalidateQueries({ queryKey: ["my-archive-suggestions"] }),
      ]);
    },
  });
  return (
    <section className="space-y-4 rounded-xl border border-accent/30 bg-surface p-5">
      <h2 className="font-display text-xl font-semibold">
        Complete your details to claim your profile
      </h2>
      <p className="text-sm text-muted">
        Your name and verified email are required before claiming. Date of birth and nationality are
        optional and can be added later. If supplied, they help compare your age at the race and
        recorded nationality to distinguish athletes with similar names. Your selected profile is
        kept while you complete this step.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Full name <span aria-hidden="true">*</span>
          <input
            required
            autoComplete="name"
            maxLength={120}
            value={fullName}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-11 w-full rounded-lg border border-border bg-bg px-3"
          />
        </label>
        <label className="text-sm">
          Date of birth (optional)
          <input
            type="date"
            autoComplete="bday"
            max={new Date().toISOString().slice(0, 10)}
            value={dateOfBirth}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 h-11 w-full rounded-lg border border-border bg-bg px-3"
          />
        </label>
        <label className="text-sm">
          Nationality (optional)
          <input
            maxLength={100}
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            placeholder="For example British; include both if dual nationality"
            className="mt-1 h-11 w-full rounded-lg border border-border bg-bg px-3"
          />
          <span className="block text-xs text-muted">
            Enter Stateless if you do not hold a nationality.
          </span>
        </label>
        <label className="text-sm">
          Verified email
          <input
            value={account.verifiedEmail}
            disabled
            className="mt-1 h-11 w-full rounded-lg border border-border bg-bg px-3"
          />
          <span className="block text-xs text-muted">
            {account.emailVerified
              ? "Verified through your sign-in account."
              : "Verify your email before continuing."}
          </span>
        </label>
      </div>
      <p className="text-xs text-muted">
        Your birth date is hidden by default. Email, address and phone are never displayed on your
        public profile. Address and phone are optional. These details help matching; they do not
        prove ownership. Child and guardian claims receive staff review.
      </p>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={privacyAcknowledged}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="mt-1"
        />
        <span>
          I have read the{" "}
          <Link to="/privacy" className="text-accent underline">
            privacy notice
          </Link>
          , including how matching uses my details. This does not opt me into marketing or external
          searches.
        </span>
      </label>
      {save.isError ? (
        <p role="alert" className="text-sm text-red-700">
          {save.error.message}
        </p>
      ) : null}
      <Button
        disabled={
          save.isPending || !privacyAcknowledged || !fullName.trim() || !account.emailVerified
        }
        onClick={() => save.mutate()}
      >
        {save.isPending ? "Saving…" : "Save details and continue"}
      </Button>
    </section>
  );
}
