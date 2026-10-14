# World Athletics career import

The owner requested all publicly listed World Athletics athletes, every available
career result, original factual biographies and discoverable profile URLs on
14 October 2026. This workflow continues that authorised import. It does not grant
access to private records, change athlete-controlled sharing, or verify ownership.
Follow `AGENTS.md` for every batch.

## Scope and checkpoint

`world_athletics_career_queue` is the staff-only checkpoint, keyed by the stable
World Athletics athlete ID. Never infer catalogue completion from the queue size.
`world_athletics_discovery_progress` records which source inventories have been
examined, their cursor and any unresolved limit. Source evidence and biographies
belong in the database, not in this repository or anonymous response payloads.

The public athlete search currently returns a bounded selection with no total or
pagination field. An empty search returned 30 profiles; this is not a complete
directory. The sitemap URL advertised in the source robots file returned 404.
Keep discovery incomplete until an exhaustive source inventory is established.
Use actual published directories, competition results and observed profile links
to discover more IDs. Do not guess IDs or claim that a bounded search is exhaustive.

Claim a bounded batch atomically, giving each run a unique lease owner:

```sql
WITH candidates AS (
 SELECT external_id FROM world_athletics_career_queue
 WHERE status IN ('pending','source_partial')
   AND (lease_expires_at IS NULL OR lease_expires_at < now())
 ORDER BY priority,external_id FOR UPDATE SKIP LOCKED LIMIT 25
)
UPDATE world_athletics_career_queue q
SET status='collecting',lease_owner=$1,lease_expires_at=now()+interval '50 minutes',
    updated_at=now()
FROM candidates c WHERE q.external_id=c.external_id
RETURNING q.external_id,q.athlete_id,q.source_url,q.source_evidence;
```

Only the current lease owner may update an in-progress checkpoint. Renew leases
before expiry if needed. Recover an expired collecting row by preserving its
evidence and setting `source_partial`; do not discard work. A published row is
not a reason to re-import the same history. Existing histories, private/claimed
profiles and ambiguous identities need a separate preserving review.

## Capture and independent comparison

Write a JSON target array with `external_id`, `athlete_id` (null for a new person)
and the actually observed HTTPS `source_url`. Use a fresh output folder for a new
source snapshot; cached files are for resuming that snapshot, not for declaring
an old capture current.

```sh
python scripts/collect-world-athletics-careers.py --targets TARGETS.json \
  --output CAREERS --assets-dir SOURCE_ASSETS --max-athletes 25 --max-requests 500
python scripts/verify-world-athletics-careers.py CAREERS
python scripts/test-world-athletics-careers.py
```

The collector reads the public profile and the public season-selector query from
the website's own assets. It does not use a private account or a guessed API.
Do not log or commit API configuration. HTTP 401, 403 or 429 stops collection;
preserve the checkpoint and report the source limitation without bypassing it.
The same stop rule applies when a CONNECT tunnel denial is wrapped in
`URLError` rather than `HTTPError`; keep the original error and stop the remaining
season requests. Do not retry through another route after an access denial.
At most three requests are in flight. Reduce the batch if the source needs it.

For each athlete, compare the returned source ID and every advertised active
season. The returned season parameter must equal the requested year; a profile
URL with `?resultsByYear=` alone can silently return the current year. Empty or
missing active seasons mean incomplete. Preserve exact marks, winds, round
placings, dates, venues, countries, event IDs, junior implements, relays and
non-finishes. Only literal duplicate source rows may be collapsed. A source
verified result does not verify athlete identity.

UNC (uncertified) marks stay in stored evidence with `profileExcluded=true` and
`verificationStatus=unverified`, including when the source `notLegal` flag is false.
Before publishing an existing profile, export all its recorded results, including
private/excluded rows, with their event slug/date/distance and complete source-row
details. Run `reconcile-world-athletics-careers.py --careers CAREERS
--recorded-results RECORDED.json`. Inspect every conflict. The script requires an
exact source athlete/competition/event identity plus date, road discipline, mark,
round and placing before linking an existing event slug. It preserves exclusions,
private visibility, unverified status and disqualifications. Do not waive a
conflict merely to publish. Verify the combined profile timeline removes the
reviewed overlaps and keeps held rows out. Re-read the stored records before
production publication; rerun reconciliation if anything changed.

Keep `candidate.json` (identity, honours, PB facts, original rows, source hash and
capture date) in `source_evidence` when pausing. Mark a partial candidate
`source_partial`; unsupported source format/access becomes `blocked` with the
actual error. Do not publish an incomplete snapshot through the complete-career
publisher. Independently compare stored rows after publication as well as before.

## Identity, biography and publication

Use exact source identities for existing profiles. Before creating anyone, screen
source IDs/URLs, normalised and reordered full names, accent-free spellings,
stored aliases and registered names, plus observed alternative names. A name
match alone cannot establish that two people are the same. Hold ambiguity as
`identity_review`; never create a duplicate to avoid resolving a match.

Write an original biography from inspected source facts. Lead with the person's
name, represented country and principal event; select meaningful championship
results and accurately qualified PBs. Do not copy source prose, pad thin records,
invent background details or call wind-assisted marks legal records. The opening
sentence should answer a natural spoken question about who the athlete is.
No ranking, AI inclusion or voice-search placement can be guaranteed.

The publication preparer takes a JSON map from source ID to reviewed biography:

```sh
python scripts/prepare-world-athletics-career-publication.py --careers CAREERS \
  --biographies BIOGRAPHIES.json --output REVIEWED_SQL
```

New identities additionally require `--new-identity-reviews REVIEWS.json`, a map
of source ID to `noExistingIdentity`, `checkedAt`, `checkedNames`, `displayName`,
`familyName` and `slug`. These are actual review findings, not defaults. Use clean
name slugs; if a slug belongs to someone else, hold/review the collision and use
a stable `-wa-SOURCEID` suffix where appropriate. Preserve existing URLs.

Review the generated SQL and execute it on a disposable Neon branch first.
Validate the history schema, independent source comparison, biography facts,
new identity, stable identifier and audit approvals. Repeating an insert must
produce zero additions. Then execute the same approved statements in production.
New profiles, source identity, complete history, biography and approvals are
atomic. The publisher refuses to overwrite an existing WA history or a
claimed/private existing profile. It fills only exact source birth dates and
preserves existing nationality. Actor IDs must identify real accounts; do not
fabricate a system user. The audit note records the owner instruction.

Existing profile SEO uses the public biography, visible results, WebPage/Person
structured data, canonical URLs and the publication-aware athlete sitemap.
Verify a live page and an older result page after each batch. Check the visible
biography and counts, HTTP 200, robots policy, canonical, Person entity and
absence of staff evidence URLs. Do not expose research notes, add keyword
stuffing, fabricate FAQ content or use inappropriate rich-result markup.

Report new profiles, completed listed careers, source performances, biographies,
pending/held counts and source discovery limits separately. Disable continuation
only when discovery and all eligible career work are complete, or when a real
blocker prevents useful progress. Never label all lifetime competitions complete
merely because every season currently listed by World Athletics was captured.
