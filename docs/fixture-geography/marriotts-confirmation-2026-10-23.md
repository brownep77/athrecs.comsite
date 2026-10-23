# Marriott’s Way organiser confirmation — 23 October 2026

Scope: only the two existing marathon and half-marathon editions on 21 February
2027, canonical event `marriotts-way-races` (event 74), edition IDs 71609696 and
71609697. No new races, waves, dates or results.

## Superseding evidence

Janice of Boghopper Races replied directly to Paul on 23 October 2026 in the
email thread “Marriott’s Way, 21 February 2027 — confirmation of race starts”.
The connected original message was read during this correction. The organiser
confirmed:

| Distance | Race start (GMT / Europe/London) | Arrangements |
| --- | --- | --- |
| Marathon | 08:30 | One mass start for runners and walkers; gun-timed start, chip-timed finish |
| Half marathon | 10:00 | One mass start for runners and walkers; gun-timed start, chip-timed finish |

Janice explained that coach availability caused the inconsistent information
and reported correcting both the website and entry platform. The private
original email remains in Paul's mailbox; account details, message identifiers
and the full correspondence are not copied into the public repository.

The original [2027 organiser page](https://boghopperraces.co.uk/2027-marriotts-way-races-1),
[FAQ](https://boghopperraces.co.uk/faqs), and
[authorised entry page](https://totalracetiming.co.uk/race/693) remain source
references. On this run the web reader still returned older conflicting text
in the organiser timetable and entry options. Do not represent that cached
retrieval as independent confirmation of updated pages. The direct reply
explicitly resolves the conflict and supersedes the 21 October interpretation.

## Baseline and publication

Before editing, latest main, relevant PRs, production database and the public
race page still showed 09:00 / 10:30. PR #794 concerned Reepham only. The
published #793 batch and original source notes remain immutable.

The new batch `athrecs:marriotts-organiser-confirmation:2026-10-23` uses the
existing stage/validate/publish transaction, revision lock, exact two-row
baseline and before/after ledger. Replacing a known time requires an explicit
reviewed from/to pair as well as a matching baseline. Missing, duplicate,
concurrently modified or incompletely reviewed rows abort the transaction.
The deployment runs the batch once; completed or rolled-back batches cannot
be replayed. Source URLs, entry routes, distances, statuses and prior notes are
preserved. New confirmation notes are appended to the history; concise current
notes are displayed on the public schedule.

Both current fixture overrides and the relevant seed values use the confirmed
starts. The combined event header and structured data use the first confirmed
race start, 08:30, instead of selecting the half marathon merely because it is
listed first. Both distance starts remain in the public schedule. Listing helpers
use the same edition-specific override. No value is copied into another year
or into Marriott’s Way 10K. Historical holding imports are not published here. In particular, the ready
31 August batch `athrecs-holding:delta:35cf58569f6f93479e6ce60f`
contains a differently named Marriott’s Way identity with both starts at
09:00 and a mislabelled half-marathon option. Its immutable payload is retained;
it must be reconciled against these canonical editions and the organiser reply
before any future publication.

## Validation

The existing isolated Postgres publication regression covers the historical
batches followed by this correction, stale-baseline rejection, explicit
replacement authorisation, rollback, exactly two audit entries, retained
entry routes/source notes, year scoping, unrelated Reepham records and replay
safety. Public start helpers and SportsEvent startDate generation are checked
against both confirmed clocks. Production publication remains subject to the
normal deployment and an independent readback.
