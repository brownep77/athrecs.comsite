# AthRecs brand partnerships

Initial routes: `/brands`, `/brands/register`, `/brands/manage`, `/opportunities`,
and the existing staff site at `/admin/partnerships`. RunRecs links to AthRecs;
partnership server functions reject requests on the RunRecs build.

## Review and access

- One company registration per account and canonical website hostname. A verified
  account email is required to submit; staff separately verifies company identity
  and the representative's authority using an independently sourced contact.
- Companies and opportunities remain private until staff approval. Changes return
  them to review. Suspending a company hides its public profile and opportunities
  and removes access to incoming applications. Review revisions prevent stale
  decisions from approving changed content.
- Once an application exists, opportunity terms and company identity are locked.
  A company must close the opportunity and create a new one to offer different
  terms; existing applications cannot silently be reused for another offer.
- Athletes opt into sponsorship, product testing or offers separately. This does
  not grant email marketing permission or publish any profile. Applications need
  an active claimed profile, verified email, category opt-in and adult declaration.
  A known under-18 date of birth blocks applications. This is an adult pilot,
  not a government-ID age verification service.
- Club representatives provide their club website and authority declaration.
  Staff checks authority before sharing each application. This does not yet
  create a reusable club administrator role or grant control of member profiles.
- Staff reviews applications before sharing. Companies see only the applicant's
  chosen athlete/club name, club website and message, and can reply in AthRecs.
  Account emails, DOB, private preferences and result-claim evidence are not
  exposed. Applications never grant advertising or image rights.
- Category withdrawal withdraws matching athlete applications atomically.
  Individual withdrawals remove company access immediately. Earlier copies
  cannot be recalled. Reviews and changes have a staff-only audit trail.
- Existing auth and staff middleware protect every private server function.
  Public functions explicitly select approved public fields.

## Initial limits

Manual review; no automated company verification, bulk athlete export, unsolicited
company messaging, payment processing or email notifications. Ten open
opportunities per company; directory and staff queues display up to 200 records.
Applicants and brands check their dashboards for updates. Brand product claims,
especially nutrition claims, require review independent of business identity.

## Delivery

Migration `0031_brand_partnerships.sql` is additive and creates empty tables.
The deployment migrator serializes schema changes with a PostgreSQL session
advisory lock because AthRecs and RunRecs share a database and may build together.
Validate it on an isolated database before applying it in production. Do not run
test registrations, claims, applications or reviews against the live database.
Follow `docs/release-safety.md`: feature branch, pull request, required verification,
preview smoke checks, then production release.

`npm run verify:partnerships` exercises real SQL in an isolated PGlite database:
publication gates, account isolation, revoked claims, club application review,
private-field boundaries, adult checks, stale decisions, consent withdrawal,
suspension and audit history. It is included in the quality gate.
