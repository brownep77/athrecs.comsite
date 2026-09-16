# ATHRECS Athlete Account authentication

ATHRECS supports a provider-aware public sign-up chooser while keeping the private staff microsite Google-only.

## Public account methods

| Method                             | Purpose                                                             | Required configuration                                                          |
| ---------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Email and password                 | Universal manual account creation and sign-in                       | Enabled by the application feature flag                                         |
| Email code                         | Passwordless sign-in or registration using a six-digit code         | `RESEND_API_KEY`; verified sender domain                                        |
| Verification and password recovery | Verified manual email, verification resend and one-hour reset links | `RESEND_API_KEY`, `AUTH_EMAIL_FROM`                                             |
| Google                             | Primary fast sign-up                                                | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                      |
| Apple                              | Privacy-friendly identity sign-up                                   | Apple Service ID, Team ID, Key ID and `.p8` private key                         |
| Microsoft                          | Personal, work and school accounts                                  | Microsoft Entra client ID and secret plus ATHRECS email delivery                |
| Facebook                           | Mainstream social login                                             | Meta app client ID and secret plus ATHRECS email delivery                       |
| LinkedIn                           | Professional identity                                               | LinkedIn OpenID Connect client ID and secret plus ATHRECS email delivery        |
| X                                  | Optional later social login                                         | X OAuth 2.0 client ID and secret with `user.email`, plus ATHRECS email delivery |

GitHub and Discord are deliberately excluded from this public rollout. Their audiences and identity signals are less closely aligned with mainstream athlete registration, and each would add another OAuth application, secret and account-linking path to maintain.

Email/password account creation and sign-in remain rendered when transactional email is unavailable. In that limited mode, new manual accounts can sign in immediately, but verification-email resend and password recovery are hidden. The interface tells visitors to keep their password safe. Unverified local accounts cannot save an athlete profile or be automatically linked to another identity provider. The account screen shows the actual email-verification state and offers verification when delivery is available.

Providers whose email may be absent or unverified remain held back until ATHRECS email delivery is configured, so visitors are not offered a provider path that cannot be recovered safely.

## Email security

Passwords are handled by Better Auth and never stored in Athlete Account tables. The minimum password length is 10 characters.

When Resend delivery is configured, manual accounts require email verification before sign-in. Password reset links expire after one hour, and a successful reset revokes existing sessions.

When Resend delivery is not configured, manual accounts can sign in without email verification. Profile saving and automatic account linking still require a verified local email. Result-ownership checks are separate from authentication. Password recovery is unavailable in this mode.

The sender domain in `AUTH_EMAIL_FROM` must be verified by Resend. Use a dedicated address such as `accounts@athrecs.com`.

## Callback rule

Every activated provider must register its exact Better Auth callback path on both ATHRECS public hosts:

```text
https://www.athrecs.com/api/auth/callback/<provider>
https://athrecs.com/api/auth/callback/<provider>
```

RunRecs uses the same account database and OAuth application, but its callbacks are separate exact URLs:

```text
https://www.runrecs.com/api/auth/callback/<provider>
https://runrecs.com/api/auth/callback/<provider>
```

Google additionally retains the staff callback:

```text
https://update.athrecs.com/api/auth/callback/google
```

The exact RunRecs Google redirect URIs are:

```text
https://www.runrecs.com/api/auth/callback/google
https://runrecs.com/api/auth/callback/google
```

In Google Cloud, the shared web client must also list these Authorized JavaScript origins with no path:

```text
https://www.runrecs.com
https://runrecs.com
```

The separate RunRecs Vercel project must use `BETTER_AUTH_URL=https://www.runrecs.com` and copy the same `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as ATHRECS. Redirect the apex host to `www` while retaining both exact Google callbacks.

Provider names in the planned rollout are `google`, `apple`, `microsoft`, `facebook` and `linkedin`. `twitter` can be enabled when its OAuth application and email delivery are configured.

## Athlete platforms and social profiles

Strava, Garmin Connect, COROS, Instagram and TikTok should be connected _after_ an Athlete Account is created rather than used as primary identity providers. Several do not supply a dependable verified email, while ATHRECS needs a recoverable identity before result ownership or private Entry Passport data is attached. They can later be offered as optional linked services for activity imports, public profile links and equipment insights.

## Activation order

1. Keep email/password account creation and sign-in available.
2. Keep Google active and verify its public callbacks.
3. Configure Resend to add email verification and password recovery.
4. Add Apple and Microsoft.
5. Add Facebook and LinkedIn.
6. Consider X only if athlete demand justifies the extra provider.
7. Add linked athlete services separately, with explicit data permissions.

## Enabling the requested login methods

All secrets belong in the production Vercel environment, never in a profile form or source control. Configure the relevant application on both projects if the method should also work on RunRecs. Do not copy production database credentials into previews.

| Method                                                          | Activation                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gmail, Outlook, Hotmail, Yahoo, iCloud or another email address | Email/password accepts any valid address. Enable delivery below to verify the address and complete the profile.                                                                                                                                              |
| Email code, verification and password reset                     | Set `RESEND_API_KEY` with send access. Verify `athrecs.com` in Resend, or set `AUTH_EMAIL_FROM` to an address on another verified sending domain. The default is `ATHRECS Accounts <accounts@athrecs.com>`.                                                  |
| Google                                                          | Preserve the existing `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.                                                                                                                                                                                         |
| Apple                                                           | Register Sign in with Apple for the web; configure `APPLE_CLIENT_ID` (Service ID), `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY` (.p8 content). Register the exact Apple return URLs below and the sending domain for Apple private-relay emails. |
| LinkedIn                                                        | Create a LinkedIn developer application and enable **Sign In with LinkedIn using OpenID Connect**. Set `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`. Email delivery is also required.                                                                   |
| Microsoft                                                       | Register a web application supporting the intended personal/work/school account audience. Set `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET`; `MICROSOFT_TENANT_ID` defaults to `common`. Email delivery is required.                                   |
| Facebook                                                        | Configure a Meta app with Facebook Login; set `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`, register redirect URLs, and finish any required provider review. Email delivery is required.                                                                |
| X                                                               | Configure OAuth 2.0, set `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET`, and ensure email access is permitted. Email delivery is required.                                                                                                                  |

For each activated provider, replace the last path segment with its exact ID (`apple`, `linkedin`, `microsoft`, `facebook` or `twitter`):

```text
https://www.athrecs.com/api/auth/callback/apple
https://athrecs.com/api/auth/callback/apple
https://www.athrecs.com/api/auth/callback/linkedin
https://athrecs.com/api/auth/callback/linkedin
https://www.athrecs.com/api/auth/callback/microsoft
https://athrecs.com/api/auth/callback/microsoft
https://www.athrecs.com/api/auth/callback/facebook
https://athrecs.com/api/auth/callback/facebook
https://www.athrecs.com/api/auth/callback/twitter
https://athrecs.com/api/auth/callback/twitter
```

After setting the production variables, redeploy and test each provider with an account controlled by the owner. Check that sign-in returns to the intended page and that an existing account keeps its athlete ID. Provider redirect generation is tested automatically; live provider approval and actual inbox delivery must be checked after credentials are connected.

Email-only codes use Better Auth’s [Email OTP plugin](https://better-auth.com/docs/plugins/email-otp). Provider setup follows the official [Apple](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/), [LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2) and [Microsoft](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) instructions.
