# UTMB public source import

The owner requested UTMB runner profiles, source nationalities, race histories,
fixtures and central archive capture on 10 October 2026. This is a bounded,
resumable acquisition, not a complete import of UTMB's multi-million-runner
directory or every race's full field.

`scripts/collect-utmb.py` captures the public ranking feed used by runner search,
then public runner pages and upcoming World Series event pages. Captures include
the original page, checksum, URL and timestamp. No login-only index scores are
requested. Rate/access errors stop collection; temporary 502/503/504 errors have
three bounded attempts. Existing captures resume without another request.

Use a private work directory outside Git:

```sh
python scripts/collect-utmb.py --work /private/utmb --per-gender 100 --offset 0
```

The next bounded directory pass uses `--offset 100`. Both genders are included;
this ranking order is not coverage of every age category. Results exceeding the
public page's 500-row limit require further work. Histories remain `complete=false`.

`scripts/import-utmb.py` requires an explicit Neon project/branch connection
file and `--confirm-branch`. Rehearse with `--review` on a production copy before
the owner's authorized production `--publish` run. Source pages and **all**
their result rows, including held rows, are stored privately in
`result_archive_source_captures`, searchable in the central archive by athlete.
These captures are runner histories, not complete race fields.

New profiles are public, unclaimed source profiles under the owner's existing
publication instruction. Nationality comes only from UTMB's explicit country
code and keeps its provenance. Race location is not athlete nationality or
residence. Source age groups do not become exact ages or birth dates.

Matching uses the established full AthRecs directory/account name and alias
screen, with a before/after fingerprint and a transactional recheck. A possible
name match is held with supporting/opposing reasons. An existing stable UTMB
source ID can extend its existing history; old observations and publication
settings are retained. Same-day legacy rows lacking edition IDs and changed
source performances are held, not overwritten or duplicated. Import audit rows
retain before/after histories. Source histories remain explicitly unverified;
this importer does not create verified PBs or change canonical results/claims.

`scripts/import-utmb-fixtures.py` reads individual race cards and reuses uniquely
matched existing events. It preserves exact advertised kilometre distances,
dates, locations and entry URLs. Missing start times remain unknown. A result-
free, unreferenced whole-weekend placeholder can become a specific race. Other
distances receive separate editions; matching date/distance/source rows are
skipped. Missing measured distances, conflicting dates and unclear event
identities are held. Every placeholder change has a before/after audit.

```sh
python scripts/verify-utmb.py
npm run typecheck
```

Validation includes synthetic DNF, time, nationality, altered-source, future-date
and repeat/conflict cases; an isolated database rehearsal; a fixture replay that
added zero rows; and post-import source-ID/nationality/result-count checks.
Private evidence, connection files, review queues and receipts must stay outside
source control. Fixture seed data is kept consistent with published expansions.
