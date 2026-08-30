# SportsRecs network foundation

This release adds the shared database foundation for a future SportsRecs network without moving public pages or changing any existing ATHRECS event, edition, athlete or result identifier.

## Safety state

- ATHRECS remains the only live canonical event publication.
- Proposed specialist domains are stored as `provisional`; this does not assert registration, ownership or verification.
- Specialist-domain writes and public URL cutover are not implemented.
- The new occurrence-and-competition model is a `shadow` model.
- Legacy `editions` and `results` remain the production source of truth.
- The sync is idempotent and does not overwrite staff-reviewed classifications.

## New model

```text
brands ── brand_domains
   │
   └── event_publications ── events ── event_classifications
                                      │
                                      └── network_event_editions
                                                │
                                                └── competitions
                                                          │
                                                          └── legacy results via mapping view

sports ── disciplines
organisations ── organisation_sports
venues
network_staff_roles ── network_staff_assignments
network_audit_log
```

## Seeded brands

| Code | Brand | Initial state | Purpose |
|---|---|---|---|
| `sportsrecs` | SportsRecs | Planned | Cross-sport network and shared services |
| `runrecs` | RunRecs | Planned | Running and parkrun |
| `athrecs` | ATHRECS | Active | Athletics |
| `cycrecs` | CycRecs | Planned | Cycling |
| `swimrecs` | SwimRecs | Planned | Swimming |
| `trirecs` | TriRecs | Planned | Triathlon and related multisport |
| `gymrecs` | GymRecs | Planned | Gymnastics |
| `fitrecs` | FitRecs | Planned | Functional fitness and obstacle competition |

The naming remains editable. No planned brand should be publicly launched until domain and trademark checks are completed.

## Classification rules

Migration `0027_sportsrecs_network_foundation.sql` converts the existing free-text `events.sport` value into controlled `sports` and `disciplines` records. It also records a proposed destination brand.

Automatic classifications are intentionally suggestions. A staff-reviewed or overridden classification is never replaced by the recurring sync.

Events with an unknown legacy sport are assigned to `other / unclassified`, placed under the SportsRecs umbrella for planning, and shown in the staff review list.

## Edition and competition shadow model

The existing system stores one legacy edition row per event, date and distance. The network foundation creates:

1. One `network_event_editions` row per event and date.
2. One `competitions` row per legacy edition.
3. A `sportsrecs_result_competition_map` view that maps every legacy result to the corresponding shadow competition.

No result foreign key is changed in this release.

## Staff view

The private staff site gains `/admin/network`, with:

- Network and individual-brand scope selection
- Proposed event counts by brand
- Controlled sport and discipline coverage
- Shadow edition, competition and result-mapping coverage
- Protected ATHRECS publication counts
- Unclassified event review visibility
- Explicit migration safeguards and unresolved decisions

The route is read-only and protected by the existing staff middleware.

## Next guarded phases

1. Add staff review and override actions for event classifications.
2. Add organisation and venue reconciliation/backfill.
3. Extend competitions with sport-specific structures for heats, rounds, stages, apparatus and splits.
4. Add domain verification records and hostname-aware brand configuration.
5. Build a read-only URL migration preview with one-to-one redirect validation.
6. Pilot RunRecs only after the migration report has no blocking conflicts.
7. Move results from legacy edition relationships only after shadow/legacy parity is verified.

Public URL migration and domain activation require a separate approved release.
