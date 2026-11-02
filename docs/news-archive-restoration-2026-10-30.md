# News archive and homepage updates restoration

Published at the owner's request on 30 October 2026.

The six articles come from draft PR #553, commit
`6903538beabffaea68e08a784603acf76526269f`. The original notes were prepared
before the 3–4 October weekend and revised on 5 October. Their publication
date is now 30 October, with an archive label in each title, list date and
opening paragraph. The original field notes and source links are retained.
No race results, athlete identities or verified performances were imported
or upgraded by this restoration. The New York preview and existing race
reports remain registered.

## Publication review

Edition-specific sources opened on 30 October confirmed the historical
race dates. This was a status/context review, not a new verification of
every athlete performance in the original drafts.

- Kuala Lumpur: the organiser's race-weekend schedule still lists the
  4 October 2026 marathon at 03:30. The 2025 report was accessible. The
  original September 2026 start-list PDF could not be retrieved during
  this review; its link remains an original archive reference.
- Cardiff: the dated 28 September 2026 organiser preview identifies the
  4 October event and announced field. The homepage now advertises 2027;
  it must not be used as the date source for the archived edition.
- Cologne: the dated 25 September 2026 men's and women's previews and
  marathon information identify 4 October and the announced fields.
- Twin Cities: the official 2026 professional-athlete page confirms the
  4 October marathon at 08:00 CDT and 3 October TC 10K. USATF's 2026
  championship page lists 07:15 and 07:20 CT and now links to results.
  The general weekend homepage has rolled forward to 2027.
- Košice: the 2026 media guide and organiser's winners report are
  accessible; the event is identified as 4 October 2026.
- Perpetua Coast: Daybreak's 50K page identifies 3 October 2026 at 08:00
  and the weekend page identifies 3–4 October. The original UltraSignup
  entry-list URL now redirects to the 2026 results. Original entry
  rankings are historical observations, not current rankings.

The exact URLs are preserved in `src/data/october-weekend-previews.ts`.
Original “checked 5 October” labels refer to the draft's earlier review.

## Feed behavior

The homepage uses the existing catalogue feed, with independent type,
sport and location controls. It is labelled as fixture/results-link
updates, with a separate link to editorial news. The feed is bounded to
the existing per-sport query limits. An optional-feed failure does not
hide the running fixtures.

Existing confirmed-distance, withheld-date and alias exclusions remain.
Results must be approved, verified, dated no later than today, and not a
retained alias. Original provider links and credit accompany result
updates. Public catalogue projection still removes withheld references.

The regression check executes the actual feed SQL against disposable
synthetic PostgreSQL data, covering held distances/dates, aliases,
future and unverified results, provider attribution and fixture ordering.

Rollback is a revert of this application commit; no database migration
or catalogue mutation is part of the change.
