# UK road-ultramarathon guide

Organiser and authorised-entry pages checked on 26 September 2026. Public data,
source URLs and edition-specific links are held in `src/lib/running/road-ultras.ts`.
This editorial selection contains 18 event families, not 18 distinct forthcoming
races. Multiple distances and dates are grouped. No athlete performances or
database fixtures are imported by this change.

## Scope and evidence decisions

- Include fixed-distance road ultras, paved-path and motor-circuit races, timed
  events capable of producing ultra finishes, and explicitly labelled mostly-road
  long journeys. Exclude track and predominantly trail races.
- A timed entry is not itself an ultra finish: completed distance must exceed
  42.195km. Belfast includes fixed-distance options as well as 24 hours.
- Two Tunnels: the ultra-specific organiser page confirms **15 August 2027**.
  The general meeting dates are not all 50K dates. Its small grass start/finish
  section is disclosed.
- Goodwood: only dates with an actual 50K entry option are listed. The July 2027
  meeting has stale 50K FAQ copy but no matching entry option, so it is excluded.
- Great Barrow: Day 2 (Windmill), Day 6 (Golding Hills) and Day 8 (Mill Wind)
  explicitly describe 100% road routes and ultra extensions. The generic entry
  metadata says trail; the specific route descriptions are used and that
  discrepancy is disclosed. No claim is made for the festival's other days.
- Windmill / Great Barrow: preserve the organiser's marathon-plus-extension
  format rather than labelling the races as certified 50Ks.
- Tunnel: the explicit 2027 entry section confirms 5–7 March; the page also has
  older 2026 text. Entries were shown closed at the check date.
- Belfast: 26–27 June 2027 awaits council approval. Display as provisional and
  omit it from scheduled SportsEvent structured data.
- JOGLE: 13–29 March 2027; sold out / waiting list when checked. LEJOG uses the
  specific 2026 page (1–17 October), not a reusable URL now advertising 2028.
  Both are almost all road and are labelled as stage races.
- Bridge: source still lists May 2026. Hell on the Humber's entry page still lists
  2025 events. Mallory is evidenced by its 3 May 2025 BMAF event listing, and Perth
  by the organiser's 24 March 2024 listing. None is presented as a confirmed
  upcoming edition. Lon Las has no new date confirmed.
- Typical field sizes are not inferred from entry caps or old result totals.

## Candidates held back

- The Other Run (Suffolk): road route verified, but the opened primary page did
  not explicitly establish an individual ultra distance. Do not use third-party
  directory categories alone to add an ultra entry.
- Cockbain Coast to Coast, The Loop, The Line and NI Castle to Castle: substantial
  trail or mixed terrain makes them unsuitable for this road-focused selection.
- Tooting 24 hours and Barry 40 miles: track events.
- CYMRUN: conflicting edition years on the organiser page need resolution.
- Scotia: the surface mix was not sufficiently established.

## Publication behaviour

- AthRecs-only landing page `/running/uk-road-ultramarathons` and 18 stable detail
  slugs under `/running/ultramarathons/`.
- Public HTML directory and XML pages sitemap derive from the same page registry.
  RunRecs retains its separate registry and rejects these routes.
- Dates use the Europe/London calendar day. An ongoing multi-day race stays
  visible through its end date. After that it moves to TBC until researched again;
  annual dates are never extrapolated.
- Guide schema is CollectionPage, ItemList, FAQPage and BreadcrumbList. Details
  use WebPage, breadcrumbs and SportsEvent only for non-provisional, unexpired
  editions. No ticket availability or prices are inferred.

## Verification

Run `node scripts/verify-road-ultras.mjs` for date and data checks. After generating
the router, run typecheck, targeted ESLint and a direct Vite build. The normal
production build contains unrelated database publication steps and is left to
the project's existing deployment pipeline.
