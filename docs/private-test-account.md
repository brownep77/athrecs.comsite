# Private fictional test account

Open `https://www.athrecs.com/test-account` and sign in with the reserved test address,
`paul@athrecs.com`. The account uses normal Better Auth authentication; no password,
verification token or ownership link is manufactured by the setup.

1. Save the racing name **Test Test** through Personal details. Gender on the
   fictional athlete is Male; a real birth date or address is unnecessary.
2. Open **Review and claim results** to use the normal profile claim and result
   confirmation. Select all, uncheck individual results, or restore them later.
3. Use **Register for Test 1** through **Test 10** to practise entry confirmation
   emails. Cancel and register again to repeat. These controls create only private
   practice registrations, not a real event entry, payment or place with an organiser.
4. Edit the biography and inspect My races. The automatic biography identifies
   invented test data. PBs, finish medals, progress and achievements remain empty.
5. Use **Retry email delivery** after a delivery failure. Ten-minute reservations
   and stable provider keys deduplicate retries; uncertain attempts older than
   23 hours are held for staff review.

The ten distances are 1K, 3K, 5K, 5 miles, 10K, 10 miles, half marathon, marathon,
50K and 100K. Existing source-history records and invitation are reused. Dates,
times and placings are deliberately fictional and unverified. Original gun times
are kept separate from absent chip times. The test events are stored in separate
`athrecs_test_events` and registration tables, never canonical events/editions/results.

The reserved email can claim only the test athlete; other accounts cannot claim
that athlete. Database guards prevent publication, search indexing, evidence
reassignment and canonical result creation. Test markers survive result parsing;
calculations exclude them independently of visibility. Public athlete counts and
genuine signup charts/funnel exclude the fixture. Administrative storage totals
remain diagnostic totals. Synthetic claim emails and invitations can reach only
`paul@athrecs.com` and carry a fictional-test label. New test-signup alerts are
restricted to that address too. Ordinary athletes' recipient settings are unchanged.

The migration adopts only an already-authorised test identity; it does not create
synthetic people in every fresh application database. For the automated isolated
suite, `scripts/fixtures/test-account.sql` supplies explicit fictional records.
`npm run verify:test-account` runs real HTTP authentication and claim/profile RPCs
against disposable PGlite, intercepting every email and rejecting external requests.
It covers OTP replay, bulk and individual claims, duplicate prevention, private
profile updates, wrong-account/cross-site rejection, publication and award guards,
practice-entry retries and provider outages. It never authenticates a production
user or sends a live message.

A live signed-in walkthrough and inbox delivery must be verified separately.
Provider acceptance is not proof of inbox receipt. Do not read production session
secrets or insert sessions to bypass sign-in. The hub retains registration and claim
audit history; repeat result selection/restoration rather than deleting the account.
