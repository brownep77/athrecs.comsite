# ATHRECS Athlete Account authentication

ATHRECS supports a provider-aware public sign-up chooser while keeping the private staff microsite Google-only.

## Public account methods

| Method | Purpose | Required configuration |
| --- | --- | --- |
| Email and password | Universal manual account creation and sign-in | Enabled by the application feature flag |
| Verification and password recovery | Verified manual email, verification resend and one-hour reset links | `RESEND_API_KEY`, `AUTH_EMAIL_FROM` |
| Google | Primary fast sign-up | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Apple | Privacy-friendly identity sign-up | Apple Service ID, Team ID, Key ID and `.p8` private key |
| Microsoft | Personal, work and school accounts | Microsoft Entra client ID and secret plus ATHRECS email delivery |
| Facebook | Mainstream social login | Meta app client ID and secret plus ATHRECS email delivery |
| LinkedIn | Professional identity | LinkedIn OpenID Connect client ID and secret plus ATHRECS email delivery |
| X | Optional later social login | X OAuth 2.0 client ID and secret with `user.email`, plus ATHRECS email delivery |

GitHub and Discord are deliberately excluded from this public rollout. Their audiences and identity signals are less closely aligned with mainstream athlete registration, and each would add another OAuth application, secret and account-linking path to maintain.

Email/password account creation and sign-in remain rendered when transactional email is unavailable. In that limited mode, new manual accounts can sign in immediately, but verification-email resend and password recovery are hidden. The interface tells visitors to keep their password safe. Unverified local accounts cannot be automatically linked to another identity provider.

Providers whose email may be absent or unverified remain held back until ATHRECS email delivery is configured, so visitors are not offered a provider path that cannot be recovered safely.

## Email security

Passwords are handled by Better Auth and never stored in Athlete Account tables. The minimum password length is 10 characters.

When Resend delivery is configured, manual accounts require email verification before sign-in. Password reset links expire after one hour, and a successful reset revokes existing sessions.

When Resend delivery is not configured, manual accounts can sign in without email verification. Account linking still requires a verified local email, and result claims remain subject to ATHRECS staff review. Password recovery is unavailable in this mode.

The sender domain in `AUTH_EMAIL_FROM` must be verified by Resend. Use a dedicated address such as `accounts@athrecs.com`.

## Callback rule

Every activated provider must register its exact Better Auth callback path on both public hosts:

```text
https://www.athrecs.com/api/auth/callback/<provider>
https://athrecs.com/api/auth/callback/<provider>
```

Google additionally retains the staff callback:

```text
https://update.athrecs.com/api/auth/callback/google
```

Provider names in the planned rollout are `google`, `apple`, `microsoft`, `facebook` and `linkedin`. `twitter` is available only as a later, separately approved option.

## Athlete platforms and social profiles

Strava, Garmin Connect, COROS, Instagram and TikTok should be connected *after* an Athlete Account is created rather than used as primary identity providers. Several do not supply a dependable verified email, while ATHRECS needs a recoverable identity before result ownership or private Entry Passport data is attached. They can later be offered as optional linked services for activity imports, public profile links and equipment insights.

## Activation order

1. Keep email/password account creation and sign-in available.
2. Keep Google active and verify its public callbacks.
3. Configure Resend to add email verification and password recovery.
4. Add Apple and Microsoft.
5. Add Facebook and LinkedIn.
6. Consider X only if athlete demand justifies the extra provider.
7. Add linked athlete services separately, with explicit data permissions.
