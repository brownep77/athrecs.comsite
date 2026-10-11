import { authEmailConfigured, sendAthrecsAuthEmail } from "@/lib/auth/email.server";

export type ClaimEmailStatus =
  "pending" | "needs_info" | "approved" | "rejected" | "withdrawn" | "revoked";

type ClaimEmailContext = {
  claimId: number;
  resultId: number;
  claimantEmail: string;
  athleteName: string;
  eventName: string;
  eventDate: string;
  distanceCode: string;
};

type ClaimReviewEmailContext = ClaimEmailContext & {
  status: Exclude<ClaimEmailStatus, "pending" | "withdrawn">;
  staffNote?: string | null;
};

function origin(value: string | undefined, fallback: string): string {
  const candidate = value?.trim();
  if (!candidate) return fallback;
  try {
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
}

function publicOrigin(): string {
  return origin(process.env.BETTER_AUTH_URL, "https://www.athrecs.com");
}

function staffOrigin(): string {
  const host = process.env.ATHRECS_STAFF_HOST?.trim() || "update.athrecs.com";
  return `https://${host}`;
}

export function staffRecipients(): string[] {
  const raw =
    process.env.ATHRECS_CLAIMS_EMAILS?.trim() || process.env.ATHRECS_STAFF_EMAILS?.trim() || "";
  return [
    ...new Set(
      raw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => /^\S+@\S+\.\S+$/.test(email)),
    ),
  ];
}

function claimSummary(context: ClaimEmailContext): string {
  return `${context.athleteName} — ${context.eventName}, ${context.eventDate}, ${context.distanceCode}`;
}

async function deliver(
  label: string,
  email: Parameters<typeof sendAthrecsAuthEmail>[0],
): Promise<void> {
  if (!authEmailConfigured()) return;
  try {
    await sendAthrecsAuthEmail(email);
  } catch (error) {
    console.error("[claim-email] delivery failed", {
      label,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Confirm receipt to the athlete and alert the private staff review inbox. */
export async function notifyResultClaimSubmitted(
  context: ClaimEmailContext,
  {
    notifyStaff = true,
    notifyAthlete = true,
    selfConfirmed = false,
  }: {
    notifyStaff?: boolean;
    notifyAthlete?: boolean;
    selfConfirmed?: boolean;
  } = {},
): Promise<void> {
  if (!authEmailConfigured()) return;
  const claimUrl = `${publicOrigin()}/claim-results?resultId=${context.resultId}`;
  const reviewUrl = `${staffOrigin()}/admin/result-claims`;
  const summary = claimSummary(context);

  await Promise.all([
    ...(notifyAthlete
      ? [
          deliver("claim-submitted-athlete", {
            to: context.claimantEmail,
            subject: selfConfirmed
              ? "Your ATHRECS profile claim is complete"
              : "ATHRECS received your result claim",
            heading: selfConfirmed
              ? "Your results are now linked"
              : "Your result claim is in review",
            message: selfConfirmed
              ? `You confirmed that ${summary} belongs to you. Your athlete profile and its stored results are now linked. This records your self-confirmation; independent result checks and photo or ID verification are separate.`
              : `We received your claim for ${summary}. This claim needs a staff ownership check before linking the athlete profile. Open your claim to see the reason and any requested information.`,
            actionLabel: "View my claim",
            actionUrl: claimUrl,
          }),
        ]
      : []),
    ...(notifyStaff && !selfConfirmed ? staffRecipients() : []).map((to) =>
      deliver("claim-submitted-staff", {
        to,
        subject: `New ATHRECS result claim #${context.claimId}`,
        heading: "A result claim needs review",
        message: `${context.claimantEmail} submitted claim #${context.claimId} for ${summary}. Evidence remains private in the staff claim queue.`,
        actionLabel: "Review claims",
        actionUrl: reviewUrl,
      }),
    ),
  ]);
}

/** Tell the athlete whenever staff changes the claim decision. */
export async function notifyResultClaimReviewed(context: ClaimReviewEmailContext): Promise<void> {
  if (!authEmailConfigured()) return;
  const claimUrl = `${publicOrigin()}/claim-results?resultId=${context.resultId}`;
  const summary = claimSummary(context);
  const note = context.staffNote?.trim();

  const copy: Record<
    ClaimReviewEmailContext["status"],
    { subject: string; heading: string; message: string; actionLabel: string }
  > = {
    needs_info: {
      subject: "ATHRECS needs more information for your result claim",
      heading: "Please update your result claim",
      message: `ATHRECS needs another verification detail for ${summary}.${note ? ` Staff note: ${note}` : ""}`,
      actionLabel: "Update my claim",
    },
    approved: {
      subject: "Your ATHRECS result claim was approved",
      heading: "Your athlete profile is now linked",
      message: `Your claim for ${summary} has been approved. The athlete profile is now linked to your Athlete Account.${note ? ` Staff note: ${note}` : ""}`,
      actionLabel: "View my claim",
    },
    rejected: {
      subject: "Update on your ATHRECS result claim",
      heading: "Your result claim was not approved",
      message: `ATHRECS could not approve your claim for ${summary}.${note ? ` Staff note: ${note}` : " You may correct the evidence and submit again."}`,
      actionLabel: "Review my claim",
    },
    revoked: {
      subject: "ATHRECS athlete profile ownership was revoked",
      heading: "Your athlete profile link was removed",
      message: `The ownership link created from your claim for ${summary} has been revoked.${note ? ` Staff note: ${note}` : ""}`,
      actionLabel: "View my claims",
    },
  };

  const selected = copy[context.status];
  await deliver(`claim-${context.status}-athlete`, {
    to: context.claimantEmail,
    subject: selected.subject,
    heading: selected.heading,
    message: selected.message,
    actionLabel: selected.actionLabel,
    actionUrl: claimUrl,
  });
}

export async function notifyResultClaimWithdrawn(context: ClaimEmailContext): Promise<void> {
  if (!authEmailConfigured()) return;
  await deliver("claim-withdrawn-athlete", {
    to: context.claimantEmail,
    subject: "Your ATHRECS result claim was withdrawn",
    heading: "Result claim withdrawn",
    message: `Your claim for ${claimSummary(context)} has been withdrawn. You can submit it again later from the athlete profile.`,
    actionLabel: "View my claims",
    actionUrl: `${publicOrigin()}/claim-results`,
  });
}

/** One athlete receipt for the whole explicitly reviewed snapshot. */
export async function notifyProfileResultsConfirmed(context: {
  id: string;
  resultId: number;
  claimantEmail: string;
  athleteName: string;
  included: number;
  excluded: number;
  added: number;
  status: ClaimEmailStatus;
}) {
  if (!authEmailConfigured()) return;
  await sendAthrecsAuthEmail(
    {
      to: context.claimantEmail,
      subject: "Your ATHRECS profile and results confirmation",
      heading:
        context.status === "approved"
          ? "Your profile claim is complete"
          : "Your results review is saved",
      message: `${context.athleteName}: you confirmed ${context.included} results, removed ${context.excluded} from your selection and submitted ${context.added} missing results for review. ${context.status === "approved" ? "Your profile is linked to your account." : "Your profile claim is awaiting an ownership check. You do not need to claim each result separately."} Your declaration is separate from independent result verification and photo or ID checks. Newly submitted results remain unverified until checked. This is one summary for your whole confirmation.`,
      actionLabel: "View my profile claim",
      actionUrl: `${publicOrigin()}/claim-results?resultId=${context.resultId}`,
    },
    { idempotencyKey: `profile-results-confirmation/${context.id}` },
  );
}
