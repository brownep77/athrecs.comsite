import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMyOpenClaimInvitations } from "@/lib/athrecs/claim-invitations-api";
import { listMyResultClaims } from "@/lib/athrecs/result-claims-api";
import {
  saveMyAthleteRacingName,
  type AthleteAccountData,
} from "@/lib/athrecs/athlete-account-api";
import { unfinishedClaim } from "@/lib/athrecs/claim-resume";

export function ProfileClaimSteps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Profile claim progress" className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
      {["Verify email", "Confirm profile", "Claim received"].map((label, index) => (
        <li
          key={label}
          aria-current={step === index + 1 ? "step" : undefined}
          className={`rounded-lg border p-3 ${step >= index + 1 ? "border-accent/40 bg-accent-soft text-fg" : "border-border text-muted"}`}
        >
          <span className="mr-1 font-semibold">{index + 1}.</span> {label}
          {step > index + 1 ? <span className="sr-only"> — complete</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function ClaimRacingName({ onSaved }: { onSaved?: (account: AthleteAccountData) => void }) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      saveMyAthleteRacingName({ data: { fullName: name, privacyAcknowledged: true } }),
    onSuccess: (account) => {
      queryClient.setQueryData(["my-athlete-account"], account);
      void queryClient.invalidateQueries({ queryKey: ["my-potential-result-matches"] });
      void queryClient.invalidateQueries({ queryKey: ["claimable-result"] });
      onSaved?.(account);
    },
  });
  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <p className="text-sm text-muted">
        Enter the full name you use in race results so we can find your profile. Your email is
        verified; your profile claim still needs this next step.
      </p>
      <label className="block space-y-2 text-sm font-medium">
        <span>Full racing name</span>
        <input
          required
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="For example, Jane Smith"
          className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-fg"
        />
      </label>
      <p className="text-xs text-muted">
        By continuing, you acknowledge our{" "}
        <Link to="/privacy" className="underline">
          privacy notice
        </Link>
        . No date of birth, address or optional profile details are needed.
      </p>
      {save.isError ? (
        <p role="alert" className="text-sm text-red-700">
          {save.error instanceof Error
            ? save.error.message
            : "Your name could not be saved. Please try again."}
        </p>
      ) : null}
      <Button type="submit" disabled={save.isPending || name.trim().split(/\s+/).length < 2}>
        {save.isPending ? "Finding your profile…" : "Continue to my profile claim"}
      </Button>
    </form>
  );
}

export function ProfileClaimGuide({
  account,
  onNameSaved,
}: {
  account: AthleteAccountData;
  onNameSaved: (account: AthleteAccountData) => void;
}) {
  const navigate = useNavigate();
  const [resume, setResume] = useState<number | null>(null);
  useEffect(() => setResume(unfinishedClaim(account.userId)), [account.userId]);
  const invitations = useQuery({
    queryKey: ["my-open-claim-invitations", account.userId],
    queryFn: () => getMyOpenClaimInvitations(),
    retry: false,
    gcTime: 0,
    enabled: account.emailVerified,
  });
  const claims = useQuery({
    queryKey: ["my-result-claims", account.userId],
    queryFn: () => listMyResultClaims(),
    retry: false,
  });
  if (!account.emailVerified) return null;
  const pending = claims.data?.find(
    (claim) => claim.status === "pending" || claim.status === "needs_info",
  );
  const invitation = invitations.data?.[0];
  const resumable =
    resume && !claims.data?.some((claim) => claim.resultId === resume) ? resume : null;
  if (account.claimedProfiles.length && !pending && !invitation && !resumable) return null;
  return (
    <section
      aria-label="Finish your profile claim"
      className="space-y-4 rounded-xl border border-accent/40 bg-surface p-5 shadow-card"
    >
      <ProfileClaimSteps step={pending ? 3 : 2} />
      <h2 className="font-display text-xl font-semibold">
        {pending
          ? pending.status === "needs_info"
            ? "Your claim needs more information"
            : "Claim received — awaiting identity review"
          : "Your account is ready. Finish claiming your athlete profile."}
      </h2>
      {pending ? (
        <>
          <p className="text-sm text-muted">
            Your claim for {pending.athleteName} has been received.{" "}
            {pending.status === "needs_info"
              ? "Open it to read what our team needs."
              : "Our team will check your identity before linking the profile. You do not need to submit it again."}
          </p>
          <Button asChild className="h-auto min-h-11 max-w-full whitespace-normal py-3">
            <Link to="/claim-results" search={{ resultId: pending.resultId }}>
              View my submitted claim
            </Link>
          </Button>
        </>
      ) : invitations.isPending || claims.isPending ? (
        <p role="status" className="text-sm text-muted">
          Checking your next claim step…
        </p>
      ) : invitation ? (
        <>
          <p className="text-sm text-muted">
            We have a suggested profile for {invitation.athleteName}. Check that it is yours, then
            submit your claim. Creating an account does not submit the claim.
          </p>
          <Button asChild className="h-auto min-h-11 max-w-full whitespace-normal py-3">
            <Link
              to="/claim-results"
              search={{ resultId: invitation.resultId, invitation: invitation.token }}
            >
              Continue claiming {invitation.athleteName}
            </Link>
          </Button>
        </>
      ) : resumable ? (
        <>
          <p className="text-sm text-muted">
            You selected a result but have not submitted its profile claim yet. Continue where you
            left off.
          </p>
          <Button asChild className="h-auto min-h-11 max-w-full whitespace-normal py-3">
            <Link to="/claim-results" search={{ resultId: resumable }}>
              Finish my profile claim
            </Link>
          </Button>
        </>
      ) : !account.fullName.trim() ? (
        <ClaimRacingName
          onSaved={(updated) => {
            onNameSaved(updated);
            void navigate({ to: "/athlete-account", search: { section: "potential" } });
          }}
        />
      ) : (
        <>
          <p className="text-sm text-muted">
            Find your profile using your racing name, {account.fullName}. Confirm a result is yours
            and submit the profile claim. Optional account details can wait.
          </p>
          <Button asChild className="h-auto min-h-11 max-w-full whitespace-normal py-3">
            <Link to="/athlete-account" search={{ section: "potential" }}>
              Find my profile to claim
            </Link>
          </Button>
        </>
      )}
      {invitations.isError || claims.isError ? (
        <p role="alert" className="text-sm text-muted">
          We could not check your saved invitations or claims.{" "}
          <button
            className="font-semibold underline"
            onClick={() => {
              void invitations.refetch();
              void claims.refetch();
            }}
          >
            Try again
          </button>{" "}
          or use your original invitation link.
        </p>
      ) : null}
    </section>
  );
}
