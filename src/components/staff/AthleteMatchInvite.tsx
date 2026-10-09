import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  findStaffClaimMatches,
  createStaffClaimInvitation,
  emailStaffClaimInvitation,
  revokeStaffClaimInvitation,
} from "@/lib/athrecs/claim-invitations-api";
import {
  CLAIM_INVITATION_FROM,
  claimInvitationMessage,
  invitationStatusLabel,
} from "@/lib/athrecs/claim-invitation";
import type { RegisteredAthlete } from "@/lib/athrecs/registrations.server";

const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg";
export function AthleteMatchInvite({ account }: { account: RegisteredAthlete }) {
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<number | null>(null),
    [note, setNote] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [link, setLink] = useState<{ id: string; url: string } | null>(null);
  const client = useQueryClient();
  const matches = useQuery({
    queryKey: ["staff-claim-matches", account.userId, query],
    queryFn: () => findStaffClaimMatches({ data: { userId: account.userId, q: query } }),
    enabled: open,
    staleTime: 0,
    gcTime: 0,
  });
  const candidate = matches.data?.candidates.find((c) => c.id === selected);
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["staff-claim-matches", account.userId] }),
      client.invalidateQueries({ queryKey: ["staff-registrations"] }),
    ]);
  }
  function deliveryMessage(status: string) {
    return (
      {
        sent: "Invitation sent from support@athrecs.com. Delivery to the inbox has not been confirmed.",
        sending: "An email send is already in progress. Refresh shortly.",
        failed:
          "The email could not be confirmed. Use Retry email; the same invitation is retained.",
        held: "Delivery needs checking before another email is sent. The previous attempt may have been accepted.",
      }[status] ?? status
    );
  }
  async function create(email: boolean) {
    if (!candidate) return;
    setBusy(true);
    setMessage("");
    try {
      const saved = await createStaffClaimInvitation({
        data: { userId: account.userId, athleteId: candidate.id, matchNote: note, reviewed: true },
      });
      setLink(saved);
      if (email) {
        const sent = await emailStaffClaimInvitation({ data: { id: saved.id } });
        setMessage(deliveryMessage(sent.status));
      } else
        setMessage(
          saved.reused
            ? "Existing invitation ready to copy. No additional email was sent."
            : "Private link created. Copy it or open WhatsApp to send it.",
        );
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  async function action(id: string, revoke: boolean) {
    setBusy(true);
    setMessage("");
    try {
      if (revoke) {
        await revokeStaffClaimInvitation({ data: { id } });
        if (link?.id === id) setLink(null);
        setMessage("Invitation revoked. Any submitted claim is reviewed separately.");
      } else {
        const sent = await emailStaffClaimInvitation({ data: { id } });
        setMessage(deliveryMessage(sent.status));
      }
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }
  const phone = account.contact.phone?.replace(/\D/g, "");
  const share = link
    ? `ATHRECS found a profile that may be yours. Please check and claim it here: ${link.url} Sign in with the email address used for your ATHRECS account.`
    : "";
  return (
    <section
      className="mt-4 border-t border-border pt-4"
      aria-label="Profile matching and invitations"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          <strong className="text-fg">Profile matching: </strong>
          {account.invitation
            ? `${invitationStatusLabel[account.invitation.status] ?? account.invitation.status} · ${account.invitation.athleteName}`
            : account.linkedProfiles
              ? "Profile linked"
              : "Not matched or invited"}
        </p>
        <Button
          type="button"
          variant="secondary"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close matching" : "Match & invite"}
        </Button>
      </div>
      {open ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted">
            1. Find the right profile. 2. Check the suggested match. 3. Send a private invitation.
            The athlete confirms and staff approve their identity.
          </p>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search.trim());
              setSelected(null);
              setReviewed(false);
              setLink(null);
            }}
          >
            <label className="min-w-0 flex-1 space-y-1 text-sm font-medium">
              Search existing athlete profiles
              <input
                className={inputClass}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={120}
                placeholder="Full name or exact profile slug"
              />
            </label>
            <Button type="submit" disabled={busy}>
              Find profiles
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setSearch("");
                setQuery("");
                setSelected(null);
                setReviewed(false);
                setLink(null);
                void matches.refetch();
              }}
            >
              Suggested matches
            </Button>
          </form>
          {matches.isPending ? (
            <p role="status">Finding profiles…</p>
          ) : matches.isError ? (
            <p role="alert">
              Matches could not load.{" "}
              <button className="underline" onClick={() => void matches.refetch()}>
                Try again
              </button>
            </p>
          ) : matches.data ? (
            <>
              {!matches.data.hasSavedName ? (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
                  This account has no full name saved. Search for the athlete’s name above; an email
                  address alone does not establish a match.
                </p>
              ) : null}
              {matches.data.moreMatches ? (
                <p className="text-sm text-muted">
                  Showing the first 12 matches. Refine the name or use an exact profile slug.
                </p>
              ) : null}
              <div className="grid gap-3 lg:grid-cols-2">
                {matches.data.candidates.map((c) => (
                  <article
                    key={c.id}
                    className={`rounded-lg border p-3 ${selected === c.id ? "border-accent bg-accent-soft" : "border-border"}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{c.name}</h3>
                        <p className="text-xs text-muted">
                          {[c.clubName, c.city, c.region, c.country].filter(Boolean).join(" · ") ||
                            "Club and location not recorded"}
                        </p>
                        <p className="text-xs text-muted">
                          {c.resultCount} stored results · {c.slug}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busy || !!c.blocked}
                        aria-pressed={selected === c.id}
                        onClick={() => {
                          setSelected(c.id);
                          setReviewed(false);
                          setNote("");
                          setLink(null);
                          setMessage("");
                        }}
                      >
                        Choose profile
                      </Button>
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted">
                      {c.reasons.join(" · ")}. Suggestion only.
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-muted">
                      {c.recentResults.map((r, index) => (
                        <li key={index}>
                          {r.race} · {r.date} · {r.distance}
                        </li>
                      ))}
                    </ul>
                    {c.blocked ? <p className="mt-2 text-sm text-amber-800">{c.blocked}</p> : null}
                  </article>
                ))}
              </div>
              {!matches.data.candidates.length ? (
                <p className="text-sm text-muted">
                  No matching profiles found. Try the full name, a previous name or the profile
                  slug.
                </p>
              ) : null}
              {candidate && !candidate.blocked ? (
                <div className="space-y-3 rounded-xl border border-border p-4">
                  <h3 className="font-semibold">
                    Invite {account.email} to check {candidate.name}
                  </h3>
                  <label className="block space-y-1 text-sm font-medium">
                    Why this may be their profile
                    <textarea
                      className={inputClass}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={2000}
                      rows={2}
                      placeholder="For example: athlete confirmed their club and one of these races."
                    />
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={reviewed}
                      onChange={(e) => setReviewed(e.target.checked)}
                      className="mt-1"
                    />
                    I checked the recipient and selected profile. This is an invitation to confirm,
                    not an ownership approval.
                  </label>
                  <details className="rounded-lg bg-elevated p-3 text-sm" open>
                    <summary className="cursor-pointer font-medium">Email preview</summary>
                    <p className="mt-2">
                      From: {CLAIM_INVITATION_FROM}
                      <br />
                      To: {account.email}
                      <br />
                      Subject: Is this your ATHRECS athlete profile?
                    </p>
                    <p className="mt-2 leading-6">{claimInvitationMessage(candidate.name)}</p>
                    <p className="mt-2 font-medium">
                      Check and claim my profile → private invitation link
                    </p>
                  </details>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={
                        busy || !reviewed || note.trim().length < 12 || !matches.data.emailAvailable
                      }
                      onClick={() => void create(true)}
                    >
                      Email claim invitation
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy || !reviewed || note.trim().length < 12}
                      onClick={() => void create(false)}
                    >
                      Create sharing link
                    </Button>
                  </div>
                  {!matches.data.emailAvailable ? (
                    <p className="text-xs text-muted">
                      Email sending is available on the live ATHRECS dashboard when delivery is
                      configured.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {link ? (
                <div className="space-y-2 rounded-lg border border-border p-3">
                  <label className="block text-sm font-medium">
                    Private claim link
                    <input
                      readOnly
                      className={`${inputClass} mt-1`}
                      value={link.url}
                      onFocus={(e) => e.target.select()}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void navigator.clipboard
                          .writeText(share)
                          .then(() => setMessage("Invitation message copied."))
                          .catch(() => setMessage("Select and copy the private link above."))
                      }
                    >
                      Copy invitation message
                    </Button>
                    {phone ? (
                      <a
                        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
                        href={`https://wa.me/${phone}?text=${encodeURIComponent(share)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open WhatsApp invitation
                      </a>
                    ) : (
                      <span className="text-xs text-muted">
                        Save a phone number in contact details to use WhatsApp.
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    Only this athlete’s account can use the link. Opening WhatsApp does not send it;
                    use your +44 7581 764764 account.
                  </p>
                </div>
              ) : null}
              {matches.data.history.length ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Invitation history</h3>
                  {matches.data.history.map((i) => (
                    <div
                      key={i.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <p>
                          {i.athleteName} ·{" "}
                          <strong>{invitationStatusLabel[i.status] ?? i.status}</strong>
                        </p>
                        <p className="text-xs text-muted">
                          Created{" "}
                          {new Date(i.createdAt).toLocaleString("en-GB", {
                            timeZone: "Europe/London",
                          })}{" "}
                          · Expires{" "}
                          {new Date(i.expiresAt).toLocaleString("en-GB", {
                            timeZone: "Europe/London",
                          })}{" "}
                          (UK)
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["prepared", "failed", "sending"].includes(i.status) ? (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={busy || !matches.data.emailAvailable}
                            onClick={() => void action(i.id, false)}
                          >
                            {i.status === "prepared" ? "Send email" : "Retry email"}
                          </Button>
                        ) : null}
                        {["prepared", "invited", "failed", "sending", "held"].includes(i.status) ? (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => void action(i.id, true)}
                          >
                            Revoke link
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          {message ? (
            <p role="status" className="rounded-lg border border-border p-3 text-sm">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
