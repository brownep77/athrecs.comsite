# World Triathlon: whole-archive import preparation

## Status and boundaries

This is a read-only readiness audit and implementation checklist, not a collector
or an import release. It does not fetch competition data, create profiles, merge
athletes, publish fixtures, change rights settings or enable a scheduled job.
Production counts and individual evidence belong in private staff storage, not
this public repository. Tests use synthetic counts only.

The World Triathlon terms inspected on 2 November 2026 require prior written
permission for automated access/data collection (section 5), and permission for
commercial use (section 7). Their app-registration guide also requires an API key.
An AthRecs owner-private/staff-only capture approval is not provider authorisation
for automated collection or public reuse. Application registration or a working
key alone must not be treated as a blanket republication licence. Preserve the
existing disabled source settings until the actual written scope is reviewed.

## Run the existing-data audit

Run against the intended database with an appropriately authorised, preferably
read-only role. Keep credentials in approved local configuration, not arguments,
logs or source control. Use a private directory outside the repository:

```sh
# PGSERVICE is a locally configured connection; this example contains no secrets.
PGSERVICE=athrecs-readonly psql -X -qAt -v as_of=2026-11-02 \
  -f scripts/world-triathlon-readiness.sql > /private/wt-snapshot.json
node scripts/world-triathlon-readiness.mjs /private/wt-snapshot.json
node --test scripts/verify-world-triathlon-readiness.mjs
```

The SQL transaction is read-only. The JavaScript report reads that snapshot only;
it does not connect to a database or provider. No run is scheduled by these files.
Choose the review date explicitly. The inclusive near-term window is three
calendar months, clamped at month-end, not 90 days.

The scope is deliberately bounded: event/website links on triathlon.org or its
subdomains, their edition rows, histories whose provider is exactly World
Triathlon, and their World Triathlon source keys. Other federation domains are
not included just because their names contain "triathlon". Edition-only links,
native results, other providers, unkeyed results and previously merged identities
need additional reconciliation before an all-catalogue conclusion. Stored rows
are not necessarily publicly displayed fixtures. Nonblank starts are not proof
of an edition-specific source review. A complete-history flag is not fresh proof
of a complete career. This audit never sets verification flags.

## Permission and connection checklist

Obtain and retain World Triathlon's written scope for historical and future event
metadata, complete result tables, splits, athlete sporting facts, commercial
AthRecs display, cached storage, correction handling and any permitted refresh
cadence. Confirm attribution requirements, retention/withdrawal rules, quotas and
whether age-group and junior data need separate handling. Exclude contact data,
photos, video and copied biographies unless separately authorised.

Register the AthRecs application and store its issued key server-side. Record the
permission evidence, reviewer, dates, authorised scopes and expiry/revocation in
staff-only storage. Do not reuse a website's embedded credentials, invent an
approval, accept terms silently or activate a general scraper as a fallback.

## Resumable coverage plan after authorisation

1. Declare the accessible historical date range and future-calendar horizon.
   Traverse every page of Event Listings, reconciling reported totals with unique
   event IDs. Partition the work by calendar month with boundary overlap and
   ID-based deduplication. Keep cancelled/postponed events and revisions distinct
   from new fixtures. A homepage list is not the full event archive.
2. For each event, inspect every race programme and its edition-specific detail.
   Retain event ID and programme ID, local date/time, timezone, category, race
   format and each component distance. Do not derive component distances from a
   Sprint/Standard label, manufacture a start, or flatten a multi-day event into
   a single race. Review today/next two days, seven days, 30 days, then the rest of
   three calendar months first. Unknown distances stay out of public fixtures.
3. Retrieve complete programme results, not a podium/position-limited response.
   Preserve each result ID, athlete/team ID, status, published timing precision,
   rank semantics, penalties, transitions and ordered split headers. Header names
   may repeat, so keep their segment identifiers and order. Team/relay finishes
   must not be recorded as individual total times. Do not convert starts into
   finishes or DNF/DNS/DSQ/LAP into a completed performance.
4. Traverse Athlete Listings and the relevant paginated athlete-results methods
   as allowed by the agreement. The profile endpoint's latest-five preview is
   not a full career. Cross-check the event-first and athlete-first inventories.
   Treat team history separately and retain unresolved identity and coverage
   gaps rather than claiming the whole site is complete.
5. Save durable private checkpoints for partition/page, event/programme, result
   and athlete history, including response hashes, original captures, capture
   time, permissions, parse version and error/hold reason. Atomically save a
   successful page before advancing its cursor. Respect quota and Retry-After;
   stop on authorisation failures, repeated cursors, schema drift or incomplete
   totals. A request cap or successful batch is not completion.

## Deduplication, profiles and publication

Reuse the existing `athlete_source_identities` mapping for an evidenced World
Triathlon athlete ID. Reconcile `athlete_source_histories` and native result stores
before adding a result. Preserve the existing World Triathlon programme/result
key convention; do not mint a second key merely because the URL/slug changed.
Compare source rows when an existing result changes; keep original facts and an
audit rather than silently replacing history.

An exact or fuzzy name is a candidate search, not merge authority. Source-ID
conflicts, compatible same-name candidates and claims/privacy conflicts stay held
for reviewed resolution. A nationality match alone is not sufficient. Keep one
cross-sport athlete identity when supported; preserve claimed accounts, privacy,
hidden results, stable public slugs and aliases during any approved structural
merge. New unclaimed profiles still require collision review and publication
approval. Do not manufacture birth dates from age groups, nationality from a
venue, or residence from a representative country. Do not copy profile photos or
biographies merely because they are viewable.

A reviewed batch needs source-row comparison, identity review, duplicate checks,
privacy/rights review, an isolated database rehearsal, a before/after receipt and
public readback. Keep source verification separate from account ownership and
profile review. Apply fixture seeds and canonical records consistently. Preserve
required provider credit and private evidence in their appropriate projections.
No automatic merge or publication writer is implemented in this preparation.

## Completion criteria

Report separate totals for discovered, fetched, parsed, matched, newly created,
duplicate, held, excluded and published records. Reconcile source totals, all
pages/programmes, source IDs, repeated runs and cross-index differences. Account
for every hold and failed page with a retry/review reason. Until the declared
scope reconciles, call the work partial. Scheduled refresh and the remaining
collector/publication implementation are separate work, not enabled here.

## Official technical references

- Terms: https://triathlon.org/terms-and-conditions
- Registration: https://developers.triathlon.org/docs/register-and-manage-your-app
- Events: https://developers.triathlon.org/reference/event-listings
- Programmes: https://developers.triathlon.org/reference/program-listings
- Programme results: https://developers.triathlon.org/reference/program-results
- Athlete profile: https://developers.triathlon.org/reference/retrieve-athlete-information
- Athlete results: https://developers.triathlon.org/reference/athlete-results
- Pagination: https://developers.triathlon.org/docs/responses-and-status-codes

These references describe the integration. They do not verify an individual
athlete, licence an import, or establish that a live API call was tested.
