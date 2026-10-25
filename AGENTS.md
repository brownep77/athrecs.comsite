# Athlete result evidence

- Owner instruction, 23 October 2026: add federations and organisations to the
  Sources list for fixture, result and athlete-profile research, and reconcile
  earlier directory entries too. Preserve source capability evidence and original
  check dates. Membership-directory links remain research references until actual
  data pages are inspected. Registration alone never enables automated collection.
  Run `npm run verify:sources` after directory or source changes; the organisation
  source check identifies missing registrations.

## Fixture dates and start times

- Owner instruction, 25 October 2026: never display internal "Other" placeholders
  as race distances or start times. Show the confirmed distance and local start;
  identify first waves, later waves and start windows explicitly. When facts are
  unknown, say "Distance not yet confirmed" or "Start time not yet verified".
  Suppress a placeholder as a duplicate only after checking the organiser's
  edition-specific programme; preserve its source record for audit.
- Owner instruction, 21 October 2026: resolve conflicting fixture start times
  using the event organiser or the relevant governing body. Prefer the latest
  edition-specific organiser race-day timetable, then a governing-body fixture.
  An organiser's programme on its authorised entry page is acceptable evidence;
  a timing provider is not automatically the organiser.
- Match the year, distance and junior/adult or wave category. A specific race-day
  timetable takes precedence over a generic summary or entry-options table;
  record any remaining discrepancy and the reason for the choice. If equally
  authoritative schedules still disagree with no clear supersession, retain TBC.
- Record the opened source, checked date and previous values. Keep checked starts
  scoped to that edition; never copy them to another year or infer recurrence.

## Athlete results

These rules apply to athlete profiles, race histories, imports, catalogue seeds,
publication and personal-best calculations in this repository.

- Never invent a race participation, time, placing, category, exact birth date or
  source URL. Plausible values, biographies, recurring fixtures and another
  athlete's results are not evidence. Leave unknown fields empty.
- A restored database or a previously generated catalogue is not independent
  verification. Record the actual organiser, timing-provider or governing-body
  source and the date it was checked.
- Before treating a performance as verified, match the athlete identity, race,
  edition date, distance, finish status, time and every supplied placing against
  the source row. Record the row locator (bib, source result ID, PDF page or
  equivalent) and identity evidence. A matching name alone is not sufficient
  where people or race distances can be confused.
- Open the source and inspect its contents. A working URL, a search snippet or
  a general results index does not establish an individual performance. Never
  construct or guess a timing-provider result identifier.
- Map timing tables by column headings, never positional offsets. Keep overall,
  gender and category positions separate. Keep chip and gun times separate.
  Preserve source precision and document conversion to integer storage.
- Owner instruction, 24 October 2026: parkruns are not chip timed. Store their
  published time as a finish time, leaving chip/gun fields empty, and label it
  "parkrun finish time · Not chip timed". Keep parkrun PBs separate from road-race
  PBs. Timing method and result verification are independent.
- Do not infer an exact birth date or age from an age category. Do not manufacture
  dates to turn year-only biographical accounts into dated race results.
- For all future imports, preserve nationality explicitly supplied by the athlete
  or the source, with its original value and provenance. Show source-reported
  nationality on approved public, unclaimed source profiles. Never infer it from
  a name, club, language, residence or race location; leave absent values empty.
  Do not overwrite athlete-supplied nationality or treat it as identity verification.
- Owner instruction, 21 October 2026: collect the other explicitly supplied
  athlete-profile facts too, including exact date of birth, nationality,
  residence, birthplace and representative where available. Preserve original
  values and provenance; leave absent or conflicting facts empty or held.
  Publish reviewed details on approved unclaimed profiles while retaining
  explicit privacy choices. Never substitute nationality or a race venue for
  residence, or expose staff evidence and contact details with these facts.
- Keep unsupported accounts explicitly unverified and out of verified personal
  bests, medals and rankings. An absent name is a review flag, not proof that the
  athlete did not participate; check aliases, pagination, DNS/DNF and identity.
- For Total Race Timing imports or corrections, run the independent source-row
  comparison documented in `docs/result-evidence-policy.md` in strict mode before
  writing. Resolve flags using source evidence, not by changing test expectations.
  Other providers require the same checks using their own source format.
- Preserve original values and provenance before an approved correction. Keep
  database corrections and seed corrections consistent so a later seed cannot
  restore a known error. Respect existing publication/visibility settings and
  all applicable approval requirements.
- Report the scope honestly: automated screening, source comparison and manual
  identity verification are different. Never call the whole catalogue verified
  because schema, row-count or code tests pass.
- Owner instruction, 10 October 2026: results actually listed on UTMB's website
  are an accepted verification source. Mark a matched, source-compared result
  `source_verified`, preserving the original row and provenance. This does not
  verify the athlete's identity or justify accepting a URL without its contents.
- Owner instruction, 15 October 2026: London's official results website
  (results.tcslondonmarathon.com) is an accepted primary verification source for
  this and future imports. Mark a matched result `source_verified` after comparing
  the actual source row with its recorded fields and retaining the row locator,
  capture date and identity-match evidence. The listing's "unofficial results"
  wording does not make the website an unofficial source; preserve that wording
  as a source qualification without using it alone to reject source verification.
  A retained browser capture may support comparison; distinguish its original
  capture date from the review date and never claim a fresh live check.
  Source verification does not verify account ownership or resolve conflicting
  identities. Keep unresolved matches held and preserve publication controls.
- Keep private athlete audits and database exports out of source-control changes
  intended for external publication. Use synthetic examples in regression tests.
- Always credit the chip-timing/results provider by name when publishing results
  on AthRecs, with a link to the original result page. Preserve provider credit in
  imports, athlete histories, club results and editorial coverage. Record the
  organiser separately; a timer is not automatically the race organiser.
  Owner exception, 10 October 2026: public athlete profiles omit World Marathon
  Majors provider branding and attribution links, including nationality credits
  and import-note wording. Retain original provider names, links and notes in
  stored evidence and staff evidence views. This presentation choice does not
  verify an athlete or result or remove the evidence requirements above.

- Owner instruction, 11 October 2026: athlete profile verification evidence belongs
  in the staff backend. Do not expose source URLs, biography citations or research
  notes in anonymous or member-facing profile HTML, response payloads or browser
  data modules. Preserve original evidence in storage and staff-only views. Keep
  public verification labels, result qualifications and award eligibility intact.
  This profile presentation exception supersedes the general public provider-credit
  rule above; it does not establish reuse permission or override required licence
  attribution (including photo credits).

- Owner instruction, 20 October 2026: when researching race results, add any newly found results websites missing from Sources. Check the existing registry and wider event inventory for duplicates; retain the actual URL, provider credit, checked date and coverage evidence. Registration alone does not enable automated collection or verify participant results.

- Owner instruction, 21 October 2026: all recorded completed results contribute
  immediately to profile achievements, countries raced, PBs, milestones and honours.
  Verification is a separate tick, added only when the supporting result evidence is
  confirmed. Do not upgrade stored verification status to make achievements appear.
  Keep invalid, excluded, future, disqualified and contradictory results ineligible;
  preserve round, classification, course and timing rules. This supersedes any
  verified-only profile achievement gate, not ranking or source-verification rules.

- Owner instruction, 21 October 2026: every athlete has a staff backend profile,
  claimed or unclaimed, with profile and result verification checkboxes. Profile
  review is separate from ownership and individual result verification. Preserve
  reviewer, time, evidence and changes in the private audit. Source provider names,
  links and review notes belong only in staff views, never public/member profiles.

- Owner instruction, 23 October 2026: no runABC names, links, descriptions or
  attribution may appear on the public website, including metadata and serialized
  browser data. Preserve original evidence in server storage/private audits.
  Apply the public catalogue projection before returning fixture or result data;
  never treat a directory URL as an official entry/results fallback. Keep the
  primary-source publication guard in force.
