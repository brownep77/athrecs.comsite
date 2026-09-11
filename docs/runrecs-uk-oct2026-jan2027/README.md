# RunRecs UK race audit: October 2026–January 2027

Requested destination: RunRecs. UK running races with a known distance greater than zero and no more than 100 km, dated 1 October 2026 through 31 January 2027 inclusive.

## Published additions

- 392 race-distance editions across 228 event identities.
- 145 new events; 83 existing events receive missing editions or distances.
- Four bounded import batches, with at most 75 events per batch.
- No existing event fields, editions, entry options, aliases or results are overwritten.
- Dates, distances and provenance were checked on 11 September 2026.

The scan covered RunABC's Scotland, North, Midlands and South calendars for all four months, supplemented by the Fell Runners Association, SiEntries and Athletics Northern Ireland. It is a verified set of additions, not a claim that every UK race has announced its 2026/27 date. Crown dependencies, overseas races, virtual races and ambiguous or unbounded distances were excluded. Unresolved dates and conflicting listings remain in `audit.json`. Entry availability is TBC unless the source explicitly showed the event as full.

Canonical event names, current and historical slugs, existing date/distance editions and pending import identities were checked before creating additions. Really Wild Boar's 5.6-mile listing is the rounded alternate unit for its primary 9 km race and was combined into one edition.

## Publication scope

RunRecs reads the shared Running catalogue. AthRecs has an existing temporary UK/Ireland 5K and 10K collection. The accompanying code excludes edition IDs inserted by `runrecs:uk:0-100km:` batches from AthRecs listings, event details, calendar results and official entry redirects. Earlier AthRecs fixtures retain their existing visibility. RunRecs catalogue queries are unchanged.

The scope uses immutable insertion records in the existing catalogue audit log and requires no schema changes. It does not infer ownership from event names or source domains.

## Validation and release

The exact payload is staged, validated and published on a disposable Neon review branch before production. Validation checks date and distance bounds, UK countries, source URLs, canonical aliases, expected new-event counts and live duplicates. Publication locks the current catalogue revision and affected events, then records complete before/after snapshots for normal rollback tooling.

Final review branch: `br-delicate-rain-aydvme02`. The first review identified and removed the duplicate alternate-unit entry. Production publication must follow a successful code deployment of the RunRecs scope filter, so newly added short races never enter AthRecs during release.

`manifest.json` contains the exact batch IDs and payload hashes. Run each numbered batch's stage, validate and publish SQL in order. The combined payload and audit are included for inspection. These files are audit records, not build-time data migrations.

Published on 11 September 2026 as catalogue revisions 18–21 after PR #444 and production deployment of commit c34baa8bc9afcff8e60c66983ea021c1944a6785. The final production query confirms 392 additions at 228 events, including 145 inserted event identities and 83 existing identities, with no out-of-scope rows or duplicate distances.

The ten public race-page checks passed, including RunRecs pages across all four UK nations, three new short-race URLs returning 404 on AthRecs, and an earlier AthRecs race remaining available. RunRecs search and the interactive January calendar include Race Over the Glen; AthRecs search and calendar exclude it. See production-receipt.json, public-verification.json, collection-verification.json and calendar-browser-verification.json.
