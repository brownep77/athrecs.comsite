# Run Norwich source-history claims

Run Norwich imports previously appeared on public profiles but were absent from
potential matches, claim submission and the account's claimed results because
those paths read only canonical results.

The private `source_history_claim_results` registry gives every eligible published
Run Norwich source row a stable claim reference. It retains the original performance
and archive reference. It creates no canonical result or edition and leaves the
public source history unchanged. Virtual results retain their supplied event window,
unknown individual date and unverified status. Minute-only source times remain minutes.

`athlete_claimable_results` supplies both kinds of record to existing authenticated
matching, invitations, claims, conflict alerts and the account results list. Canonical
IDs remain positive; source references are negative API IDs backed by separate foreign
keys. The claim saves the original source evidence. A source withdrawal stops new
suggestions and submissions without deleting claim history. A reassignment cannot
transfer existing ownership. Run Norwich imports and publication changes update the
registry through a narrowly scoped trigger; other providers remain unchanged.

Race-day club and age are supplied where recorded. Category, bib, time and source
placing information remain available in the claim screen and staff review. Source
profile claims retain the existing email verification, explicit confirmation, staff
review, owner locking, revocation and conflict-notification rules. This change sends
no invitations and does not approve existing claims.

For existing rows, run the following once after applying the migration (repeat-safe):

```sql
update athlete_source_histories set published_at=published_at
where provider='Run Norwich official results';
```

Do not call the deployment complete until the registry count and available records
match the eligible published histories. Check source-key uniqueness and ensure no
canonical race rows have been created by this projection.

Verification: `verify-result-conflict-flow.mjs` tests actual services and source
claims against disposable PGlite/PostgreSQL, including evidence snapshots and virtual
dates. `verify-profile-claim-journey.mjs` tests the actual authenticated browser flow
using synthetic source histories. No production athletes are claimed and no mail is sent.
