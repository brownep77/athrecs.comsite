import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { RegisteredAthlete } from "@/lib/athrecs/registrations.server";
import { contactLinks } from "@/lib/athrecs/athlete-contact";
import type { IntercomContactChannel } from "@/lib/athrecs/intercom-contact";
import { saveStaffAthleteContact } from "@/lib/athrecs/athlete-contact-api";
import { IntercomContactDialog } from "./IntercomContactDialog";
import {
  SOCIAL_PLATFORMS,
  SOCIAL_LABELS,
  validateProfileConnection,
} from "@/lib/athrecs/profile-connections";

const fieldClass = "w-full rounded border border-border bg-surface px-3 py-2 text-sm";

export function AthleteContactActions({ account }: { account: RegisteredAthlete }) {
  const [editing, setEditing] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [intercomChannel, setIntercomChannel] = useState<IntercomContactChannel | null>(null);
  const links = contactLinks(account.email, account.contact);
  const social = SOCIAL_PLATFORMS.flatMap((platform) => {
    const value =
      account.contact.socialLinks.find((link) => link.platform === platform) ??
      account.profileConnections.find((link) => link.platform === platform);
    if (!value) return [];
    try {
      return [validateProfileConnection(value)];
    } catch {
      return [];
    }
  });
  return (
    <div className="mt-4 space-y-3 border-t border-border pt-3">
      <div className="flex flex-wrap gap-2" aria-label={`Contact ${account.name}`}>
        <Button
          type="button"
          disabled={!links.email}
          onClick={() => setIntercomChannel("email")}
          aria-haspopup="dialog"
        >
          Email in Intercom
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIntercomChannel("chat")}
          aria-haspopup="dialog"
        >
          Message in Intercom
        </Button>
        {(["sms", "whatsapp"] as const).map((channel) => (
          <Button
            key={channel}
            type="button"
            variant="secondary"
            disabled={!links[channel]}
            title={
              links[channel]
                ? "Available channels are shown in Intercom"
                : "Add the athlete’s phone number first"
            }
            onClick={() => setIntercomChannel(channel)}
            aria-haspopup="dialog"
          >
            {channel === "sms" ? "SMS" : "WhatsApp"} in Intercom
          </Button>
        ))}
        {links.telegram ? (
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            Telegram app
          </a>
        ) : (
          <Button variant="secondary" disabled title="Add the athlete’s Telegram contact first">
            Telegram app
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={!links.sms}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(account.contact.phone!);
              setCopyStatus("Number copied. Paste it into Viber to find the athlete.");
            } catch {
              setCopyStatus(`Copy this number into Viber: ${account.contact.phone}`);
            }
          }}
        >
          Viber: copy number
        </Button>
        {social.map((link) => (
          <span key={link.platform} className="inline-flex flex-wrap gap-2">
            {link.platform === "facebook" || link.platform === "instagram" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIntercomChannel(link.platform as "facebook" | "instagram")}
                aria-haspopup="dialog"
                title="Reply to an existing conversation on your connected channel"
              >
                {SOCIAL_LABELS[link.platform]} reply in Intercom
              </Button>
            ) : null}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              View {SOCIAL_LABELS[link.platform]} profile
            </a>
          </span>
        ))}
        <Button type="button" variant="secondary" onClick={() => setEditing(!editing)}>
          {editing ? "Close contact details" : "Edit contact details"}
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted">
        Compose and send in Intercom. SMS, WhatsApp and social replies depend on your connected
        channels and the athlete’s existing contact or conversation.
      </p>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">Other contact apps</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["email", "Email in mail app"],
              ["sms", "SMS in phone app"],
              ["whatsapp", "WhatsApp app"],
            ] as const
          ).map(([channel, label]) =>
            links[channel] ? (
              <a
                key={channel}
                href={links[channel]}
                target={channel === "whatsapp" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 py-2 font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                {label}
              </a>
            ) : null,
          )}
        </div>
      </details>
      <p className="text-xs text-muted">
        Marketing consent: {account.marketingConsent ? "granted" : "not granted"}.{" "}
        {account.contact.phone ? `Phone: ${account.contact.phone}. ` : "No phone supplied. "}
        {!social.length ? "No social links supplied." : ""}
      </p>
      {copyStatus ? (
        <p role="status" className="text-sm">
          {copyStatus}
        </p>
      ) : null}
      {editing ? <ContactEditor account={account} onSaved={() => setEditing(false)} /> : null}
      {intercomChannel ? (
        <IntercomContactDialog
          channel={intercomChannel}
          contact={{
            userId: account.userId,
            email: account.email,
            name: account.name,
            phone: account.contact.phone,
          }}
          onClose={() => setIntercomChannel(null)}
        />
      ) : null}
    </div>
  );
}

function ContactEditor({ account, onSaved }: { account: RegisteredAthlete; onSaved: () => void }) {
  const [phone, setPhone] = useState(account.contact.phone ?? "");
  const [telegramUsername, setTelegram] = useState(account.contact.telegramUsername ?? "");
  const [sourceNote, setSource] = useState(account.contact.sourceNote);
  const [social, setSocial] = useState(
    Object.fromEntries(
      SOCIAL_PLATFORMS.map((platform) => [
        platform,
        account.contact.socialLinks.find((link) => link.platform === platform)?.url ?? "",
      ]),
    ),
  );
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      saveStaffAthleteContact({
        data: {
          userId: account.userId,
          phone,
          telegramUsername,
          sourceNote,
          socialLinks: SOCIAL_PLATFORMS.filter((platform) => social[platform].trim()).map(
            (platform) => ({ platform, url: social[platform] }),
          ),
        },
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["staff-registrations"] });
      await client.invalidateQueries({ queryKey: ["directory-invitation-accounts"] });
      onSaved();
    },
  });
  return (
    <form
      className="grid gap-3 rounded-lg bg-bg p-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <p className="text-sm text-muted sm:col-span-2">
        Private staff contact details. Use details supplied or confirmed by the athlete. Leaving a
        field blank removes the staff-saved value; athlete-supplied social links remain available.
      </p>
      <label className="text-sm">
        Phone (international format)
        <input
          type="tel"
          className={fieldClass}
          value={phone}
          maxLength={40}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+44…"
        />
      </label>
      <label className="text-sm">
        Telegram username (optional)
        <input
          className={fieldClass}
          value={telegramUsername}
          maxLength={33}
          onChange={(event) => setTelegram(event.target.value)}
          placeholder="@username"
        />
      </label>
      {SOCIAL_PLATFORMS.map((platform) => (
        <label key={platform} className="text-sm">
          {SOCIAL_LABELS[platform]} profile URL
          <input
            type="url"
            className={fieldClass}
            value={social[platform]}
            maxLength={2048}
            onChange={(event) => setSocial({ ...social, [platform]: event.target.value })}
          />
        </label>
      ))}
      <label className="text-sm sm:col-span-2">
        Contact details source
        <input
          required
          minLength={3}
          maxLength={500}
          className={fieldClass}
          value={sourceNote}
          onChange={(event) => setSource(event.target.value)}
          placeholder="For example: athlete confirmed by email on 9 October"
        />
      </label>
      {save.isError ? (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
          {save.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save private contact details"}
      </Button>
    </form>
  );
}
