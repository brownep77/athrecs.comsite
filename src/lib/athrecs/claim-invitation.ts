import { z } from "zod";
import { staffContactInput } from "./athlete-contact";
export const invitationToken = z.string().regex(/^[a-f0-9]{64}$/);
export const invitationSearch = z.object({
  userId: z.string().min(1).max(200),
  q: z.string().trim().max(120).default(""),
  athleteId: z.number().int().positive().optional(),
});
export const invitationInput = z.object({
  userId: z.string().min(1).max(200),
  athleteId: z.number().int().positive(),
  matchNote: z.string().trim().min(12).max(2000),
  reviewed: z.literal(true),
});
export const invitationId = z.object({ id: z.string().uuid() });
export const externalInvitationInput = z
  .object({
    athleteId: z.number().int().positive(),
    recipientName: z.string().trim().min(2).max(200),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .refine(
        (value) => !value || z.email().safeParse(value).success,
        "Enter a valid email address.",
      ),
    phone: staffContactInput.shape.phone,
    telegramUsername: staffContactInput.shape.telegramUsername,
    socialLinks: staffContactInput.shape.socialLinks,
    sourceNote: staffContactInput.shape.sourceNote,
    matchNote: z.string().trim().min(12).max(2000),
    reviewed: z.literal(true),
  })
  .refine(
    (value) => value.email || value.phone || value.telegramUsername || value.socialLinks.length,
    "Add an email address, international phone number, Telegram username or social profile.",
  );
export type ExternalInvitationInput = z.infer<typeof externalInvitationInput>;
export const CLAIM_INVITATION_FROM = "ATHRECS Support <support@athrecs.com>";
export function claimInvitationMessage(name: string) {
  return `Thanks for joining ATHRECS. We found an athlete profile named ${name} that may be yours. Please check the race shown, then confirm if it belongs to you. You do not need to search again or finish your account details first. Sign in using the email address that received this invitation. Our team will check your identity before linking the profile and its stored results. If this is not you, choose “Not my profile”. The private link expires after seven days. Reply to support@athrecs.com if you need help.`;
}
export function newAthleteInvitationMessage(name: string, emailBound: boolean) {
  return `You’re invited to claim the ATHRECS athlete profile for ${name}. ATHRECS brings your sporting results together in one place. Open the link to see the selected profile, then create a free account or sign in${emailBound ? " using this email address" : " and verify your email"}. You will return directly to this profile without searching again. Confirm that the race shown is yours and submit your claim. Our team will check your identity before linking the profile and its stored results. If it is not your profile, choose “Not my profile”. The private link expires after seven days. Reply to support@athrecs.com if you need help.`;
}
export const invitationStatusLabel: Record<string, string> = {
  prepared: "Link created — not emailed",
  invited: "Invitation emailed",
  pending: "Claim awaiting review",
  needs_info: "More information needed",
  approved: "Profile claimed",
  rejected: "Claim not approved",
  withdrawn: "Claim withdrawn",
  revoked: "Invitation revoked",
  declined: "Not their profile",
  expired: "Invitation expired",
  failed: "Email needs retry",
  sending: "Email being sent",
  held: "Check email delivery before retrying",
};
export type InvitationSummary = {
  id: string;
  athleteName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  sentAt: string | null;
};
