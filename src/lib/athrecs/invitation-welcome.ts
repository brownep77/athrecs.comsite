/** Paul's welcome wording, from the approved Resend template (13 October 2026). */
export const INVITATION_WELCOME_MESSAGE = `Hi,

Thanks for joining AthRecs. It’s really nice to have you involved.

As a runner myself, I know how much goes into these results. I’m passionate about preserving everyone’s achievements so you can look back, share them with your family and leave something for future generations to see if you want to.

Too many results have been lost in archives over the years. Every result you add helps us preserve a little piece of sporting history.

To get started:

1. Sign in and claim your athlete profile.
2. Check your results, confirm which are yours and flag anything incorrect.
3. Add any missing results with the race name, date and time where you have them.

The site is still a pilot and I’m running it independently, so I’m super grateful for any feedback. Just reply to this email if anything isn’t clear or you have any suggestions.

Thanks again,

Paul`;

export const INVITATION_CODE_INSTRUCTIONS =
  "Your one-time sign-in code expires after five minutes. Open your private claim link below, choose Sign in, enter this email address and choose “I already have a code”. If the code has expired, request a new one there. Never share your code or private link.";

export function welcomeInvitationStatus(status: string): string {
  return (
    {
      sent: "Welcome email and a fresh five-minute sign-in code sent from paul@athrecs.com with the existing claim link. Inbox delivery has not been confirmed.",
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
