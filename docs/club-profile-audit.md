# Club profiles and public contacts — 13 October 2026

The catalogue contains 1,737 clubs after resolving 11 duplicate aliases. This update compares current governing-body directory records, reviews public club websites and adds an editorial profile layout. It does not verify the identity of any club representative or athlete.

## Coverage

- 1,681 canonical directory records were compared with current source content. The remaining 56 retain earlier check dates. Unavailable pages do not receive a new date.
- Website screening attempted all 1,737 listings and retrieved usable pages from 743 club websites. The others had no standalone website, an unavailable page, a redirect requiring review or a blocked request.
- Reviewed website extraction contributes contact pages or contact/social details for 624 listings. A retrieved website is not a claim that every field on that site was manually verified.
- The merged catalogue has contact entries for 478 clubs: 465 publish an email address and 54 a telephone number. There are 778 contact entries in total, including named directory contacts with no direct email or telephone.
- 893 clubs have social links, with 1,792 distinct links after normalising duplicate URLs. Links are attributed to the publishing club website or governing-body directory; this does not establish the present ownership of a social account.
- 25 clubs have extended, individually written profiles. These contain 25 notable-member entries, each supported by the club's history, honours list or another opened primary source. Other clubs retain brief factual introductions; missing histories and alumni are not invented.

The contact counts describe the complete merged catalogue, including retained earlier directory contacts. They are not counts of newly discovered contacts or independent verification of every retained field.

## Sources and editorial decisions

The directory comparison used England Athletics, Welsh Athletics, Athletics Ireland, Athletics Northern Ireland and Triathlon Ireland. Website screening read public home pages and linked contact/about pages. It did not sign in, submit forms, contact club officers or scrape restricted social accounts.

New contact data records the publishing page and check date. Prefer role addresses and clearly club-related public contact details. Exclude placeholder email addresses, website suppliers, generic university contacts and governing-body social accounts. Preserve a club's contact form where no direct address is published. Historical source dates remain attached to older retained contacts.

Addresses in governing-body directories may be correspondence addresses. The page labels these as directory or correspondence addresses and asks visitors to confirm the training venue. Only sourced training venues and clubhouses receive a map link and an exact street/postcode in search structured data. Examples of corrections include Birchfield Harriers at Alexander Stadium and Alnwick Harriers at Alnwick Rugby Club. Multi-venue clubs have an explanatory note.

Country flags use the club's recorded location, including UK home nations. A globe requires an explicit global scope; an unknown location, national virtual club or overseas race programme does not qualify. The unattached-athlete grouping has no country flag and is not emitted as a SportsOrganization.

Club descriptions use the club name, location and relevant disciplines naturally. Extended profiles have separate history, contact and notable-member sections. The page emits a canonical URL, descriptive title, short search description, SportsOrganization and BreadcrumbList data. These changes make the information clearer and machine-readable; they do not promise a particular Google ranking or rich result.

Notable-member text does not create athlete accounts, link unclaimed identities, add results or award verified status. Existing athlete visibility rules and club registration checks remain unchanged.

## Maintenance

- `src/data/club-enrichment-a.ts` and `-b.ts`: directory fields and actual source comparison dates.
- `src/data/club-website-contacts.ts`: accepted public contact/social discoveries and per-field provenance.
- `src/data/club-profiles.ts`: manually reviewed prose, sources and explicit corrections.
- `scripts/audit-club-websites.mjs /absolute/scratch/output.json`: resumable read-only screening into a review queue. It never writes the catalogue.

Stage future directory comparisons, inspect changed fields, retain original values in the review evidence, and merge only supported changes. Never replace a missing source response with fabricated data or mark a fallback row newly checked. The historical August generator now refuses to overwrite newer reviewed data; its fixed-date output must not be used as a current refresh.

The club-only seed version republishes club fields without forcing an unrelated athlete/results reseed. Alias merges preserve the most recent directory data. Detailed source extracts and raw website copies stay out of the repository.

## Validation

`verify-club-audit.mjs` checks catalogue coverage and date preservation. `verify-club-profiles.mjs` loads the actual catalogue and checks alias freshness, profile references, address corrections, contact provenance, duplicate social links and JSON-LD safety. The dedicated Club profiles workflow renders the actual route and card with fictional data to check desktop/mobile layout, contact links, maps, country/global indicators and structured data without creating accounts or sending email.
