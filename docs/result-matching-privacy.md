# Athlete result matching: controller record and operational review

Implemented 13 October 2026 at the owner's request. This is an engineering record, not a certification of legal compliance. It contains no private athlete data.

## Purposes and field necessity

- Account email and name operate the requested account and authenticate claims.
- Before any athlete or staff-approved ownership claim, only saved name and verified email are required account fields. At the owner's request, full birth date and nationality are optional for claims and stored-result matching; either can be omitted, added later or cleared. This reduces required collection. Neither field is proof of ownership.
- When supplied, birth date supports age on _historical race dates_ and child/guardian routing. Nationality compares only with explicitly source-reported nationality; dual nationality and Stateless are accepted. It is never inferred from location. Existing child, guardian and disputed-claim review safeguards remain. The controller must document the lawful-basis and balancing assessment for the processing; optional collection alone does not establish legal compliance.
- Optional aliases, former/maiden surnames and source IDs help find an athlete's own historical records. Contact address/phone do not help matching and require independent, revocable account-support consent.
- Public web search has separate adult opt-in and runs only on request. Its existing adult check still needs a saved birth date; the interface explains this separate limitation and offers stored-result matching and staff assistance without it. An explicit allowlist of public-search fields is sent; DOB, nationality, email, postcode, street address and phone are excluded. A harmless API probe must report x-zero-data-retention=true before athlete data is sent. External content is untrusted and cannot automatically import or claim a result.

## Boundaries and retention implemented

New optional settings live in a user-keyed private table with cascade deletion, never public profile JSON. Authenticated read endpoints send private/no-store. Each saved setting records notice version and update time. Withdrawal removes contact fields and cached external results. External cache is reused for seven days; old rows are deleted on the next search, all rows on setting changes, and on account deletion via existing foreign keys. Do not describe this as a scheduled seven-day deletion job.

Claim records and existing accounts retain their existing lifecycle; there is no new blanket deletion of ownership/audit evidence. The published notice explains these criteria and gives paul@athrecs.com as the privacy contact. Public birthday sharing remains an explicit, existing separate choice. No new fields are automatically published.

## Controller actions still required

Confirm the legal entity/controller identity and contact details; maintain the lawful-basis assessment above, processing record, retention review for inactive accounts/claims/backups, rights-request procedure and applicable children's-code/DPIA assessment. Verify contracts and UK/EEA transfer safeguards for all hosting/database/email/search processors. Verify xAI enterprise terms, subprocessor list and zero-retention setting in the provider account before offering external scans. Technical controls do not replace these operational obligations. The interface blocks external scans if the runtime zero-retention check fails.

The privacy notice uses contract for requested account service, legitimate interests for record accuracy/ownership protection and child safeguarding, and consent for optional contact and external search. The controller must validate these bases and honour withdrawals, objections, access/correction/deletion requests and human review. Never treat a privacy acknowledgement as blanket consent.

## Primary guidance checked

- ICO data minimisation: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/
- ICO right to be informed: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/
- ICO age assurance: https://ico.org.uk/about-the-ico/what-we-do/information-commissioners-opinions/age-assurance-for-the-children-s-code/6-expectations-for-age-assurance-and-data-protection-compliance/
- Provider DPA effective 22 September 2026: https://x.ai/legal/data-processing-addendum
- Provider zero-retention header: https://docs.x.ai/developers/faq/security
