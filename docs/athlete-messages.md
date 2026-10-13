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
entries are clearly marked as manual. Social accounts are not synced.

**Connect your inbox** opens `/admin/email-inbox`. Staff can connect the existing
`paul@athrecs.com` Namecheap Private Email mailbox using its mailbox or app password.
The server requires a dedicated 32-byte hex `ATHRECS_INBOX_ENCRYPTION_KEY` and stores
the password encrypted with AES-256-GCM. Credentials never appear in status responses.
Disconnecting removes the saved credential and keeps correspondence already imported.

The production cron checks the INBOX every five minutes, with an optional initial
30-day catch-up and a manual **Sync now**. Each run processes up to 50 emails with
a bounded runtime. Large backlogs take multiple runs. It uses TLS and a read-only
mailbox: original emails and unread flags stay unchanged. No receiving DNS,
mailbox routing, outgoing sender, Resend keys or webhook settings are changed.

Incoming messages match an exact email address from a verified account or a
previous site email/invitation. Ambiguous matches stay in the mailbox for manual
recording; unknown sender bodies are not downloaded. These matches do not verify
athlete identity or approve claims. Imported replies are labelled **Received email**
and **Automatic record**. HTML is converted to plain text; authentication codes
and private action links are redacted. Attachment names are shown, but files stay
in email. Emails over 1 MiB have a placeholder directing staff to the mailbox.
UID cursors, a database lease and stable message keys prevent overlapping imports
and duplicates. Reconnection revokes an in-flight worker before it can write.

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

Run `npm run verify:athlete-inbox` for synthetic IMAP, disposable database and real
staff RPC checks of encryption, privacy, matching, retries, deduplication, leases,
disconnect races and read-only IMAP settings. `verify-athlete-inbox-browser.mjs`
covers the connection interface. Neither test connects to a real mailbox.
