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

## Reconciliation with main (7 October 2026)

- Retains the Berlin Marathon 2026 results banner and main's HomeEventDiscovery
  destinations: fixtures, road running, both calendars, marathon and half-marathon
  guides, UK road ultras, every configured marathon country and Find Events.
  The shared header retains main's broader sport navigation.
- Main now requires sign-in for profile reads. The discovery loader uses the
  existing session middleware and omits performances for anonymous/invalid
  sessions, while preserving public event discovery. Signed-in readers still
  pass through the original owner-sharing, hidden-result and eligibility rules.
  Client feed caches are separated by viewer and hidden on logout.
- The device-local shortlist and public-sharing controls are unchanged. RunRecs
  routes, filters, event destinations and publication code are unchanged.
- Git-triggered Vercel deployments are disabled for
  `codex/athrecs-engaging-homepage` in `vercel.json` so this review update does not
  deploy. This exact-branch setting does not change main's deployment behaviour.
- The current main quality gate is retained, with homepage HTTP checks for
  anonymous, invalid-token, member and client-context sessions, plus desktop and
  mobile smoke assertions for both guest and member homepages.
