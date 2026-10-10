# Private source acquisition

`result_archive_source_captures` is a private inbox of complete source tables and
original compressed HTML. It precedes canonical race/athlete matching and does
not create public events, athlete records, canonical results, claims or emails.
The central archive can later convert a reviewed capture into edition-linked
datasets. Unmapped race headings and missing distances remain as supplied.

An approval records its real basis: `owner_private_import` or `provider_export`.
An owner's approval is not labelled a provider licence. Each run and capture
references one non-revoked, source-specific approval restricted to `staff_only`.
Other providers' historical-feed settings are not changed by a manual capture.

The Total Race Timing collector accepts only previously discovered public
`https://totalracetiming.co.uk/raceresults/<id>` links. It checks robots.txt,
waits at least 1.5 seconds between request starts, allows at most four concurrent
page requests within one provider, stops on 401/403/429, limits page
size, and never fetches photo/gallery endpoints. Original HTML is preserved.
Two independent parsers must agree on every displayed cell. All fields and
decimal precision are retained; an unlabeled `Time` remains an unlabeled time.

Before a database write, `prepare-private-result-capture.mjs` runs the same
strict evidence conditions as `audit-result-evidence.mjs --strict`. Source
contradictions and ambiguous names are held for review, with no performance
accepted or silently corrected. A comparison passing does not prove athlete
identity. All records remain source observations until that separate review.
Individual tables may omit gender/category classification columns. Those values
remain null; an imported placing absent from the source is rejected. Relay/team
tables require their own mapping and remain held by the individual-results path.
When the source explicitly displays `Category=None`, payload schema 2 leaves
normalized category and category placing null, retaining the exact original
label and placing in `sourceCategoryLabel`, `sourceCategoryPlace`, and original
cells. This does not discard the source rank or assign an invented age category.
Earlier stored schema-1 observations remain immutable; canonical matching must
apply the same absent-category handling before using their category fields.

Capture versions are unique by provider, page key and deterministic payload
hash. Replays update last-seen time without another copy; source changes retain
the prior version. Row-count checks and active approval checks are enforced in
the database path. Public privileges are revoked, and RLS has no non-owner
policies. Public application queries do not read these tables.

For a supervised run, supply a private inventory manifest, private approval JSON,
output directory and a retained run UUID. Keep source captures and credentials
outside source control. Migrations are recorded in the standard `_migrations`
ledger after isolated-branch validation; never run catalogue seeds as part of
source acquisition. Aggregate receipts report compared, held, empty, failed and
future pages separately. A source index count is never a count of athletes or
completed fields.
