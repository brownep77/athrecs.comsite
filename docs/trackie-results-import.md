# Trackie supervised import — 21 October 2026

The owner requested results from <https://www.trackie.com/results/>. The first
page listed 15 meetings dated 11 September–16 October 2026. This is a bounded
first batch, not the complete nine-page 2026 archive or earlier years.

Private capture run: `93ced85f-cd56-4c3b-9d6e-54ad9d709c34`.
Source-specific approval: `trackie-owner-private-20261021`, basis
`owner_private_import`. This records the owner's request, not a provider licence.
The source registry remains disabled for recurring automated collection.

| Source listing | Compared source rows |
| --- | ---: |
| OAC Twilight Meet listing 10364 | 76 |
| BNAA Fort Scaur, 10 October | 70 |
| Joe Piane Notre Dame Invitational, supplied Gold-race report | 383 |
| Thorold Elite XC Prep Meet | 111 |
| ABBA Road Race Series, one mile | 56 |
| BNAA Arboretum, 26 September | 57 |
| CALTAF Throws Fest #3 | 90 |
| Laurentian XC Open | 45 |
| CALTAF Throws Fest #2 | 128 |
| **Total** | **1,016** |

Four additional original PDFs are retained as held captures: LCS XCR
Invitational & Relays, Dakota Classic, Vigars & Salter Western Invitational,
and Purple and White Intrasquad. Their layouts need separate adapters. No
participant count is invented for those files. Lakefront Marauder and Don
Mills use JavaScript redirects to external results: Lakefront to
`https://live.sportmadesimple.com/meets/79356/events/xc/2931974` (an application
shell in public retrieval), and Don Mills to `https://share.google/ActZtLYBj1lytlH7K`
(which public retrieval could not open). Both remain outside the imported count.
SportMadeSimple / AthleticLIVE is also registered as a disabled research source.

## Evidence and limits

`prepare-trackie-captures.py` locates PDF columns from their headings, keeps
continuation pages, excludes team-score tables and retains source precision,
seed times, winds, classification headings and page/row locators. Each retained
row's complete text is compared between pdfplumber and PyMuPDF. This is source
transcription comparison, not independent accuracy or athlete identity proof.
Field marks, combined-event totals and non-finish statuses are preserved; they
do not become running times or PBs. Placing stays scoped to the supplied event
heading. No nationality, birthday or account ownership is inferred.

The original PDFs and private row payloads live in the existing source-capture
inbox. The legacy `source_html_gzip` column contains the compressed original
PDF bytes; `payload.sourceMimeType` identifies `application/pdf`. Readers must
respect this MIME type. Original document hashes and captured timestamps are
retained. Replays deduplicate by provider, source key and payload hash.

The source itself has qualifications requiring review before canonical linking:
the OAC listing calls the meeting #3 while the report says #4; the Fort Scaur
report title says 2025 while its event date and listing say 10 October 2026;
one junior mile time appears implausible. Values remain as printed. The held
Purple and White report also contains conflicting numeric date formats.

No public athletes, canonical results, claims, medals, PBs or account links are
created by this import. Existing staff access controls and source visibility
remain in force. Full source fields are inspectable in the private capture
browser; Trackie Finals/TIME and event-scoped positions receive display support.

## Validation

Source registry and bulk-run checks, TypeScript, focused component lint,
catalogue verification and a local production build passed. Local build
database publication was disabled. Production capture receipts and a read-back
query verify the private import separately from the application deployment.
# Public profiles, clubs, meetings and events

The owner subsequently requested public athlete profiles, clubs, meetings and
individual events. `publish-trackie-profiles.py` prepares a private, reviewable
plan and applies it first to a copied production branch. The reviewed plan hash,
live athlete/account directory fingerprint and original capture hashes guard the
production transaction. This is separate publication authority; the original
private-capture approval remains unchanged.

The first plan contains 633 new unclaimed profiles and 815 source performances,
nine meetings (three already catalogued), 272 event/category competitions, and
52 new clubs/teams plus one existing club. Another 201 observations are held for
identity or source-detail review. Shortened clubs remain unresolved unless the
source report or a club/governing-body source establishes the full name.

Parser version 4 separates centred team-score points from club names. Earlier
captures are preserved and new versions retain the same original PDF hashes.
The synthetic PDF regression covers centred points, seed/final separation and
field marks. Source histories preserve decimal times, marks, points and event
placing scope. Canonical results link the meeting graph and use the same exact
display text; integer timing columns remain empty. Those canonical rows are
excluded from duplicate profile display. All new identities and performances
remain unverified and cannot earn verified PBs or medals. No accounts or claims
are created, and existing athlete profiles are unchanged.

The public result-page projection exposes only the mark, placing and verification
label, never the stored capture locators or identity-review notes. Provider links
remain on meeting/results pages; profile evidence stays in the staff backend.


## Second supervised batch

The owner's continuation request authorizes another bounded publication. The
live second results page on 21 October listed 15 meetings dated 5 July–29 August
2026 (the search engine's older copy had a different page boundary). Batch ID:
`trackie-public-20261021-batch2`. Private capture approval:
`trackie-owner-private-20261021-batch2`; run:
`57fabbf7-a431-5efd-87f5-e6fdf559333b`.

| Source listing | Compared individual finals |
| --- | ---: |
| CALTAF Throws Fest #1, 10350 | 132 |
| YUTC Twilight #5, 10342 | 164 |
| YUTC Twilight #4, 10343 | 177 |
| Track North Sudbury Twilight #5, 10346 | 106 |
| Track North Sudbury Twilight #4, 10347 | 52 |
| Track North Sudbury Twilight #3, 10348 | 119 |
| **Total** | **750** |

The reviewed plan creates 367 unclaimed profiles and 542 linked unverified
performances, reuses three meetings, creates three meetings, links 199 exact
competition headings, and creates 47 clubs while reusing seven. Another 208
compared observations are held for existing identity candidates, name details or
conflicting club identities. Two additional rows with overlapping PDF text are
retained in `payload.heldRows`, with their comparison issues, and excluded from
the 750 compared rows. Shortened ambiguous clubs remain unlinked.

Parser v5 reads two-column Hy-Tek reports in column order, retains distinct
column-aware row locators, and resets column mappings between finals, heats and
relays. Explicit M/W/F prefixes in an Age column supply gender for mixed races;
no birthday or nationality is inferred. The synthetic regression covers column
separation and suppression of unsupported rounds/relay tables as well as exact
marks and seed/final separation. Batch identifiers and instructions now come
from the reviewed configuration and are retained in publication audits.

Twelve original PDF attachments are retained privately. The two multi-day
championships require event-specific dates: Alberta's index lists 24 July, but
the report explicitly spans 24–26 July. Four other PDFs remain unsupported
(Crimson Lake, both Hamilton meetings, Royal City Nitro). Three HTML-only
meetings (Bolton and both Lynx pole-vault meetings) remain outside this batch.
Their source pages are reachable; an absent PDF does not mean absent results.
Heats and relays are outside the supported individual-finals scope.

Full club names were compared with the opened Trackie team directory at
<https://www.trackie.com/ajax/get-custom-team-list.php> and the retained prior
club sources. A source affiliation is historical, not confirmed membership.
The production transaction retains the original PDFs, private evidence and
holds; public profile data does not expose that evidence. No recurring scan is
enabled. The next unscanned archive page is page 3; unsupported page-2 formats
remain separate follow-up work.
