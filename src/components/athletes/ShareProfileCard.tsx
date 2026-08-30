import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Link2, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareProfileButton } from "@/components/athletes/ShareProfileButton";
import {
  getMyProfileShare,
  saveMyProfileShare,
  type AthleteShareSettings,
} from "@/lib/athrecs/athlete-profile-share-api";
import { SITE_URL } from "@/lib/athrecs/seo";

export function ShareProfileCard() {
  const queryClient = useQueryClient();
  const share = useQuery({
    queryKey: ["my-profile-share"],
    queryFn: () => getMyProfileShare(),
    staleTime: 0,
    retry: false,
  });
  const [enabled, setEnabled] = useState(false);
  const [shareBio, setShareBio] = useState(true);
  const [shareResults, setShareResults] = useState(true);
  const [shareClub, setShareClub] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!share.data) return;
    setEnabled(share.data.enabled);
    setShareBio(share.data.shareBio);
    setShareResults(share.data.shareResults);
    setShareClub(share.data.shareClub);
    setShareLocation(share.data.shareLocation);
    setAcknowledged(Boolean(share.data.acknowledgedAt) && share.data.enabled);
  }, [share.data]);

  const save = useMutation({
    mutationFn: () =>
      saveMyProfileShare({
        data: { enabled, shareBio, shareResults, shareClub, shareLocation, acknowledged },
      }),
    onSuccess: (data: AthleteShareSettings) => {
      queryClient.setQueryData(["my-profile-share"], data);
      setMessage(
        data.enabled
          ? "Sharing is on. Anyone with the link can see the fields you selected."
          : "Sharing is off. The public link now returns not found.",
      );
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  if (share.isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading profile sharing…
        </p>
      </section>
    );
  }

  if (share.isError || !share.data) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold text-fg">Share profile</h2>
        <p className="mt-1 text-sm text-muted">Sharing settings could not be loaded.</p>
        <Button className="mt-3" type="button" variant="secondary" size="sm" onClick={() => void share.refetch()}>
          Try again
        </Button>
      </section>
    );
  }

  const data = share.data;
  const publicUrl = `${SITE_URL}${data.shareUrlPath}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="space-y-4 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              {data.enabled ? <Globe className="size-5" aria-hidden="true" /> : <LockKeyhole className="size-5" aria-hidden="true" />}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-subtle">Visibility</p>
              <h2 className="font-display text-xl font-semibold text-fg">Share profile</h2>
            </div>
          </div>
          <Badge variant={data.enabled ? "accent" : "outline"}>
            {data.enabled ? "Link active" : "Private"}
          </Badge>
        </div>

        <p className="max-w-3xl text-sm leading-6 text-muted">
          Your ordinary Athlete Profile stays private until you turn sharing on. The public link is
          unlisted — it is not added to the Athletes directory — and never includes your email,
          date of birth, postcode, photograph or product preferences.
        </p>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-elevated p-4">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => {
              setEnabled(event.target.checked);
              if (!event.target.checked) setAcknowledged(false);
            }}
            className="mt-1 size-4"
          />
          <span>
            <strong className="block text-sm text-fg">Create a shareable profile link</strong>
            <span className="mt-1 block text-xs leading-5 text-muted">
              People with the URL can view the name, club, location, bio and claimed results you
              choose below. You can switch this off at any time.
            </span>
          </span>
        </label>

        {enabled ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <ShareToggle checked={shareBio} label="Include bio" onChange={setShareBio} />
            <ShareToggle checked={shareResults} label="Include claimed results" onChange={setShareResults} />
            <ShareToggle checked={shareClub} label="Include club or team" onChange={setShareClub} />
            <ShareToggle checked={shareLocation} label="Include city and country" onChange={setShareLocation} />
          </div>
        ) : null}

        {enabled ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-1 size-4"
            />
            <span className="text-sm leading-6 text-fg">
              I understand this creates a public, unlisted ATHRECS page that anyone with the link
              can open. Hidden results, photos and private account fields stay off that page.
            </span>
          </label>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-subtle">
            <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
            Withdrawal takes effect immediately.
          </p>
          <Button
            type="button"
            disabled={save.isPending || (enabled && !acknowledged)}
            onClick={() => {
              setMessage(null);
              save.mutate();
            }}
          >
            {save.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {save.isPending ? "Saving…" : "Save sharing"}
          </Button>
        </div>

        {message ? (
          <p className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-accent" role="status">
            {message}
          </p>
        ) : null}
      </div>

      {data.enabled ? (
        <div className="space-y-3 border-t border-border bg-elevated p-5 md:p-6">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-subtle">
            <Link2 className="size-4" aria-hidden="true" />
            Your public link
          </p>
          <p className="break-all font-mono text-sm text-fg">{publicUrl}</p>
          <ShareProfileButton path={data.shareUrlPath} title="My ATHRECS athlete profile" />
        </div>
      ) : null}
    </section>
  );
}

function ShareToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-sm text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4"
      />
      {label}
    </label>
  );
}
