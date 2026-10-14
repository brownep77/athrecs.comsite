# Six-club research task — activation specification

Status: activated on 14 October 2026 after PR #724 deployed successfully and all
six plans were saved. All six automatic scans started in production. The research
task is enabled; activation does not claim that its first research pass has run.

Task ID: `6acfc00280788191953bd4597605e0f6`. The returned schedule and activation
record are also retained in private `club_collection_reviews` audits with action
`research_task_activated`. Check the task and saved plans for current pause state.

Title: **Research club results**

Schedule: hourly, Europe/London. No external messages or emails. Give Paul a short
update only for meaningful additions or a new actionable blocker.

## Task prompt

Continue the AthRecs six-club collection pilot. Research and publish supported
athlete profiles, biographies and result histories for enabled plans covering
10Ironwomen, Wymondham AC, Norwich Road Runners, Norfolk Gazelles, City of Norwich
AC (CONAC) and Bure Valley Harriers. Use the club's saved aliases, sports, links,
research priorities and checkpoint. Read current AGENTS.md and
docs/club-athlete-scanner.md in brownep77/athrecs.comsite before publication.

Use connected Neon project lively-resonance-04577945, production branch
br-flat-unit-aydbwlfk, database neondb only after confirming current identity and
schema. Read club_collection_plans and current scanner/import activity. Honour
paused plans. Select the enabled pilot club least recently researched and make
a bounded useful batch: up to 20 source pages and 100 supported result additions
per run. Prioritise fresh results and unresolved high-value leads, then historical
gaps. Share race evidence across clubs where useful; do not refetch the same
sheet for every athlete. Skip work that another run has already completed.

Open and read actual organiser, timing-provider or governing-body result rows.
UTMB-listed results are an accepted source when the row is inspected and the
athlete match corroborated. Check race edition, date, distance, finish status,
time, bib/source ID and each supplied placing. Keep chip/gun, overall/gender/
category positions and triathlon legs separate. Preserve precision, original
values, source links, check date and the exact row locator privately. Search
snippets, guessed URLs and prior generated records are not independent evidence.

Check live profiles, aliases, source IDs, histories, pending scanner candidates
and other import batches for duplicates. Use stable identifiers and corroborating
facts; never merge solely on name or infer current membership from an old race.
Hold initials, competing identities, conflicting results or managed/private
profiles requiring their separate review. Do not create login accounts, claim
ownership, invent birth dates/nationality or mark athlete identity verified.
Preserve source-reported nationality and conflicts explicitly.

For scanner candidates, use the established review/publication flow, recording
the actual identity decision and evidence; source problems require a new source
comparison. For other providers use the existing guarded, transactional import
path with exact before/after audit records. Paul's authorization covers supported
public source profiles and result publication; it does not permit weakening
ownership, privacy or evidence controls. Recheck the club plan is enabled and
compare target revisions immediately before writing. Publish clear supported
matches and retain unresolved candidates with concrete reasons. Keep source
evidence and biography citations in the staff backend, outside public payloads.

Write factual, original biographies from supported sports information. Publish
an exact-text biography audit when needed by the existing website. Exclude
private health details and unrelated personal information. Preserve existing
athlete-supplied content. After publication, read the saved rows and check the
actual public result table; a DB write or staged batch alone is not proof of
visible publication.

Save a guarded per-club research_checkpoint with summary, checked source URLs,
source row IDs, actual added/enriched counts, duplicates, held items, next lead
and successful-through time. Update research_checked_at only after a completed
research pass and add a club_collection_reviews audit. Retain the previous
checkpoint on failure and report an actionable blocker. Do not overwrite a
concurrent checkpoint or change other tasks. Report newly published results,
profiles and biographies separately from staged rows and source pages checked.
Do not claim whole-club or all-source completeness.

Never contact clubs or athletes, send invitations or email, create accounts,
change unrelated infrastructure, or merge/deploy code as part of this task.

Rotate fairly: count a recorded failed attempt when choosing which club to
research next, so an unavailable provider does not repeatedly block the other
clubs. Retain the last successful checkpoint on failure and write a
research_blocked audit with the attempted sources, reason and retry-after time.
Prefer never-attempted clubs first, then the least recently attempted enabled
club; use club_id as the tie-break. Do not retry the same blocked source within
24 hours unless new evidence resolves it.

## Activation checks

- Confirm deployed feature and successful migration before creating the task.
- Confirm the six real directory clubs have enabled plans; preserve existing edits.
- Successfully perform read-only GitHub and Neon connector calls in the activation session.
- Check existing automations for overlap; this task is distinct from club biographies.
- Create one hourly automation, not six simultaneous tasks.
- Record the returned task ID here only after successful creation.
