# Belgium elite, professional and youth competition audit

Checked: **28 August 2026**

## Result

This source-bounded expansion adds **100 restricted-entry competition series** and **100 exact-dated editions** to the ATHRECS catalogue:

| Audience | Series |
|---|---:|
| Professional-only | 29 |
| Elite-only | 8 |
| Youth-only | 34 |
| Mixed elite/youth restricted categories | 29 |
| **Total** | **100** |

The sport split is **97 cycling**, **2 duathlon** and **1 triathlon** fixture. The cycling coverage includes **58 cyclo-cross fixtures**.

## Scope

Included:

- Remaining exact-dated Belgian professional and elite road races in 2026.
- Every Belgian men’s and women’s 2027 UCI WorldTour fixture whose date was officially approved.
- The six Belgian rounds of the 2026–27 UCI Cyclo-cross World Cup.
- Every Belgian international C1/C2 cyclo-cross fixture in the official 2026–27 national calendar that carries elite, U23 or junior classes.
- Every clearly youth-only U12–U17 cyclo-cross fixture in that calendar.
- Belgian elite, U23, junior, U17 and U15 road championships from 2026.
- The two remaining 2026 Topcompetition U17 road fixtures after the audit date.
- Belgian-hosted junior/U23 track and BMX championships with exact official dates.
- Belgian youth triathlon and youth duathlon championships listed by Belgian Triathlon.

## Entry handling

These events must not behave like mass-participation races:

- Professional road and WorldTour races use team invitation or selection.
- Elite and international cyclo-cross races require licensed competition eligibility.
- Championships may require Belgian nationality, federation selection or a qualifying licence.
- Youth events are limited to their published age classes and may require a federation licence.

No edition in this batch exposes a public **Enter** URL. The race page instead retains the official organiser or federation source and explains the restriction in the edition notes. This prevents a federation calendar page from being presented as though it were an open registration form.

## Source boundary

Primary sources used:

- UCI-approved 2027 WorldTour and Women’s WorldTour calendars.
- UCI 2026–27 Cyclo-cross World Cup calendar.
- Belgian Cycling’s official road championship pages.
- Belgian Cycling’s official 2026–27 cyclo-cross calendar, version 260804.
- Belgian Cycling competition and hosted-championship pages.
- Belgian Triathlon’s 2026 Belgian Championships calendar.
- Official race or organiser pages for remaining 2026 professional road fixtures.

No unannounced 2027 national or lower-tier road race date has been inferred from a 2026 edition. Those fixtures remain excluded until Belgian Cycling, the UCI or the organiser publishes the exact 2027 date.

## Catalogue integration

The batch is exported from:

- `src/data/belgium-elite-youth-competitions.ts`

It is merged through:

- `src/data/verified-all-sport.ts`

The migration:

- `migrations/0025_refresh_belgium_elite_youth_fixtures.sql`

clears only the fixture catalogue marker so the existing non-destructive fixture upsert runs again. It does not clear athlete, result, club or existing race data.

## Regression protection

Run:

```bash
node --experimental-strip-types scripts/verify-belgium-elite-youth-competitions.mjs
```

The verifier locks:

- the 100-series and 100-edition counts;
- unique slugs, names and edition keys;
- the professional/elite/youth audience split;
- all 16 officially confirmed Belgian 2027 WorldTour dates;
- all six Belgian 2026–27 Cyclo-cross World Cup rounds;
- 25 Belgian international cyclo-cross fixtures;
- 24 clearly youth-only cyclo-cross fixtures;
- the Belgian road, track, BMX, triathlon and duathlon anchor dates;
- HTTPS provenance and explicit restricted-entry notes;
- the absence of misleading public-entry links.
