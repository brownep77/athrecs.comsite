# Athlete result evidence

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
- Do not infer an exact birth date or age from an age category. Do not manufacture
  dates to turn year-only biographical accounts into dated race results.
- For all future imports, preserve nationality explicitly supplied by the athlete
  or the source, with its original value and provenance. Show source-reported
  nationality on approved public, unclaimed source profiles. Never infer it from
  a name, club, language, residence or race location; leave absent values empty.
  Do not overwrite athlete-supplied nationality or treat it as identity verification.
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
