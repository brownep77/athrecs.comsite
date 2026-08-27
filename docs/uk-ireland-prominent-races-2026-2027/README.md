# UK and Ireland prominent-race gap audit — 27 August 2026

## Scope

This batch cross-references the ATHRECS production Running inventory against official and authoritative fixture sources for the 12-month period from 27 August 2026 through 27 August 2027.

Sources reviewed include runBritain and home-nation governing bodies, Athletics Ireland, Scottish Athletics, Welsh Athletics, Athletics Northern Ireland, the Fell Runners Association, Results Base, DB Max, SPORTident/SiEntries, TDL Event Services, Pop Up Races and official organiser pages.

## Publication decision

- **29 new event series** are added.
- **45 advertised distance rows** are added across those new events.
- **6 missing distance rows** are added to three existing ATHRECS events.
- A production publication bundle contains **32 event records, 54 edition records and 53 verified entry-option records**, including the existing rows refreshed with verified official entry information.
- The batch stays within the staged publisher limits of 75 events and 200 editions.

## Existing-event reconciliation

| ATHRECS event | Decision |
|---|---|
| Dingle Marathon & Half Marathon | Keep the existing series; add the missing Marathon edition and use the official organiser source. |
| Connemarathon | Keep the existing series; add Half Marathon and 39.3-mile Ultra alongside the existing Marathon. |
| The Village Run, Ballylinan | Keep the existing series; add 10K, Half Marathon and 3/4 Marathon alongside the existing 5K. |

## Deliberately conservative records

Portadown Running Festival is published for **14 March 2027** with its confirmed venue, but its distance is left as `Unspecified` and its status as `TBC`. The latest completed festival offered 5K, 10K and Half Marathon, but those distances are not assigned to 2027 until the organiser publishes the programme.

Seaton Classic 10K keeps its confirmed **26 September 2026** fixture and governing-body source, while direct entry availability remains `TBC`. ATHRECS links to the Athletics Northern Ireland fixture page and does not invent a direct entry URL.

## Persistent production update

The reviewed payload is applied only during a Vercel production build from `main`. It uses ATHRECS's existing three-step catalogue pipeline—stage, validate and transactional publish—rather than a destructive catalogue reseed or direct row deletion. The source key is stable, so repeat production deployments reuse the published batch and make no additional database change.

## Verification

The static verifier checks counts, unique edition keys, the 12-month date window, official source and entry links, multi-distance preservation, the three reconciled existing events, catalogue wiring and production publication safeguards:

```bash
npm run verify:uk-ireland-prominent-races
```

A dedicated GitHub Actions workflow also creates a clean PostgreSQL database, executes the production publication path twice and verifies:

- 32 events, 54 editions and 53 entry options are written;
- Portadown and Seaton retain their conservative `TBC` handling;
- Dingle, Connemarathon and The Village Run contain every confirmed distance; and
- the second publication creates no additional revision.
