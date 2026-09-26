# AthRecs discovery homepage

Implements the approved combined homepage direction using the existing logo,
Fraunces / DM Sans typography and AthRecs colour tokens.

- Sport filters drive public athlete performances, spotlights and upcoming events.
- Search supports athlete profiles, an athlete's results, events and the existing
  Athletics club directory. Search results link to the existing destination pages.
- Recent performances are a dated selection from public profiles, not an event
  leaderboard. Eligibility, PBs and milestones reuse the existing profile rules.
- Athlete spotlights and achievements contain published records; nothing is
  added to or reclassified in the source data. Source audit details, dates of birth
  and staff notes are excluded from the new homepage response.
- Event cards interleave available sports. Athletics uses existing AthRecs pages,
  running uses RunRecs, and other sports link to the catalogue's event website.
  The homepage labels those destinations and formats start times in the venue's
  local timezone. Unknown times stay unknown.
- The shortlist persists in versioned browser localStorage, with cross-tab updates
  and storage-failure feedback. It is labelled as device-local, with no sign-in or
  account synchronisation. It does not promise following notifications.
- Sharing uses the existing profile share controls. Private accounts still use the
  existing account/result-claim flow.

There are no database migrations, publication writes, domain redirects, changes
to profile PB treatment or edits to the RunRecs homepage. Account-synchronised
following and a merged event catalogue are separate future features.

Validation: `npm run typecheck`, targeted ESLint, `npm run verify:home-discovery`
and `npm run build`. The homepage verifier uses synthetic privacy fixtures;
with `--http` it additionally uses the app's isolated PGLite database to exercise real HTTP server functions,
search, sport filters, empty states and SSR. It never connects to production.
