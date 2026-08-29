# UK 10K enrichment release 64

Checked on **29 August 2026**. This release advances the next 12 immutable queue records
(`64A`–`64D`) using official organiser pages, governing-body-backed registration, or a
clearly identified official booking partner.

| Queue key | Primary source / entry route | Verification note |
|---|---|---|
| `fleet-10k5k-peter-driver-memorial|2026-10-25|10K` | `https://www.fleet10k.co.uk/` | Fleet & Crookham AC confirms 25 October, 09:30 and direct entry. |
| `haltemprice-10k|2026-10-25|10K` | `https://www.runthrough.co.uk/event/haltemprice-10k-october-2026` | RunThrough confirms 25 October, 09:00 and direct entry. |
| `jedburgh-half-marathon|2026-10-25|10K` | `https://www.entrycentral.com/festival/18` | Official festival registration confirms 25 October, 11:00. |
| `kernow-killer-october|2026-10-25|10K` | `https://www.kernowkiller.uk/` | Organiser confirms the 10K obstacle challenge at 09:30. |
| `monsal-trail-half-marathon-autumn-sunday|2026-10-25|10K` | `https://www.nice-work.org.uk/e/monsal-trail-october-half-marathon-and-10k-weekend-10050` | Nice Work confirms the Sunday 10K at 10:00. |
| `polesden-lacey-10k|2026-10-25|10K` | `https://www.nationaltrust.org.uk/visit/surrey/polesden-lacey/events/6ae7564c-7591-4e38-a056-0bea88be8062` | National Trust event page confirms the exact fixture and entry route. |
| `regents-park-5k-10k-october|2026-10-25|10K` | `https://www.runthrough.co.uk/event/regents-park-5k-10k-october-2026` | RunThrough confirms the 09:00 10K and organiser checkout. |
| `rosemullion-10k|2026-10-25|10K` | `https://www.falmouthrunningclub.co.uk/race-list` | Falmouth Running Club confirms 10:00 and links the SiEntries checkout. |
| `running-tribe-races-october|2026-10-25|10K` | `https://findarace.com/events/running-tribe-races` | Exact-date page is labelled as the organiser's official booking partner. |
| `stroud-half-marathon|2026-10-25|10K` | `https://www.stroudhalf.com/events/stroud-10k/` | Official page confirms 09:20 and links a dedicated RaceNation checkout. |
| `the-one-in-the-park-greenwich-park-10k-5k|2026-10-25|10K` | `https://www.onerace.events/london-5k-10k-greenwich-park-october` | OneRace confirms 09:30 and its branded registration route. |
| `the-pumpkin-plod|2026-10-25|10K` | `https://zigzagrunning.eventrac.co.uk/e/pumpkin-plod-11105` | Zig Zag Running confirms Ferry Meadows and the 09:00 / 11:00 wave choices. |

## Publication safeguards

- The release selects exactly 12 event/date/distance keys from the assembled catalogue.
- Each selected edition must expose exactly one verified primary entry route.
- Same-day multi-distance fixtures retain the exact 10K edition.
- PostgreSQL publication is staged, validated and transactional.
- A stable source key makes repeat production deployments idempotent.
