# Event image validation investigation — 3 November 2026

## Evidence and limitations

The Google Search Console email at 07:58 GMT confirms failed validation for `Missing field "image"`, with one passed page. It contains no affected URLs. The available Search Console browser session reached the Google sign-in wall; the actual failed/pending URL list, crawl dates and restart button remain inaccessible. The examples below are independently observed production findings, not claimed matches to Google's report.

PR #1117 was merged at 09:03:29 UTC, contrary to its earlier open status. This investigation started from main commit `3b883a734cab2353d56022270c2cc1d21664e2e3`.

Read-only production HTML audit on 3 November:

| URL | HTTP | Event image | Canonical and indexing |
| --- | --- | --- | --- |
| https://www.athrecs.com/running/races/london-marathon | 200 | Missing | Self canonical; index/follow |
| https://www.athrecs.com/running/ultramarathons/dartmoor-discovery | 200 | Missing | Self canonical; index/follow |
| https://www.athrecs.com/races/tunnel-vision | 200 | AthRecs publisher logo | Self canonical; index/follow |
| https://www.athrecs.com/races/gunma-marathon | 200 | AthRecs publisher logo | Self canonical; index/follow |

All four had parseable JSON-LD and no X-Robots-Tag. This is a bounded sample, not a full live crawl.

## Proposed correction

Use one reviewed event-image lookup in all three Event schema builders: fixtures (including the RunRecs compatibility wrapper), marathon/half-marathon guides and ultra guides. Display the same reviewed image with alternative text and source caption on the relevant page. No database migrations, result changes, canonical changes, robots changes or privacy/publication changes.

Remove the publisher-logo Event fallback; retain publisher branding in Organization and Open Graph metadata. This deliberately leaves the recommended image warning visible on unsupported events rather than substituting an unrelated logo. Missing image is a recommended-property issue under Google's current Event documentation; this change does not promise indexing or rich-result appearance.

Two source-reviewed edition images:

- London Marathon: organiser's current event page Open Graph image. Image fetched successfully as JPEG, 1200×630; visually inspected as participants on The Mall. HTTP 200, image/jpeg, no X-Robots-Tag; current robots.txt does not disallow its path. It is earlier race photography used by the organiser on its current event page, explicitly described as earlier imagery in the caption. Scoped to the currently reviewed 24–25 April 2027 edition (stored start 24 April). No inference of future reuse.
- Gunma Marathon: official about/guide page Open Graph image, fetched and visually inspected as edition-specific 36th Gunma Marathon artwork with 3 November 2026 printed on it, JPEG 1200×630. Official robots.txt does not disallow the image path. Scoped only to 3 November 2026.

Images remain externally hosted. Source availability is checked evidence, not a guarantee of future availability or Googlebot access. No third-party image binaries are copied into the repository. The code never automatically scrapes a source page or uses arbitrary unreviewed image fields.

Dartmoor Discovery's opened organiser page did not expose a supported event-specific image in the inspected image metadata; its club/sponsor logos were not substituted. Tunnel Vision and all other unreviewed fixtures still need event-image evidence. The static guide catalogue also contains other dated events without reviewed imagery. Do not describe the whole site as fixed or restart sitewide validation on the strength of two images.

## Checks

- TypeScript typecheck.
- `node scripts/verify-event-images.mjs`: actual fixture and both guide builders, edition scoping, no publisher fallback, archive/undated fallback, image dimensions, rendered image/caption/attribution and empty-image rendering.
- Existing race-page schema, rollout, search-discovery, marathon, half-marathon and ultra checks.
- The read-only live audit script reports missing/publisher images and exits nonzero while either remains. This is expected against unchanged production.

## Approval and deployment follow-up

No merge, production release, validation restart or URL-index request is authorised before Paul approves this PR.

After approval and deployment:

1. Run `node scripts/audit-live-event-images.mjs` with the London guide and the affected fixture URLs. Gunma may correctly become an archive after race day; do not force it back into upcoming Event markup to test the image.
2. Fetch the referenced images again, checking status, MIME type, dimensions, redirects and robots rules. Use Google's Rich Results Test and URL Inspection live test to verify Google's access, beyond this agent's HTTP checks.
3. In the signed-in Search Console Events report, open Missing field image → See details. Export/check all Failed and Pending examples, compare Google's crawl dates with current live markup, research appropriate event imagery for the remaining URLs, and distinguish other required-field errors from this recommendation.
4. Once remaining affected instances are resolved, choose Start new validation. Google's documented restart rechecks Pending/Failed URLs and new instances; Passed/Other instances are not rechecked. Actual button availability has not been observed in this session. Do not use noindex/removal to make errors disappear.

References:
- https://developers.google.com/search/docs/appearance/structured-data/event
- https://support.google.com/webmasters/answer/9216203?hl=en
- https://www.londonmarathonevents.co.uk/london-marathon
- https://www.g-marathon.com/about-guide/
