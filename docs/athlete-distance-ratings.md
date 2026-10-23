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
distances from 1–200 km without an exact reference use an explicitly labelled modelled
reference. The 1K to mile extension uses the frozen mile-to-5K relationship;
see the standards document for the method. Longer events can contribute participation points without a rating.
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

Running finishes of 1 km or longer receive 10 completion points plus 1 point per
known kilometre raced, with a progressive ultra bonus. This includes parkrun and trail/ultra events. An accepted
running finish of unknown length receives the 10 completion points only.
Running events shorter than 1 km, field events, other sports, splits and team/relay totals
are outside this first version's scope.

The distance reward increases within each individual race:

| Part of each race                            | Total points per km in that part |
| -------------------------------------------- | -------------------------------: |
| First 42.195 km                              |                                1 |
| Beyond 42.195 km, up to 100 km               |                                3 |
| Beyond 100 km, up to 100 miles (160.9344 km) |                                4 |
| Beyond 100 miles                             |                                5 |

The raw bonus for a race of `d` kilometres is
`2×max(0,d−42.195) + max(0,d−100) + max(0,d−160.9344)`.
The race earns `10 + d + bonus`. These are AthRecs participation rules, separate
from time ratings, with the same rules applied to historic and current seasons.
Each threshold applies only to that part of that individual race, so there is no
sudden points jump at a boundary. Cumulative athlete kilometres never trigger an
ultra bonus: twenty 5K finishes receive 300 points and no ultra bonus, while a
single 100K finish receives 225.61 points. Completion count still rewards
consistent participation; two 50K finishes receive 151.22 points in total.

| Completed distance | Participation points |
| ------------------ | -------------------: |
| 1K                 |                   11 |
| 1,500m             |                11.50 |
| 1 mile             |                11.61 |
| 2K                 |                   12 |
| 3K                 |                   13 |
| 4K                 |                   14 |
| Parkrun / 5K       |                   15 |
| 10K                |                   20 |
| Half marathon      |                31.10 |
| Marathon           |                52.20 |
| 50K                |                75.61 |
| 50 miles           |               167.01 |
| 100K               |               225.61 |
| 100 miles          |               469.35 |
| 200K               |               664.68 |

The raw known distances and per-event bonuses are summed before rounding totals to two decimal places.
Consequently a total may differ by a cent from the sum of individually rounded
examples. All-time and selected-season cards show completed events, kilometres,
completion points, base distance points, ultra bonuses, combined points and the verified subset.
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
