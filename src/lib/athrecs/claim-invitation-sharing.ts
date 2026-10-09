import type { StaffContact } from "./athlete-contact";

export function claimInvitationSharing(url: string, contact: StaffContact) {
  const parsed = new URL(url);
  if (
    parsed.origin !== "https://www.athrecs.com" ||
    parsed.pathname !== "/claim-results" ||
    !/^[a-f0-9]{64}$/.test(parsed.searchParams.get("invitation") ?? "") ||
    !/^[1-9]\d*$/.test(parsed.searchParams.get("resultId") ?? "")
  ) {
    throw new Error("Invalid private claim link.");
  }
  const message = `ATHRECS found a profile that may be yours. Check and claim it here: ${url} Sign in with the email address used for your ATHRECS account.`;
  const phone = /^\+[1-9]\d{7,14}$/.test(contact.phone ?? "") ? contact.phone : null;
  const username = /^[a-zA-Z][a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/.test(contact.telegramUsername ?? "")
    ? contact.telegramUsername
    : null;
  const telegramRecipient = username || phone;
  // Viber documents a 200-character limit. Put the intact claim URL first.
  const viberMessage = `${url}\nATHRECS: check and claim your profile.`;
  return {
    message,
    whatsapp: `https://wa.me/${phone?.slice(1) ?? ""}?text=${encodeURIComponent(message)}`,
    telegram: telegramRecipient
      ? `https://t.me/${telegramRecipient}?text=${encodeURIComponent(message)}`
      : `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("ATHRECS: check and claim your profile. Sign in with your ATHRECS email.")}`,
    viber: `viber://forward?text=${encodeURIComponent(viberMessage)}`,
    whatsappRecipient: phone,
    telegramRecipient,
  };
}
