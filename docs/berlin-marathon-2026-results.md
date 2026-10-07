# Berlin Marathon 2026 results hub

Public route: `/results/berlin-marathon-2026` (AthRecs only).

The organiser confirms 27 September 2026 and links to the 2026 Mika Timing
service at https://berlin.r.mikatiming.com/2026/?lang=EN_CAP. Runners start from
08:45 Europe/Berlin / 07:45 Europe/London. Checked 27 September before finishers.

Sources opened:
- https://www.bmw-berlin-marathon.com/en/
- https://www.bmw-berlin-marathon.com/en/your-race/race-day-for-participants
- https://www.bmw-berlin-marathon.com/en/your-race/results

The timing service returned HTTP 403 to automated retrieval. No finish results
have been copied or inferred. The page starts with an empty, explicitly awaiting
snapshot and provides the official results link. There is no live timing feed.

## Updating the snapshot

Edit `src/data/berlin-marathon-2026.json`, run
`node scripts/verify-berlin-results.mjs`, typecheck and build, then deploy.
The page and downloadable cards read the same snapshot. The separate static X
preview image is an evergreen results-hub card, not a live podium.

Follow AGENTS.md and the result evidence policy. Open each actual source row;
match edition, marathon distance, bib/source identity, finish status, name,
country/club, category, both times and every supplied placing. Retain the exact
official age-category label. Never derive categories from names or infer ages.
Keep overall, gender and category positions separate; leave unknown values null.
Use source precision and retain chip and gun times independently. DNS, DNF and
disqualified rows do not belong in this finisher snapshot. Avoid including other
race disciplines or previous years.

Each record requires `verified: true`, `publicationApproved: true`, its actual
source URL, row locator and checkedAt. Approval is for public race coverage only;
this file does not import athlete profiles or change their visibility. Respect
existing privacy choices. Use a permitted source or supplied authorised export
for broader coverage; the organiser's full results page remains the full-field
destination unless complete coverage is actually established.

Set status to `provisional` while results remain provisional; use `official`
only when confirmed by the organiser. Set coverage accurately to `highlights`,
`partial` or `complete`. `updatedAt` records the result publication update, not
a page visit. Never advertise partial coverage as the full field. Do not turn
absence from this snapshot into a claim that someone did not run.

## Sharing

Instagram PNG: 1080 × 1350. X PNG: 1600 × 900. Downloads use the actual AthRecs
logo and exact source data on a teal canvas. Men/women cards prefer gun time;
age/all cards prefer chip time, with the time basis printed. Placings always come
from the source rather than a recalculated list. Cards include result status and
coverage. The first ten selected records appear on a group card. Search and
pagination can cover all approved snapshot records. Each result can export its
own finisher card. Posting is user initiated; no social account is connected here.
