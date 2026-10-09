import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  createStaffExternalInvitation,
  emailStaffClaimInvitation,
  getStaffInvitationProfile,
  revokeStaffClaimInvitation,
} from "@/lib/athrecs/claim-invitations-api";
import {
  CLAIM_INVITATION_FROM,
  externalInvitationInput,
  invitationStatusLabel,
  newAthleteInvitationMessage,
} from "@/lib/athrecs/claim-invitation";
import {
  SOCIAL_LABELS,
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from "@/lib/athrecs/profile-connections";
import { ClaimInvitationSharing } from "./ClaimInvitationSharing";

const inputClass = "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm";
type SavedInvitation = Awaited<ReturnType<typeof createStaffExternalInvitation>>;

export function ExternalProfileInvite({ athleteId, name }: { athleteId: number; name: string }) {
  const [recipientName, setRecipientName] = useState(name);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [social, setSocial] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState<SavedInvitation | null>(null);
  const query = useQuery({
    queryKey: ["staff-invitation-profile", athleteId],
    queryFn: () => getStaffInvitationProfile({ data: { athleteId } }),
    staleTime: 0,
    gcTime: 0,
  });
  const data = {
    athleteId,
    recipientName,
    email,
    phone,
    telegramUsername: telegram,
    socialLinks: SOCIAL_PLATFORMS.filter((platform) => social[platform]?.trim()).map(
      (platform) => ({ platform, url: social[platform]!.trim() }),
    ),
    sourceNote: source,
    matchNote: note,
    reviewed,
  };
  const valid = externalInvitationInput.safeParse(data);
  const blocked = !query.data || query.data.profile.owner || !query.data.profile.resultCount;
  function resetReview() {
    setSaved(null);
    setReviewed(false);
    setMessage("");
  }
  function emailMessage(status: string) {
    return (
      (
        {
          sent: "Invitation sent from support@athrecs.com. Inbox delivery has not been confirmed.",
          failed: "Email could not be confirmed. Retry the same invitation below.",
          sending: "Email is already being sent. Refresh shortly.",
          held: "Email delivery needs checking before retrying; the earlier attempt may have been accepted.",
        } as Record<string, string>
      )[status] ?? status
    );
  }
  async function create(sendEmail: boolean) {
    if (!valid.success || blocked || (sendEmail && !valid.data.email)) return;
    setBusy(true);
    setMessage("");
    try {
      const invitation = await createStaffExternalInvitation({ data: valid.data });
      setSaved(invitation);
      if (sendEmail)
        setMessage(
          emailMessage((await emailStaffClaimInvitation({ data: { id: invitation.id } })).status),
        );
      else
        setMessage(
          "Private invitation ready. Choose a channel below, check the recipient and send in the app.",
        );
      await query.refetch();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      await query.refetch();
    } finally {
      setBusy(false);
    }
  }
  async function historyAction(id: string, revoke: boolean) {
    setBusy(true);
    setMessage("");
    try {
      if (revoke) {
        await revokeStaffClaimInvitation({ data: { id } });
        if (saved?.id === id) setSaved(null);
        setMessage("Invitation revoked.");
      } else setMessage(emailMessage((await emailStaffClaimInvitation({ data: { id } })).status));
      await query.refetch();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Invite an athlete who has not signed up"
      className="space-y-4 rounded-xl border border-accent bg-surface p-4"
    >
      <div>
        <h3 className="text-lg font-semibold">Invite to claim · {name}</h3>
        <p className="mt-1 text-sm text-muted">
          No existing ATHRECS account needed. Their link keeps this profile selected while they sign
          up, then they confirm it and submit a claim.
        </p>
      </div>
      {query.isPending ? (
        <p role="status">Checking profile…</p>
      ) : query.isError ? (
        <p role="alert">
          Could not check the profile.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      ) : query.data ? (
        <>
          <div className="rounded-lg bg-accent-soft p-3 text-sm">
            <strong>{query.data.profile.name}</strong> · {query.data.profile.resultCount} eligible
            stored results
            <ul className="mt-2 space-y-1">
              {query.data.profile.recentResults.map((result, index) => (
                <li key={index}>
                  {result.race} · {result.date} · {result.distance}
                </li>
              ))}
            </ul>
          </div>
          {query.data.profile.owner ? (
            <p role="status">
              This profile is already claimed. Review its ownership before sending another
              invitation.
            </p>
          ) : !query.data.profile.resultCount ? (
            <p role="status">Add a checked result before inviting this athlete to claim.</p>
          ) : (
            <>
              <fieldset disabled={busy} className="space-y-4">
                <legend className="font-semibold">Recipient contact details</legend>
                <p className="text-xs text-muted">
                  Enter the details you have. These are private staff records and are not published
                  on the athlete profile.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="min-w-0 text-sm font-medium">
                    Recipient name
                    <input
                      className={inputClass}
                      value={recipientName}
                      maxLength={200}
                      onChange={(e) => {
                        setRecipientName(e.target.value);
                        resetReview();
                      }}
                    />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Invitation email (optional)
                    <input
                      type="email"
                      className={inputClass}
                      value={email}
                      maxLength={254}
                      placeholder="athlete@example.com"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        resetReview();
                      }}
                    />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Phone for SMS, WhatsApp or Viber
                    <input
                      type="tel"
                      className={inputClass}
                      value={phone}
                      maxLength={40}
                      placeholder="+44…"
                      onChange={(e) => {
                        setPhone(e.target.value);
                        resetReview();
                      }}
                    />
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Telegram username
                    <input
                      className={inputClass}
                      value={telegram}
                      maxLength={33}
                      placeholder="@username"
                      onChange={(e) => {
                        setTelegram(e.target.value);
                        resetReview();
                      }}
                    />
                  </label>
                </div>
                <details className="rounded-lg border border-border p-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Instagram, Facebook, X / Twitter or LinkedIn
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <label key={platform} className="min-w-0 text-sm font-medium">
                        {SOCIAL_LABELS[platform]} profile link
                        <input
                          type="url"
                          className={inputClass}
                          maxLength={2048}
                          placeholder="https://…"
                          value={social[platform] ?? ""}
                          onChange={(e) => {
                            setSocial({ ...social, [platform]: e.target.value });
                            resetReview();
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </details>
                <label className="block text-sm font-medium">
                  Where these contact details came from
                  <input
                    className={inputClass}
                    value={source}
                    maxLength={500}
                    placeholder="For example: supplied by the athlete or known personally"
                    onChange={(e) => {
                      setSource(e.target.value);
                      resetReview();
                    }}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Why this is the intended athlete’s profile
                  <textarea
                    className={inputClass}
                    value={note}
                    maxLength={2000}
                    placeholder="For example: I know the athlete and recognise these races."
                    onChange={(e) => {
                      setNote(e.target.value);
                      resetReview();
                    }}
                  />
                </label>
                <p className="text-sm text-muted">
                  {email.trim()
                    ? "They must sign up or sign in with this email address. The link returns them to this profile."
                    : "Without an email address, send the private link only to the intended athlete. They verify an account; staff then check their identity against this contact before approval."}
                </p>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={reviewed}
                    onChange={(e) => setReviewed(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I checked the contact details and selected profile. Invite this person to claim;
                    do not approve ownership automatically.
                  </span>
                </label>
                <details open className="rounded-lg bg-elevated p-3 text-sm">
                  <summary className="cursor-pointer font-semibold">Invitation preview</summary>
                  <p className="mt-2">From: {CLAIM_INVITATION_FROM}</p>
                  <p className="break-words">
                    To: {email.trim() || recipientName || "Selected contact"}
                  </p>
                  <p className="mt-2">{newAthleteInvitationMessage(name, !!email.trim())}</p>
                  <p className="mt-2 font-medium">
                    Sign up and claim my profile → private invitation link
                  </p>
                </details>
                {reviewed && !valid.success ? (
                  <p role="alert" className="text-sm">
                    {valid.error.issues[0]?.message}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={
                      busy ||
                      blocked ||
                      !valid.success ||
                      !email.trim() ||
                      !query.data.emailAvailable
                    }
                    onClick={() => void create(true)}
                  >
                    Email invitation to claim
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy || blocked || !valid.success}
                    onClick={() => void create(false)}
                  >
                    Create SMS or social invitation
                  </Button>
                </div>
                {!query.data.emailAvailable ? (
                  <p className="text-xs text-muted">
                    Email sending is available on the live ATHRECS staff site.
                  </p>
                ) : null}
              </fieldset>
            </>
          )}
          {saved ? (
            <ClaimInvitationSharing
              url={saved.url}
              email={saved.recipient}
              contact={saved.contact}
              newAthlete
              emailBound={saved.emailBound}
            />
          ) : null}
          {message ? (
            <p role="status" className="break-words text-sm">
              {message}
            </p>
          ) : null}
          {query.data.history.length ? (
            <div className="space-y-2 border-t border-border pt-3">
              <h4 className="font-semibold">Profile invitation history</h4>
              {query.data.history.map((item) => (
                <div
                  key={item.id}
                  className="space-y-2 rounded-lg border border-border p-3 text-sm"
                >
                  <p className="break-words">
                    {item.recipient} ·{" "}
                    <strong>{invitationStatusLabel[item.status] ?? item.status}</strong>
                  </p>
                  <p className="text-xs text-muted">
                    Created {new Date(item.createdAt).toLocaleDateString("en-GB")} · expires{" "}
                    {new Date(item.expiresAt).toLocaleDateString("en-GB")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.canEmail && ["prepared", "failed"].includes(item.status) ? (
                      <Button
                        variant="secondary"
                        disabled={busy || !query.data?.emailAvailable}
                        onClick={() => void historyAction(item.id, false)}
                      >
                        {item.status === "failed" ? "Retry email" : "Send prepared email"}
                      </Button>
                    ) : null}
                    {["prepared", "invited", "failed", "held", "sending", "expired"].includes(
                      item.status,
                    ) ? (
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() => void historyAction(item.id, true)}
                      >
                        Revoke invitation
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
