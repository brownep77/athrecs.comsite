# Contact athletes through Intercom

The signed-up athlete cards at `/admin/athlete-accounts` offer **Email in Intercom**,
**Message in Intercom** and the relevant contact options. The **Messages** section
also offers an optional email draft that can be copied into Intercom.

## Send an email or Messenger message

1. Open the athlete's account card and choose **Email in Intercom** or **Message in
   Intercom**. In **Messages**, enter an optional subject and message, then choose
   **Continue in Intercom**.
2. If a draft is shown, choose **Copy draft**. If clipboard access is blocked,
   select and copy the text from the same window; the draft stays available.
3. Choose **Open athlete in Intercom**. Sign in to the AthRecs Intercom workspace
   if needed, and confirm the contact's details.
4. In Intercom, choose **New conversation**, then **Email** or **Chat**. Paste the
   subject and message into the appropriate fields, choose the sender, review and
   send there.

Intercom documents both the [contact-profile link format][contact-links] and
[starting an individual conversation from a contact profile][one-off]. The
AthRecs link opens the contact; it does not preselect a channel or populate
Intercom's composer. The email draft is copied locally and is not included in
the contact URL.

## Prepared profile invitations

The **Match & invite** flow can hand a prepared invitation to Intercom too. Choose
**Create invitation for Intercom or another app**, then **Email invitation in
Intercom** or **Message invitation in Intercom**. Copy the invitation and paste it
into the correct athlete's Intercom conversation. The private claim URL stays in
the draft and clipboard; it is never placed in the Intercom contact lookup URL.

Opening or copying an invitation does not send it, mark it as delivered or
synchronize its replies. Review the recipient and send in Intercom. The existing
invitation generation and direct-send options retain their separate behavior.

## Channels and availability

| Option          | How to use it                                                                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email           | Choose Email in the new-conversation composer. Intercom uses its configured sender addresses and permissions. [Email instructions][email]                                                                                                                                 |
| Message / Chat  | Choose Chat to send through Intercom Messenger. Review and reply to the conversation in Intercom. [Inbox instructions][inbox]                                                                                                                                             |
| SMS             | The contact needs a valid phone number, and Intercom SMS must be activated for that number's country. Intercom determines whether the channel is available. [SMS instructions][sms]                                                                                       |
| WhatsApp        | Use a connected WhatsApp Business number and the athlete's phone number. Starting a conversation requires an approved message template; an arbitrary copied draft does not replace that template. [WhatsApp instructions][whatsapp]                                       |
| Facebook reply  | Find the existing incoming conversation from the connected Facebook Page. Private messages are supported; posts on the Page wall are not brought into the Inbox. [Facebook instructions][facebook]                                                                        |
| Instagram reply | Find the existing incoming conversation from the connected Instagram account. Intercom cannot start a new Instagram conversation. Human replies are subject to Instagram's seven-day window; automated replies have a 24-hour window. [Instagram instructions][instagram] |

Facebook and Instagram conversations may belong to separate social contacts in
Intercom. If the account contact does not show the conversation, find the original
incoming conversation in the Intercom Inbox. Creating another contact does not
bring that conversation across. Do not merge contacts merely to make a link work.

This feature does not route Telegram, Viber, X or LinkedIn messages through
Intercom. Use the **Telegram app**, **Viber: copy number** and social-profile links.
**Other contact apps** contains the ordinary mail, SMS and WhatsApp alternatives.
These labels describe this AthRecs implementation, not every third-party app that
could be installed in Intercom.

## If Intercom cannot find the athlete

The primary link uses the same stable account ID sent by the AthRecs Messenger.
**Find by email** is a separate fallback. Intercom documents that an email lookup
works only when that email belongs to one contact. Check the actual recipient;
never choose a different person merely because their name is similar.

An AthRecs registration does not guarantee that an Intercom contact exists: the
athlete may never have opened the signed-in Messenger. If no contact exists,
create the correct contact in Intercom before starting an email, chat, SMS or
WhatsApp conversation. The Inbox does not automatically create a lead just
because an unknown email is entered as a recipient. See the [contact FAQ][contact-links]
and [Inbox instructions][inbox]. Existing social conversations follow the separate
lookup described above.

## Message history and direct email

Opening a contact, opening the handoff dialog or copying a draft does **not** send
a message or add a sent entry to AthRecs. Messages and replies sent through this
handoff remain in Intercom; they are not automatically synchronized into the
AthRecs **Messages** timeline.

That timeline continues to show site email records, replies imported from the
connected mailbox and messages deliberately recorded by staff. Use **Record a
message** only to save correspondence that actually happened. The separate
**Send using AthRecs email** option still sends through the site's existing email
service and keeps its existing record. See [Athlete messages](athlete-messages.md).

## Implementation and verification

This handoff uses Intercom's documented contact links and requires no new REST API
token. The workspace ID is public configuration, not an API credential. Existing
staff access controls protect the account data used to build the links. No
background contact import, send API or conversation synchronization is introduced.

Run `node scripts/verify-intercom-contact.mjs` for pure destination, identity
encoding, invalid-input and clipboard-draft checks. The existing
`verify-athlete-messages.mjs` exercises the protected recipient account ID and
email through real staff RPC calls against a disposable database. Its outgoing
email boundary is intercepted and accepts only synthetic recipients.

Browser regression cases are in `verify-athlete-messages-browser.mjs` and
`verify-registrations.mjs --browser`. They cover the dialog, copy failure recovery,
native-app alternatives and absence of send/history mutations. They inspect
Intercom destinations without contacting a real workspace. Passing these tests
does not establish that a live Intercom account is signed in, a channel is
connected or an actual message was delivered. The live native send flow was not
tested while Intercom sign-in was unavailable.

Official channel guidance checked on 1 November 2026.

[contact-links]: https://www.intercom.com/help/en/articles/8827723-contacts-faqs
[one-off]: https://www.intercom.com/help/en/articles/3467924-dynamic-and-fixed-audiences
[email]: https://www.intercom.com/help/en/articles/3292845-get-started-with-outbound-emails
[inbox]: https://www.intercom.com/help/en/articles/6433002-start-a-conversation-from-the-inbox
[sms]: https://www.intercom.com/help/en/articles/6311194-sms-in-the-inbox
[whatsapp]: https://www.intercom.com/help/en/articles/6808174-start-a-whatsapp-conversation
[facebook]: https://www.intercom.com/help/en/articles/326-connect-your-facebook-channel
[instagram]: https://www.intercom.com/help/en/articles/6139045-connect-your-instagram-channel
