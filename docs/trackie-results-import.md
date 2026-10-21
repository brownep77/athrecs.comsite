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
