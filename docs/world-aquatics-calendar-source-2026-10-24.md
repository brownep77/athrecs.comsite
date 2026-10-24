# World Aquatics calendar source — 24 October 2026

Paul supplied the official 2026 competition-calendar view while reviewing
aquatics links in the federation directory. The registry already contained the
World Aquatics homepage, membership directory and Results hub, but not its
competition calendar or athlete search.

## Source registration

| Source ID | Entry point | Purpose |
| --- | --- | --- |
| `world_aquatics_calendar` | <https://www.worldaquatics.com/competitions> | Fixture discovery, prioritising pool and open-water swimming |
| `world_aquatics_results` | <https://www.worldaquatics.com/results> | Existing official results source; original 23 October check preserved |
| `world_aquatics_athletes` | <https://www.worldaquatics.com/athletes> | Athlete search and individual profile research |

All three records are explicitly linked to the existing `world-aquatics`
organisation. Its homepage, aliases, original references and 22 October
directory check date are retained. No duplicate organisation is created.
The homepage reconciliation note retains its original wording and records this
follow-up separately.

The two additional source pages bring the registry from 841 to 843 records.
All 36 enabled collection records are unchanged. These inspected entry points
remain available for supervised research; registration does not install or
enable an automated collector, import fixtures, or verify athlete results.

## What was checked

- Paul's exact link returned HTTP 200 on 24 October 2026:
  <https://www.worldaquatics.com/competitions?group=FINA&year=2026&month=latest&disciplines=>.
- The fetched HTML identifies a competition-calendar widget and the sport
  controls `SW` (Swimming), `WP` (Water Polo), `DV` (Diving), `SY` (Artistic
  Swimming), `OW` (Open Water), and `HD` (High Diving).
- The page contains an initially empty listing and a hidden empty-state
  template. Text extraction exposing that template does not establish that
  the selected year has no competitions. No complete calendar count or
  pagination result is claimed.
- The Results and Athletes entry points opened as their expected official
  pages. Their dynamic listings were not enumerated in this review.
- The canonical calendar avoids treating a fixed 2026 URL as coverage of
  later years. The exact meaning of `month=latest` was not established, so it
  must not be treated as an all-month completeness guarantee.

## Cross-year fixture evidence

World Aquatics' [19 October 2026 announcement](https://www.worldaquatics.com/news/4594549/world-aquatics-reveals-open-water-swimming-world-cup-202627-calendar-as-sport-builds-towards-budapest-2027)
was opened on 24 October. It explicitly lists the 2026/27 Open Water Swimming
World Cup across two calendar years: Cancún, 6–7 November 2026; Somabay,
19–20 March 2027; an unconfirmed host, 23–24 April; Golfo Aranci,
30 April–1 May; and Setúbal, 28–29 May 2027.

This establishes why collection must inspect the appropriate years rather
than rely only on Paul's 2026 view. It is not a fixture-publication receipt.
The unresolved host remains unconfirmed, and no race distances, individual
starts or recurrence dates are inferred from this series announcement.

Individual result review must preserve identity evidence, event, stroke,
distance, 25m/50m course length, round, relay context, source precision and
source-supplied nationality. An athlete personal-best table is not a complete
performance history.
