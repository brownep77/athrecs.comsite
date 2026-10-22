# Further sports directory expansion — 22 October 2026

Adds 39 national federations to the reviewed 155-record directory, producing
194 organisations, including 146 national federations in 37 countries and
territories. Existing organisation records and stable URLs are retained.

| Added jurisdiction | Athletics | Cycling | Swimming / aquatics | Triathlon |
| --- | --- | --- | --- | --- |
| Czechia | Czech Athletic Federation | Czech Cycling Federation | Czech Swimming Federation | Czech Triathlon Association |
| Hungary | Hungarian Athletics Association | Hungarian Cycling Federation | Hungarian Swimming Association | Hungarian Triathlon Federation |
| Romania | Romanian Athletics Federation | Romanian Cycling Federation | Romanian Swimming and Modern Pentathlon Federation | Triathlon Romania |
| Greece | Hellenic Athletics Federation | Hellenic Cycling Federation | Hellenic Swimming Federation | Hellenic Triathlon Federation |
| Turkey | Türkiye Athletics Federation | Türkiye Cycling Federation | Türkiye Swimming Federation | Türkiye Triathlon Federation |
| Estonia | Estonian Athletics Association | Estonian Cyclists Union | Estonian Swimming Federation | Estonian Triathlon Association |
| Latvia | Latvian Athletics Association | Latvian Cycling Federation | Swimming Federation of Latvia | Latvian Triathlon Federation |
| Lithuania | Lithuanian Athletics Federation | Lithuanian Cycling Federation | LTU Aquatics | Lithuanian Triathlon Federation |
| Mexico | Pending further website verification | Unión Ciclista de México | Aquatics México | Federación Mexicana de Triatlón |
| South Korea | Korea Association of Athletics Federations | Korea Cycling Federation | Korea Swimming Federation | Korea Triathlon Federation |

## Evidence and editorial decisions

Each new record contains public official sources and a 22 October 2026 review
date. Sources include national federation websites, the World Aquatics member
directory, ten individual World Triathlon member profiles, eight individual
European Cycling Union member profiles, Asian Athletics, the Hellenic Olympic
Committee, Türkiye's government portal and COPACI. This batch verifies the new
entries; it does not claim a second full audit of the preceding 155 records.

- Mexico's current cycling body is Unión Ciclista de México, whose recognition
  is confirmed by COPACI. Its own site identifies road, track, mountain biking
  and BMX. Do not substitute the previous federation.
- World Aquatics now lists Federación de Asociaciones de Deportes Acuáticos
  Aquatics México, Asociación Civil. The previous Mexican Swimming Federation
  was expelled in November 2024. The current member entry lists no standalone
  website, so the public link is explicitly labelled as an official member
  directory. Mexico's athletics body is confirmed in NACAC's directory, but a
  current usable standalone destination was not resolved in this batch.
- The Czech swimming body's role and name are confirmed by World Aquatics.
  Its listed root and several indexed pages returned 404 during direct checks;
  the public entry therefore uses the explicitly labelled World Aquatics
  directory, rather than a guessed replacement domain.
- The Czech Cycling Federation's old domain redirects in the web index to
  `czechcyclingfederation.com`; the new destination is used. Hungary's swimming
  destination uses the current `hunswim.com` site alongside the World Aquatics
  listing and the federation's own rules page.
- Greece's triathlon destination uses `hellastriathlon.gr`, confirmed by the
  Hellenic Olympic Committee, rather than the failing legacy domain in the
  World Triathlon profile. Korea's triathlon destination uses its working HTTPS
  site, avoiding the obsolete port in the international member profile.
- Romania's swimming body's name includes modern pentathlon, but only swimming
  is mapped because modern pentathlon is not an AthRecs sport section. Separate
  water polo federations are not mistaken for swimming federations.
- LTU Aquatics uses its current name, retaining Lithuanian Swimming Federation
  as a search alias. Local names and country alternatives such as Czech Republic,
  Türkiye and Republic of Korea are searchable.
- New athletics entries map road running and track and field. Latvia additionally
  maps trail running because its own calendar lists the national trail championship.
- Romania's cycling entry maps road, track and mountain biking. BMX was not
  established from the reviewed federation site and is not assumed from a
  separate platform. Lithuania's triathlon entry maps triathlon only: the
  duathlon result found was an older winter event, insufficient to establish
  the current run-bike-run remit. Other triathlon records have supporting
  national rules, calendars or current multisport information.

Some official sites block automated retrieval, time out, or require JavaScript.
Their identities and roles were cross-checked against indexed official pages
and international/continental member profiles. Review dates mean the evidence
was reviewed, not that every reference always responds successfully. Organisation
sources confer no permission to collect or republish athlete results.

## Link presentation and verification

`websiteKind: "member-directory"` distinguishes a parent body's official
listing from a federation's own website. Both cards and profiles display this
distinction, and JSON-LD does not assign the parent directory as the national
body's own URL or `sameAs`. No new client fetches, effects or dependencies are
introduced; the React review retains native links, descriptive labels and
existing accessible external-link notices.

Targeted checks cover country/sport lookup, accented and alternative-name
searches, Mexico's current bodies, member-directory markers, corrected links,
and conservative Romanian BMX and Lithuanian duathlon exclusions. Directory
integrity, search discovery, TypeScript and the development build are checked
before publication. Production verification checks the 39 new profile pages,
directory totals, representative filters, link labels and sitemap inclusion.
