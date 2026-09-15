import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Link2, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMyProfileConnections,
  saveMyProfileConnection,
  removeMyProfileConnection,
} from "@/lib/athrecs/profile-connections-api";
import {
  SOCIAL_LABELS,
  SOCIAL_PLATFORMS,
  type ProfileConnection,
  type SocialPlatform,
} from "@/lib/athrecs/profile-connections";
import type { AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import { AthleteId } from "./AthleteId";

export function ProfileConnectionsPanel({ account }: { account: AthleteAccountData }) {
  const links = useQuery({
    queryKey: ["my-profile-connections"],
    queryFn: () => getMyProfileConnections(),
  });
  const sourceLinks = [
    { label: "World Athletics", url: account.worldAthleticsUrl },
    { label: "Power of 10", url: account.powerOf10Url },
    {
      label: "parkrun",
      url: /^A?\d+$/i.test(account.parkrunId)
        ? `https://www.parkrun.org.uk/parkrunner/${account.parkrunId.replace(/^a/i, "")}/`
        : "",
    },
  ].filter((item) => item.url);
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl font-semibold">Your athlete identity</h2>
        <p className="mt-2 text-sm text-muted">
          Names and source profiles help bring your results into this account.
        </p>
        <AthleteId number={account.athleteNumber} className="mt-3" />
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ...new Set([
              account.fullName,
              ...account.previousNames,
              ...account.claimedProfiles.map((p) => p.athleteName),
            ]),
          ]
            .filter(Boolean)
            .map((name) => (
              <span key={name} className="rounded-full bg-elevated px-3 py-1.5 text-sm">
                {name}
              </span>
            ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {sourceLinks.map((source) => (
            <a
              key={source.label}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
            >
              {source.label}
              <ExternalLink className="size-4" />
            </a>
          ))}
        </div>
        {account.athleticsUrn ? (
          <p className="mt-3 text-sm text-muted">Athletics membership: {account.athleticsUrn}</p>
        ) : null}
        <Button asChild variant="secondary" className="mt-4">
          <Link to="/athlete-account">Edit names and result sources</Link>
        </Button>
      </section>
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="border-b border-border p-5">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Link2 className="size-5 text-accent" />
            Social profiles
          </h2>
          <p className="mt-2 text-sm text-muted">
            Add your profile links. These links do not import posts or verify race results. Choose
            which links appear on your shared profile.
          </p>
        </div>
        {links.isPending ? (
          <p className="p-5 text-sm text-muted">Loading social links…</p>
        ) : links.isError ? (
          <p className="p-5 text-sm text-red-700" role="alert">
            Social links could not be loaded. Please try again.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {SOCIAL_PLATFORMS.map((platform) => (
              <ConnectionRow
                key={`${platform}-${links.data?.find((link) => link.platform === platform)?.url ?? ""}-${links.data?.find((link) => link.platform === platform)?.sharePublicly ?? false}`}
                platform={platform}
                connection={links.data?.find((link) => link.platform === platform)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ConnectionRow({
  platform,
  connection,
}: {
  platform: SocialPlatform;
  connection?: ProfileConnection;
}) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState(connection?.url ?? "");
  const [sharePublicly, setSharePublicly] = useState(connection?.sharePublicly ?? false);
  const [message, setMessage] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["my-profile-connections"] });
  const save = useMutation({
    mutationFn: () => saveMyProfileConnection({ data: { platform, url, sharePublicly } }),
    onSuccess: async () => {
      setMessage("Link saved.");
      await refresh();
    },
    onError: (error) => setMessage(error.message),
  });
  const remove = useMutation({
    mutationFn: () => removeMyProfileConnection({ data: { platform } }),
    onSuccess: async () => {
      setUrl("");
      setSharePublicly(false);
      setMessage("Link removed.");
      await refresh();
    },
    onError: (error) => setMessage(error.message),
  });
  const busy = save.isPending || remove.isPending;
  return (
    <form
      className="p-5"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <label htmlFor={`social-${platform}`} className="text-sm font-semibold">
        {SOCIAL_LABELS[platform]}
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id={`social-${platform}`}
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…"
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 text-sm"
        />
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save
        </Button>
        {connection ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => remove.mutate()}
            aria-label={`Remove ${SOCIAL_LABELS[platform]} link`}
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={sharePublicly}
          onChange={(event) => setSharePublicly(event.target.checked)}
        />
        Show on my shared profile when sharing is enabled
      </label>
      {message ? (
        <p role="status" className="mt-2 text-sm text-accent">
          {message}
        </p>
      ) : null}
    </form>
  );
}
