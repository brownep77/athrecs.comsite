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

## Third supervised batch

The owner's continuation covers the live third page, checked on 21 October
2026: 15 listings dated 13 June–5 July. Batch ID:
`trackie-public-20261021-batch3`. Private capture approval:
`trackie-owner-private-20261021-batch3`; run:
`dc2a53ab-d121-5559-b19c-e15da699c00d`.

| Source listing | Compared individual finals |
| --- | ---: |
| StFX Blue and White Twilight, 10317 | 37 |
| Royal Canadian Legion District K, 10318 | 513 |
| Royal Canadian Legion District F, 10320 | 511 |
| Royal Canadian Legion District H, 10324 | 579 |
| Royal Canadian Legion District E, 10325 | 462 |
| Move More Bermuda, 10327 | 57 |
| Track North Sudbury Twilight #2, 10328 | 182 |
| **Total** | **2,341** |

The reviewed plan contains 767 new unclaimed profiles, 1,801 linked unverified
results, seven new meetings and 470 event/category competitions. It creates
37 clubs/teams and reuses 19. Another 540 compared rows are held, primarily for
existing athlete/account identity candidates. One additional StFX row is held
for overlapping PDF text and excluded from the compared total. The complete
athlete/account alias directory was checked again against this final row set.

Parser v6 ignores split report-date titles and preserves record suffixes that
extend slightly past a numeric column heading. Exact marks, including `R` and
`#`, remain as printed. Synthetic regressions cover the title and record-mark
cases. The publisher also holds damaged name encoding and explicit source ages
that conflict with numeric age bands. Names are not silently repaired.

Thirteen original PDFs are retained privately, including six held reports.
PEI, Jack Brow, Bermuda Nationals, ABAA Nationals and Mississauga need specific
competition dates or resolution of conflicting date spans. Hamilton Canada Day
uses an unsupported MeetPro PDF layout. District C Crystal Taylor uses HTML;
Solstice redirects to `https://viaa.ca/results/2026/solstice/`, which public
retrieval could not open. Neither is counted as imported. VIAA is registered as
a disabled research source after a registry and event-inventory duplicate check.

Club expansions use the retained Trackie team directory and prior reviewed club
sources. Ambiguous abbreviations remain unlinked. No nationality, birth date,
current membership, account ownership or verified achievement is inferred.
Validation includes exact history-schema checks, an isolated database rehearsal,
transaction guards, independent readback and live public-page checks. The next
unscanned 2026 archive page is page 4; the held formats remain follow-up work.

## Fourth supervised batch

The owner asked for more. The live fourth page, checked on 21 October 2026,
contains 15 listings dated 16 May–13 June. Batch ID:
`trackie-public-20261021-batch4`; private capture approval:
`trackie-owner-private-20261021-batch4`; run:
`897a5b37-f97b-5325-803a-c81c0e301a30`.

| Source listing | Compared individual finals |
| --- | ---: |
| YUTC Twilight #1, 10309 | 80 |
| MTA Outdoor Prep Meet #1, 10311 | 496 |
| OAC Twilight Meet #2, 10312 | 244 |
| Royal Canadian Legion Zone K1, 10313 | 573 |
| YUTC Twilight #2, 10331 | 223 |
| YUTC Throws Night, 10332 | 56 |
| **Total** | **1,672** |

The reviewed plan publishes 620 new unclaimed profiles and 1,159 unverified
results. It links six meetings (three new, three existing), 375 event/category
competitions, and 60 club identities (25 new, 35 existing). Another 513 source
rows remain held for existing identities, ambiguous names/clubs or source
conflicts. The live directory was checked against the final corrected name set.

Parser v7 maps a Prelims column separately when it accompanies Finals; its
values cannot become club names. Name and team extraction share one boundary,
allowing the small printed alignment difference between headings and body rows.
It also detects slash-formatted and reversed date ranges. Synthetic PDFs cover
all three cases. A read-only audit of the previous batches compared 4,081
retained rows with no name, club, mark or placing changes from these fixes.
Another 26 legacy continuation rows are omitted by both baseline v6 and v7;
their original compared evidence is retained and no historical rows are changed.

Eleven original PDFs are retained privately. Five remain held: both Hamilton
reports (image-only or unsupported MeetPro), Cali and SSNS multi-day reports,
and UTTC Twilight #2, whose title conflicts between 2 June and 19 May. Bolton
#4 and Skiffington/Grant are HTML listings outside this PDF adapter. Bolton #3
is explicitly cancelled. Sabrecats redirects to AthleticLIVE; the retrieved
shell supplied no rows. These are not counted as imported.

YUTC Throws Night is the existing Project Athletics Throws Night, event 4392539.
The actual World Athletics report at
<https://worldathletics.org/competition/calendar-results/results/7243424>
was opened directly and compared with Trackie's original PDF: same date, venue
and 14 matching performances across six event headings. This avoids another
meeting record despite the different title. Four new profiles retain CAN as
explicitly reported nationality, with source row, hash and original value in
private evidence. A fifth proposed profile is held because the U20 category
conflicts with an explicitly reported birth year. No birthday or nationality
is inferred, and these source comparisons do not establish account ownership.

The supporting World Athletics HTML and reviewed rows, and the original Trackie
team directory, are retained with the private capture approval. The optional
supplementary review file checks exact Trackie row identifiers, names, gender,
date and marks before applying nationalities or holds. Public profiles expose
nationality but keep its source evidence in the staff backend.

The organiser's results index at <https://www.yorkutrackclub.com/results> is
registered disabled. Existing AthleticNET, Athletics Ontario and Athletics
Canada sources are reused with the newly observed result URLs. Club expansions
use the Trackie team directory, Flying Angels' official membership page and the
Project Athletics and Brampton Racers club websites. No recurring scan is enabled.
The next unscanned 2026 archive page is page 5.

## Fifth supervised batch

The owner's further request covers the live fifth archive page checked on
21 October 2026, with 15 listings dated 29 March–16 May. Batch ID:
`trackie-public-20261021-batch5`; private approval:
`trackie-owner-private-20261021-batch5`; capture run:
`2b07f043-672c-5367-a267-9dadd695d949`.

| Source listing | Compared individual finals |
| --- | ---: |
| BNAA meet hosted by Pacers, 10291 | 81 |
| Vernon All Comers, 10293 | 141 |
| OAC Twilight Meet #1, 10296 | 301 |
| Delta Open, 10306 | 730 |
| **Total** | **1,253** |

The reviewed plan contains 397 new unclaimed athlete profiles, 839 exact
unverified results, four new meetings and 398 event/category competitions.
It creates 21 clubs/teams and links 12 existing clubs. Another 414 compared
rows are held for existing identity candidates, inconsistent source details,
clipped names or damaged text. All 1,253 retained rows passed the independent
PDF text comparison; there are no additional overlapping-text rows this time.

Parser v8 recognises `Sprint` as timed and retains suffix categories such as
`U10`. Synthetic regressions cover both cases, including preliminary/final
separation. Original decimal marks, winds, jump tie markers and field units
remain unchanged. Original report years and ages are retained as evidence,
never converted to invented birthdays or nationalities.

The full athlete/account alias directory was checked before publication. The
Delta report visibly clips long names; 23 boundary-length observations are
held rather than silently expanded. Two further rows with a shortened surname
are held after comparison with another original Trackie report. Supplementary
profile facts are retained privately for identity review; a year-only birthdate,
a nationality-like value labelled birthplace, and provincial affiliation do
not establish an exact birthday, nationality or residence.

Seven original PDFs are retained privately. SSNS Capital CITY and Carifta
require event-specific dates, and the Pacers school report consists of relays.
Five HTML listings remain outside the supported PDF publication, including
Codiac, Forest City, Peace Hills and both Bolton meets. Three redirect listings
remain outside publication: Sir Reginald Samuel goes to AthleticNET and both
Ice Breaker listings go to the same VIAA results archive. Those destinations
reuse existing source registrations.

Club-name expansions use the retained Trackie team directory, explicit team
codes and prior reviewed sources. Ambiguous school/campus and Special Olympics
labels remain unlinked. A historical result affiliation is not current
membership. Three newly found club-hosted results sources—Ocean Athletics,
Kamloops and Okanagan—are registered disabled after registry and event-inventory
duplicate checks. No recurring collection is enabled.

Validation includes the source comparisons, PDF regression, all final public
history schemas, source-registry and bulk-run checks, production-copy rehearsal,
exact production readback and live profile/club/meeting/result pages. Existing
profiles, accounts and claims are not modified.

## Review of fifth-batch holds — 22 October 2026

The current production capture and publication audit were read before review.
None of the 414 held source locators was present in either a Trackie canonical
result or a Trackie athlete history. No later Trackie resolution audit was found.
The original 839 published results were excluded from this review.

All seven original PDFs were recovered through the private source-capture store
and their SHA-256 hashes checked. Four supplementary retained references were
also recovered from the private approval, including the separate March report.
All 1,253 compared rows were reproduced from the original PDFs using the two
PDF engines. These are retained captures from 21 October, not fresh live checks.

The reviewed append-only plan resolves 126 observations onto 54 existing public,
unclaimed source profiles. Exact full name, sex, explicit source age and reviewed
club identity agree across separate reports; 89 earlier source rows were checked
against their original PDFs. Two earlier continuation rows were compared directly
with both PDF engines because the current adapter omits their repeated headings.
All 566 profiles added since the original identity screen and all 19 account
directory entries were screened again, with no additional candidate conflicts.
No exact birth date, nationality, account ownership or current membership is
inferred. Result verification remains `unverified`.

| Meeting | Newly resolved result records |
| --- | ---: |
| BNAA meet hosted by Pacers, 10291 | 28 |
| Vernon All Comers, 10293 | 34 |
| OAC Twilight Meet #1, 10296 | 64 |
| **Total** | **126** |

The total includes two explicitly printed DNFs, retained as DNFs. No new athlete,
club, meeting or competition is required. Existing profile facts, visibility,
history entries and verification values remain unchanged.

| Remaining review reason (mutually exclusive) | Observations |
| --- | ---: |
| Existing athlete/account candidates, without a supported identity match | 231 |
| Existing candidates plus different source clubs | 7 |
| Different source clubs without an existing candidate | 18 |
| Clipped names | 23 |
| Shortened surname requiring identity resolution | 2 |
| Damaged name encoding | 5 |
| Multiple rows in the same competition | 2 |
| **Still held** | **288** |

Existing-name candidates need independent full-name, age/year, club or other
identity evidence; fuzzy similarity is not enough. Club conflicts need evidence
connecting the affiliations. Damaged or clipped names need an unclipped original
result or an independently linked athlete record. Same-competition duplicates
need round/attempt or distinct-person evidence. No source PDF is missing for the
414 observations. The separate multi-day/relay reports with no compared rows
remain outside this denominator and still need dates or relay-specific handling.

`resolve-trackie-observations.py` extends the supervised publication process to
append reviewed observations to existing histories. Private plans and receipts
stay outside git. It requires an unchanged production-copy rehearsal, locks the
identity/history tables, rechecks the live directory fingerprint and exact prior
JSON, refuses account links, claims and active invitations, checks original held
locators and capture hashes, and rejects duplicate source rows or competitions.
Original history values and the full decisions/remaining holds are recorded in
the staff-only `trackie.held_resolved` audit under
`trackie-review-20261022-batch5`; earlier publication audits remain immutable.
Future reviews must subtract these resolved locators rather than replay PR #809.

Validation includes six synthetic negative tests, all 54 complete updated
application history schemas, the public athlete/results privacy regressions,
copied-production rehearsal and independent exact history/result/profile readback.
Production publication and independent readback confirmed all 54 updated profiles
and 126 public result records, with zero linked accounts and no verification or
integer-timing changes. Reviewed plan SHA-256:
`e845cc1ee030913eb9bf27d0f5be11b1d6ab635e2932c7547efdf4295ee4f19c`.
The review branch was `br-misty-fire-ayrxcmjl`.
