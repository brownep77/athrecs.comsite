# Website chat alerts to Paul's phone

This change prepares WhatsApp notification delivery. It does not activate website
chat, configure a Meta account, enrol a recipient, approve a template, buy credits,
or send a real notification. Those remain activation steps.

## Visitor-to-phone flow

An accepted visitor message and a notification outbox row commit together. Delivery
starts immediately after that commit, alongside AI generation. The provider request
has a five-second timeout. Each accepted visitor message creates at most one outbox
row; resubmitting the same request does not create another alert. The notification
contains fixed text and a staff-only conversation link, never the visitor's name,
message text, email, page path, password, or transcript.

Proposed template body: **New AthRecs website message. Open the conversation in your private staff inbox.**

URL button: **Open conversation**

Template URL: `https://update.athrecs.com/admin/assistant-chats?chat={{1}}`

The only dynamic parameter is the conversation UUID. It does not grant access:
the existing staff host, approved Google login and staff allowlist still apply.
The inbox opens the matching transcript after sign-in. It remains a transcript
review inbox; personal replies, human takeover, WhatsApp inbound replies and phone
push subscriptions are not included in this change.

## Account setup

Use a WhatsApp Business Platform Cloud API sender associated with the intended
Meta business account. A normal WhatsApp account or a `wa.me` link alone cannot
send these automated notifications. Confirm the recipient's full international
number and opt-in. The receiving number is separate from the sender phone-number
ID; do not migrate the owner's existing WhatsApp number automatically.

Create the template above through the account's supported template flow and obtain
approval for its exact name, language, body and dynamic URL button. Verify current
account eligibility, sender registration, permissions, supported Graph API version,
charges and budget before enabling production. Do not infer approval or a free
service tier from a successful code test. Meta's own template category decision
and provider rules govern this internal notification use case.

## Server-only production settings

| Variable | Value |
| --- | --- |
| `ATHRECS_CHAT_WHATSAPP_TOKEN` | Sensitive system-user/server credential authorised to send from the configured sender; never `VITE_` |
| `ATHRECS_CHAT_WHATSAPP_PHONE_NUMBER_ID` | Registered sender's numeric phone-number ID |
| `ATHRECS_CHAT_WHATSAPP_RECIPIENT` | Confirmed receiving number, international digits only |
| `ATHRECS_CHAT_WHATSAPP_GRAPH_VERSION` | Supported version verified in the Meta account, such as the exact `vN.N` shown there; no guessed default |
| `ATHRECS_CHAT_WHATSAPP_TEMPLATE` | Approved template name |
| `ATHRECS_CHAT_WHATSAPP_TEMPLATE_LANGUAGE` | Exact approved language code |
| `ATHRECS_CHAT_WHATSAPP_OPT_IN` | `true` only after recipient confirmation |
| `ATHRECS_CHAT_WHATSAPP_MONTHLY_LIMIT` | Maximum attempts per UTC month; defaults to 100, capped at 3,000. This is not a currency spending guarantee. |
| `ATHRECS_CHAT_WHATSAPP_ENABLED` | Start with `false`; enable only after account setup and a controlled live check |

Existing `DATABASE_URL`, `CRON_SECRET`, and `VERCEL_ENV=production` are required.
Preview and development never send even when the explicit alert flag is true.
The existing `ATHRECS_WHATSAPP_NUMBER` optional visitor handoff link is independent
and is neither a sending credential nor an alert recipient setting.

## Reliability and truthful status

The authenticated `/api/assistant-chat-alerts` worker runs every minute. It handles
committed but never-attempted rows, and explicit HTTP 429 rejections with exponential
backoff, for up to five attempts. The first attempt occurs in the chat request;
the cron interval is not its normal delivery delay. Actual arrival depends on Meta,
connectivity and the receiving phone's notification settings; zero delay is not
guaranteed.

Meta API acceptance is labelled **Accepted by WhatsApp**, not delivered or read.
Timeouts, uncertain server errors, lost receipts and interrupted workers are held
for review without automatic replay: this API path does not provide a send
idempotency key, so retrying an uncertain request could send duplicate alerts.
Delivery/read webhooks are not implemented. Non-429 rejections remain failed until
the account issue is resolved. The staff inbox reports the aggregate states.

Only alerts created while configuration is enabled and ready are queued. Old chats
are never backfilled. Unsent alerts expire after 24 hours. Changing the sender,
recipient, template, language or API version invalidates older queued work. Deleting
a conversation cascades to its pending alerts, but cannot retract a notification
already submitted to Meta. Retention cleanup also cascades. Monthly attempts use a
separate durable counter and are not reset by deleting conversations.

To pause, set `ATHRECS_CHAT_WHATSAPP_ENABLED=false` and redeploy. Before changing the
recipient or template, pause first. A request already in flight may finish.

## Verification and activation

Run `node --experimental-strip-types scripts/verify-assistant-alerts.mjs`, the
existing assistant and access checks, TypeScript and the production Vite build.
Automated checks use synthetic phone numbers, in-memory SQL and mocked delivery.

For the separately authorised live check, use a synthetic website conversation,
confirm an actual notification arrives on the intended phone, open its button,
verify the approved staff sign-in and matching transcript, and check anonymous
access is denied. Do not use a real visitor transcript as test data. Verify pause
and the monthly cap. Record account/template approval and observed phone receipt
before reporting notifications as working.

Primary sources checked 20 October 2026:
- https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/template-messages
- https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
- https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/template/

The current Meta documentation search confirmed template messaging; direct page
retrieval was rate-limited/login-gated. The archived official SDK documents the
template object but is not used as a dependency or as evidence of current account
eligibility. Exact current template approval and API support still require the
connected account check.
