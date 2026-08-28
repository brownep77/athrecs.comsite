# Germany and Belgium catalogue release — 28 August 2026

## Germany

- 38 verified endurance event series.
- 150 separately published date/distance editions.
- Running, cycling, triathlon and duathlon coverage.
- Every edition retains a verified primary official entry or information option.
- BMW BERLIN-MARATHON and the in-window German IRONMAN 70.3 races remain supplied by their existing AIMS and IRONMAN feeds, avoiding duplicate event cards.

## Belgium

- 100 exact-dated restricted-entry competition series and 100 editions.
- 97 cycling, two duathlon and one triathlon fixture.
- Professional, elite, youth and mixed elite/youth categories.
- No misleading public entry links. Every edition retains an explicit restriction note.
- Explicitly labelled men's and women's competitions remain separate when held on the same date and course.

## Production publication

The release uses three bounded catalogue batches through ATHRECS's stage, validate and transactional publish pipeline: one German batch and two 50-event Belgian batches. The source keys and payloads are stable, so repeat deployments create no additional revisions. Edition notes are preserved by the staged importer and rollback snapshots.

A clean PostgreSQL workflow publishes all three batches twice and verifies counts, entry-option handling, restriction notes, gender-paired competitions and idempotency.
