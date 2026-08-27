# Approved historical result sync

This integration accepts normalized historical race-result exports from the private
`brownep77/athrecs-holding` worker and stages participant records in the existing
private result archive. It is intended for Total Race Timing and Run Norwich
history, then for any additional provider added through the same reviewed policy.

## Privacy and claim behaviour

- Imported athlete records use a `claim-<source>-<hash>` slug and are forced through
  the existing private-by-default result importer.
- Imported rows never attach to an existing public or public-figure profile by name.
- A provider `sourceAthleteId` may group several performances into one private claim
  identity. Without one, `sourceResultId` creates a separate private identity for
  that result, avoiding accidental same-name merges.
- Participant names and times are not returned in automation responses or written to
  the worker summary artifact.
- Public display remains controlled by the existing authenticated claim and athlete
  publication flows.

## Source inventory

| Source key | Official archive | Recorded historical coverage | Participant-row status |
| --- | --- | --- | --- |
| `total_race_timing_results` | `https://totalracetiming.co.uk/result` | 2016–2026 | Approval required |
| `run_norwich_results` | `https://www.runnorwich.co.uk/event-info/results/` | 2015–2019 and 2022–2025 | Approval required |

The public archive pages are discovery references only. The worker deliberately does
not scrape participant rows from them. It consumes an organizer/provider-authorized
CSV or JSON export after a permission reference is recorded.

## Deployment approval gate

Every Athrecs deployment/database that should accept these rows must define:

```text
ATHRECS_RESULT_SOURCE_APPROVALS_JSON={"total_race_timing_results":"approval-reference","run_norwich_results":"approval-reference"}
```

Use a contract, email, licence or internal approval reference, not a password or API
secret. The worker must submit the exact same value. The value is compared but not
returned; only a short one-way fingerprint is retained in the staff ingestion note.
An absent source key blocks participant ingestion with HTTP 403.

## Trusted endpoint

The existing GitHub Actions OIDC endpoint is reused to avoid another route-tree and
credential surface:

```text
POST /api/catalogue-automation?mode=historical-results
Authorization: Bearer <GitHub Actions OIDC token>
Content-Type: application/json
```

Only the trusted main-branch refresh workflow in `brownep77/athrecs-holding` can
pass OIDC verification. A request contains no private feed URL or feed credential.
The official archive URL is fixed by the server-side source policy.

## Normalized batch contract

```json
{
  "sourceKey": "run_norwich_results",
  "sourceUrl": "https://www.runnorwich.co.uk/event-info/results/",
  "batchKey": "run_norwich_results:2025:00001:0123456789abcdef",
  "permissionReference": "approval-reference",
  "results": [
    {
      "sourceResultId": "provider-result-id-or-worker-derived-id",
      "sourceAthleteId": "optional-provider-stable-athlete-id",
      "eventSlug": "run-norwich-10k",
      "eventName": "Run Norwich 10K",
      "date": "2025-09-07",
      "distance": "10K",
      "place": 1,
      "bib": "1001",
      "givenName": "Example",
      "familyName": "Runner",
      "gender": "F",
      "category": "F35",
      "chipTimeSeconds": 2100,
      "clubName": "Example AC",
      "country": "United Kingdom",
      "distanceKm": 10
    }
  ]
}
```

A batch is capped at 400 rows. `sourceResultId`, an athlete name, event/date/distance
and a positive finish time are required. Repeated completed batches are detected by
a canonical SHA-256 checksum and return the existing ingestion run rather than
creating another one.

## Multi-database operation

The worker accepts `ATHRECS_RESULT_TARGETS_JSON`, an array of approved deployment
endpoints. Each endpoint writes through that deployment's own `DATABASE_URL`, so the
same authorized feed can be synchronized to production, staging or other retained
Athrecs databases without putting database credentials into GitHub Actions.

## Activation checklist

1. Obtain a participant-level export or API/feed authorization from the source owner.
2. Normalize the export to the documented CSV or JSON schema.
3. Add the same non-secret permission reference to each target deployment and to the
   private worker feed configuration.
4. Add every database-backed deployment endpoint to `ATHRECS_RESULT_TARGETS_JSON`.
5. Run the workflow manually once, review aggregate ingestion coverage in staff Data
   Intelligence, then leave the daily refresh enabled.
6. Preserve the original authorized export outside the public repository according to
   the agreed retention terms.
