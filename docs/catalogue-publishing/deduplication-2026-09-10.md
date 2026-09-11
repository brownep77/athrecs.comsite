# Production catalogue duplicate cleanup — 10 September 2026

## Applied outcome

The user explicitly requested a whole-catalogue duplicate audit and removal. The production database was scanned across all 9,606 event records and 223,950 dated editions. The conservative, reviewed cleanup is **already applied to production**, not merely prepared in this branch.

| Measure | Before | After |
| --- | ---: | ---: |
| Events | 9,606 | 9,450 |
| Editions | 223,950 | 223,132 |
| Stored results | 2,599 | 2,599 |
| Parkrun events | 2,960 | 2,960 |
| Entry options | 220,634 | 220,636 |

156 redundant event identities and 818 duplicate edition rows were consolidated. 148 distinct editions were reparented, not deleted. All original entry and results-source URLs were preserved; two additional secondary entry options retain otherwise-displaced source URLs. 156 permanent event redirects resolve to existing canonical events in the database. The May Bucharest Half Marathon and its 10K remain unchanged and separate from the October marathon.

Event matches comprised 96 identical World Athletics competition-ID/name/venue/date pairs, 15 same-name/place/date pairs and 45 reviewed source/sponsor/spelling aliases. Edition merges comprised 769 `Other` → `Track & field` placeholders, 20 Marathon → Marathon, 16 Half → Half, eight 10K → 10K, four reviewed `Other` → Marathon placeholders and one `1mi` → `1 Mile` alias.

This does not certify that every possible fuzzy duplicate has been eliminated. Shared names or organiser sites, separate distances, dates, locations, genders and genuine distinct events were not grounds for deletion by themselves.

## Safety, test and audit evidence

- Run: `catalogue-dedup-2026-09-10`.
- Neon project: `lively-resonance-04577945`, database `neondb`.
- Production branch: `br-flat-unit-aydbwlfk`.
- Isolated test branch: `br-spring-sunset-ay8eyf1y`.
- Pre-cleanup production snapshot: `snap-dry-darkness-aydgl3zg`.
- Production completion: `2026-09-10T07:18:40.299691+00:00`.
- Identical tested/executed engine definition MD5: `96aafb6186086a7ffab332c1e4f43816`.
- Before/after protected-data checksum: `0edc2713fc30dd3f58d34f59ff8a394b`.
- Protected checksum scope: results, result claims, hidden-result preferences and result-ingestion edition records.

The maintenance transaction held the catalogue seed advisory lock and table write locks, checked source records for protected dependants, recorded before-images, preserved every distinct normalized event/date/distance, and rejected unexpected counts or conflicts. The first test attempt rolled back on a PL/pgSQL variable/alias ambiguity; the corrected engine was then tested successfully before production execution. No production race data changed during that failed test.

Both test and production passed an idempotency check. Test replay of all retired event snapshots recreated zero records; canonical upserts succeeded; retired placeholder replay recreated zero rows. Post-commit production checks found zero orphan editions, entry options or competitions, zero broken event redirect targets and zero remaining identical-source `Other` / `Track & field` pairs.

Fourteen table-level sets of complete before/after images, 156 event mappings, 818 edition mappings, the original slug-guard definition and the exact executed maintenance engine are retained in `public.network_audit_log`. The temporary production cleanup function was dropped after successful execution. The ordinary append-only catalogue publication revision remains **16**; this is a distinct, audited maintenance operation.

## Re-creation prevention

`migrations/20260910_catalogue_duplicate_tombstones.sql` is already registered in the production `_migrations` table. It only guards identities explicitly present in the audited merge history and backed by a valid canonical row/redirect. It does not run the data cleanup. Existing normal historic-URL reservations and authentication are retained. Canonical `INSERT ... ON CONFLICT` remains supported. These guards do not claim to detect every new sponsor/spelling alias in future imports.

Merging this documentation/migration branch will not rerun the cleanup. No application merge or explicit production deployment was performed for this maintenance task.

## Fifteen pairs held for source review

These conflicts were recorded with both current event snapshots and source URLs under action `catalogue_duplicate_review_required`; no event/edition merge was applied to these pairs.

| Event or issue | Event IDs | Conflict |
| --- | --- | --- |
| Birmingham Running Festival | 4372582 / 3060009 | Unrelated Mansfield entry URL |
| Campeonato Gaúcho Sub20 | 3065462 / 3574589 | Different dates for the same WA ID |
| Freiburger Fünfkampfmeisterschaften | 3065533 / 3574893 | Different WA IDs |
| Futuras Promesas / Pradelia Delgado Ojeda | 3065794 / 3575270 | Different venue/city |
| IOW Marathon | 3147998 / 3060644 | 11:00 versus 10:00 |
| Miting AK Slavonija-Žito | 3065894 / 3575403 | Different dates for the same WA ID |
| Monsal Tinsel Trail 5K | 3148033 / 3059601 | 10:00 versus 10:30 |
| SAP Liberecký kraj | 3065413 / 3574573 | Different dates for the same WA ID |
| Salcey Forest Christmas 5K | 3148037 / 3059602 | 09:30 versus 10:00 |
| Samarkand Marathon | 3065154 / 3573972 | Different WA IDs |
| Take U to the limit / Croatian U23 | 3065776 / 3575226 | Different names for the same WA ID |
| Torneo Interclubes Concepción | 3065284 / 3574408 | Different dates for the same WA ID |
| Torneo Mujeres en Acción | 3065315 / 3574275 | Different dates for the same WA ID |
| Trófeu Bandeirantes | 3065572 / 3574802 | Venue and date-coverage differences |
| Trófeu Ivoti | 3065875 / 3573819 | Different dates for the same WA ID |

## Read-only audit retrieval

```sql
SELECT value::jsonb FROM app_meta
WHERE key = 'catalogue-dedup-2026-09-10';

SELECT entity_id, before_value, after_value, note
FROM network_audit_log
WHERE after_value->>'run' = 'catalogue-dedup-2026-09-10'
   OR entity_id LIKE 'catalogue-dedup-2026-09-10:%'
ORDER BY id;

-- Exact tested maintenance source, retained even though its temporary routine
-- was removed. Review before any reuse; do not execute against a changed DB.
SELECT before_value->>'sql' AS executed_source
FROM network_audit_log
WHERE action = 'catalogue_dedup_execution_source'
  AND entity_id = 'catalogue-dedup-2026-09-10:engine';
```

Restore using the snapshots/before-images only after reviewing any subsequent changes; do not blindly overwrite newer work. Production database records and redirect targets were verified. Public browser display was not independently verified during this run.
