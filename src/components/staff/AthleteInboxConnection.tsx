import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  connectStaffAthleteInbox,
  disconnectStaffAthleteInbox,
  getAthleteInboxStatus,
  syncStaffAthleteInbox,
} from "@/lib/athrecs/athlete-inbox-api";

export function AthleteInboxConnection() {
  const [password, setPassword] = useState("");
  const [includeRecent, setIncludeRecent] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [notice, setNotice] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["staff-inbox-status"],
    queryFn: () => getAthleteInboxStatus(),
    refetchInterval: 30000,
    gcTime: 0,
  });
  const refresh = async () => {
    await query.refetch();
    await queryClient.invalidateQueries({ queryKey: ["staff-athlete-messages"] });
  };
  const connect = useMutation({
    mutationFn: (data: { password: string; includeRecent: boolean }) =>
      connectStaffAthleteInbox({ data }),
    gcTime: 0,
    onSettled: (): void => {
      connect.reset();
    },
    onSuccess: async () => {
      setPassword("");
      setReconnecting(false);
      setNotice(
        "Inbox connected. Athlete replies will sync every five minutes. You can also use Sync now.",
      );
      await refresh();
    },
    onError: () => {
      setPassword("");
      setNotice(
        "Could not connect. Check the password for paul@athrecs.com and that IMAP access is enabled.",
      );
    },
  });
  const sync = useMutation({
    mutationFn: () => syncStaffAthleteInbox(),
    onSuccess: async (r) => {
      setNotice(
        r.skipped
          ? "No sync started. Another sync may already be running."
          : `${r.imported} new replies added.`,
      );
      await refresh();
    },
    onError: () => setNotice("Could not sync. Try again or reconnect the mailbox."),
  });
  const disconnect = useMutation({
    mutationFn: () => disconnectStaffAthleteInbox(),
    onSuccess: async () => {
      setNotice("Inbox disconnected. Saved athlete messages are kept.");
      await refresh();
    },
    onError: () => setNotice("Could not disconnect. Please try again."),
  });
  const busy = connect.isPending || sync.isPending || disconnect.isPending;
  const state = query.isError ? undefined : query.data;
  return (
    <section
      className="max-w-2xl space-y-5 rounded-xl border border-border bg-surface p-5"
      aria-label="Email inbox connection"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold">Email replies</h1>
        <p className="mt-2 text-sm text-muted">
          Connect paul@athrecs.com so replies appear under Received in each athlete’s Messages.
        </p>
      </div>
      {query.isPending ? <p role="status">Checking inbox connection…</p> : null}
      {query.isError ? (
        <p role="alert">
          Connection details could not load.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      ) : null}
      {state?.connected ? (
        <div className="space-y-3">
          <p className="font-semibold text-accent">paul@athrecs.com is connected</p>
          <p className="text-sm text-muted">
            {state.lastSyncedAt
              ? `Last checked ${new Date(state.lastSyncedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}.`
              : "Waiting for the first sync."}{" "}
            {state.imported} replies imported.
          </p>
          {state.lastError ? (
            <p role="alert" className="text-sm">
              {state.lastError}
            </p>
          ) : null}
          {state.ambiguous ? (
            <p className="text-sm text-muted">
              Some emails matched more than one athlete and were left in your inbox. Use Record a
              message on the correct athlete to add them.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => sync.mutate()}>
              {sync.isPending ? "Syncing…" : "Sync now"}
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setReconnecting(!reconnecting)}
            >
              Reconnect
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => disconnect.mutate()}>
              Disconnect inbox
            </Button>
          </div>
        </div>
      ) : null}
      {state && (!state.connected || reconnecting) ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setNotice("");
            connect.mutate({ password, includeRecent });
            setPassword("");
          }}
        >
          <p className="text-sm text-muted">
            Use the Namecheap Private Email password or app password for paul@athrecs.com. It is
            encrypted before it is saved.
          </p>
          <label className="block space-y-1 text-sm font-medium">
            <span>Mailbox password</span>
            <input
              type="password"
              name="mailbox-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={500}
              disabled={busy || !state.ready}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeRecent}
              onChange={(e) => setIncludeRecent(e.target.checked)}
              disabled={busy}
              className="mt-1"
            />
            <span>Also check the past 30 days for athlete replies</span>
          </label>
          {!state.ready ? (
            <p role="alert">Secure inbox setup is not available yet. Please try again shortly.</p>
          ) : null}
          <Button type="submit" disabled={busy || !state.ready || !password}>
            {connect.isPending ? "Connecting…" : "Connect inbox"}
          </Button>
        </form>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm">
          {notice}
        </p>
      ) : null}
      <p className="text-sm text-muted">
        Replies are matched by email address to a verified athlete account or an athlete you have
        emailed through AthRecs. Names alone are never used. Your original emails stay in your inbox
        and keep their unread status. Attachments remain in email.
      </p>
    </section>
  );
}
