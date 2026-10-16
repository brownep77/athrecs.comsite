# AthRecs website assistant

The custom chat uses the OpenAI Responses API and the site's existing Postgres
database. It guides visitors to account creation, athlete search, results and club
registration. It does not search individual records or modify accounts. The UI
supports English, French, German, Spanish, Italian, Dutch, Polish and Portuguese;
visitors can also request another reply language in their message.

## Enable on the existing AthRecs deployment

1. Apply the normal additive database migrations (the existing build does this).
2. In the hosting provider's secure environment settings, set `OPENAI_API_KEY`
   to a funded OpenAI project key. Never use a `VITE_` prefix or commit the key.
3. Confirm the existing `DATABASE_URL` points to the persistent AthRecs database.
4. Set `ATHRECS_ASSISTANT_ENABLED=true` and redeploy.
5. Test an English and a non-English message; confirm both appear in the staff
   transcript page. A provider rejection is saved as an unavailable response.

The launcher stays hidden without all three settings. The default model is
`gpt-6-luna`; `OPENAI_ASSISTANT_MODEL` may select another Responses-compatible
model supporting low reasoning effort. Model access and billing must be checked
with the actual project key before enabling production traffic.

`ATHRECS_ASSISTANT_MONTHLY_LIMIT` defaults to 3,000 turns per UTC calendar month
(maximum configurable 10,000). Each turn makes at most one provider request with
600 output tokens and ten recent messages, each capped at 1,800 characters.
There are also limits of 12 turns/browser/hour, 30 turns/network/hour on Vercel
and 100 turns/conversation. Failed provider requests consume quota too. Configure
the OpenAI project's budget alerts/limits separately; the turn limit is not a
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

## Optional WhatsApp handoff

Set `ATHRECS_WHATSAPP_NUMBER` to the owner's confirmed business number, in
international digits only (no plus sign, spaces or punctuation). This shows an
Open WhatsApp link. It opens a separate conversation and never automatically
forwards the website transcript. Two-way WhatsApp routing and WhatsApp transcript
sync require a separately configured WhatsApp Business integration.

## Verification

`node --experimental-strip-types scripts/verify-assistant.mjs` tests persistence,
cross-session isolation, duplicate submissions, concurrent turns, budget rollback,
retention, crash recovery, localization, provider failures and staff middleware.
Provider tests use synthetic messages and mocked HTTP responses; they do not
establish actual OpenAI account access. Run the production build and check the
public launcher, keyboard/mobile dialog, staff login and a real reply after the
key is connected. Do not publish test conversations or production secrets.
