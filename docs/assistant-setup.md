# AthRecs website assistant

The custom chat uses the OpenAI Responses API and the site's existing Postgres
database. It guides visitors to account creation, athlete search, results and club
registration. It does not search individual records or modify accounts. The UI
supports English, French, German, Spanish, Italian, Dutch, Polish and Portuguese;
visitors can also request another reply language in their message.

## Enable using the existing Vercel account (no copied OpenAI key)

Set `ATHRECS_ASSISTANT_PROVIDER=vercel`. Vercel injects and refreshes its
`VERCEL_OIDC_TOKEN`; requests go to the Vercel AI Gateway Responses endpoint with
the verified model ID `openai/gpt-6-luna`. Usage is charged to the Vercel team's AI
Gateway credits. A funded/verified Gateway account is still required.

Create a random server-only `ATHRECS_ASSISTANT_RATE_LIMIT_SECRET` as a Sensitive
environment variable so token rotation does not reset network rate limits. Keep
the existing persistent `DATABASE_URL` and enable `ATHRECS_ASSISTANT_ENABLED=true`
only after a successful live provider check. Direct OpenAI remains supported.

For an isolated provider check, set `ATHRECS_ASSISTANT_VERIFY_PROVIDER=true` on
the feature branch's Preview environment and deploy. The normal build sends two
synthetic questions (English/French), prints only their replies and fails if the
provider is unavailable. It needs no database and logs no credentials. Remove
the verification flag after the check; do not run paid probes on every build.

## Alternative: connect a direct OpenAI project key

1. Apply the normal additive database migrations (the existing build does this).
2. In the hosting provider's secure environment settings, set `OPENAI_API_KEY`
   to a funded OpenAI project key. Never use a `VITE_` prefix or commit the key.
3. Confirm the existing `DATABASE_URL` points to the persistent AthRecs database.
4. Set `ATHRECS_ASSISTANT_ENABLED=true` and redeploy.
5. Test an English and a non-English message; confirm both appear in the staff
   transcript page. A provider rejection is saved as an unavailable response.

The launcher stays hidden without its enabled flag, provider credential,
stable rate-limit secret and persistent database. In direct mode the API key
is the fallback rate-limit secret. The default direct model is
`gpt-6-luna`; `OPENAI_ASSISTANT_MODEL` may select another Responses-compatible
model supporting low reasoning effort. Model access and billing must be checked
with the actual project key before enabling production traffic.

`ATHRECS_ASSISTANT_MONTHLY_LIMIT` defaults to 3,000 turns per UTC calendar month
(maximum configurable 10,000). Each turn makes at most one provider request with
600 output tokens and ten recent messages, each capped at 1,800 characters.
There are also limits of 12 turns/browser/hour, 30 turns/network/hour on Vercel
and 100 turns/conversation. Failed provider requests consume quota too. Configure
the active provider account's budget alerts/limits separately; the turn limit is not a
currency-denominated spending guarantee. Set the enabled flag to false and
redeploy to turn off new chats.

## Staff transcripts

Open `https://update.athrecs.com/admin/assistant-chats` with the existing approved
staff Google login. Read every accepted message and response, its timestamp,
selected language, starting public page and any unavailable-response status.
Download a conversation as plain text or delete it. This is a review inbox,
not live human takeover and not automatic email delivery. No account identity is
attached automatically. The language field records the selected UI language;
someone may ask the model to reply in a different language within the chat.

The HttpOnly session cookie lasts seven days. Records expire 90 days after the
conversation starts and become unreadable; physical cleanup runs on the next
accepted chat attempt or staff history visit. Do not promise deletion at an exact
clock time. Staff downloads have their own handling/retention responsibilities.

## WhatsApp handoff and automatic notifications

Set `ATHRECS_WHATSAPP_NUMBER` to the owner's confirmed business number, in
international digits only (no plus sign, spaces or punctuation). This shows an
Open WhatsApp link. It opens a separate conversation and never automatically
forwards the website transcript. Automatic notifications and two-way replies are separate features; neither is implemented by this PR.

For automatic notifications, connect a WhatsApp Business Platform sender (direct Meta
Cloud API or a supported provider), with a registered business phone-number ID,
business account, server-side messaging credential and confirmed recipient number.
Confirm messaging eligibility, recipient opt-in and any required approved template
with that provider before sending. Never put a token in a public environment variable.

The preferred notification contains a short alert and a link to the existing staff-only
transcript page. The link must still require the approved staff login; never make a
public transcript URL or put the full conversation in a WhatsApp deep link. Full
transcript forwarding creates another copy outside AthRecs retention controls and
needs an explicit data-handling decision and updated visitor notice.

Implementation still needed: a transactional notification outbox after a stored chat
turn, a retry worker with idempotency, delivery/failure tracking and a staff setting to
pause notifications. Two-way human takeover additionally needs verified incoming
webhooks, conversation mapping, duplicate-event handling, reply delivery and explicit
AI-pause/resume controls. Do not advertise live human replies until these exist.

Primary references: [WhatsApp Business Platform](https://whatsappbusiness.com/products/business-platform/)
and [Meta Cloud API examples](https://github.com/fbsamples/whatsapp-api-examples).

## Verification

`node --experimental-strip-types scripts/verify-assistant.mjs` tests persistence,
cross-session isolation, duplicate submissions, concurrent turns, budget rollback,
retention, crash recovery, localization, provider failures and staff middleware.
Provider tests use synthetic messages and mocked HTTP responses; they do not
establish actual OpenAI account access. Run the production build and check the
public launcher, keyboard/mobile dialog, staff login and a real reply after the
key is connected. Do not publish test conversations or production secrets.


## Release and activation checks (17 October 2026)

The previous preview failed before compilation because the opt-in provider probe
received HTTP 403. This does not establish whether the cause was billing, account
verification, model permission or another provider restriction. The branch Preview
probe flag was subsequently disabled. Do not suppress that rejection or infer that
a successful application build establishes provider access.

The Vercel project has a production DATABASE_URL, but no production assistant enabled
flag, provider selection, stable assistant rate-limit secret, OpenAI/Gateway API key
or WhatsApp number was present at inspection. Preview provider selection is confined
to feat/athrecs-assistant; it does not configure production.

Preferred activation uses Vercel OIDC, avoiding a long-lived provider key. The team
owner must check AI Gateway account access, billing/credits and any model/provider
restrictions in the Vercel dashboard. Once access is resolved, run the opt-in live
probe in an isolated Preview; then configure the production provider, a newly
generated Sensitive rate-limit secret and the enabled flag. Do not reuse another
application's secret. Direct OpenAI is an alternative: the owner configures a funded
project key securely in Vercel with permission to create Responses and access the
chosen model. Never paste keys into chat. Official references:
[Vercel OIDC](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc),
[OpenAI permissions](https://developers.openai.com/api/docs/guides/rbac).

Before enabling visitors, verify real answers in all eight languages, the deployed
host-only cookie and private response headers, two isolated visitor sessions,
anonymous/non-staff rejection of transcript APIs, a staff transcript download and
cascading deletion using synthetic chats. The local browser suite checks all eight
localized interfaces at desktop, 320px phone and short-screen sizes using mocked
replies; it does not prove generated-language quality or production authentication.
The local access suite executes the real request handlers and staff guards with
synthetic sessions and in-memory SQL. The separate persistence suite checks quotas,
retention, crash recovery and concurrent requests.

The application sends store:false. That disables Responses application-state
storage; it is not a promise of zero retention across provider abuse-monitoring,
Gateway observability or database backups. Review those account controls separately
([OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)).


## WhatsApp message-alert implementation

See [assistant-whatsapp-alerts.md](assistant-whatsapp-alerts.md) for the new opt-in notification outbox, immediate delivery attempt, authenticated retry worker, staff status and activation requirements. This supersedes the earlier statement that all notification implementation is outstanding; account setup and a real phone-delivery check remain outstanding. Human takeover and two-way replies remain separate work.
