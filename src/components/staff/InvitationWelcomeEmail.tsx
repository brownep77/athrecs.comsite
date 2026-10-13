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
        <div className="mt-3 space-y-3 rounded-lg bg-[#f4f7f7] p-4 text-sm text-[#17212b]">
          <p>From: {CLAIM_INVITATION_FROM}</p>
          <p>Subject: Welcome to AthRecs — your sign-in code and profile invitation</p>
          <article
            aria-label="Branded welcome email template"
            className="mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-[#d9e2e4] bg-white"
          >
            <header className="border-b-4 border-[#00a88f] px-7 py-6">
              <img
                src="/athrecs-logo.png"
                alt="AthRecs.com"
                width={315}
                height={64}
                className="block h-auto w-full max-w-[315px]"
              />
              <p className="mt-3 text-xs uppercase tracking-widest text-[#52606d]">
                Athlete Account
              </p>
            </header>
            <div className="space-y-5 p-7">
              <h4 className="text-2xl font-bold">Welcome to AthRecs</h4>
              <div className="rounded-lg bg-[#e7f7f3] p-4 text-center">
                <p className="font-medium">Your one-time sign-in code</p>
                <p
                  aria-label="Code generated when sent"
                  className="my-2 text-3xl font-bold tracking-[0.3em]"
                >
                  ••••••
                </p>
                <p className="text-xs text-[#52606d]">
                  Generated when sent · valid for 24 hours · use once
                </p>
              </div>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#52606d]">
                {invitationWelcomeMessage(recipientName)}
              </p>
              <p className="text-[15px] leading-relaxed text-[#52606d]">
                {INVITATION_CODE_INSTRUCTIONS}
              </p>
              <p className="inline-block rounded-lg bg-[#007f70] px-4 py-3 font-bold text-white">
                Sign in and claim my profile
              </p>
              <p className="text-xs text-[#52606d]">
                Your existing private invitation link is included in the email.
              </p>
            </div>
          </article>
          <p className="mx-auto max-w-[560px] text-xs text-[#52606d]">
            Preview only. No email is sent and no code is generated until you choose Send welcome +
            sign-in code.
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
