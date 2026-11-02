import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StaffContact } from "@/lib/athrecs/athlete-contact";
import { STAFF_SENDER_LABEL } from "@/lib/athrecs/athlete-contact";
import { claimInvitationSharing } from "@/lib/athrecs/claim-invitation-sharing";
import { SOCIAL_LABELS, validateProfileConnection } from "@/lib/athrecs/profile-connections";
import { intercomContactLinks } from "@/lib/athrecs/intercom-contact";
import { IntercomContactDialog } from "./IntercomContactDialog";

export function ClaimInvitationSharing({
  url,
  email,
  userId,
  contact,
  newAthlete = false,
  emailBound = true,
}: {
  url: string;
  email: string;
  userId?: string;
  contact: StaffContact;
  newAthlete?: boolean;
  emailBound?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [intercomChannel, setIntercomChannel] = useState<"email" | "chat" | null>(null);
  const links = claimInvitationSharing(url, contact, newAthlete, emailBound);
  const intercomLinks = intercomContactLinks({ userId, email });
  const canOpenIntercom = Boolean(intercomLinks.account || intercomLinks.email);
  const socialLinks = contact.socialLinks.flatMap((link) => {
    try {
      return [validateProfileConnection(link)];
    } catch {
      return [];
    }
  });
  return (
    <section
      aria-label="Share claim invitation"
      className="space-y-3 rounded-lg border border-border p-3"
    >
      <p className="break-words text-sm font-medium">Private invitation for {email}</p>
      <label className="block text-sm font-medium">
        Private claim link
        <input
          readOnly
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          value={url}
          onFocus={(e) => e.target.select()}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!canOpenIntercom}
          onClick={() => setIntercomChannel("email")}
          aria-haspopup="dialog"
        >
          Email invitation in Intercom
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!canOpenIntercom}
          onClick={() => setIntercomChannel("chat")}
          aria-haspopup="dialog"
        >
          Message invitation in Intercom
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            void navigator.clipboard
              .writeText(links.message)
              .then(() =>
                setMessage("Invitation message copied. Paste it into the athlete’s chat."),
              )
              .catch(() => setMessage("Select and copy the private link above."))
          }
        >
          Copy invitation message
        </Button>
      </div>
      <p className="text-xs text-muted">
        Copy this private invitation into an email or Messenger conversation in Intercom. Review the
        recipient and send there; opening Intercom does not send or mark the invitation delivered.
      </p>
      <p className="text-sm font-medium">Other messaging apps</p>
      <div className="flex flex-wrap gap-2">
        {links.sms ? (
          <a
            href={links.sms}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
          >
            Open SMS invitation
          </a>
        ) : null}
        {(["WhatsApp", "Viber", "Telegram"] as const).map((channel) => (
          <a
            key={channel}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
            href={links[channel.toLowerCase() as "whatsapp" | "viber" | "telegram"]}
            target={channel === "Viber" ? undefined : "_blank"}
            rel="noopener noreferrer"
            onClick={() =>
              setMessage(
                `Opening ${channel}. Check the recipient and send in the app; delivery is not tracked here.`,
              )
            }
          >
            Open {channel} invitation
          </a>
        ))}
      </div>
      {socialLinks.length ? (
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
              onClick={() => {
                void navigator.clipboard
                  .writeText(links.message)
                  .then(() =>
                    setMessage(
                      `Message copied. Open a private conversation on ${SOCIAL_LABELS[link.platform]}, check the recipient and paste it to send.`,
                    ),
                  )
                  .catch(() =>
                    setMessage(
                      "Copy the invitation message above and paste it into a private conversation.",
                    ),
                  );
              }}
            >
              Copy & open {SOCIAL_LABELS[link.platform]}
            </a>
          ))}
        </div>
      ) : null}
      <p className="text-xs text-muted">
        Instagram, Facebook, X and LinkedIn use a copied message: open the saved profile and paste
        into a private conversation. SMS support varies by device; copy the message if it is not
        filled in. You can also paste the invitation into another messaging app.
      </p>
      <p className="text-xs text-muted">
        WhatsApp: {links.whatsappRecipient ?? "choose the athlete in the app"}. Telegram:{" "}
        {links.telegramRecipient ?? "choose the athlete in the app"}. Viber: choose the athlete in
        the app.
      </p>
      <p className="text-xs text-muted">
        For other messaging apps, use your {STAFF_SENDER_LABEL} account. Intercom uses its connected
        sender. Review and send in the app; opening it does not send a message or mark it delivered.{" "}
        {newAthlete
          ? emailBound
            ? "They must sign up or sign in with the invited email address."
            : "Send privately to the intended athlete. They must verify an account; staff check identity before approval."
          : "Only the selected ATHRECS account can claim."}{" "}
        If an app does not open, copy the invitation message instead.
      </p>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
      {intercomChannel && canOpenIntercom ? (
        <IntercomContactDialog
          key={JSON.stringify([userId, email, url])}
          contact={{ userId, email, phone: contact.phone }}
          channel={intercomChannel}
          draft={{ subject: "Is this your ATHRECS athlete profile?", body: links.message }}
          onClose={() => setIntercomChannel(null)}
        />
      ) : null}
    </section>
  );
}
