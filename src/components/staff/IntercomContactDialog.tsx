import { useId, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ATHRECS_INTERCOM_WORKSPACE_ID,
  INTERCOM_CONTACT_CHANNELS,
  intercomContactLinks,
  intercomDraftText,
  type IntercomContactChannel,
} from "@/lib/athrecs/intercom-contact";

export function IntercomContactDialog({
  contact,
  channel,
  onClose,
  draft,
}: {
  contact: {
    userId?: string | null;
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  };
  channel: IntercomContactChannel;
  onClose: () => void;
  draft?: { subject: string; body: string };
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const [returnFocus] = useState(() =>
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  const descriptionId = useId();
  const draftId = useId();
  // Staff contact links remain useful when the public Messenger is switched off.
  const appId = import.meta.env.VITE_INTERCOM_APP_ID?.trim() || ATHRECS_INTERCOM_WORKSPACE_ID;
  const links = intercomContactLinks(contact, appId);
  const channelInfo = INTERCOM_CONTACT_CHANNELS[channel];
  const socialReply = channel === "facebook" || channel === "instagram";
  const draftText = draft ? intercomDraftText(draft) : null;
  const primaryHref = links.account ?? links.email;
  const phone = /^\+[1-9]\d{7,14}$/.test(contact.phone ?? "") ? contact.phone : null;

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied. Paste it in Intercom.`);
    } catch {
      setCopyStatus(`Could not copy ${label.toLowerCase()}. Select and copy it from this window.`);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto"
        aria-describedby={descriptionId}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (returnFocus?.isConnected) returnFocus.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{channelInfo.title}</DialogTitle>
          <p id={descriptionId} className="text-sm leading-6 text-muted">
            {channelInfo.instructions}
          </p>
        </DialogHeader>

        <div className="space-y-1 rounded-lg border border-border bg-elevated p-3 text-sm">
          {contact.name ? <p className="font-semibold">{contact.name}</p> : null}
          {contact.email ? <p className="break-all">{contact.email}</p> : null}
          {phone ? <p>{phone}</p> : null}
          <div className="flex flex-wrap gap-2 pt-2">
            {links.email && contact.email ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void copy(contact.email!.trim(), "Email address")}
              >
                <Copy className="size-3.5" aria-hidden="true" /> Copy email
              </Button>
            ) : null}
            {phone ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void copy(phone, "Phone number")}
              >
                <Copy className="size-3.5" aria-hidden="true" /> Copy phone
              </Button>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-6 text-muted">{channelInfo.availability}</p>

        {draftText !== null ? (
          <div className="space-y-2">
            <label htmlFor={draftId} className="block text-sm font-medium">
              Draft to paste in Intercom
            </label>
            <textarea
              id={draftId}
              readOnly
              rows={7}
              value={draftText}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm"
            />
            <Button type="button" variant="secondary" onClick={() => void copy(draftText, "Draft")}>
              <Copy className="size-4" aria-hidden="true" /> Copy draft
            </Button>
            <p className="text-xs leading-5 text-muted">
              Paste the subject and message into Intercom’s composer. Copying this draft does not
              send it.
            </p>
          </div>
        ) : null}

        {copyStatus ? (
          <p role="status" className="text-sm text-accent">
            {copyStatus}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {primaryHref ? (
            <Button asChild className="h-auto min-h-11 whitespace-normal text-center">
              <a href={primaryHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                {links.account ? "Open athlete in Intercom" : "Find by email in Intercom"}
              </a>
            </Button>
          ) : (
            <p role="alert" className="text-sm">
              An Intercom contact link is unavailable. Check the athlete’s account details.
            </p>
          )}
          {links.account && links.email ? (
            <Button asChild variant="secondary">
              <a href={links.email} target="_blank" rel="noopener noreferrer">
                Find by email
              </a>
            </Button>
          ) : null}
        </div>
        <p className="text-xs leading-5 text-muted">
          Confirm the athlete’s details in Intercom before sending. Email lookup works only when the
          address belongs to one contact.{" "}
          {socialReply
            ? "If the incoming conversation is not on this contact, find it in Intercom Inbox. Social contacts may be separate; creating another contact does not bring the conversation across."
            : "If no contact exists, add the athlete in Intercom first."}
        </p>
        <p className="text-xs leading-5 text-muted">
          Messages and replies sent there stay in Intercom. Opening a contact does not send a
          message or add an entry to the AthRecs message history.
        </p>
      </DialogContent>
    </Dialog>
  );
}
