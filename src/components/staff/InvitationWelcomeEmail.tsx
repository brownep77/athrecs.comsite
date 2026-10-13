import { useState } from "react";
import { Button } from "@/components/ui/button";
import { emailStaffWelcomeInvitation } from "@/lib/athrecs/claim-invitations-api";
import { CLAIM_INVITATION_FROM } from "@/lib/athrecs/claim-invitation";
import {
  invitationWelcomeMessage,
  INVITATION_CODE_INSTRUCTIONS,
  welcomeInvitationStatus,
} from "@/lib/athrecs/invitation-welcome";

export function InvitationWelcomeEmail({
  id,
  disabled,
  recipientName,
  onSent,
}: {
  id: string;
  disabled: boolean;
  recipientName?: string | null;
  onSent: () => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function send() {
    setBusy(true);
    setMessage("");
    try {
      const result = await emailStaffWelcomeInvitation({ data: { id } });
      setMessage(welcomeInvitationStatus(result.status));
      await onSent();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The welcome email could not be sent.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Welcome email and sign-in code"
      className="w-full space-y-2 border-t border-border pt-3"
    >
      <details>
        <summary className="cursor-pointer font-medium">Welcome email preview</summary>
        <div className="mt-2 space-y-3 rounded-lg bg-elevated p-3 text-sm">
          <p>From: {CLAIM_INVITATION_FROM}</p>
          <p className="font-medium">
            Welcome to AthRecs — your sign-in code and profile invitation
          </p>
          <p>
            A fresh six-digit code is generated securely when you send. It expires after 24 hours.
          </p>
          <p className="whitespace-pre-line">{invitationWelcomeMessage(recipientName)}</p>
          <p>{INVITATION_CODE_INSTRUCTIONS}</p>
          <p className="font-medium">
            Sign in and claim my profile → this existing private invitation
          </p>
        </div>
      </details>
      <p className="text-xs text-muted">
        One email with Paul’s welcome, a fresh 24-hour code and this invitation’s existing claim
        link.
      </p>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || busy}
        onClick={() => void send()}
      >
        {busy ? "Sending welcome and code…" : "Send welcome + sign-in code"}
      </Button>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
