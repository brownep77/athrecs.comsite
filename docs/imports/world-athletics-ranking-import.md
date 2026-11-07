# World Athletics rankings import — 1,000 entries per batch

Status: implementation specification; **no ranking records are imported by this document**.

## Objective and scope
Ingest permitted World Athletics rankings for all countries, men and women, current and historical dates, and all track, road, field, race-walk and combined-event disciplines. Prioritise running in the first processing waves, but never silently omit other disciplines.

Read World Athletics' usage conditions and obtain an appropriate data access agreement/licence if required **before enabling automated bulk retrieval or republication**. Do not evade access controls, rate limits, CAPTCHAs or other restrictions. Preserve source attribution. The retrieval adapter must support an authorised export or feed; an HTML adapter may be enabled only if access and reuse are permitted.

World Athletics overall ranking reference: https://worldathletics.org/world-rankings/overall-ranking/men

## Phases
1. **Current overall rankings:** men and women; every page, ranking as-of date and all ranking countries; snapshot ranks/points.
2. **Event-specific rankings:** include road 5K, 10K, half marathon and marathon; 800m/1500m/3000m/5000m/10,000m; cross-country and race walking where represented, then sprints/hurdles, jumps, throws and combined events. Capture event-group-specific ranking snapshots.
3. **Historical rankings:** traverse available ranking dates, retired athletes, Olympians, world record holders and previous top-ranked athletes. Historical athlete inclusion must be evidenced by a source record.
4. **Profile enrichment and performances:** canonical source ID, verified public name, sex/category, represented nation, event disciplines, athlete source link, rankings, sourced performances and PBs, a factual SEO bio; never invent performances or award automatic verification without official support. Do not publish private contact information, private profile fields or full DOB solely because a source has it.
5. **Incremental refresh:** latest ranking-date discovery; reprocess changed athlete and ranking records, retain earlier dated snapshots, alert on provider ID collisions, identity disagreement and content removal/correction.

## Unit of work
- Batch size: **exactly up to 1,000 ranking entries** (a ranking entry is one athlete in one ranking list/date, not one new athlete). Zero or fewer than 1,000 at the end of a list is legitimate.
- Stable batch key: `provider + ranking_date + sex + event_code + region_filter + page_cursor_range`. A batch may span source pages but not mix snapshot dates; persist explicit source cursor(s).
- Process batches sequentially per provider/ranking partition; parallel partitions must lock canonical athlete ID.
- Persist source provenance, fetched_at, raw checksum, source URL, ranking date, event, rank, score, athlete external ID and any source evidence. Store licensed source data only within granted rights.
- Stage and validate before any athlete/profile write. A rerun of the same batch must be idempotent, with upserts by provider + external athlete ID and provider + ranking snapshot + event + external athlete ID. No duplicate rankings or profiles.
- Resume from the last confirmed cursor after crash or rate limit. Retry transient errors with backoff, quarantine malformed records, keep counts and actionable errors.

## Identity matching
1. Exact `athlete_source_identities(provider='worldathletics', external_id)` match is primary.
2. If ID is new, compare source-verified name/aliases, sex, nation, DOB or competition year (used internally only) and existing source-linked profiles; cross-check against conflicting known provider IDs. **Names alone must never trigger auto-merge.**
3. One defensible unique candidate: attach source identity and update permitted facts, preserving claimed user edits and visibility choices.
4. Multiple candidates or inconsistent identity: review queue; never resolve automatically.
5. No suitable candidate: create **one unclaimed athlete profile**, only when permitted by data terms and sufficient public identity evidence exists. Never create a user account or imply the athlete registered.
6. A ranking entry is **not** a performance result. Performance imports require separate verified source-level evidence and deduplication.

## Suggested new tables (migration after reviewing repo conventions)
- `ranking_import_runs`: id, provider, snapshot_date, job_type, status, started_at, finished_at, config, totals, error.
- `ranking_import_batches`: run_id, partition_key, batch_index, first_cursor, next_cursor, entries_expected, staged, matched, created, reviewed, rejected, committed, checksum, status, timestamps; unique(run_id,partition_key,batch_index).
- `ranking_import_staging`: batch_id, source_record_key, athlete_external_id, ranking_date, sex, event_code, area_code, rank, score, source_url, payload_json, validation_status, match_candidate_id, review_reason; unique(batch_id,source_record_key).
- `athlete_ranking_snapshots`: provider, ranking_date, sex, event_code, area_code, athlete_id, external_id, rank, score, source_url, captured_at; unique(provider,ranking_date,sex,event_code,area_code,external_id).
- Optional identity review table or reuse current bulk athlete result review workflow if its invariants allow a ranking-specific queue.

## Operator experience
- Admin screen shows **1,000 entries at a time**, with counts: processed, existing identity matches, new unclaimed profiles, ambiguous review, invalid/rejected and source errors.
- Review decisions: Accept / Reject / Later, plus bulk approval only of sufficiently corroborated, nonconflicting matches. Preview changes before commit; keep an audit log and undo plan.
- Display ranking source/athlete links beside each candidate and differences from existing athlete record. Human approval is required for conflicting IDs, sex or nation histories, claims, and other ambiguous cases.
- User-facing publication must respect private/claimed athlete settings; profiles must not leak private source results, club or DOB.

## Batch acceptance criteria
- 1,000 valid entries can be staged, reviewed, committed and re-run without any duplicate profile, identity link or ranking row.
- A sample with the same athlete in multiple event rankings makes one athlete and multiple dated ranking records.
- A conflicting source ID, same-name athlete or conflicting sex/nation cannot silently merge.
- All 1,000 entries accounted for by status; number of processed entries equals sum of matched + newly created + review + rejected/error outcomes (define mutually exclusive final statuses).
- Simulated API outages, partial pages, concurrent runs and failed DB commits can resume safely.
- Ranking snapshots are immutable by date except auditable provider corrections.
- No unintended changes to claimed profiles or privacy choices. Validate existing profile and result visibility tests.
- Dry-run first; activate source adapter only after licensing/access verification and automated tests.

## First rollout
1. Validate source permissions and choose approved data access.
2. Add migration, import adapter interface, staging validator, resolver and queue behind feature flag (default off).
3. Dry-run men + women overall ranking **first 1,000 entries each**; report match/new/review counts without publishing.
4. Examine 100 random matches and every high-risk identity resolution; fix errors and run integration tests.
5. Commit approved 1,000-entry batches, then expand to road-running/distance event categories, other events, historic snapshots and scheduled incremental updates.
6. Report weekly counts and last successful source snapshot; do not claim completion before all partitions are accounted for.

## Existing project context (checked 4 Nov 2026)
- `athletes` currently 1,103,422 records.
- `athlete_source_identities` has 21,980 `worldathletics` links.
- `athletes.source_url` has 21,826 World Athletics links.
- `athlete_source_histories` uses multiple World Athletics provider labels; do not interpret one label count as complete coverage.
- Top 10 male and top 9 female overall ranking names examined already have existing AthRecs identity-linked profiles. These figures are audit baseline only.
