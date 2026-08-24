# ATHRECS Athlete Account authentication

ATHRECS supports a provider-aware public sign-up chooser while keeping the private staff microsite Google-only.

## Public account methods

| Method | Purpose | Required configuration |
| --- | --- | --- |
| Email and password | Universal manual sign-up, verified email and recovery | `RESEND_API_KEY`, `AUTH_EMAIL_FROM` |
| Google | Primary fast sign-up | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Apple | Privacy-friendly identity sign-up | Apple Service ID, Team ID, Key ID and `.p8` private key |
| Microsoft | Personal, work and school accounts | Microsoft Entra client ID and secret |
| Facebook | Mainstream social login | Meta app client ID and secret |
| LinkedIn | Professional identity | LinkedIn OpenID Connect client ID and secret |
| X | Optional later social login | X OAuth 2.0 client ID and secret with `user.email` |

GitHub and Discord are deliberately excluded from this public rollout. Their audiences and identity signals are less closely aligned with mainstream athlete registration, and each would add another OAuth application, secret and account-linking path to maintain.

A method is not rendered until every required credential is present. Providers whose email may be absent or unverified are also held back until ATHRECS email delivery is configured, so visitors are never offered an account path they cannot verify or recover.

## Email security

Manual accounts require email verification before sign-in. Passwords are handled by Better Auth and never stored in Athlete Account tables. Password reset links expire after one hour, and a successful reset revokes existing sessions.

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

1. Keep Google active and verify its public callbacks.
2. Configure Resend and activate manual email/password accounts.
3. Add Apple and Microsoft.
4. Add Facebook and LinkedIn.
5. Consider X only if athlete demand justifies the extra provider.
6. Add linked athlete services separately, with explicit data permissions.
