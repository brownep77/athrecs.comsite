# Saved-source register intake

The staff event register has three views: collected source records, source coverage,
and catalogue events with contacts/history. Only running and parkrun observations
are admitted to the intake. Mixed-sport source directories stay visible as leads;
that does not enable their crawlers or approve other sports for import.

Apply the additive `20261012_running_register_intake.sql` migration first. Run each
statement in `refresh-source-records.sql` sequentially against a review branch,
then against the explicitly selected live branch after checking its output. These
queries aggregate the source captures and histories already held in the database;
they never fetch websites or alter athlete results, verification, fixtures or
publication settings. Run `reconcile-source-records.sql` after loading the saved
source inventory and fixture-sheet observations. The scripts are resumable by
record key. Reconcile again after importing more sheets or catalogue editions.

Saved inventory imports use canonical source URLs, retain file/sheet/row provenance,
keep rights and collection status, and preserve pending cursor URLs. The private
import checkpoint contains that inventory and the sheet normalization scripts;
private data exports do not belong in this repository. Guessed contacts are not
imported as organiser contacts. Existing event contacts/history remain in their
staff tables and are reached through a matched catalogue event.

Counts describe event/programme/year **source observations**, not globally unique
races. Multiple providers, distances, alias spellings and saved histories can
refer to one edition. WMM deduplicates source result IDs within a named race/year;
UTMB counts distinct captured runner histories for each race identifier. Neither
is a verified finisher count. Timing captures use their latest saved version.
Year-only records retain null exact dates; missing countries, organiser, first
race year and final race year remain unknown. Earliest/latest observed years must
never be interpreted as a race's lifetime.

The source coverage view groups records by exact website host. Different feeds on
that host repeat the same coverage counts. A saved PDF without parsed event facts
remains in the existing capture queue; the existence of the file is not claimed as
an extracted event or result. Cursor URLs can include navigation and need review.
This is a snapshot of collected material, not completion of every source archive.

Validation:

```sh
node scripts/verify-register-collection.mjs
node scripts/verify-event-register.mjs
npm run typecheck
```

All collection API calls use staff middleware. Both new tables enable RLS and
revoke public privileges. No source evidence is included in anonymous catalogue
feeds. Source refreshes do not change the public catalogue revision.

## Extraction progress

`refresh-extraction-progress.sql` maintains staff-only, resumable work items in
`event_register_extraction_items`. Run it after source-record refresh. The source
coverage view reports fully extracted / known classified pages or documents,
with separate fixture/index and results counts. Partial, held, failed and pending
items remain in the denominator. Navigation links awaiting classification and
confirmed non-race documents do not enter the denominator. No full archive total
is inferred; even 100% of known work is not proof that the whole archive is done.
Feeds sharing a host share progress. CDN documents use their discovery website.

`extract-saved-result-documents.py` accepts an inventory and local original bytes.
It checks the saved SHA-256, preserves printed headers and page/line locations,
and separates explicitly labelled day columns. It emits raw observations only:
all nonempty extractions remain partial until column mapping and remaining
layouts have been reviewed. It neither creates athlete performances nor marks
identity verified. Cumulative standings and non-running documents are classified
separately. Unknown dates remain unknown; a year is not turned into 1 January.
Keep the input/output, source originals and database import receipts private.

New index observations use `origin='source-index'`. An index listing and a
results table are different work items: finding a results link never means its
finishers have been extracted. Reconcile known source URL/date/programme matches
before adding more catalogue editions. Registry reuse holds remain unchanged.
