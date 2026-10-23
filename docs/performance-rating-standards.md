# AthRecs performance reference standards

AthRecs scores a completed fixed-distance performance as
`1000 × open reference time in seconds ÷ recorded finish time in seconds`.
This is an AthRecs time rating, not World Athletics points, an ITRA/UTMB index,
an age grade or a percentile. A score can exceed 1000; the reference times are
fixed standards, not a live world-record feed. Full precision orders scores;
only the displayed score is rounded.

## Frozen source: `usatf-mldr-2025-open-v1`

The open-category benchmarks are extracted from the numeric **OC sec** row in
the first worksheet of Alan Jones and Tom Bernhard's 2025 USATF Masters Long
Distance Running road age-grading workbooks. No age factors are used. The
maintainer reports USATF MLDR approval on 10 January 2025. Source files were
retrieved and inspected on 23 October 2026.

- [Maintainer repository and methods](https://github.com/AlanLyttonJones/Age-Grade-Tables).
- [MaleRoadStd2025.xlsx](https://github.com/AlanLyttonJones/Age-Grade-Tables/blob/master/2025%20Files/MaleRoadStd2025.xlsx): Git blob SHA `58fbf477a87d3bf90751c7913a4ef2ac6835a3fc`; first worksheet `Age Factors`; workbook heading includes `Version 2025-07-27`.
- [FemaleRoadStd2025.xlsx](https://github.com/AlanLyttonJones/Age-Grade-Tables/blob/master/2025%20Files/FemaleRoadStd2025.xlsx): Git blob SHA `7dbf1569e0527b75e541c03d0ab8f99c117f7b65`; first worksheet `Age Facctors` (source spelling).
- [CC0-1.0 licence](https://github.com/AlanLyttonJones/Age-Grade-Tables/blob/master/LICENSE.md): Git blob SHA `670154e3538863b2d9891fd5483160fbdfc89164`.
- [USATF calculators](https://www.usatf.org/resources/statistics/calculators) links to the [2025 road calculator](https://howardgrubb.co.uk/athletics/mldrroad25.html), which links to these maintained tables.

The first row's numeric values are authoritative for this extraction. Some
workbook display-formatted rows differ; AthRecs does not silently substitute
those display values. Tiny binary floating-point residue in whole-second
numeric standards is rounded to the nearest integer (e.g. 23590.999999999996
becomes 23591). Distances below 5 km are outside this feature's scope.

The same frozen standards apply to historic results and the current season.
A future standards release must have a new version and recalculate both views
consistently, rather than changing the meaning of an older score silently.

## Comparison limits

Standard road distances use their matching road reference. Other explicit fixed
distances between 5 and 200 km use log-distance/log-time interpolation between
the adjacent reference standards and are labelled interpolated estimates.
There is no extrapolation beyond 200 km. Distances stay distinct; a 55 km race
does not become a 50 km result. Timed events need their own distance-in-duration
method and do not receive a finish-time score.

Parkrun remains separate from road 5K and its score is course-unadjusted. Track,
trail, fell, mountain, cross-country and unknown surfaces remain separate and
use an explicitly labelled distance-only estimate, without any claim to terrain
or condition adjustment. ITRA and UTMB explain why terrain, altitude and race
conditions affect comparable trail performances:
[ITRA race score](https://itra.run/FAQ/ItraScore),
[UTMB Index](https://utmb.world/utmb-index).

Men's/women's standards use only an explicit result classification, or an
explicit source profile classification when the result supplies none. Name,
age category, nationality and residence never establish that classification.
Unknown or unsupported classifications receive no time rating. Source
verification stays separate from the calculated score. Invalid, conflicting,
excluded, synthetic, future and non-finish results receive no score.
An explicit historical chip/gun basis must agree numerically with that supplied
timing column; invalid or conflicting chosen columns are ineligible. Distinct
chip and gun times alone do not establish a conflict when the main time's basis
is unknown.
