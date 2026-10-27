# Automated scanner hand-off

The private `brownep77/athrecs-holding` refresh workflow may submit a bounded fixture delta to:

`POST /api/catalogue-automation`

The endpoint accepts only short-lived GitHub Actions OIDC identities for the exact private repository, workflow, `main` ref and GitHub-hosted runner configured in `github-actions-oidc.server.ts`.

Both `Refresh Athrecs race data` (`refresh-races.yml`) and `Weekly UK and Ireland
race expansion` (`weekly-uk-ireland-races.yml`) use the `athrecs-catalogue`
audience at `https://www.athrecs.com/api/catalogue-automation`. The old RunRecs
URL redirects and must not receive staging requests. The weekly workflow keeps
its exact name, path, repository identity and `main` restriction; this migration
does not authorise pull requests, alternate workflows or publication.

## Safety boundary

Automation can only:

1. stage a catalogue batch;
2. run the normal catalogue validation;
3. return the staged batch ID and validation result.

It cannot publish, roll back, edit an existing published revision or bypass the staff confirmation screen. A staff member must review a ready batch under `/admin/catalogue-publishing` and explicitly publish it.

## Payload controls

Each request is size limited and accepts at most 75 events and 200 editions. The source key must use the `athrecs-holding:delta:` namespace, and the source URL must identify the authenticated workflow run. Repeated identical payloads reuse the same staged batch.

The worker also refuses unusually large deltas, date changes, cancelled or postponed fixtures, empty state baselines and scraper-slug collisions before contacting Athrecs.

Automated deltas that would clear or change an existing edition start time are
held during validation. Publication repeats the check under the existing row
locks so a start recorded after validation is protected too. A source-confirmed
time correction requires a separately reviewed staff batch; a scan retry cannot
overwrite it. These checks do not change staff correction or duplicate guards.

