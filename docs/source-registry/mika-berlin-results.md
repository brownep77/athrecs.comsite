# Berlin Marathon / mika:timing athlete-results source

## Registration and scope

Requested by Paul Browne on 27 September 2026.

- Source key: `mika_timing_berlin_results`.
- Registered result URL: https://berlin.r.mikatiming.com/2026/
- Organiser archive/discovery page: https://www.bmw-berlin-marathon.com/en/your-race/results
- Initial verified edition scope: 2026. This is not a claim of full result collection.
- Product: AthRecs athlete evidence and results; do not feed participant rows to the RunRecs fixture collector.

The managed source was registered with `requested_enabled=true`, `enabled=false`, `review_status=pending`, and rights status `Participant-level reuse and automated access review required`. This code change also registers the source key with the existing historical-results policy. Neither action enables a crawler, changes a schedule, approves participant reuse, or publishes an athlete.

The organiser's public archive advertises past-event, competition, age-group and sex selectors. The presence of an archive is not evidence that every historical edition was inspected or may be bulk reused. No earlier years have been added to the policy without that review.

## Before any participant ingestion

1. Establish the applicable result-host access/reuse conditions and retain the source-specific permission reference. The organiser's event participation terms alone do not establish a third-party database licence. No positive reuse finding was established in this setup.
2. Implement and independently test a dedicated row adapter. Registration in this PR is not an adapter or an import job.
3. Keep the existing `ATHRECS_RESULT_SOURCE_APPROVALS_JSON`, OIDC, body-size, batch-size, identity, privacy and publication gates. Do not populate approvals with an invented reference or use direct database writes to bypass a blocked importer.
4. Read the actual edition, event, division, gender, category, timing labels and finality text. A result being from an official timer does not make an `Unofficial Results` list final.
5. Keep full row evidence privately, including result/bib identity, exact source locator, filter settings, capture time and revision hash. Run the independent source-row audit from `docs/result-evidence-policy.md` before any verified publication.
6. Reconcile against current canonical athletes, provider identities, results and pending proposals. A name match, nationality or shared club alone does not establish identity. Obtain corroboration before linking historical performances across editions. Do not create another public profile simply because a possible match is unresolved.

The existing automated-import API requires `sourceUrl` to equal the registered URL exactly. That does not replace row-level source locators. Do not use the 2026 URL as sole provenance for a historical edition, or submit a generic `Finish` field as `chipTimeSeconds` merely to satisfy an existing type.

## Field mapping rules

| Source field | Required treatment |
| --- | --- |
| `Pl.AC` | Source age-category rank; keep distinct from other placings. |
| `Place` | Retain its original label and filter context. On a gender-filtered table, do not assume this is a mixed-field overall place. Confirm the scope before mapping. |
| `Gun time` | Gun-time text, with original precision. |
| `Finish` | Finish-time text. Do not call it chip/net time without an explicit source definition. |
| Country/code | Source-published nationality/code only. Do not infer from name, home, club or event country. Hold ambiguous codes for corroboration. |
| Club/team | Race-day source string; missing stays missing. Do not update current profile membership from an old affiliation. |
| Category | Preserve the exact label. Do not infer a date of birth or silently expand ambiguous category bounds. |

Keep Runner, Wheelchair and Handbiker results distinct. A para class code is a sporting classification, not permission to infer a medical diagnosis. Flying 400, inline skating, GENERALI 5K and mini-marathon are separate competitions, not marathon running age categories.

## Capture and artwork checkpoint

Earlier read-only captures in the same user workflow covered Runner Men/Women overall top 20 and Runner Men/Women age-group `40` top 20. These four captures were labelled `Unofficial Results` and already have separate draft Instagram cards. They are not new additions in this source-registration change, and their rows have not been imported by this PR.

Previously observed running age selector labels: `H`, `JU20`, `30`, `35`, `40`, `45`, `50`, `55`, `60`, `65`, `70`, `75`, `80`. Recheck the current selector and category definitions before assuming completeness. Only age `40` had its requested top twenties captured; the remaining age groups and additional divisions are incomplete.

The next attempt to inspect result-host terms and collect age `30` and `35` ended at the connected browser's cost limit and returned no new rows. Do not mark those categories captured, verified or published. Direct public-web extraction of the 2026 result host was also unavailable during this setup.

Artwork must use the existing AthRecs logo and teal/black/white TV-style template, one separate top-20 card per race/division/gender/age selection. Keep names, ranks, times and source-confirmed flags data-driven. Put the copyable caption and hashtags below the image, not inside a second generated image. Use the true smaller field where fewer than 20 finishers exist. Do not promote a provisional draft to a verified/final card.

## Work still required

The full London 10,000 top twenties, the remaining Berlin age groups, other major-race category results, and athlete current/historical imports have not been completed by this registration. Existing winner cards are not substitutes for top-twenty leaderboards. Never report a repeated previously captured race as a new package; deduplicate using source, edition date, distance/division, gender, category and row revision.

## Validation and rollback

Run `node --experimental-strip-types scripts/verify-mika-source-registration.mjs` for the narrow policy assertions. Full repository typecheck, lint, build and importer integration checks are separate requirements; this narrow check does not claim they passed.

This PR contains no athlete rows, credentials, approval references, workflow or production-publication change. Reverting its policy addition removes the new code registration. The separately registered managed-source row remains disabled until reviewed; do not delete it as a blanket rollback without checking for subsequent legitimate use.
