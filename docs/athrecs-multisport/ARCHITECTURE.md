# Architecture

## 1. Core hierarchy

```text
Sport
 └─ Discipline
     └─ Event series
         └─ Event occurrence / edition
             ├─ Venue and geography
             ├─ Competition
             │   ├─ Round / heat / stage / set / apparatus
             │   ├─ Entry
             │   │   └─ Entry members for teams, relays and crews
             │   └─ Result
             │       ├─ Primary performance
             │       ├─ Metrics
             │       └─ Segments / splits
             └─ Result upload batches
```

An event is the durable identity, such as “Run Norwich”, “Norfolk County Swimming Championships” or “Norwich City v Ipswich Town”. An occurrence is a dated edition or fixture. A competition is the actual contest within it, such as a 10K, an under-15 100m freestyle heat, an artistic-gymnastics apparatus category or a football match.

## 2. Why the result model supports all sports

`event_competitions.result_model` controls the main interpretation:

| Model | Typical uses |
|---|---|
| `time` | Running, swimming, cycling, rowing, motorsport |
| `score` | Gymnastics, diving, combat scoring |
| `distance` | Long jump, throws, golf driving |
| `height` | High jump, pole vault |
| `points` | Combined events, leagues, rankings |
| `placement` | Races or brackets where rank is primary |
| `win_loss` | Football, rugby, tennis, boxing |
| `multi_metric` | Triathlon, cricket, complex team or judged sports |

Every result can additionally contain ordered metrics and segments. This avoids adding a new database table every time Athrecs supports a new sport.

Examples:

- A marathon uses `performance_value=10800`, `performance_unit=seconds`, plus 5K split segments.
- A football team uses `score_for`, `score_against` and `outcome`.
- A gymnastics athlete uses `points`, with difficulty and execution metrics and apparatus segments.
- A triathlete uses a total time plus swim, transition, cycle and run segments.

## 3. Existing catalogue compatibility

The original tables remain the source for existing running records:

- `events`
- `editions`
- `athletes`
- `results`

The migration extends `events` but does not rewrite legacy `editions` or `results`. Compatibility views provide combined read models:

- `public_event_catalogue_v` — verified public competitions with normalized `distance_metres`.
- `athlete_result_feed_v` — public verified results across both generations.
- `athlete_result_breakdown_v` — public performance breakdown by sport, discipline, surface, distance and geography.
- `athlete_activity_all_v` and `athlete_activity_breakdown_all_v` — private Athlete 360 entry/result behaviour, including entries with no published result.

New multi-sport records use `event_occurrences`, `event_competitions`, `competition_entries` and `competition_results`. Existing pages can continue using their current queries while new pages adopt the compatibility views.

## 4. Organiser ownership and permissions

An authenticated user belongs to an `organisation` through `organisation_members`.

Roles are:

```text
owner > admin > editor > results_uploader > finance > viewer
```

Organisation membership alone does not permit changes to every event. `organisation_events` grants a verified relationship to a specific event and separately controls:

- `can_edit`
- `can_upload_results`

Existing events are claimed through a staged `event_claim` submission. Approval creates the relationship. This prevents anyone who creates an organisation account from taking control of an existing event.

## 5. Verification and publication boundary

Submitted and public data are separate.

```text
organiser input
    ↓
staging tables / data submission
    ↓
automated checks + evidence
    ↓
Athrecs review case
    ├─ request changes
    ├─ reject
    └─ approve
          ↓
atomic publication + provenance + audit
```

Event and athlete edits are stored as JSON payloads in `data_submissions`. Result files are stored as `result_upload_batches` and `result_upload_rows`. Reviewers apply only allow-listed fields.

## 6. Athlete ownership and privacy

The public `athletes` row is not the account-security record. Access is controlled by `athlete_user_links` with relationships such as self, parent/guardian, coach, agent or authorised representative.

Private data is separated into:

- `athlete_private_profiles`
- `athlete_public_settings`
- `athlete_identifiers`
- `athlete_memberships`
- `athlete_delegations`
- `athlete_consents`

Public athlete queries apply location and equipment visibility on the server before returning data.

Verified access is capability-scoped, not inferred from a broad delegate title. The main capabilities are:

- private-profile view/edit;
- identifier access;
- public-setting management;
- equipment view/management;
- preference management;
- commercial-data access;
- consent view/management.

Self, parent and guardian roles receive conservative family defaults. Coaches, agents, managers and club administrators need an explicit verified permission for sensitive capabilities. Consent management remains owner-only by default.

## 7. Equipment and commercial data

Athlete equipment and commerce data are purpose-separated:

- `products`
- `athlete_equipment`
- `equipment_usage`
- `athlete_preferences`
- `product_interactions`
- `athlete_consents`

A preference records its source and confidence. Declared facts, observed activity, confirmed purchases, calculations and inferences are not treated as the same thing. Consent is stored separately by purpose and channel.

## 8. Extensibility

The seeded sports and disciplines are starting values, not a closed list. Athrecs administrators can add sports, disciplines, surfaces and JSON schemas through `taxonomy-backend.ts`.

`sport_data_schemas` can define additional event, occurrence, competition, entry, result or athlete fields while the shared core remains queryable across sports.

## 9. Transactions

Reviewed submissions and result publication use `withSqlTransaction`. The helper obtains one database connection for the complete transaction on Neon and uses the PGLite transaction API in local preview. This prevents partially published batches.
