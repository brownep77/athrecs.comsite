/** Paul's welcome wording, from the approved Resend template (13 October 2026). */
export const INVITATION_CODE_TTL_SECONDS = 24 * 60 * 60;

export const INVITATION_WELCOME_MESSAGE = `Thanks for joining AthRecs. It’s really nice to have you involved.

As a runner myself, I know how much goes into these results. I’m passionate about preserving everyone’s achievements so you can look back, share them with your family and leave something for future generations to see if you want to.

Too many results have been lost in archives over the years. Every result you add helps us preserve a little piece of sporting history.

To get started:

1. Sign in and claim your athlete profile.
2. Check your results, confirm which are yours and flag anything incorrect.
3. Add any missing results with the race name, date and time where you have them.

The site is still a pilot and I’m running it independently, so I’m super grateful for any feedback. Just reply to this email if anything isn’t clear or you have any suggestions.

Thanks again,

Paul`;

/** Use only a supplied recipient name; never infer it from an email or profile match. */
export function invitationWelcomeMessage(name?: string | null): string {
  const supplied = name?.trim() ?? "";
  const words = supplied.split(/\s+/);
  const first = /^(mr|mrs|ms|miss|mx|dr|prof)\.?$/i.test(words[0]) ? words[1] : words[0];
  const known =
    supplied.length <= 200 &&
    !/^(name not supplied|unknown|athlete|runner|user)$/i.test(supplied) &&
    !/[@<>\r\n]/.test(supplied) &&
    /^[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*$/u.test(first ?? "");
  return `${known ? `Hi ${first},` : "Hi,"}\n\n${INVITATION_WELCOME_MESSAGE}`;
}

export const INVITATION_CODE_INSTRUCTIONS =
  "Your one-time sign-in code is valid for 24 hours and can be used once. Open your private claim link below, choose Sign in, enter this email address and choose “I already have a code”. If it has expired, request a new code there. If you request another code, use the newest one and the expiry shown in that email. Never share your code or private link.";

export function welcomeInvitationStatus(status: string): string {
  return (
    {
      sent: "Welcome email and a fresh 24-hour sign-in code sent from paul@athrecs.com with the existing claim link. Inbox delivery has not been confirmed.",
      sending: "An invitation email is already being sent. Refresh shortly.",
      recent:
        "A code was requested less than a minute ago. Wait a minute before requesting another.",
      limited:
        "Five welcome-code emails have been requested for this invitation today. Try again tomorrow.",
      failed:
        "Welcome email delivery could not be confirmed. Wait a minute before requesting a fresh code. The existing invitation is still available.",
    }[status] ?? status
  );
}
