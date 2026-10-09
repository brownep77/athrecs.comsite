import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StaffContact } from "@/lib/athrecs/athlete-contact";
import { STAFF_SENDER_LABEL } from "@/lib/athrecs/athlete-contact";
import { claimInvitationSharing } from "@/lib/athrecs/claim-invitation-sharing";

export function ClaimInvitationSharing({
  url,
  email,
  contact,
}: {
  url: string;
  email: string;
  contact: StaffContact;
}) {
  const [message, setMessage] = useState("");
  const links = claimInvitationSharing(url, contact);
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
      <p className="text-xs text-muted">
        WhatsApp: {links.whatsappRecipient ?? "choose the athlete in the app"}. Telegram:{" "}
        {links.telegramRecipient ?? "choose the athlete in the app"}. Viber: choose the athlete in
        the app.
      </p>
      <p className="text-xs text-muted">
        Use your {STAFF_SENDER_LABEL} account. Review and send in the app; opening it does not send
        a message or mark it delivered. Only the selected ATHRECS account can claim. If an app does
        not open, copy the invitation message instead.
      </p>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
