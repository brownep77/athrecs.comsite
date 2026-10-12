# Running event register

Staff route: `/admin/event-register` on `update.athrecs.com`.

The first release reads the current catalogue directly. It does not duplicate
event identities, replay imports, publish results or manufacture historical years.
Database views make future catalogue additions available automatically.

The **United Kingdom (all home nations)** country filter includes England,
Scotland, Wales and Northern Ireland as well as records labelled United Kingdom
or a UK country alias. Each home nation remains separately selectable, and stored
country labels are unchanged. Ireland and the Crown Dependencies stay separate.
The table displays 50 events per page, with the full matching total above it.

## Scope and grain

- Running, Parkrun and OCR events, including events with no dated editions.
- Athletics: road, XC/cross-country and mountain events, plus identifiable running
  distances on track. Walking, field and combined events are excluded. Mixed
  track-and-field programmes await discipline classification rather than being
  counted as running races. The SQL migration defines the exact predicate.
- Retained canonical aliases are excluded in the service using the existing map.
- One event keeps its canonical ID. One dated race keeps its edition ID, exact
  date and distance. Year is a grouping/filter, not a replacement identity.
- Cancelled and historic editions remain inspectable. Existing provisional or
  recurring catalogue records retain their recorded status; none are reverified
  by appearing here. Surface strings remain as recorded, including provisional
  or unknown labels; they have not been silently normalised.

## Coverage

Counts distinguish result links, archived rows and results linked to athletes.
The latter two can overlap and must never be summed as unique performances.
Dataset expected row counts remain unknown when absent; matching the expected
count is labelled a count match, not independent verification or completeness.
The edition detail keeps chip, gun and unspecified times separate. Private
athlete results contribute counts only; participant identities are not returned.
Athlete source histories without canonical edition mappings are outside these
counts and need a later reconciliation step. Publication records are shown as
recorded per brand; a missing publication receipt is unknown, not unpublished.
This first release covers existing catalogue events, not all possible events or
all historical editions from every external source.

## Contacts and event lifespan

The event's existing organiser and website appear without inferring an email,
phone, current contact or official approval. Direct contacts use append-only
observations with organiser, business contact details, current/historical/future/
unknown period, applicable years, evidence URL and checked date. These fields
are ready for collection; the seed catalogue has no structured email/phone fields.
Contact versions are observations, not proof that an older address is still valid.

First-ever year/date and confirmed final year/date require a source, checked date
and evidence note. They remain separate from the earliest/latest catalogue edition.
No future fixture does not establish that an event ended. Paused is distinct from
ended. Lifecycle observations and collection priority/next check/notes are
append-only; optimistic revision checks prevent silent concurrent overwrites.
No contact outreach is performed by this feature.

## Access, performance and verification

All four server functions use the established staff middleware (host, Google
identity and allowlist, same-site checks, private no-store headers). There is no
new public endpoint. Filters and pagination run on the server, 50 rows at a time.
CSV exports explicitly cover the displayed page and escape spreadsheet formulas.
Event IDs are checked against running scope on both reads and writes.

Run `node scripts/verify-event-register.mjs`, `npm run typecheck`, and `npm run build`.
The focused test applies the real migrations and service queries to a disposable
PGLite database with synthetic events and people, including exclusion, multiple
same-year occurrences, missing years, archive/linked overlap, temporal contacts,
evidence validation and stale-write rejection. Test the additive migration on a
Neon branch of production before release. The existing build migrator applies it
once and records its filename during deployment.

## Initial catalogue baseline — 12 October 2026

The production-branch rehearsal, excluding the existing retained alias map,
returned 13,627 events and 233,094 dated race records:

| Category | Events | Dated race records |
| --- | ---: | ---: |
| Running | 8,436 | 15,577 |
| Parkrun | 2,974 | 215,217 |
| Identifiable running within Athletics | 2,208 | 2,291 |
| OCR | 9 | 9 |

These are observed catalogue counts, not independently verified race occurrence
counts. Weekly recurring/provisional fixtures contribute to the dated records.
9,164 events have a stored website and 8,623 have an organiser value. Direct
contacts and verified lifespan observations start empty and are an explicit
research queue. Canonical result coverage includes 6,663 dated races with
37,339 linked results; 742 dated races have archived rows. These overlap.

Validation: focused SQL/service regression passed; typecheck and local build
passed. The additive migration and full-size register query ran successfully on
an isolated Neon branch. Browser visual QA was unavailable in this environment.
The pre-existing standalone `verify-staff-microsite.mjs` check fails on its
`socialProviders: {` text-pattern expectation in unchanged authentication code;
the new register uses the existing middleware and its own guard coverage.
