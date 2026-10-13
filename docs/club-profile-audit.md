# Club profiles and public contacts — 13 October 2026

The catalogue contains 1,737 clubs after resolving 11 duplicate aliases. This update compares current governing-body directory records, reviews public club websites and adds an editorial profile layout. It does not verify the identity of any club representative or athlete.

## Coverage

- 1,681 canonical directory records were compared with current source content. The remaining 56 retain earlier check dates. Unavailable pages do not receive a new date.
- Website screening attempted all 1,737 listings and retrieved usable pages from 743 club websites. The others had no standalone website, an unavailable page, a redirect requiring review or a blocked request.
- Website research contributes contact pages or contact/social details for 659 listings. A retrieved website is not a claim that every field on that site was manually verified.
- The merged catalogue has contact entries for 494 clubs: 481 publish an email address and 55 a telephone number. There are 835 contact entries in total, including named directory contacts with no direct email or telephone.
- 904 clubs have social links, with 1,825 distinct links after normalising duplicate URLs. Links are attributed to the publishing club website or governing-body directory; this does not establish the present ownership of a social account.
- 133 clubs have extended, individually written profiles (7.7% of the catalogue). These contain 75 notable-member entries, each supported by the club's history, honours list or another opened primary source. Other clubs retain brief factual introductions; missing histories and alumni are not invented.

The second editorial batch adds 30 profiles across England, Wales and Ireland, including City of Norwich AC, Norwich Road Runners, Norfolk Gazelles, Ryston Runners, Swansea Harriers, Bristol & West AC and Galway Triathlon Club. It adds 14 sourced notable-member entries and clarifies five training venues plus Ryston's correspondence address. That batch did not change contact or social coverage.

The third editorial batch adds another 30 profiles across England and Northern Ireland, including Dereham Runners, Wymondham AC, Ipswich Harriers, Ipswich JAFFA, Morpeth Harriers, Leicester Coritanian AC and North Belfast Harriers. It adds 13 sourced notable-member entries, updates contact or social records for 12 clubs and clarifies 11 venues. The net additions are 15 contact entries, six more clubs with email addresses and two social links. Morpeth's listed town is corrected from Cramlington to Morpeth; Diss is described as an adult road-running group in line with its current website. These targeted checks do not constitute a fresh review of every catalogue entry.

The fourth editorial batch adds 27 profiles: 12 Welsh clubs, seven Irish clubs, five English clubs and three Isle of Man clubs. It adds 11 notable-member entries and changes contact or social records for 23 clubs. Net catalogue changes are 31 contact entries, four more clubs with email addresses, 13 social links and three more clubs with social coverage. Nine training or clubhouse venues are clarified. Penarth and Dinas Runners now uses its published 2025 training base; GOG's combined multi-venue directory text is removed from the exact-address field and explained separately. Clwb Run Wales is described as a national virtual club and retains its Welsh indicator.

The fourth batch distinguishes BRAT's 2010 merger from its predecessor clubs and Midleton's 2009 multisport formation from its 1968 cycling roots. Cork's history contains an inconsistent January founding date, so its biography describes the supported November 1998 revival meeting without supplying an exact founding year. Historical hall-of-fame material is not presented as evidence of current membership or current rankings.

The fifth editorial batch adds 21 profiles: eight English, eight Irish and five Welsh clubs. It adds 12 sourced notable-member entries, changes contact or social records for 17 clubs and clarifies 16 training or clubhouse venues. Net additions are 11 contact entries, six clubs with email addresses, one with a phone number, 18 social links and eight clubs with social coverage. The existing three Warrington organisations remain separate canonical clubs.

This batch replaces Bandon's older Town Park venue with the Clancoolbeg facility opened on 11 April 2026, using Athletics Ireland's report; the new venue's Eircode remains empty. Ardee's combined training/postal address is replaced by a seasonal location note that includes the October 2026 temporary winter venues. Altrincham's track and postal address are distinguished, and its disciplines are corrected to running and athletics from its published programme. Sarn Helen's cycling and triathlon activities and Wrecsam Tri's swimming and cycling are represented explicitly. Sarn Helen's multiple meeting points are no longer stored as one exact address.

Stockport's 1891 name change is distinguished from Davenport Harriers' 1887 origins and the 1911 reorganisation. Ron Hill's occasional track appearances and honorary position are not described as first-claim membership. Bohermeen's current formation uses 1969 while explaining its earlier 1927 and 1954 chapters. Bandon's unreadable club website is not treated as newly verified: the biography relies on the opened governing-body report and directory. Pool lessons at Afan Valley are kept distinct from swimming-club membership. New role contacts retain their source URLs and check dates; generic social-platform links and Wix supplier links are excluded.

Founding dates distinguish current clubs from their predecessors. Woodford Green AC with Essex Ladies uses the 1998 merger date and explains Woodford Green's 1908 origins; City of Portsmouth uses its 1993 merger date. Norwich Road Runners' history gives a naming period around 1983–84, so no exact founding year is fabricated. Cambridge Harriers is explicitly identified as a South East London club, distinct from Cambridge's university clubs.

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
- `src/data/club-profiles.ts` and `club-profiles-b.ts` through `club-profiles-e.ts`: manually reviewed prose, sources and explicit corrections.
- `docs/club-profile-checkpoint.json`: completed batch slugs, source gaps and next candidates. Check the live branch and profile map before resuming; the queue is not evidence that a club has been researched.
- `scripts/audit-club-websites.mjs /absolute/scratch/output.json`: resumable read-only screening into a review queue. It never writes the catalogue.

Stage future directory comparisons, inspect changed fields, retain original values in the review evidence, and merge only supported changes. Never replace a missing source response with fabricated data or mark a fallback row newly checked. The historical August generator now refuses to overwrite newer reviewed data; its fixed-date output must not be used as a current refresh.

The club-only seed version republishes club fields without forcing an unrelated athlete/results reseed. Alias merges preserve the most recent directory data. Detailed source extracts and raw website copies stay out of the repository.

## Validation

`verify-club-audit.mjs` checks catalogue coverage and date preservation. `verify-club-profiles.mjs` loads the actual catalogue and checks alias freshness, profile references, address corrections, contact provenance, duplicate social links and JSON-LD safety. The dedicated Club profiles workflow renders the actual route and card with fictional data to check desktop/mobile layout, contact links, maps, country/global indicators and structured data without creating accounts or sending email.
