import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { RegisteredAthlete } from "@/lib/athrecs/registrations.server";
import { contactLinks } from "@/lib/athrecs/athlete-contact";
import { saveStaffAthleteContact } from "@/lib/athrecs/athlete-contact-api";
import {
  SOCIAL_PLATFORMS,
  SOCIAL_LABELS,
  validateProfileConnection,
} from "@/lib/athrecs/profile-connections";

const fieldClass = "w-full rounded border border-border bg-surface px-3 py-2 text-sm";

export function AthleteContactActions({ account }: { account: RegisteredAthlete }) {
  const [editing, setEditing] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
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
        {Object.entries(links).map(([channel, href]) => {
          const label = { email: "Email", sms: "SMS", whatsapp: "WhatsApp", telegram: "Telegram" }[
            channel
          ];
          return href ? (
            <a
              key={channel}
              href={href}
              target={channel === "whatsapp" || channel === "telegram" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
            >
              {label}
            </a>
          ) : (
            <Button
              key={channel}
              variant="secondary"
              disabled
              title="Add the athlete’s contact details first"
            >
              {label}
            </Button>
          );
        })}
        <Button
          variant="secondary"
          disabled={!account.contact.phone}
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
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
          >
            {SOCIAL_LABELS[link.platform]}
          </a>
        ))}
        <Button variant="secondary" onClick={() => setEditing(!editing)}>
          {editing ? "Close contact details" : "Edit contact details"}
        </Button>
      </div>
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
