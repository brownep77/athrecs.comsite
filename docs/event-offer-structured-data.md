# Event offers: 12 October 2026 correction

Search Console's Events report showed one item for each of missing
`offers.availability` and `offers.validFrom`: `/races/mbna-chester-marathon`,
last crawled on 11 October. On 12 October the live page already emitted
`WebPage`, since the 11 October edition had passed and no upcoming edition was
listed. Do not restore the old race as an upcoming event to satisfy the report.

A read-only check of the next non-cancelled edition and qualifying official
priced entry options additionally identified:

| Page                       | Current evidence                                                                                                      | Correction                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/races/abingdon-marathon` | Organiser explicitly says 2026 is sold out; waiting list remains mentioned; transfers are closed.                     | Change the verified option from `waitlist` to `sold_out`; retain the waiting-list context.                                              |
| `/races/the-dramathon`     | EntryCentral says all four races are closed. Its organiser description states opening on 3 January 2026 at 18:00 GMT. | Record opening day `2026-01-03`; preserve the stated time in evidence notes. Do not advertise the closed entry as a purchasable ticket. |

Sources inspected:

- https://www.abingdonmarathon.org.uk/enter-the-race
- https://www.entrycentral.com/thedramathon
- https://www.thedramathon.com/the-event/the-wee-dram/

Abingdon's general mid-February opening pattern does **not** establish an exact
2026 opening date. Leave it empty. Before this correction, every `opens_at`
value in `edition_entry_options` was null. This is not a claim that organisers
never published dates: Dramathon demonstrates a collection gap. The SQL audit
and live samples are distinct from Google's indexed-example report.

## Output rules

- Retain the verified, official, HTTPS-entry, known nonnegative price and
  three-letter currency gates. Reject blank prices rather than converting them
  to zero. Explicitly free entries remain valid.
- `open` and `closing_soon` mean `InStock`; only explicit `sold_out` means
  `SoldOut`. A future verified opening date suppresses `InStock`.
- Ballots and waiting lists are applications, not guaranteed event tickets.
  Closed or expired sales are omitted from ticket offers while their public
  entry information remains. Explicit sold-out entries are retained. Closed
  entries with an evidenced future opening date can be represented with that
  date and no availability, as Google documents.
- Unknown or unrecognised availability is omitted, not guessed. Do not map
  closed/waitlist/ballot to `SoldOut`, `PreOrder`, or an unsupported Google value.
- `validFrom` uses only a verified option's real `opens_at` calendar date with
  an HTTPS source URL. Reject impossible dates, opening after the race, or
  opening after a known deadline. Never use import/check timestamps or race
  dates as sale-opening dates.
- Storage currently holds a DATE. Emit its original precision without adding
  midnight or a timezone. Preserve any source-specified time in evidence notes;
  extending storage to retain structured opening times is separate work.

Google recommends these fields but permits omission when the fact is unknown;
its event availability vocabulary lists InStock, SoldOut and PreOrder.
https://developers.google.com/search/docs/appearance/structured-data/event
https://schema.org/validFrom

## Publication and checks

`publish-event-offer-corrections.mjs` runs only on production/main, after the
normal catalogue publishers. It changes two existing options through
stage → validate → publish, preserving original snapshots, existing prices,
edition fields and unrelated options. It refuses changed source/verification,
preserves newer checked evidence, and never replays published or rolled-back
corrections. The exact opening-time evidence remains in the staged payload and
edition notes; the existing importer preserves the old option notes. Seed
overrides also retain these corrections. No seed-version bump or full reseed.

- `node scripts/verify-race-page-schema.mjs`: serialized JSON-LD, all stored
  statuses, unknown values, invalid/free prices, date validation, future and
  expired sales, archive fallback, route and specialist-export contracts.
- `node scripts/verify-event-offer-publication.mjs`: actual staged publication
  against disposable Postgres, evidence retention, reversible snapshots,
  idempotency, newer/unverified evidence guards, and stored date → JSON-LD.
- Existing athlete-search regressions, typecheck and scoped lint.

After deployment, inspect actual anonymous HTML for Chester, Abingdon and
Dramathon. Request validation for Google's Chester examples only once the live
output is confirmed. Validation requests are not proof of Google's acceptance.
Missing `validFrom` will legitimately remain on offers with no exact sourced
opening day. Omitting non-ticket applications or expired sales may leave the
optional missing-`offers` warning; do not invent an offer to remove it.

## Follow-up audit on 12 October 2026

The wider check found three precise opening dates in old edition notes that
had not been copied into `opens_at`. The registration pages were independently
opened again before adding these bounded corrections:

| Race edition                        | Verified opening day | Source                                                       |
| ----------------------------------- | -------------------- | ------------------------------------------------------------ |
| Burnsall Trail Half, 17 April 2027  | 5 September 2026     | https://www.sientries.co.uk/event.php?elid=Y&event_id=18202  |
| Kettlewell Trail Half, 19 June 2027 | 5 September 2026     | https://www.sientries.co.uk/event/kettlewell-trail-half-2027 |
| Malham Trail Half, 4 September 2027 | 5 September 2026     | https://www.sientries.co.uk/event/malham-trail-half-2027     |

Malham also supplies 12:00, retained verbatim in evidence notes. Burnsall and
Kettlewell supply no opening time. No price or availability change is needed.
Brighouse's race-day registration-desk opening is not the original ticket
sale-start date, so it is not copied into `validFrom`.

The follow-up also fixes the offer calendar-day boundary to Europe/London,
matching `todayIso()` and visible entry deadlines through daylight saving.
Tests reproduce the previous one-hour midnight discrepancy and cover GMT.

Correction source checks, row locks, staging, validation and publication now
share one transaction under the existing catalogue publication lock. Failed
validation leaves no staged correction behind. Existing completed corrections
remain no-ops. No live rollback is performed.

A real disposable-database rollback test exposed two older issues: JSONB key
ordering incorrectly rejected unchanged snapshots, and entry-option notes were
not restored. Value comparison and explicit notes restoration fix both. A
repeat-safe notes migration makes the seeded schema field available in fresh
databases too. Tests restore every original option field and confirm that
later edits, older revision rollback and replay of rolled-back corrections are
still blocked.
