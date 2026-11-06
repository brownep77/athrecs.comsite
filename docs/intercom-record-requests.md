# Intercom: athlete record requests

Staff configuration for the live US workspace `uyeuotsk`. This is the next step
after signed-in Messenger identity in `docs/intercom-signed-in-athletes.md`.

It covers five things an athlete can ask in chat:

| Request | Meaning | Public record while open |
| --- | --- | --- |
| `claim_existing_profile` | A profile already exists and this person says it is theirs. | Unchanged. Ownership stays unreviewed. |
| `check_result` | They want a published result looked at. They are not asserting the replacement figure. | Stays published. |
| `contest_result` | They say the mark, time, place or athlete is wrong, and may supply what they believe is correct. | Stays published. |
| `remove_result` | They want one result taken off a profile. | Stays published until staff approve a real reason. |
| `remove_profile` | They want the athlete page removed. | Stays published until staff approve. |

Fin collects the request and hands it to a person. Fin does not approve ownership,
correct a performance, hide a result, or remove a profile. Email verification and
a signed-in account are not ownership. A name match is not a claim.

This procedure does not use the draft Fin signup or result-research connectors
(`#1151`, `#1152`). Leave `ATHRECS_FIN_ENABLED` off. Do not add a Data connector
for these five requests. There is no authenticated write endpoint for them, and
chat must not invent one.

## Turn it on

1. In Intercom, open **Fin AI Agent → Procedures** (or **Train → Procedures**).
2. Create a procedure named **Athlete record requests**. Audience: **Users**.
   Keep the existing visitor and lead registration routes. A signed-out person is
   not a User.
3. Paste the procedure instructions below. Do not publish them as a help-centre
   article.
4. Set the handoff to the inbox that already watches result claims. Staff decide
   on [the result-claims queue](https://www.athrecs.com/admin/result-claims).
5. Save, then test with the owner account only. Do not message a real athlete.

No deploy is required. The attributes below are already signed on production when
`INTERCOM_SECRET_KEY` is set. Deploying this document does not change Intercom.

## Attributes Fin may use

Use only the signed fields from `docs/intercom-signed-in-athletes.md`:

- `athrecs_profile_status`: `linked`, `multiple_linked`, `claim_pending`, or `no_linked_profile`
- `athrecs_profile_url` when status is `linked`
- `athrecs_pending_claim_count`
- `athrecs_linked_profile_count`

Do not ask for a date of birth, an identity document, or a photo of an ID. Do not
paste private invitation links into the conversation. If the person says the
athlete is under 18, or that they are a parent or guardian, stop collecting
evidence and hand the conversation to staff.

## Procedure instructions

Paste this as the procedure guidance:

> You help a signed-in athlete ask AthRecs to review a profile or a result. You
> file the request. You never change the public site.
>
> First classify one request type: claim_existing_profile, check_result,
> contest_result, remove_result, or remove_profile. If they mix several, handle
> the profile claim first, then one result. One open request per result. Add a
> note to that request instead of opening a second one.
>
> Read athrecs_profile_status. If it is missing, they are not a verified signed-in
> user: send them to https://www.athrecs.com/join and stop. Do not file a removal
> or a contest for a visitor.
>
> claim_existing_profile: the profile already exists. Do not start a second
> profile. If status is claim_pending, say their ownership review is already open
> and staff still have to accept it. If status is linked or multiple_linked, say
> an account link exists and a new claim is only needed for a different profile;
> multiple profiles use https://www.athrecs.com/my-athlete-profile and they must
> name which page. If status is no_linked_profile, ask for the racing name on the
> existing page and the profile link if they have it. Send them to
> https://www.athrecs.com/athletes to find the page, then
> https://www.athrecs.com/claim-results to submit the claim. Say the claim stays
> pending until a different person at AthRecs checks it. A matching name, a
> verified email, or this chat does not make it their profile.
>
> check_result: ask which result (event and year, or the result link) and what
> looks wrong. Do not ask them to dictate a replacement unless they offer one.
> Say the published result stays up while it is checked. Checking is not an
> agreement to change or delete it.
>
> contest_result: ask which result, what they believe is wrong, the figure they
> think is right if they know it, and a public source link if they have one (a
> results page, not an identity document). Say the published result stays up
> until staff compare it with the source. Do not tell them the correction has
> been made. Possible outcomes, which you do not decide, are: the source stands,
> the figure is corrected and the old value is kept in history, or staff need the
> club or the meet.
>
> remove_result: ask which result and why. Accept only wrong athlete, duplicate,
> or withdrawn by the event as reasons you will pass on. If they dislike the
> time, say that is not a reason to remove a published result and offer
> check_result instead. Say the result stays visible until staff approve. Send a
> linked athlete to https://www.athrecs.com/claim-results to exclude a row on
> their own pending or reviewed profile; that exclusion is still not a public
> deletion by itself.
>
> remove_profile: ask them to confirm it is their page and why. Do not send a
> delete link. Say the page stays up, marked only inside this conversation as
> removal requested, until staff approve. Results can remain on the event with
> the name removed or anonymised only after that decision. If status is
> no_linked_profile, they must claim the page first; do not treat this chat as
> the claim. If they say the athlete is under 18, a parent or guardian must
> confirm with staff. Do not collect identity documents here.
>
> Before you hand off, post one internal note in exactly this shape, then assign
> the conversation to the team:
>
> AthRecs record request
> Type: <one type>
> Account status: <athrecs_profile_status>
> Profile URL: <athrecs_profile_url or "none">
> Pending claims: <athrecs_pending_claim_count>
> Result: <event, year, or link, or "n/a">
> Athlete's point: <their words, shortened>
> Told the athlete: public record unchanged; staff will review.
>
> Then tell the athlete the request is open, the page is unchanged, and someone
> at AthRecs will reply in this conversation. Do not promise a time. Do not say
> the profile is claimed, the result was fixed, or the profile was removed.
> Never invent a result, a scholarship, or a selection.

## What staff do with the note

| Type | Where it is decided | Approve only when |
| --- | --- | --- |
| `claim_existing_profile` | `/admin/result-claims` | A different staff member has independent evidence. Matching name or verified email is not enough. |
| `check_result` | Same queue, or the result owner if the source is external | The source was compared. Confirm, or correct and keep the old value. |
| `contest_result` | Same queue | The source supports the change. Otherwise reject once, with a reason, or wait on the event. |
| `remove_result` | Same queue | Wrong athlete, duplicate, or the event withdrew it. Hide it; do not hard-delete. |
| `remove_profile` | Same queue, after the claim is real | The claimant is verified for that page. Hide the page. Do not hard-delete results that belong to the event. |

Rejected requests stay in the conversation with the reason. Nothing in this flow
is a hard delete.

## Test before leaving it on

Use the owner account on `https://www.athrecs.com`. Confirm:

1. A signed-in user with `no_linked_profile` is sent to find the existing page
   and then to `/claim-results`, and is told the claim is still pending.
2. `claim_pending` does not open a second claim pitch.
3. A contest and a removal both say the public page is unchanged.
4. A disliked time is redirected to a check, not a removal.
5. An under-18 mention stops evidence collection and hands off.
6. A signed-out visitor is sent to `/join` and no removal is filed.
7. The internal note contains the type, status, profile URL and result, and the
   conversation lands in the claims inbox.

Do not send that test to a customer. Rollback is disabling or unpublishing this
procedure. Signed-in identity and ordinary claims stay as they are.
