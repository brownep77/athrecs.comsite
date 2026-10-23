# Athlete result finder

The staff tool at `/admin/athlete-result-finder` answers two separate questions:

1. Which stored source observations might belong to this athlete?
2. For an actual supported results URL, can we retrieve the page now and prepare matching rows for import review?

It is linked from Sources, Collected results, the staff navigation and each staff athlete profile. It requires the existing staff session and permitted staff host. Private source evidence never enters a member or public profile payload through these endpoints.

## URL storage versus searchable results

A saved URL identifies a location; it does not contain the participants or performances. Searching a URL string cannot discover a runner inside the referenced page.

| What AthRecs holds | What the finder can do |
| --- | --- |
| Canonical results, normalized archive rows, approved race captures or imported athlete histories | Search the stored participant observations immediately. |
| A supported public results URL | Fetch that one page on request, extract and compare names, and show a private preview. Staff can open selected matching rows in the importer. |
| An unextracted PDF, spreadsheet or other saved document | Show the extraction inventory state; use the existing extraction/import workflow before its participant rows become searchable here. |
| A source homepage, directory or unsupported results URL | Show source coverage and direct staff to existing collectors or import tools. Do not imply the source has been searched. |

The first version does not require storing an entire website. Retaining normalized result rows and their source URL, row locator, capture date and original evidence supports repeat searches and later source comparisons. A live preview itself is not a saved archive entry. The normal importer controls retention, mapping and review.

## Stored search

`searchAthleteSourceResults` searches four collections:

- Profile results in `results`, with athlete, event and edition context.
- Central observations in `result_archive_entries` and their datasets.
- Rows in the latest eligible, approved, staff-only `result_archive_source_captures`.
- Performances in `athlete_source_histories`, including private/unpublished histories labelled as such.

The search accepts a racing name, up to eight explicit aliases, an optional club filter, years and a registered source website. Source filtering matches its registered hosts and subdomains, not arbitrary substring lookalikes. Name words and aliases generate possible matches; they do not establish identity. Club and year filters exclude rows where the required information is absent, so start without them when coverage is uncertain.

The default page returns up to 25 observations per collection. Collections report pagination and their own unavailable, timed-out or failed states. Results can overlap between collections; displayed counts are not unique races. A bounded search with missing collections must not be presented as an exhaustive negative result.

The database migration adds search indexes and a compact capture-name candidate index. Exact row-level name matching still runs after candidate selection. Whole source HTML and unrelated participants are not returned in the stored-search response. Search transactions have statement and lock time limits.

Archive rows open their existing review detail directly. Capture links open the selected saved race and prefill the athlete name. Profile and history observations open the existing athlete review workspace. These links do not create claims or change result ownership.

## Live URL check

The initial adapter supports actual `https://totalracetiming.co.uk/raceresults/<id>` pages. It does not generate IDs, enumerate races, crawl the full source registry or call a general internet search API.

The staff-only POST validates the exact supported host and path, checks published crawl rules, limits request frequency with persisted reservations, bounds response size and duration, and treats redirects, denied access, rate limits and unsupported content as incomplete checks. It never bypasses a challenge or sends the athlete name to a search provider. Matching uses recorded names and supplied racing-name variants. Club information is supporting context; missing affiliation is not an identity decision.

Preview rows retain original column headings and values, including distinct timing and placing fields. At most 50 matching rows and bounded original text are returned. The response distinguishes checked, blocked, unavailable and rate-limited states, with truthful fetch/check times. A blocked source does not become a zero-match result.

Before enabling a table's import handoff, the adapter runs the existing independent TRT source comparison against the full original table, passing the source bib to distinguish separate entrants with the same name. Flagged, malformed, empty, unsupported or ambiguous comparisons retain their preview evidence but withhold the automatic handoff. A generic Name-only table can be previewed, but remains manual-only because the independent TRT auditor does not recognize that layout. This comparison does not establish athlete identity or mark results verified.

For a successful comparison, staff may open matching rows from one table in the existing archive importer. The handoff explicitly records that it contains selected matching rows from a server-fetched single-page preview. It is not a claim that the whole race was captured. The importer still requires a race edition, column mapping, authority to retain and its normal review/save steps. No source record, claim, notification or public profile is created just by searching.

This path needs no paid search account or AI API key. Existing hosting/database resources are still used.

## Source coverage

The coverage panel reads the current source registry, saved edition result links and wider event inventory, plus aggregate counts for stored result collections. It is loaded on request. Counts are grouped by website; multiple registry records for the same website can share totals and must not be added together. Records with unknown or unregistered domains remain part of global collection totals.

Coverage distinguishes stored rows, extraction/review backlog, links without rows and no linked stored evidence. Missing optional stores are reported as unknown rather than zero; if no rows are known and any participant collection is unavailable, the stage is explicitly incomplete. Saved result-link counts include held and rejected references and do not authorize collection. Canonical counts use the primary result source URL and history counts use the parent history URL; supporting references or individual performance URLs can yield search matches beyond those per-domain counts.

Registry enable/hold states describe existing metadata collection settings. This feature does not change them or enable participant collection across all registered sources. Saved captures are screened against the newest version so a superseded approved page cannot reappear when its replacement is held or revoked.

## Validation and rollout

Focused verification uses synthetic records in disposable PGlite databases, bounded fake source responses and a loopback browser harness. It covers the four search stores, pagination, aliases, missing stores, source-domain matching, capture approvals, extraction inventory, live-fetch restrictions and selected-row import handoff. No production athlete data or source HTML belongs in tests or git.

Run:

```sh
npm run verify:athlete-source-finder
npm run verify:athlete-source-coverage
npm run verify:athlete-source-check
npm run verify:athlete-source-finder-browser
npm run typecheck
npm run build:dev
```

The browser verifier can use `ATHRECS_TEST_CHROMIUM_EXECUTABLE` to select an installed test binary; CI uses the project Playwright browser. The normal production build applies the additive migration. No new API credential, source registration or source enablement is needed.

Rollback is a normal code revert. The additive indexes/function can remain unused until a separately reviewed cleanup; there are no result-data rewrites to undo. Any records subsequently saved through the existing importer remain normal reviewed archive records and should not be removed by a code rollback.
