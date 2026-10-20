import { z } from "zod";

export const messageTarget = z.union([
  z.object({ userId: z.string().trim().min(1).max(200) }).strict(),
  z.object({ athleteNumber: z.string().regex(/^[1-9]\d{0,17}$/) }).strict(),
]);
export type MessageTarget = z.infer<typeof messageTarget>;
export const staffEmailInput = z.object({
  target: messageTarget,
  entryId: z.string().uuid(),
  recipient: z.email().trim().toLowerCase().max(254),
  subject: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((value) => !/[\r\n]/.test(value)),
  body: z.string().trim().min(1).max(20000),
});
export const messageFilters = z.object({
  target: messageTarget,
  direction: z.enum(["all", "sent", "received"]).default("all"),
  page: z.number().int().min(1).max(100000).default(1),
});
export const messageInput = z.object({
  target: messageTarget,
  entryId: z.string().uuid(),
  direction: z.enum(["sent", "received"]),
  channel: z.enum(["email", "whatsapp", "sms", "telegram", "phone", "social", "other"]),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
  contact: z.string().trim().min(1).max(254),
  occurredAt: z.iso
    .datetime()
    .refine(
      (value) => Date.parse(value) <= Date.now() + 60000,
      "Use the date the message was sent or received.",
    ),
});
export const messageChannelLabels = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  telegram: "Telegram",
  phone: "Phone",
  social: "Social",
  other: "Other",
};
export const messageStatusLabels: Record<string, string> = {
  accepted: "Sent to email provider",
  failed: "Send failed",
  unknown: "Delivery unconfirmed",
  recorded: "Recorded by staff",
  received: "Received email",
};

/** Never retain the separate OTP or action URL in correspondence history. */
export function safeEmailMessage(email: { heading: string; message: string; code?: string }) {
  let body = `${email.heading}\n\n${email.message}`;
  if (email.code) body = body.replaceAll(email.code, "[code omitted]");
  body = body.replace(/https?:\/\/[^\s<>]+[?][^\s<>]+/g, "[private link omitted]");
  return `${body.slice(0, 20000)}\n\nSign in codes and action links are omitted from this record.`;
}
