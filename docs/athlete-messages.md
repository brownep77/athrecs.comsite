# Athlete messages

Staff can open **Messages** in the athlete directory, on a staff athlete profile,
or in a signed-up athlete's card. The timeline has All, Sent and Received filters,
counts, dates, expandable message text and pages of 20 messages.

Site email tracking starts with this feature. Earlier successful invitation send
records are included using their saved invitation text. Authentication codes and
action URLs are omitted. A successful Resend API response means provider
acceptance, not confirmed delivery, opening or reading. Failed requests and
uncertain network failures are labelled separately. Logging errors do not turn an
accepted email into a failed send or trigger an automatic duplicate email.

**Record a message** saves correspondence already sent or received in email,
WhatsApp, SMS, Telegram, phone or another app. It never sends anything. These
entries are clearly marked as manual. External inboxes and social accounts are
not synced; receiving replies automatically requires a separate inbox integration.
No receiving DNS, mailbox routing, Resend keys or webhook settings are changed.

Both reads and writes use the existing staff middleware, including the staff host,
Google allowlist, same-site checks and private no-store responses. Messages are
not added to public athlete payloads. Histories join only through explicit account
bindings, approved active profile links or the original invitation's athlete ID;
names are never used to identify a conversation.

The email adapter records known account recipients and invitations with the
existing `profile-claim-invitation/<id>` or `invitation-welcome/<id>/<attempt>`
idempotency keys. Unknown addresses outside those invitations are not logged.
Each idempotency key has one record; a successful retry updates an earlier failed
record. A later failure cannot downgrade a previously accepted send.

Run `npm run verify:athlete-messages` for disposable database and real staff RPC
tests. Outgoing email is intercepted and restricted to synthetic example.test
recipients. This covers private access, cross-site rejection, account isolation,
linked profiles, manual recording without sending, retries, failure states,
redaction and pagination.
