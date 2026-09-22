# Club athlete scanner

Staff entry: `/admin/club-scanner` on **update.athrecs.com**. The scanner uses the existing dedicated-host, Google identity and staff allowlist middleware. The navigation also links to the athlete directory.

1. Choose a club, exact source-name variants and a past date range (five years by default, up to eleven calendar years). Broad substrings and guessed affiliations are not accepted.
2. Start a scan. Total Race Timing's actual results index supplies discovered result URLs. Additional TRT result URLs can be supplied. Other provider/PDF links are retained as manual-review source jobs; this version does not claim to parse them.
3. Inspect progress, pause/resume or retry failures. Jobs and decisions are durable in PostgreSQL. The authenticated production worker processes one source per minute; staff can also process the next source on demand. There are no LLM/API research calls.
4. Review source columns beside possible athlete profiles. Keep uncertain matches held, record notes, dismiss/reopen, approve a distinct new athlete, or link to a specific existing athlete. Approving a result requires an evidence URL and confirmation that each source row and identity/grouping was checked. Similar names and initials never auto-merge. Source-format errors must be resolved by re-fetching the source, not an identity override.
5. Publish up to ten approved rows. Publication fetches source tables again, repeats the independent TRT comparison, rejects changed values and rechecks profile identity, ownership, privacy and duplicate records. It atomically creates the approved new public profiles and published source histories. Canonical results and PBs are untouched. Eligible source positions can appear in the existing source-history win highlights.

## Coverage and evidence

The first adapter covers server-rendered Total Race Timing result tables. Headings map every column; chip, gun and generic time are distinct; times retain decimals, and overall/gender/category places remain separate. Date, race, table anchor and bib come from the source. Missing dates remain missing in the held workspace; no birthday, nationality, location or age is inferred. Broad distance labels such as “Wave 1” need manual interpretation and stay held.

The scanner records the source row, complete captured tables, content hash and capture time. The existing independent `scripts/lib/result-evidence-audit.mjs` comparison runs both during extraction and immediately before publication. Automated source comparison is not identity verification: staff must record the identity decision. Source histories remain marked incomplete.

The queue contains proposals and uncertain findings produced by this scanner. Older manually collected WAC/CONAC review files are not silently imported, and scanning does not guarantee all providers or every race are covered. Exact source duplicates are skipped; other results on the same athlete/date are held for comparison. Repeated scans reuse source keys and preserve existing review decisions. A manual recheck clears approval and retains an audit entry.

## Operations

Migration `20260922_club_athlete_scanner.sql` creates only new workspace tables and indexes. It contains no athlete data changes or seed catalogue. The worker uses the existing `CRON_SECRET`; absent/incorrect credentials reject requests, and preview workers do no work. Source fetching is restricted to explicit HTTPS Total Race Timing paths, refuses redirects and enforces response size and time limits. Provider outages and unsupported formats are visible in the saved scan.

All review, publication and source-recheck decisions are recorded in `club_scan_reviews`. Existing managed or private profiles require their separate owner/publication workflow; this screen cannot override those controls.

## Validation

`npm run verify:club-scanner` uses synthetic result tables and an isolated PGlite database. It covers source precision, optional columns, club-name boundaries, ambiguous names, missing dates, source URL restrictions, reviewed publication, source changes, privacy/ownership, transactional rollback, rescans and decision history. It runs in the quality gate. `node --experimental-strip-types scripts/preview-club-scanner.mjs` starts a disposable UI fixture on port 8097; it cannot write to production.
