# London Marathon import from the official results website

Owner instruction, 1 November 2026 (Paul Browne): upload the London Marathon
results to AthRecs and create profiles, adapting the importer to do so. The
official site `results.tcslondonmarathon.com` is an accepted primary
verification source (owner instruction, 15 October 2026, `AGENTS.md`).

This adapter sits beside the Pace Notes London importer
([london-2025-profile-import.md](london-2025-profile-import.md)) and leaves it
unchanged. It reuses that importer's duplicate screen, hold rules, private
capture inbox, freshness locks and rehearsal-before-production rule.

## What it creates

- One private capture row set per edition (staff only), with every original field.
- For each clean, unmatched finisher: a provisional, unclaimed public profile with
  one `TCS London Marathon results` source history performance:
  - net (chip) finish time (`timing.basis = chip`); gun time was not captured;
  - separate overall, gender and category places, bib, age category, half split;
  - `verificationStatus: source_verified` with the row locator (event + `idp`),
    capture date and mapping method. This verifies the result row, never the
    athlete's identity or account ownership;
  - source-reported nationality stored in `athletes.nation` and
    `profileDetails.sourceNationalityObservation` (provider and detail URL kept
    for staff evidence). Date of birth, residence and county are never inferred.
- Wheelchair and para-wheelchair results use the discipline
  `Marathon (wheelchair)`, so they never count as running marathon PBs.
- A finisher whose official locator (same year and `idp`) or bib (unique within
  this year's captured events) already appears on an existing result or source
  history of the same London edition (Pace Notes, mika:timing supplied results,
  World Marathon Majors rankings with London event text and this year) is
  `linked`, provided name, time, gender, nationality and age category agree.
  Ranking "place" values are not official overall places and are never used
  as a locator. On link: evidence is appended to the audit log and the existing profile,
  result, history, visibility and claims are unchanged.
- Everything else is held for staff review: repeated names within the race,
  possible name variants, any existing athlete or account with a matching
  name/alias, locator conflicts, same-time same-name performances, unparsed
  names or times. No name-only merge is ever made.

## Multi-signal identity evidence (owner instruction, 1 November 2026)

`scripts/lib/london-official-evidence.py` resolves held rows whose only reasons
are soft (an existing same/similar name, an in-race name variant, or a same-name,
same-time record) using independent signals: gender, explicit nationality, age
progression (birth-year intervals from dated categories; other providers widened
a year each way, and compatibility needs two strictly shared years), club,
marathon time against the candidate's fastest actual or predicted (Riegel)
marathon, name rarity (directory, field and all 17 London years), and bridges
(official locator, bib, or a provisional cross-year chain). Thresholds are module
constants and are copied into each plan with every candidate's score breakdown.

| Decision | Disposition | Effect |
| --- | --- | --- |
| Same-name, same-time record of this edition on the single compatible candidate | `linked` (`same_name_time_edition_evidence`) | Evidence only, no second row |
| One compatible, unprotected candidate; gender, nationality and age agree; plus a bridge, club or corpus-rare name; score ≥ 6 | `evidence_linked` | The official history is appended to that athlete; nothing else changes; audit records the score |
| Every candidate excluded by an age gap ≥ 2 widened years or both-sides source nationality | `new` (`distinct_person`) | Provisional profile; excluded candidates recorded |
| No candidate at all; only an in-race variant flag | `new` (`create_no_candidates`) | Provisional profile |
| Anything else | `held` | Ranked candidates with per-signal evidence |

Account links, private/derived profiles and a candidate already holding a record
of this edition force a hold. Read-only inputs:

```sh
python3 scripts/snapshot-london-official-profiles.py --build-chains --source /private/london-official \
  --output /private/chains.json
python3 scripts/snapshot-london-official-profiles.py --candidate-evidence --connection /private/prod.json \
  --confirm-branch br-flat-unit-aydbwlfk --snapshot /private/snap-2026 --output /private/candidate-evidence-2026.json
python3 scripts/apply-london-official-profiles.py plan ... --candidate-evidence /private/candidate-evidence-2026.json \
  --chains /private/chains.json
```

The candidate evidence is bound to the snapshot digest. At apply time the guarded
append re-checks that the athlete is still public, an athlete profile, not derived
and not account-linked, and the snapshot fingerprint still covers the directory.

## Inputs (all private, outside the repository)

| Input | What it is |
| --- | --- |
| Source folder | `london_<year>.json` files from the official-site capture (2010–2026) |
| Edition config | `--make-config` output: year, date, reviewed edition ID(s), batch ID, file SHA-256, row counts per event, capture time, owner instruction |
| Connection file | `{"projectId": "lively-resonance-04577945", "branchId": "<branch>", "databaseUrl": "postgresql://…neon.tech/…"}` (`chmod 600`) |
| Review branch | A Neon branch copied from production, for the rehearsal |

## Workflow per edition (one at a time, newest first)

```sh
S=scripts
# 1. Reviewed canonical edition IDs (read-only)
python3 $S/snapshot-london-official-profiles.py --connection /private/prod.json \
  --confirm-branch br-flat-unit-aydbwlfk --list-editions
# 2. Private edition config
python3 $S/snapshot-london-official-profiles.py --make-config --source /private/london-official \
  --year 2026 --date 2026-04-26 --edition-id <id> --batch london-official-2026-20261101 \
  --output /private/london-2026.json
# 3. Snapshot production (read-only) and build the plan
python3 $S/snapshot-london-official-profiles.py --connection /private/prod.json --confirm-branch br-flat-unit-aydbwlfk \
  --edition-config /private/london-2026.json --source /private/london-official --output /private/snap-2026
python3 $S/apply-london-official-profiles.py plan --edition-config /private/london-2026.json \
  --source /private/london-official --snapshot /private/snap-2026 --output /private/plan-2026.json
# 4. Create a Neon branch from production now (no writes in between), then rehearse with replay
python3 $S/apply-london-official-profiles.py apply --review --connection /private/review.json \
  --confirm-branch <review-branch> --plan /private/plan-2026.json \
  --snapshot /private/snap-2026 --receipt /private/rehearsal-2026.json
# 5. Publish the same plan to production
python3 $S/apply-london-official-profiles.py apply --publish --connection /private/prod.json \
  --confirm-branch br-flat-unit-aydbwlfk --plan /private/plan-2026.json --snapshot /private/snap-2026 \
  --rehearsal-receipt /private/rehearsal-2026.json --receipt /private/production-2026.json
```

Production requires a completed, replay-verified rehearsal receipt for the same
plan hash and snapshot fingerprint, and the live fingerprint must still equal the
snapshot's. Any profile edit, merge or import in between stops the run: take a
new snapshot, plan and rehearsal. Do not weaken the guards to continue.

Run editions sequentially and take a fresh snapshot for the next one, so the
profiles created for one year are screened as existing names for the next.
Repeat runners therefore appear as held for review rather than as duplicates.

## Snapshot size

The database HTTP endpoint caps a response at 64 MB. The official snapshot reads
only the history performance fields the planner uses plus an md5 of each full
performance (so the fingerprint still changes if anything changes) and reads
that part in keyset pages of 5,000 rows in its own order, so the part digest
equals the fingerprint's. The directory is already streamed in 20,000-row pages.

## Reference race dates

Stored in `scripts/lib/london-official-context.py` (`REFERENCE_DATES`) for
operator review only; the canonical edition row listed in step 1 is
authoritative. 2020 was the elite-only race of 4 October 2020; 2021 and 2022
were held in October.

## Checks

```sh
python3 scripts/verify-london-official-plan.py
node scripts/verify-london-official-apply.mjs   # needs npm dependencies (PGlite)
```
