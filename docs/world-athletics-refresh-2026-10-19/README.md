# World Athletics refresh recovery — 19 October 2026

## Recovery and publication scope

The saved collection is commit `0c92442547aae36251e8bf38743acecb7fd03417`, from
[run 39234684807](https://github.com/brownep77/athrecs.comsite/actions/runs/39234684807).
No repeat collection was run. Main at review was `ca0f9336b8df58ad32360c3079a8bf96072e5d70`;
its two intervening commits were merged into the existing automation branch.

The original snapshot contained 380 new slugs, four removed slugs, 19 changed
existing series, 622 new edition keys, 20 removed keys and 15 changed editions.
Two apparent new slugs were renamed meetings with existing World Athletics IDs
(7244461 and 7245057). They must retain their historical AthRecs identities.
Two other omitted IDs (7246024 and 7244476) have no demonstrated cancellation;
their existing records are preserved.

This release contains **366 new meetings and 585 competition-day editions**.
Every pre-existing World Athletics series and edition is preserved byte-for-byte
at the object level. The ordinary production seed publishes missing identities.
No existing event, date, result, athlete, visibility or entry record is overwritten.

The machine-readable manifest is
`src/data/world-athletics-refresh-review.json`. Its `added` array enumerates every
included source ID, slug and day count. It also retains, without publishing:

- 24 proposed changes to existing source identities, including two renames,
  date/venue/category changes, status changes and an existing ambiguous identity.
- 12 new source identities (18 days) whose names collide with the combined
  catalogue's existing name grouping. Their proposed records and dates are in
  `nameReview`; they require explicit canonical mapping, not name-only merging.
- Three pre-existing duplicate source-ID groups (7245016, 7239525 and 7245137).
  They are not new duplicates from this refresh.

Production was inspected read-only before publication. None of the original
378 genuinely new source IDs was already present as an event website. The Paris
meeting already had both 18 and 25 June 2027 editions. This is why applying date
changes as ordinary inserts is unsafe; the existing-edition corrections need a
separate, guarded reconciliation against live IDs and dependencies.

## Provenance and validation

`source-checks.json` retains targeted reads of the actual World Athletics calendar
payload on 19 October. All 19 changed existing series and the two renamed IDs
matched their source IDs and revised dates/metadata. Four new meetings were also
sampled. The two omitted IDs were not found in their named calendar searches;
absence alone is not cancellation evidence. These targeted checks did not repeat
the 783-meeting extraction and are not a claim of independent manual verification
of every new meeting.

The initial verifier's `diamond_league_2027: 16` was misleading: its filter also
counted a 2026 meeting. It now requires a 2027 edition and reports **15**. This
corrects the verifier, not the source data. Retained and held rows mean the final
additive snapshot's totals differ from the original replacement snapshot.

Checks: preservation/idempotence/identity-collision regression, global track
calendar provenance and date-key checks, combined fixture duplicate audit,
fixture-geography guard suite, lint and TypeScript. GitHub's complete quality
gate and deployment checks remain mandatory before merge. A Git commit or seed
version marker alone is not proof of database publication; verify all `added`
slugs and their exact editions against production after deployment.

## Future pull-request authentication

The failed job already had `contents: write` and `pull-requests: write`.
GitHub has a separate repository setting for creation/approval by `GITHUB_TOKEN`.
The simplest supported configuration is:

1. Open [Actions settings](https://github.com/brownep77/athrecs.comsite/settings/actions).
2. Enable **Allow GitHub Actions to create and approve pull requests** and save.
3. Keep the repository's existing default token permissions. Each job declares
   only what it needs. The workflow never approves or merges a PR.

This setting was **not changed during recovery**: the connector has no settings
mutation endpoint, and the settings browser was unavailable (insufficient credits).
The checked-in workflow alone cannot override this GitHub policy.

For unattended PR checks, the workflow also supports a dedicated GitHub App:
install it only on this repository with Contents read/write and Pull requests
read/write, configure `WA_REFRESH_APP_CLIENT_ID` as a repository Actions variable
and `WA_REFRESH_APP_PRIVATE_KEY` as a repository Actions secret. The GitHub-owned
`actions/create-github-app-token@v3` action issues a short-lived, repository-scoped
token and revokes it after the job. No administration, review bypass or personal
access token is required. Do not configure an App to evade an organisation policy;
the repository owner must approve its installation and permissions.

GitHub documents that PR events created with `GITHUB_TOKEN` can require a human
to approve their workflow runs. An App installation token avoids that approval
prompt while retaining the normal quality gate and merge review.

- [Repository workflow permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
- [GITHUB_TOKEN workflow triggers](https://docs.github.com/en/actions/concepts/security/github_token)
- [GitHub App authentication in Actions](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/making-authenticated-api-requests-with-a-github-app-in-a-github-actions-workflow)

## Recovery without recollecting

Collection/validation/push and PR submission are now separate jobs. Retry only
`submit` after a PR permission failure. Alternatively dispatch the workflow on
`main` with `submit_existing=true`: it uses the saved branch, merges current main,
validates it and submits without calling the collector. A changed head SHA is
rejected at submission. Open PR lookup is explicitly restricted to open PRs, so
a previously merged PR does not prevent the next PR from being created.

The saved branch is updated using ordinary fast-forward pushes. Main is merged
first; conflicts fail safely. There is no force push and no reset of pending
review changes. Future runs retain a raw source capture and the review manifest
as Actions artifacts. New same-name identities and existing-record changes are
held for review; they are never silently deleted or treated as newly published.
