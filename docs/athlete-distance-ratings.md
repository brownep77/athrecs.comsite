# Athlete distance ratings and participation

An athlete's full visible linked result record now feeds two separate measures in
the achievements section of public/full, shared and account profiles. No extra
database read or migration is needed; result pagination does not limit totals.

## Time ratings

Each eligible performance gets `1000 × reference seconds / finish seconds`.
The reference is the frozen men's or women's open-category standard documented
in [performance-rating-standards.md](performance-rating-standards.md). These are
AthRecs time ratings, without age adjustment; they are not official federation
ranking points. Unsupported or missing racing classifications receive no rating.

The table shows all-time best and selected calendar-season best for each exact
distance, surface and racing category. The current season is the Europe/London
calendar year, 1 January–31 December; earlier recorded years are selectable.
Each season also has a paginated list of individual times and ratings. Scores
use full precision for selection and whole numbers for display. Original timing
precision and chip/gun/unknown timing labels are retained.

Parkrun is distinct from road 5K. Other surfaces use a labelled distance-only
estimate, with no adjustment for elevation, terrain or conditions. Fixed
intermediate distances from 5–200 km use an explicitly labelled interpolated
reference. Longer events can contribute participation points without a rating.
No global competitive leaderboard is added by this change.

Examples using the frozen references:

| Distance      | Finish time | Men's rating | Women's rating |
| ------------- | ----------- | -----------: | -------------: |
| 5K            | 20:00       |          641 |            695 |
| 5K            | 25:00       |          513 |            556 |
| 10K           | 40:00       |          660 |            719 |
| Half marathon | 1:30:00     |          639 |            699 |
| Marathon      | 3:00:00     |          670 |            722 |
| Road 50K      | 5:00:00     |          490 |            522 |

## Participation points

Running finishes of 5 km or longer receive 10 completion points plus 1 point per
known kilometre raced. This includes parkrun and trail/ultra events. An accepted
running finish of unknown length receives the 10 completion points only. Track
and field events shorter than 5 km, other sports, splits and team/relay totals
are outside this first version's scope.

| Completed distance | Participation points |
| ------------------ | -------------------: |
| Parkrun / 5K       |                   15 |
| 10K                |                   20 |
| Half marathon      |                31.10 |
| Marathon           |                52.20 |
| 50K                |                   60 |
| 100K               |                  110 |
| 100 miles          |               170.93 |

The raw known distances are summed before rounding totals to two decimal places.
Consequently a total may differ by a cent from the sum of individually rounded
examples. All-time and selected-season cards show completed events, kilometres,
completion points, distance points, combined points and the verified subset.
These describe the linked recorded history, not every event the athlete has run.

## Evidence and visibility

Existing completion, profile visibility and verification controls remain in
force. An unverified accepted finish contributes immediately and keeps its
pending verification label. Computation never upgrades stored verification.
Duplicates count once; contradictory identities, distances, times or outcomes
are held out. Synthetic, excluded, future, disqualified and non-finish rows do
not contribute. Current-year year-only dates cannot establish an already
completed race; historic unambiguous years remain usable without invented days.
Source URLs, provider names and review notes stay out of the ratings UI.

## Validation

- `npm run verify:distance-ratings`: standards, score ordering, categories,
  surface separation, historical precision, participation, adversarial duplicate
  and conflict cases, season boundaries, rounding, rendering and evidence privacy.
- `node scripts/verify-distance-ratings-browser.mjs`: isolated synthetic fixture
  covering desktop/mobile, season selection, pagination and privacy. No database,
  real athlete or authenticated session is used.
- `.github/workflows/athlete-distance-ratings.yml` runs the checks, typecheck
  and browser interactions for affected pull requests.
