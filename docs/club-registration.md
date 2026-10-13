# Directory-first club registration

The public `/clubs` directory is the entry point. Listings remain available before
any representative registers. Country/sport filters and 48-card pages make the
directory browsable. Each listing and profile links to **Register this club**.
Existing directory evidence badges are not representative-approval badges.

`/clubs/register` provides four stages: club selection, representative details,
authority evidence, and review/declarations. Officers use their own AthRecs login.
Saved drafts and decisions appear at `/clubs/account`. Verified account email is
required at submission; full name, role, independently checkable authority
information, adult confirmation and the privacy acknowledgement are required.
Club email and phone are optional and are not automatically verified. Affiliated
and unaffiliated clubs are accepted. Missing clubs are requested privately first.

Staff use `/admin/club-registrations` on the existing staff host. Approval requires
independent club-identity and representative-authority checks, a private evidence
record and an applicant-facing decision. Staff cannot approve their own request.
An existing club cannot be silently reassigned or overwritten. A missing-club
request must be matched to an existing listing or explicitly approved for a new
listing; normalized same-name/country duplicates block new listing creation.
Near-name clubs require human checking, not automatic merging. Affiliation supplied
by an applicant remains self-reported and is not promoted into directory evidence.

Approval creates a scoped `club_representatives` record. Other active
representatives are highlighted in review; additional appointments require an
independent authority check. Rejection, requests for more information and access
revocation are explicit decisions. Future club tools must call
`requireClubRepresentative`; it rechecks active approval and the current verified
email against the submission. Club approval grants no athlete ownership, access to
athlete private data, automatic imports or email invitations. Bulk member upload is
a subsequent facility and is explicitly described as unavailable in this stage.

## Access and privacy

- Public directory data stays separate from private application/audit tables.
- All application calls use the existing authenticated, same-site middleware.
  Staff review calls additionally use the existing staff host and allowlist gate.
- Private responses use `private, no-store`, `Vary: Cookie, Authorization`, and
  noindex headers. UI query keys include the account ID and expire on unmount.
- Application reads/writes are account-scoped; review evidence is not returned to
  applicants. No government IDs, membership lists or uploaded documents are
  requested. Evidence URLs are references, not server fetch targets.
- Account and application locks, revision checks, uniqueness constraints and
  transactions protect against duplicate applications and stale approvals.
- Limit ten open applications per account and twenty new applications per day.
- Connected Vercel previews cannot read/write private club applications;
  production requires the configured durable database. No new credentials needed.
- Applications, revisions and decisions are retained for review/access/disputes;
  withdrawal does not erase the audit. The operator must maintain necessity reviews
  and rights-request handling, and validate the lawful-basis and retention record.
  This implementation is not a certification of legal compliance.

## Verification and release

The additive `20261013_club_registration.sql` migration changes no existing club,
athlete or result rows. The existing build migrator applies it on deployment.

`npm run verify:club-registration` exercises actual service transactions against
an isolated PGlite database: incomplete drafts, verified-email requirements,
known minors, cross-account isolation, stale revisions, self-review, evidence
privacy, approval, revocation, duplicate listings, withdrawal and rollback.

`npm run verify:club-registration-browser` exercises real React screens with
synthetic API fixtures: directory/filter/pagination, sign-in, draft/resume,
validation, retry, submission, email gates, mobile layout and review controls.
It makes no live accounts, sends no emails, and writes screenshots only to ignored
test artifacts. `ATHRECS_BROWSER_EXECUTABLE` may select an installed test browser.
Service tests are part of `ci:verify`; browser tests run in the quality gate.
PGlite does not simulate concurrent production database connections. A production
officer/independent-staff acceptance check remains separate from these tests.

Rollback: revert the application commit, leaving the additive private tables in
place for record retention. Do not drop verification history or delete listings
as part of rollback. No live clubs or athlete records were changed in development.
