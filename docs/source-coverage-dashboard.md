# Staff source coverage

Open `/admin/collection-stats?section=sources`, also linked from `/admin/sources`.
The existing staff-only RPC, private/no-store responses and host checks protect
all counts, source evidence and athlete drill-downs.

| Report | Numerator | Denominator |
| --- | --- | --- |
| Fixture sources by sport | Saved editions attributed to this source | All non-alias editions in the sport |
| Athlete sources | Distinct non-test athletes linked to this source | All non-test athlete profiles |
| Main result sources | Distinct non-test main results linked to this source | All non-test main results on non-alias editions |
| Saved results sheets | Saved archive entries in this dataset | Dataset's recorded expected row count |
| Saved entries matched | Archive entries linked to a main result | Saved entries in this dataset |
| Results for each athlete and source | Distinct expected years included in captured years | Distinct expected years for that history |
| Pages found | Relevant discovered pages marked extracted | Relevant discovered pages not excluded |

Source shares describe AthRecs' holdings, not completeness of the external
website. There is no reliable full-source athlete/fixture/result denominator in
the current data model. Empty denominators remain unknown; they are not zero or
100%. Race-sheet coverage above 100% remains visible as a reconciliation signal.
Year coverage does not establish that every result in those years was collected.
The history `complete` value is shown as the importer's saved assessment.

Host attribution lowercases hostnames and removes `www.` only. It does not merge
other subdomains or infer provider identities. Athletes and results may have
multiple sources; each counts once per source, so source shares may overlap.
Fixture attribution uses the edition's source URL with an event-source fallback.
Unknown provenance is explicit. Imported histories and archive rows are separate
from main results; their counts cannot be added into a unique performance total.

Every report is read from stored data on demand. The optional one-minute refresh
runs only while the page is visible and does not crawl external sources. The
report-load timestamp, history capture timestamp, dataset update timestamp and
collection-attempt timestamp have different meanings. CSV exports include the
report timestamp and denominator notes. Failed refreshes retain any previously
loaded data with an error, rather than reporting zero or moving its timestamp.

No ingestion, source approval, publication, matching or verification settings
are changed. Existing collectors supply the source evidence and timestamps.

Validation: `npm run verify:collection-stats` exercises real authenticated RPCs
against disposable PGlite data, including the source-share and coverage checks
in `scripts/verify-source-coverage.mjs`. Add `-- --browser` for the desktop/mobile
navigation, unknown display, drill-down, CSV and refresh-control checks.
