# Source scorecard

Generated from `fixture-result-sources.csv` by `npm run sources:score`. 1708 sources scored.
Scores use registry evidence; live collection metrics adjust them once recorded in
`source-live-metrics.csv`. A score never grants permission to collect.

## Tiers and check frequency

| Tier | Sources |
| --- | ---: |
| A (Every 2 hours) | 328 |
| B (Daily) | 1067 |
| C (Weekly) | 304 |
| Retired (Monthly) | 9 |

## Permission

| Permission | Sources |
| --- | ---: |
| Open | 1052 |
| Needs review | 435 |
| Manual only | 212 |
| Not allowed | 9 |

## What sources supply

| Supplies | Sources |
| --- | ---: |
| Results | 580 |
| To assess | 379 |
| Fixtures | 371 |
| Fixtures and results | 192 |
| Reference | 186 |

## Sports covered

| Sport | Sources |
| --- | ---: |
| Swimming | 411 |
| Running | 404 |
| Unclassified | 305 |
| Triathlon | 291 |
| Athletics | 272 |
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
| Monster Timing Ireland | Ireland | Fixtures and results | 70 | Rights review, then partner request if needed |
| Malaysia Athletics | Malaysia | Fixtures | 69 | Collect; improve adapter |
| Athletics Federation of India | India | Fixtures | 69 | Collect; improve adapter |
| Athletics Association of Thailand | Thailand | Fixtures | 69 | Collect; improve adapter |
| Abbott World Marathon Majors Age Group World Rankings | Global | Results | 69 | Collect; improve adapter |
| Active.com | United States | Fixtures | 69 | Collect; improve adapter |
| ADNOC Abu Dhabi Marathon | United Arab Emirates | Fixtures | 69 | Collect; improve adapter |
| Albanian Swimming Federation — calendar | Albania | Fixtures | 69 | Collect; improve adapter |
| Albanian Swimming Federation — website | Albania | Fixtures | 69 | Collect; improve adapter |
| Federació Andorrana de Natació — calendar | Andorra | Fixtures | 69 | Collect; improve adapter |
| Federació Andorrana de Triatló — calendar | Andorra | Fixtures | 69 | Collect; improve adapter |
| Asia Run Calendar | Indonesia | Southeast Asia | Fixtures | 69 | Collect; improve adapter |
| AthleteRanking Japan | Japan | Fixtures | 69 | Collect; improve adapter |
| Athletics Alberta | Canada | Fixtures | 69 | Collect; improve adapter |
| Australian Athletics | Australia | Fixtures | 69 | Collect; improve adapter |
| Athletics Canada | Canada | Fixtures | 69 | Collect; improve adapter |
| Athletics Canada event calendar | Canada | Fixtures | 69 | Collect; improve adapter |
| Ethiopian Athletics Federation | Ethiopia | Fixtures | 69 | Collect; improve adapter |
| Athletics NSW | Australia | Fixtures | 69 | Collect; improve adapter |
| Athletics New Zealand | New Zealand | Fixtures | 69 | Collect; improve adapter |

## How scores work

- Permission: open 30, needs review 12, manual only 5, not allowed 0
- Supplies: fixtures and results 25, fixtures 20, results 16, to assess 8, reference 4
- Adapter built 20, plain web page 8
- Coverage: UK and Ireland 15 (UK first), global or Europe 12, other regions 8
- Timing quality: provider-confirmed chip timing 10, partial 6, unknown 3
- Live data, when recorded: up to +10 for volume, +5 for low rejection; -10 for no new records, down to -25 for high rejection
- Tier A needs an enabled source scoring 70+; B 50+; C 30+; otherwise Retired
