import { z } from "zod";
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
export const CLAIM_INVITATION_FROM = "ATHRECS Support <support@athrecs.com>";
export function claimInvitationMessage(name: string) {
  return `Thanks for joining ATHRECS. We found an athlete profile named ${name} that may be yours. Please check the race shown, then confirm if it belongs to you. You do not need to search again or finish your account details first. Sign in using the email address that received this invitation. Our team will check your identity before linking the profile and its stored results. If this is not you, choose “Not my profile”. The private link expires after seven days. Reply to support@athrecs.com if you need help.`;
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
