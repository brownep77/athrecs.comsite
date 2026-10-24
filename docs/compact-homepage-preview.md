# Compact AthRecs homepage preview

## Review scope

This branch implements the selected compact teal layout for the AthRecs homepage and sport fixture pages. It is intended for a test deployment first. It has not been approved for a production release.

- The homepage opens on broad Running: Running records and Athletics records on recognised running surfaces. Track and field and parkrun have their own pages.
- Country, Month and Distance are together above the fixture list. On a phone, Month and Distance remain next to each other.
- The left navigation shows UK, Ireland, United States, Canada, Australia, New Zealand and South Africa as a short list. A More countries disclosure opens a searchable alphabetical list using the current sport's country options, plus those seven shortcuts and any selected country. Country selection stays in the current sport, preserves month, distance and text filters, and resets pagination. An All countries link clears only the country filter. Selected countries are highlighted; a selected country outside the short list opens the full list automatically.
- The Guides section links to the running guide directory, seven country marathon guides, race series and individual race guides.
- The desktop sidebar scrolls independently when its expanded guide list is taller than the available window.
- The sport bar changes to separate pages for Athletics, Triathlon, Cycling, Swimming, Duathlon and parkrun. Cycling also has road, mountain-bike, track and BMX shortcuts. Each page uses the matching catalogue, labels and practical information.
- Sport filters are remembered in the current browser tab. Text search keeps the selected country, month and distance.
- Results and Clubs shortcuts carry the current sport context. Broad Running results use the explicit `all-running` category, leaving the older `running` alias unchanged.
- Saved races form an anonymous browser shortlist shared across sport pages. They are not added to a public profile or an account calendar. Storage failures retain an in-memory shortlist for the visit.
- Calendar and Share actions use actual event slugs and edition IDs. Events with several starts let the visitor select the intended edition. Date/start qualifications and public-content rules remain in force.
- The homepage has one small Partner with AthRecs card linking to the existing business page.

## Test deployment

The isolated branch is `preview/compact-sport-homepage`. Its Vercel build command explicitly supplies `--preview`, so missing Git metadata cannot fall back to the normal database/publication build.

```sh
npm run build:layout-preview
```

The preview build compiles a fixed isolation flag, uses a disposable PGlite copy of the committed catalogue and ignores external database credentials. It does not run the normal database migrator, provider check or catalogue publishers. Accounts, staff tools, submissions and operational endpoints are blocked. The stateless calendar-file download remains available. The preview disables indexing and cron jobs and gives the main function a 120-second limit for a cold catalogue load.

An attempted production build of this preview branch is rejected. A production release needs a separate reviewed change; the branch must not simply be promoted.

Local server checks have exercised the actual Running and Athletics pages, not only sample cards. The data shown in the preview is a committed catalogue snapshot, not a live database connection. The first cold request may take longer while that snapshot is loaded.

## Review checklist

1. Open the homepage at desktop and phone widths. Check that the fixture list remains the main focus.
2. Select a country, month and distance; search for a race name; confirm that all chosen filters remain applied.
3. Switch to Athletics, Swimming and Cycling, then return to Running. Check the sport-specific content and remembered filters.
4. Open the seven country links and their marathon guides from the left navigation.
5. Save races from two sports. Check that the same shortlist appears on both pages and survives a refresh in a browser with storage enabled.
6. For a fixture with several distances, select a specific edition before using Calendar or Share. Check the date and distance in the resulting action.
7. Check the partner card's size and placement. It opens the existing business information page.

## Verification

The focused checks cover TypeScript, changed-file linting, fixture scope and month filtering before pagination, result scope, saved-item validation, calendar identity and preview isolation. The preview isolation test uses a disposable database and rejects outbound network requests.

The hosted desktop preview has also exercised a United Kingdom / April 2027 / Half marathon search, saved a real fixture, switched through Athletics and Swimming, restored the Running filters, retained the shortlist across sports, expanded all seven country guide links and loaded the Canadian marathon guide. The first cold catalogue load is slower than subsequent navigation. Phone-width browser review remains part of the user review checklist.

```sh
npm run typecheck
node --experimental-strip-types scripts/verify-sport-fixture-pages.mjs
node scripts/verify-public-results-section.mjs
node --experimental-strip-types scripts/verify-saved-fixtures.mjs
npm run verify:layout-preview
```
