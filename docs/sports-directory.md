# Sports organisation directory

The public `/directory` collection and `/directory/:slug` profiles explain the
organisations behind all 11 current AthRecs sport sections. Clubs remain at
`/clubs`, linked prominently from the directory. The primary Directory item,
sport pages, footer, HTML site map and XML pages sitemap expose the new section.

Research and expansion, 23 October 2026: 325 organisations, including 277 national
federations in 69 countries and territories. The original UK/home nations, Ireland, USA, Canada,
Australia, New Zealand and South Africa coverage is joined by France, Germany,
Spain, Italy, Portugal, Netherlands, Belgium, Switzerland, Sweden, Denmark,
Japan and Brazil. The earlier additions cover Austria, Finland, Norway, Poland,
India, Singapore, Kenya and Bermuda. All eight have athletics, swimming and
triathlon entries; seven also have cycling entries. Kenyan cycling remains a
research gap rather than linking an unverified independent website. Scottish
Hill Runners is added as a specialist service association, not a governing body.
Sport mappings describe the reviewed disciplines, not a claim of
complete country coverage. Parkrun remains separately classified as an event charity.

The previous 70 additions included 48 national federations and 22 other organisations:
European continental bodies; international mountain, trail, ultra and masters
running organisations; UK/Ireland specialist running associations; Cycling Ulster
and Swim Ulster; US and Australian specialist associations; funding bodies in
Australia, Canada and New Zealand; and SASCOC in South Africa. This is not an
exhaustive global federation or specialist association census.

The earlier review revisited all 123 original records, checking the official
website/source destinations and organisational role or affiliation evidence.
It corrected the Welsh display names to Beicio Cymru and Triathlon Cymru,
retaining old-name aliases and stable slugs; clarified Athletics Ireland's
all-island remit; updated the WMRA destination and several role references;
and expanded parkrun's country filters. France is excluded from active parkrun
coverage because its specific suspension notice takes precedence over the
generic special-days table. See [the review record](sports-directory-review-2026-10-22.md).

A further 39 national federations cover Czechia, Hungary, Romania, Greece,
Turkey, Estonia, Latvia, Lithuania, Mexico and South Korea. Nine countries have
athletics, cycling, swimming and triathlon entries; Mexico has cycling,
aquatics and triathlon. Mexico's current entries use Unión Ciclista de México
and Aquatics México. See [the second expansion record](sports-directory-expansion-2026-10-22-b.md)
for source checks, conservative sport mappings and remaining gaps.

A further 35 organisations cover Argentina, Chile, Colombia, Malaysia, Thailand,
the Philippines, Indonesia and Hong Kong. Each has athletics, cycling, swimming
and triathlon coverage; Argentina additionally has separate road/track, mountain
bike and BMX federations alongside the UCRA umbrella. See
[the third expansion record](sports-directory-expansion-2026-10-22-c.md) for
current names, destination checks and the scope of this addition.

A further 32 federations cover Croatia, Slovenia, Slovakia, Serbia, Bulgaria,
Iceland, Luxembourg and Israel. Each has athletics, cycling, swimming and
triathlon entries, with discipline-specific cycling and duathlon mappings.
See [the fourth expansion record](sports-directory-expansion-2026-10-22-d.md)
for primary evidence, website checks and the scope of this addition.

The 23 October expansion adds 32 federations in Jamaica, Barbados, the Bahamas,
Trinidad and Tobago, Cyprus, Malta, Mauritius and Uruguay. Each has athletics,
cycling, swimming and triathlon entries. See [the fifth expansion record](sports-directory-expansion-2026-10-23.md)
for current destinations, discipline mappings and eight labelled member-directory links.
New records carry their own review date; earlier records retain their original dates.

The second 23 October expansion adds 32 federations in Bolivia, Costa Rica,
the Dominican Republic, Ecuador, Guatemala, Panama, Paraguay and Peru.
Each country gains athletics, cycling, swimming and triathlon entries.
See [the sixth expansion record](sports-directory-expansion-2026-10-23-b.md)
for identity evidence, renamed organisations, current websites and ten additional
labelled member-directory links. All 293 preceding records remain unchanged.

Where a usable standalone website cannot be verified, `websiteKind` identifies
an official member-directory destination. Cards and profiles label that link
explicitly, and the parent directory is not emitted as the national body's
own URL or `sameAs` in structured data.

## Editorial rules

- Keep funding agencies, national/home-nation federations, regional and continental
  bodies, specialist associations, international bodies, Olympic/Paralympic bodies
  and event organisations distinct. ITRA is a specialist association, not a national
  federation. Continental entries use International with their European remit stated.
- An organisation's remit is not an athlete's nationality or team eligibility.
- British Triathlon, British Cycling and Aquatics GB have Great Britain remits;
  Triathlon Ireland, Cycling Ireland and Swim Ireland cover the island of Ireland.
- Athletics Ireland has clubs throughout the 32 counties and Irish national
  representation across the island; Athletics Northern Ireland also retains its
  separate governing/development role within UK Athletics. Remits overlap.
- Ulster regional entries appear for both Ireland and Northern Ireland, with their
  regional remit explicit; they do not govern all of either country.
- Retain local-language names and English/acronym aliases for search. Reviewed
  current names include German Cycling, SvømDanmark and Triathlon Japan.
- Bermuda and Hong Kong are counted as territories. Country totals count national-federation
  jurisdictions, not parkrun-only locations or separate UK home-nation entries.
- Empty sport arrays are reserved for cross-sport funding/development bodies.
  Olympic/Paralympic entries must not imply that duathlon or parkrun are Games sports.
- Keep official source URLs and review dates on records. The initial review used
  official pages and indexed official-page text where direct retrieval was blocked
  (including British Triathlon, British Cycling, Team GB's dynamic body content,
  some US and South African sites, and parkrun). The expansion also used World
  Triathlon and UEC member profiles alongside national-body pages. Some French,
  Portuguese, Brazilian and specialist sites were reviewed through indexed official
  text where direct retrieval was blocked. A review date does not assert every page
  was retrievable or grant permission to collect their athlete/result data.
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
