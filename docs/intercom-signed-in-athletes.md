# Intercom for signed-in AthRecs accounts

The existing visitor Messenger and the signed-in connection use the same US
workspace, `uyeuotsk`. Signed-in identification is enabled only when the server
has `INTERCOM_SECRET_KEY`. Without it, the existing anonymous chat stays available
and no unsigned account identity is sent.

## Activate the connection

1. In Intercom, open **Settings → Channels → Messenger → Overview → Website**.
   Complete **Signed-in users, visitors & leads → Connect your customer data**.
2. Under **Settings → Data → People**, create the seven custom attributes in the
   table below with the stated types. Intercom requires the definitions to exist
   before the Messenger can populate them. Enable **Require verified updates**
   for these new fields.
3. Obtain the **web Messenger secret key** shown in that setup or under
   **Settings → Workspace → Security → Messenger**. This is the Messenger signing
   secret, not a REST API access token. Keep its value out of chat, source control,
   screenshots and browser application code.
4. In Vercel project **athrecs-comsite**, add `INTERCOM_SECRET_KEY` as a **Secret**
   for **Production**. Keep the existing public `VITE_INTERCOM_APP_ID=uyeuotsk`.
   Do not prefix the signing secret with `VITE_`, and do not enable it in general
   preview environments that could send test accounts to the live workspace.
5. Redeploy the reviewed production commit so the new environment variable is
   present. Test on `https://www.athrecs.com` with the owner's account, then use
   Intercom's **Test installation** and its Messenger installation logs.
6. Confirm the expected account values arrive. Enable **Require verified updates**
   for the standard signed identity fields too, so browser-supplied values cannot
   override them.
7. After successful signed-in testing, enforce **Messenger Security** for web.
   Check visitor chat again. Do not enforce before the server-generated JWTs work.

No account or conversation is created by the server function itself: it returns a
signed token to the authenticated browser, which boots or updates the Messenger.
The signing key never goes to the browser. User tokens are returned with private,
no-store headers and are kept in memory, not local/session storage.

## Signed data

The standard `user_id` is the immutable **AthRecs account ID**, never the athlete
page currently being viewed. `name`, `email` and `created_at` come from that
account. Tokens use HS256, contain `iat` and `exp`, and expire after one hour.

| Attribute                      | Type   | Meaning                                                                                                                                                             |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `athrecs_linked_profile_count` | Number | Number of explicit active account–athlete links.                                                                                                                    |
| `athrecs_profile_status`       | Text   | `linked`, `multiple_linked`, `claim_pending`, or `no_linked_profile`.                                                                                               |
| `athrecs_pending_claim_count`  | Number | Pending or needs-information result-ownership requests. Approval of these requests can establish a profile link. This is not a count of submitted race corrections. |
| `athrecs_linked_result_count`  | Number | Canonical or available source result records on active linked profiles, excluding DNS. This is not a count of verified finishes or personal bests.                  |
| `athrecs_profile_id`           | Text   | Athlete ID when exactly one active profile is linked; otherwise an empty string clears stale context.                                                               |
| `athrecs_profile_url`          | Text   | Actual athlete page URL when exactly one profile is linked; otherwise an empty string.                                                                              |

Multiple linked profiles are represented explicitly. There is no primary-profile
designation in the current data model, so the integration does not choose one.
Claim status and result counts are support context, not proof of athlete identity
or source verification. No birth date, research evidence or race-history rows are
included. Data refreshes every five minutes while the page is open, and after an
overdue tab regains focus; it is not an instant background database synchronisation.

## Suggested Intercom routing

Use a **Users** audience for the signed-in workflow and the signed status field
for its branches. Keep the visitor/leads registration and discovery routes.

| Status              | Suggested choices                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `no_linked_profile` | Find my profile; request an athlete profile; ask for help.                                              |
| `claim_pending`     | Ask about my claim; provide more information; ask for help.                                             |
| `linked`            | Open my profile; report a missing result; correct a result; submit a race or fixture.                   |
| `multiple_linked`   | Open My Athlete Profile; select the profile the enquiry concerns; report missing/corrected information. |

The single-profile URL is available as an attribute for a link button. For multiple
profiles, use `https://www.athrecs.com/my-athlete-profile` and ask which profile the
enquiry concerns. Workflow configuration must be completed in Intercom; deploying
this code does not create or modify Intercom workflows.

Fin can use these attributes in configured Tasks and workflow branches. Live
database answers and submission actions require separately configured Data
connectors and authenticated AthRecs API endpoints. No such connector or automatic
profile publication is included in this first stage.

## Session behaviour and verification

The browser waits for AthRecs session resolution and requests identity without
accepting a client-supplied user ID. It checks the returned ID against the current
account and rejects responses that arrive after logout or an account change.
Genuine visitor-to-member login preserves conversation continuity. Logout and
member-to-member switches shut down the Messenger and clear its cookies, including
parent-domain cookies. A stored opaque account ID is used only as a cleanup hint
across reloads; it is not trusted for identification. Other tabs receive logout
signals. Failed identity checks suspend identified chat and retry without exposing
another account's history.

Run `npm run verify:intercom` for synthetic database/JWT and browser lifecycle
checks. `npm run typecheck` and an Intercom-enabled Vite build cover compilation.
These tests do not establish a successful live Intercom handshake.

For the live check, confirm that the owner is identified with the correct account
and profile context, navigating to another athlete page does not change that
identity, logout removes conversation access, and a separate account/browser has
its own history. Check that anonymous chat and the existing visitor workflow still
work. Do not send a test conversation unless authorised.

## Official references

- [Messenger installation and customer data](https://www.intercom.com/help/en/articles/16946116-new-messenger-install-experience-on-your-website)
- [Messenger JWT authentication](https://www.intercom.com/help/en/articles/10589769-authenticating-users-in-the-messenger-with-json-web-tokens-jwts)
- [JWT migration and payload format](https://www.intercom.com/help/en/articles/10807823-migrating-from-identity-verification-to-messenger-security-with-jwts)
- [JavaScript methods and logout cookie cleanup](https://developers.intercom.com/installing-intercom/web/methods)
- [Protecting signed data attributes](https://www.intercom.com/help/en/articles/11087109-securing-the-data-you-send-via-the-messenger)
