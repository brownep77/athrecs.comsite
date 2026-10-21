# Sports organisation directory

The public `/directory` collection and `/directory/:slug` profiles explain the
organisations behind all 11 current AthRecs sport sections. Clubs remain at
`/clubs`, linked prominently from the directory. The primary Directory item,
sport pages, footer, HTML site map and XML pages sitemap expose the new section.

Initial research, 21 October 2026: 53 organisations covering the UK and home
nations, Ireland, USA, Canada, Australia, New Zealand, South Africa and four
international federations, with parkrun separately classified as an event charity.
This is not an exhaustive global federation or specialist association census.

## Editorial rules

- Keep funding agencies, national/home-nation federations, international bodies,
  Olympic/Paralympic bodies and event organisations distinct.
- An organisation's remit is not an athlete's nationality or team eligibility.
- British Triathlon, British Cycling and Aquatics GB have Great Britain remits;
  Triathlon Ireland, Cycling Ireland and Swim Ireland cover the island of Ireland.
- Empty sport arrays are reserved for cross-sport funding/development bodies.
  Olympic/Paralympic entries must not imply that duathlon or parkrun are Games sports.
- Keep official source URLs and review dates on records. The initial review used
  official pages and indexed official-page text where direct retrieval was blocked
  (including British Triathlon, British Cycling, Team GB's dynamic body content,
  some US and South African sites, and parkrun). A review date does not assert every
  page was retrievable or grant permission to collect their athlete/result data.
- Relationships are labelled "Related organisations" and are not automatically
  rendered as ownership, funding or membership assertions.
- Add specialist associations and further countries only with evidence of their
  actual roles. Do not create a fictional federation to fill a country/sport gap.

## Verification

`node scripts/verify-sports-directory.mjs` checks unique identifiers, sport
coverage, URL safety, references, relationships, malformed filters, Northern
Ireland remit, and the parkrun/Olympic distinctions. It runs in the existing
quality gate. Type checking and the Vite build cover route integration.

The directory uses reviewed static records and server-rendered pages; it needs
no database migration, new credentials or third-party runtime API. Filters are
URL-backed. Filter combinations are noindexed with a canonical directory URL;
organisation pages have distinct metadata, structured data and sitemap entries.
