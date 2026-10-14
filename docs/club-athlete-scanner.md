# Club athlete scanner

Staff entry: `/admin/club-scanner` on **update.athrecs.com**. The scanner uses the existing dedicated-host, Google identity and staff allowlist middleware. The navigation also links to the athlete directory.

1. Choose a club, exact source-name variants and a past date range (five years by default, up to eleven calendar years). Broad substrings and guessed affiliations are not accepted.
2. Start a scan. Total Race Timing's actual results index supplies discovered result URLs. Additional TRT result URLs can be supplied. Other provider/PDF links are retained as manual-review source jobs; this version does not claim to parse them.
3. Inspect progress, pause/resume or retry failures. Jobs and decisions are durable in PostgreSQL. The authenticated production worker processes one source job per minute; staff can also process the next source on demand. The table reader makes no LLM/API research calls. A separate ChatGPT research task handles unfamiliar sources for the six-club pilot.
4. Review source columns beside possible athlete profiles. Keep uncertain matches held, record notes, dismiss/reopen, approve a distinct new athlete, or link to a specific existing athlete. Approving a result requires an evidence URL and confirmation that each source row and identity/grouping was checked. Similar names and initials never auto-merge. Source-format errors must be resolved by re-fetching the source, not an identity override.
5. Publish up to ten approved rows. Publication fetches source tables again, repeats the independent TRT comparison, rejects changed values and rechecks profile identity, ownership, privacy and duplicate records. It atomically creates the approved new public profiles and published source histories. Canonical results and PBs are untouched. Eligible source positions can appear in the existing source-history win highlights.

## Coverage and evidence

The first adapter covers server-rendered Total Race Timing result tables. Headings map every column; chip, gun and generic time are distinct; times retain decimals, and overall/gender/category places remain separate. Date, race, table anchor and bib come from the source. Missing dates remain missing in the held workspace; no birthday, nationality, location or age is inferred. Broad distance labels such as “Wave 1” need manual interpretation and stay held.

The scanner records the source row, complete captured tables, content hash and capture time. The existing independent `scripts/lib/result-evidence-audit.mjs` comparison runs both during extraction and immediately before publication. Automated source comparison is not identity verification: staff must record the identity decision. Source histories remain marked incomplete.

The queue contains proposals and uncertain findings produced by this scanner. Older manually collected WAC/CONAC review files are not silently imported, and scanning does not guarantee all providers or every race are covered. Exact source duplicates are skipped; other results on the same athlete/date are held for comparison. Repeated scans reuse source keys and preserve existing review decisions. A manual recheck clears approval and retains an audit entry.

## Operations

Migration `20260922_club_athlete_scanner.sql` creates only new workspace tables and indexes. It contains no athlete data changes or seed catalogue. The worker uses the existing `CRON_SECRET`; absent/incorrect credentials reject requests, and preview workers do no work. Source fetching is restricted to explicit HTTPS Total Race Timing paths, refuses redirects and enforces response size and time limits. Provider outages and unsupported formats are visible in the saved scan.

## Regular club plans

The **Regular club checks** panel saves aliases, sports to research, result links,
research websites, priorities, historical start, recent window and interval for
any directory club. The six-club setup resolves existing slugs for 10Ironwomen,
Wymondham AC, Norwich Road Runners, Norfolk Gazelles, City of Norwich AC and Bure
Valley Harriers. It never creates clubs or replaces existing plans. Setup is a
staff action, not a migration side effect.

Migration `20261014_club_collection_plans.sql` adds private plans, revision checks,
operational audits, a compressed source cache and indexed athlete name lookup.
The production minute worker queues due plans with row locks. The first scan
starts at the historical date; later scans revisit the configured recent window
(45 days by default, daily). A running or paused scan prevents a second scan for
that club. Pausing a plan also pauses its active automatic scans and prevents
automatic publication. Resume continues the saved scan. Edits apply to the next
scan; a requested check waits for the current scan to finish.

Jobs are ordered by index, source URL and run age, so nearby club jobs reuse a
source retrieval. The cache holds at most 64 compressed pages, each at most 6MB
uncompressed; index TTL is one hour and result TTL is 24 hours. Fetch timestamps
are retained separately from the time a source is compared. Publication always
fetches the original again, bypassing the cache. This is bounded shared fetching,
not a claim that every race is downloaded only once forever.

When enabled, the worker publishes at most one **already reviewed and approved**
candidate per tick. It never sets an identity approval itself. It rechecks the
source and existing ownership, visibility and duplicate controls; failures move
the candidate to review with the reason retained. A changed source row also
clears any prior approval and returns the candidate to review. Published history
is preserved pending an explicit correction. Result source verification is
separate from athlete account identity and canonical PB eligibility.

The panel reports discovered sources checked/remaining, problems, scanner results
published, duplicates, review work and profiles created. These are not total club
career coverage. Unsupported links remain explicit research work. Sports and
research priorities guide research; the TRT adapter still only interprets its
supported running tables. Separate research publications are recorded in the
research checkpoint and their existing athlete publication audits.

## Hourly research pilot

The ChatGPT automation reads enabled plans and prioritises the least recently
researched club. It opens actual organiser/timing/governing-body evidence, checks
identities and duplicates, and publishes only supported additions under Paul's
standing authorization. It can work on any of the six clubs during a run; all
six are not promised a complete research pass every hour. It must honour paused
plans and recheck them immediately before writes. Private evidence remains in
the backend. It does not contact clubs or athletes or create accounts.

Persist `research_checked_at` and `research_checkpoint` on the corresponding
plan, with a concise `summary`, source URLs, rows reviewed, results/profiles
published, skipped duplicates, held reasons and the next research lead. Add a
`club_collection_reviews` audit for each checkpoint update. Before modifying the
checkpoint, compare the previous value and enabled state to avoid overwriting
another run. An unsuccessful check is a blocker, not proof of no new results.
Use existing approved review/publication workflows for scanner candidates and
the established guarded evidence-backed import path for other providers. Never
approve results from a URL or search snippet alone. The task and scanner share
source identities and the live database for duplicate checks.

This is a pilot, not universal source support or a guarantee of ChatGPT-level
accuracy. Benchmark accepted and held rows against manual source review before
expanding. The native worker does not incur AI API calls; the separate research
task has its own execution limits. Pause the task as well as club plans to stop
all research execution.

All review, publication and source-recheck decisions are recorded in `club_scan_reviews`. Existing managed or private profiles require their separate owner/publication workflow; this screen cannot override those controls.

## Validation

`npm run verify:club-scanner` uses synthetic result tables and an isolated PGlite database. It covers source precision, optional columns, club-name boundaries, ambiguous names, missing dates, source URL restrictions, reviewed publication, source changes, privacy/ownership, transactional rollback, rescans and decision history. It runs in the quality gate. `node --experimental-strip-types scripts/preview-club-scanner.mjs` starts a disposable UI fixture on port 8097; it cannot write to production.
