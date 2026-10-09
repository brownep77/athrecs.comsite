import { z } from "zod";
import {
  SOCIAL_PLATFORMS,
  validateProfileConnection,
  type ProfileConnection,
} from "./profile-connections";

export const STAFF_SENDER_PHONE = "+447581764764";
export const STAFF_SENDER_LABEL = "+44 7581 764764";

export const staffContactInput = z.object({
  userId: z.string().trim().min(1).max(200),
  phone: z
    .string()
    .max(40)
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .refine(
      (value) => !value || /^\+[1-9]\d{7,14}$/.test(value),
      "Use an international phone number starting with +, such as +44.",
    ),
  telegramUsername: z
    .string()
    .trim()
    .max(33)
    .transform((value) => value.replace(/^@/, ""))
    .refine(
      (value) => !value || /^[a-zA-Z][a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/.test(value),
      "Enter a Telegram username, without a link.",
    ),
  socialLinks: z
    .array(z.object({ platform: z.enum(SOCIAL_PLATFORMS), url: z.string().max(2048) }))
    .max(4)
    .transform((links) =>
      links.map((link) => validateProfileConnection({ ...link, sharePublicly: false })),
    )
    .refine(
      (links) => new Set(links.map((link) => link.platform)).size === links.length,
      "Use one link per social network.",
    ),
  sourceNote: z.string().trim().min(3, "Record where these contact details came from.").max(500),
});

export type StaffContact = {
  phone: string | null;
  telegramUsername: string | null;
  socialLinks: ProfileConnection[];
  sourceNote: string;
};

export function contactLinks(email: string, contact: StaffContact) {
  const phone = /^\+[1-9]\d{7,14}$/.test(contact.phone ?? "") ? contact.phone : null;
  const username = /^[a-zA-Z][a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/.test(contact.telegramUsername ?? "")
    ? contact.telegramUsername
    : null;
  return {
    email: z.email().safeParse(email).success ? `mailto:${encodeURIComponent(email)}` : null,
    sms: phone ? `sms:${phone}` : null,
    whatsapp: phone ? `https://wa.me/${phone.slice(1)}` : null,
    telegram: username ? `https://t.me/${username}` : phone ? `https://t.me/${phone}` : null,
  };
}
