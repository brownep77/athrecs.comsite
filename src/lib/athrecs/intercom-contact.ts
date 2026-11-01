import { z } from "zod";

/** Public ID of AthRecs' existing US-region workspace; this is not a credential. */
export const ATHRECS_INTERCOM_WORKSPACE_ID = "uyeuotsk";

export type IntercomContactChannel =
  "email" | "chat" | "sms" | "whatsapp" | "facebook" | "instagram";

export const INTERCOM_CONTACT_CHANNELS: Record<
  IntercomContactChannel,
  { title: string; instructions: string; availability: string }
> = {
  email: {
    title: "Email in Intercom",
    instructions: "Open the athlete’s contact, choose New conversation, then Email.",
    availability: "Choose your connected sender and send the email in Intercom.",
  },
  chat: {
    title: "Message in Intercom",
    instructions: "Open the athlete’s contact, choose New conversation, then Chat.",
    availability: "Messenger conversations and replies are managed in Intercom.",
  },
  sms: {
    title: "SMS in Intercom",
    instructions: "Open the athlete’s contact and choose SMS if it is available.",
    availability:
      "SMS must be activated for the recipient’s country, with a valid phone number on their Intercom contact.",
  },
  whatsapp: {
    title: "WhatsApp in Intercom",
    instructions: "Open the athlete’s contact and choose WhatsApp if it is available.",
    availability:
      "Use a connected WhatsApp Business number. Starting a conversation requires an approved template and the athlete’s phone number.",
  },
  facebook: {
    title: "Facebook reply in Intercom",
    instructions: "Open the athlete’s existing Facebook conversation in Intercom to reply.",
    availability:
      "Your Facebook Page must be connected, and the athlete must have messaged it first. Intercom applies the channel’s reply limits.",
  },
  instagram: {
    title: "Instagram reply in Intercom",
    instructions: "Open the athlete’s existing Instagram conversation in Intercom to reply.",
    availability:
      "Your Instagram account must be connected, and the athlete must have messaged it first. Intercom applies the channel’s reply limits.",
  },
};

type IntercomContactIdentity = { userId?: string | null; email?: string | null };

/**
 * Official contact redirects. Account IDs are the same external user IDs sent
 * by the signed-in Messenger. Email is a separate fallback, never a name match.
 * https://www.intercom.com/help/en/articles/8827723-contacts-faqs
 */
export function intercomContactLinks(
  contact: IntercomContactIdentity,
  appId: string = ATHRECS_INTERCOM_WORKSPACE_ID,
): { account: string | null; email: string | null } {
  if (!/^[a-z0-9]{6,12}$/.test(appId)) return { account: null, email: null };
  const href = (key: "user_id" | "email", value: string) => {
    const url = new URL(`https://app.intercom.com/apps/${appId}/users/show`);
    url.search = new URLSearchParams({ [key]: value }).toString();
    return url.toString();
  };
  const userId = contact.userId;
  const validId =
    typeof userId === "string" &&
    userId.length > 0 &&
    userId.length <= 200 &&
    !/[\s\p{Cc}]/u.test(userId);
  const email = typeof contact.email === "string" ? contact.email.trim() : "";
  const validEmail = email.length <= 254 && z.email().safeParse(email).success;
  return {
    account: validId ? href("user_id", userId) : null,
    email: validEmail ? href("email", email) : null,
  };
}

/** A clipboard draft has no delivery or history side effects. */
export function intercomDraftText(draft: { subject: string; body: string }): string {
  return `Subject: ${draft.subject}\n\n${draft.body}`;
}
