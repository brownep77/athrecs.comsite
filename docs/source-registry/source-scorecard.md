# Source scorecard

Generated from `fixture-result-sources.csv` by `npm run sources:score`. 1685 sources scored.
Scores use registry evidence; live collection metrics adjust them once recorded in
`source-live-metrics.csv`. A score never grants permission to collect.

## Tiers and check frequency

| Tier | Sources |
| --- | ---: |
| A (Every 2 hours) | 41 |
| B (Daily) | 781 |
| C (Weekly) | 851 |
| Retired (Monthly) | 12 |

## Permission

| Permission | Sources |
| --- | ---: |
| Needs review | 1420 |
| Manual only | 212 |
| Open | 41 |
| Not allowed | 12 |

## What sources supply

| Supplies | Sources |
| --- | ---: |
| Results | 580 |
| To assess | 379 |
| Fixtures | 348 |
| Fixtures and results | 192 |
| Reference | 186 |

## Sports covered

| Sport | Sources |
| --- | ---: |
| Swimming | 411 |
| Running | 381 |
| Unclassified | 305 |
| Triathlon | 291 |
| Athletics | 271 |
| Cycling | 145 |
| Trail | 76 |
| HYROX | 12 |

## Highest-value sources not yet collected (top 25)

| Source | Country | Supplies | Score | Next action |
| --- | --- | --- | ---: | --- |
| Titanium Llanelli 2026 Junior and Senior Female results | Wales | Fixtures and results | 78 | Rights review, then partner request if needed |
| Titanium Llanelli 2026 Junior and Senior Open Tier 1 results | Wales | Fixtures and results | 78 | Rights review, then partner request if needed |
| World Athletics Combined Events Tour | Global | Fixtures and results | 72 | Rights review, then partner request if needed |
| World Athletics Cross Country Tour | Global | Fixtures and results | 72 | Rights review, then partner request if needed |
| World Athletics Race Walking Tour | Global | Fixtures and results | 72 | Rights review, then partner request if needed |
| Eightmile Event Timing | United Kingdom | Fixtures and results | 70 | Rights review, then partner request if needed |
| Elite Timing Ireland | Ireland | Fixtures and results | 70 | Rights review, then partner request if needed |
| Monster Timing Ireland | Ireland | Fixtures and results | 70 | Rights review, then partner request if needed |
| Precision Timing Ireland | Ireland | Fixtures and results | 70 | Rights review, then partner request if needed |
| Sports Systems UK | United Kingdom | Fixtures and results | 70 | Rights review, then partner request if needed |
| StuWeb UK Events and Results | United Kingdom | Fixtures and results | 70 | Rights review, then partner request if needed |
| British Triathlon Super Series results and rankings | United Kingdom | Results | 69 | Rights review, then partner request if needed |
| Titanium Race Timing results | United Kingdom | Results | 69 | Rights review, then partner request if needed |
| Triathlon Scotland championship results and honours | Scotland | Results | 69 | Rights review, then partner request if needed |
| UCI official calendar and results | Global | Fixtures and results | 68 | Manual research or partner request |
| Banja Luka Marathon | Bosnia and Herzegovina | Fixtures | 67 | Rights review, then partner request if needed |
| BBBRun | Australia | Fixtures | 67 | Rights review, then partner request if needed |
| Changsha Marathon | China | Fixtures | 67 | Rights review, then partner request if needed |
| Chrono Puces | France | Fixtures and results | 67 | Rights review, then partner request if needed |
| Chrono-Race (France) | France | Fixtures and results | 67 | Rights review, then partner request if needed |
| Chronoplace | France | Fixtures and results | 67 | Rights review, then partner request if needed |
| ecomarathon.run | Japan | Fixtures | 67 | Rights review, then partner request if needed |
| EGAT Mae Moh Half Marathon | Thailand | Fixtures | 67 | Rights review, then partner request if needed |
| CS Montereau Athletics | France | Fixtures | 67 | Rights review, then partner request if needed |
| TREK Marathon de Lille / Ligue Hauts-de-France | France | Fixtures | 67 | Rights review, then partner request if needed |

## How scores work

- Permission: open 30, needs review 12, manual only 5, not allowed 0
- Supplies: fixtures and results 25, fixtures 20, results 16, to assess 8, reference 4
- Adapter built 20, plain web page 8
- Coverage: UK and Ireland 15 (UK first), global or Europe 12, other regions 8
- Timing quality: provider-confirmed chip timing 10, partial 6, unknown 3
- Live data, when recorded: up to +10 for volume, +5 for low rejection; -10 for no new records, down to -25 for high rejection
- Tier A needs an enabled source scoring 70+; B 50+; C 30+; otherwise Retired
