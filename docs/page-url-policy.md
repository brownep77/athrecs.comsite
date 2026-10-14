# AthRecs page addresses

Every public content page should have one descriptive, canonical address. A slug
is the readable part of that address, such as `wymondham-athletic-club`. Existing
public route families already support slugs; do not recreate or rename pages
just to introduce a different folder structure.

## Construction

| Page | Pattern | Rule |
| --- | --- | --- |
| Athlete | `/athletes/{name-or-established-slug}` | Use the person's name. Keep an existing unique suffix; for new collisions use a stable identifier, never a birth date, changing club or inferred nationality. |
| Club | `/clubs/{club-name}` | Use the recognised club name; add a verified place only when needed to distinguish clubs. |
| Race | `/races/{race-name}` | Keep a recurring race's address across editions. Include a year only if the page itself is edition-specific. |
| Results | `/results/{race-name}-{yyyy-mm-dd}-{distance}-{edition-id}` | Use `resultSlug()`. The immutable edition ID prevents collisions and lets old names redirect to the same edition. |
| Race guide | `/running/races/{race-name}` | Retain the existing guide route and slug. Guides and fixture pages have different content. |
| Ultra guide | `/running/ultramarathons/{race-name}` | Retain the existing guide route. |
| Country guide | `/running/{country}-{distance-guide}` | Use the established guide identifier, such as `uk-marathons`. |
| Sport | `/sports/{sport-name}` | Use the registered sport slug, such as `road-running`. |
| News / report | `/news/{article-slug}` or `/race-reports/{article-slug}` | Short descriptive subject; include an edition year when relevant. Retain the original slug after headline edits. |
| General page | `/about-us`, `/privacy`, `/clubs` | Short, descriptive fixed route; the homepage stays `/`. |

Use lowercase words separated by hyphens. Avoid keyword lists, underscores,
punctuation and changing sponsor names in newly chosen slugs. Keep the most
recognisable name; preserve established accented-name normalization. Never
rewrite existing slugs as a side effect of a biography, display-name, club,
nationality, sponsor or upcoming race-date update.

Results currently derive their readable label from the stored event name, date
and distance. A correction to these values can change that label; the trailing
edition ID ensures the old address still resolves and receives a 301 redirect.
Do not remove this ID without a persisted unique slug and alias migration.

## Existing links and search engines

- Point new internal links, canonical tags, structured data and sitemaps at the
  same preferred address. Use the shared result helper instead of numeric links.
- Keep old numeric result links and previous result labels working through the
  existing 301 redirect. Preserve valid searches and page numbers.
- Event, athlete and club slug changes must use the database's slug-history
  protections. Never reuse a reserved old slug for a different record.
- Do not bulk rename established published addresses for cosmetic reasons.
  Prepare an explicit old-to-new map and test permanent redirects before any
  deliberate migration; update internal links and sitemaps in the same release.
- Search filters can remain query parameters. Do not create indexable pages for
  every combination of country, gender, distance, sort order and search text.
  Keep the existing filtered-page indexing and pagination rules.
- Staff pages, account pages, API endpoints and result claims are not public SEO
  landing pages. Their existing access controls and indexing exclusions remain.
- Slugs improve readability; they do not establish identity or guarantee search
  indexing or rankings. Preserve all publication and privacy checks.

## Checks

Run `npm run verify:slug-stability`, `npm run verify:search-discovery` and
`node scripts/verify-public-results-section.mjs` for slug or redirect changes.
The last two exercise synthetic PostgreSQL data, sitemap visibility, unique
result addresses and legacy redirects without touching production records.

References:

- https://developers.google.com/search/docs/crawling-indexing/url-structure
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
