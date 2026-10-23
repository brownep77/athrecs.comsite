import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import { getMyMatchingSettings } from "@/lib/athrecs/result-matching-settings-api";
import { getMyProfileSetupStatus, saveMyProfileSetup } from "@/lib/athrecs/profile-setup-api";
import { setupLines } from "@/lib/athrecs/profile-setup";
import type { MatchingSettings } from "@/lib/athrecs/result-matching-settings";
import { getMyOpenClaimInvitations } from "@/lib/athrecs/claim-invitations-api";
import { listMyResultClaims } from "@/lib/athrecs/result-claims-api";
import { unfinishedClaim } from "@/lib/athrecs/claim-resume";

export function ProfileResultsSetup({
  account,
  onSaved,
}: {
  account: AthleteAccountData;
  onSaved?: (account: AthleteAccountData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [resume, setResume] = useState<number | null>(null);
  useEffect(() => setResume(unfinishedClaim(account.userId)), [account.userId]);
  const invitations = useQuery({
    queryKey: ["my-open-claim-invitations", account.userId],
    queryFn: () => getMyOpenClaimInvitations(),
    enabled: account.emailVerified,
    retry: false,
    gcTime: 0,
  });
  const claims = useQuery({
    queryKey: ["my-result-claims", account.userId],
    queryFn: () => listMyResultClaims(),
    enabled: account.emailVerified,
    retry: false,
  });
  const settings = useQuery({
    queryKey: ["my-matching-settings", account.userId],
    queryFn: () => getMyMatchingSettings(),
    enabled: account.emailVerified,
    retry: false,
  });
  const status = useQuery({
    queryKey: ["my-profile-setup-status", account.userId],
    queryFn: () => getMyProfileSetupStatus(),
    enabled: account.emailVerified,
    retry: false,
  });
  if (!account.emailVerified) return null;
  // Invitations and unfinished claims already identify a concrete next step.
  // Keep optional research details out of the way until that claim is complete.
  if (
    invitations.isPending ||
    claims.isPending ||
    invitations.data?.length ||
    claims.data?.some((claim) => claim.status === "pending" || claim.status === "needs_info") ||
    (resume && !claims.data?.some((claim) => claim.resultId === resume))
  )
    return null;
  return (
    <section
      className="space-y-3 rounded-xl border border-accent/40 bg-surface p-5"
      aria-label="Find my results setup"
    >
      <h2 className="font-display text-xl font-semibold">Find more of your results</h2>
      {status.data ? (
        <p role="status" className="text-sm text-muted">
          {status.data.completed
            ? "Our team has checked your profile details."
            : "Your profile is in our review queue. We’ll check your links and look for more results."}{" "}
          You can review and claim any suggested results immediately below.
        </p>
      ) : (
        <p className="text-sm text-muted">
          Tell us the names and clubs you have raced under. Add profile links to help our team find
          more of your history.
        </p>
      )}
      {settings.isPending || status.isPending ? (
        <p role="status">Loading your matching details…</p>
      ) : settings.isError || status.isError ? (
        <p role="alert">
          Your matching details could not load.{" "}
          <button
            className="underline"
            onClick={() => {
              void settings.refetch();
              void status.refetch();
            }}
          >
            Try again
          </button>
        </p>
      ) : editing || (!status.data && !account.claimedProfiles.length && !skipped) ? (
        <SetupForm
          key={account.userId}
          account={account}
          settings={settings.data}
          onSaved={(updated) => {
            setEditing(false);
            if (updated) onSaved?.(updated);
          }}
          onSkip={() => {
            setSkipped(true);
            setEditing(false);
          }}
        />
      ) : (
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Add clubs or profile links
        </Button>
      )}
    </section>
  );
}

function SetupForm({
  account,
  settings,
  onSaved,
  onSkip,
}: {
  account: AthleteAccountData;
  settings: MatchingSettings;
  onSaved: (account?: AthleteAccountData) => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState(account.fullName || account.authName || "");
  const [club, setClub] = useState(account.clubOrTeam);
  const [clubs, setClubs] = useState(
    [
      ...new Set(
        [...(settings.previousClubs ?? []), account.profileDetails?.previousClub ?? ""].filter(
          Boolean,
        ),
      ),
    ].join("\n"),
  );
  const [names, setNames] = useState(account.previousNames.join("\n"));
  const [links, setLinks] = useState(
    [
      ...new Set(
        [account.powerOf10Url, account.worldAthleticsUrl, ...settings.sourceUrls].filter(Boolean),
      ),
    ].join("\n"),
  );
  const [ack, setAck] = useState(account.privacyAcknowledged);
  const client = useQueryClient();
  const navigate = useNavigate();
  const save = useMutation({
    mutationFn: () =>
      saveMyProfileSetup({
        data: {
          fullName: name,
          currentClub: club,
          previousClubs: setupLines(clubs),
          previousNames: setupLines(names),
          sourceUrls: setupLines(links),
          privacyAcknowledged: ack as true,
        },
      }),
    onSuccess: async () => {
      await Promise.all(
        [
          "my-athlete-account",
          "my-matching-settings",
          "my-profile-setup-status",
          "my-potential-result-matches",
          "my-archive-suggestions",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
      // Profile links queue staff research; do not imply an automatic external feed.
      await client.cancelQueries({ queryKey: ["my-external-runner-matches"] });
      client.removeQueries({ queryKey: ["my-external-runner-matches"] });
      const updated =
        client.getQueryData<AthleteAccountData>(["my-athlete-account"]) ??
        client.getQueryData<AthleteAccountData>(["my-athlete-account", account.userId]);
      onSaved(updated?.userId === account.userId ? updated : undefined);
      void navigate({
        to: "/athlete-account",
        search: { section: "potential" },
        hash: "account-section-content",
      });
    },
  });
  const field = "min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg";
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Full racing name</span>
          <input
            className={field}
            autoComplete="name"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Current club or team (optional)</span>
          <input
            className={field}
            maxLength={160}
            value={club}
            onChange={(e) => setClub(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Previous clubs or teams (optional)</span>
          <textarea
            className={field}
            rows={3}
            value={clubs}
            onChange={(e) => setClubs(e.target.value)}
            placeholder="One club per line"
          />
          <span className="block text-xs text-muted">
            Up to ten clubs. These help find older results.
          </span>
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Previous racing names (optional)</span>
          <textarea
            className={field}
            rows={3}
            value={names}
            onChange={(e) => setNames(e.target.value)}
            placeholder="One full name per line"
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm font-medium">
        <span>Your public profile or result links (optional)</span>
        <textarea
          className={field}
          rows={3}
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Paste Power of 10, parkrun or other public profile links, one per line"
        />
        <span className="block text-xs text-muted">
          Up to ten public HTTPS links. Our team will check them; availability of further results
          depends on the source.
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          className="mt-1"
          type="checkbox"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
          required
        />
        <span>
          I acknowledge the{" "}
          <Link to="/privacy" className="underline">
            privacy notice
          </Link>
          . My matching links stay private and are shared with the AthRecs team to help build my
          profile.
        </span>
      </label>
      {save.isError ? (
        <p role="alert" className="text-sm text-red-700">
          {save.error instanceof Error
            ? save.error.message
            : "Details could not be saved. Please try again."}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={save.isPending} type="submit">
          {save.isPending ? "Finding your results…" : "Save and find my results"}
        </Button>
        <Link
          to="/athlete-account"
          search={{ section: "potential" }}
          hash="account-section-content"
          onClick={onSkip}
          className="text-sm underline"
        >
          Review available results now
        </Link>
      </div>
      <p className="text-xs text-muted">
        We’ll notify our team when you save. You can claim matching results straight away while we
        check for more.
      </p>
    </form>
  );
}
