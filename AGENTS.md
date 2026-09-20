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
- Keep private athlete audits and database exports out of source-control changes
  intended for external publication. Use synthetic examples in regression tests.
