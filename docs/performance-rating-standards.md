# AthRecs performance reference standards

AthRecs scores a completed fixed-distance performance as
`1000 × open reference time in seconds ÷ recorded finish time in seconds`.
This is an AthRecs time rating, not World Athletics points, an ITRA/UTMB index,
an age grade or a percentile. A score can exceed 1000; the reference times are
fixed standards, not a live world-record feed. Full precision orders scores;
only the displayed score is rounded.

## Frozen source: `usatf-mldr-2025-open-v2`

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
becomes 23591). Version 2 adds the original workbooks' **1 Mile** reference:
men 227 seconds (3:47), women 253 seconds (4:13), at exactly 1.609344 km.
The mile values were re-opened and compared with the distance/header/OC-sec
rows on 23 October 2026, using the same source blob SHAs above. Every existing
5–200 km reference and score is unchanged from version 1.

The same frozen standards apply to historic results and the current season.
A future standards release must have a new version and recalculate both views
consistently, rather than changing the meaning of an older score silently.

## Comparison limits

Standard road distances use their matching road reference. Other explicit fixed
distances between one mile and 200 km use log-distance/log-time interpolation between
the adjacent reference standards and are labelled interpolated estimates.
The requested 1 km to below-one-mile range extends the frozen one-mile-to-5K
log-distance/log-time segment down to 1 km. This is an **AthRecs short-distance
estimate**, not an additional USATF or track standard. For each category, with
`S_mile` its published mile reference and `S_5K` its published 5K reference:

`u = log(distance_km / 1.609344) / log(5 / 1.609344)`

`reference_seconds = exp(log(S_mile) + u × log(S_5K / S_mile))`

The same formula interpolates between one mile and 5K; below one mile its `u`
is negative and it is explicitly marked as extrapolated. Estimated 1K
references are approximately 136.020152 seconds for men and 153.346535 seconds
for women. These are model references, not claimed personal performances or
world records. No distance below 1 km receives a time rating.

There is no extrapolation beyond 200 km. Distances stay distinct; a 55 km race
does not become a 50 km result. Timed events need their own distance-in-duration
method and do not receive a finish-time score.

`performanceRatingReference(km, category)` exposes the exact reference and its
method (`published-road-standard`, `interpolated-distance-estimate`, or
`short-distance-extrapolation`). The `interpolated` flag remains true for any
modelled reference for backward compatibility; `extrapolated` distinguishes the
below-mile extension. Both kinds display as distance-only estimates. A target
rating of `R` corresponds to `1000 × reference_seconds / R` seconds, allowing a
consistent rating ladder without manufacturing a separate standard for every
rating or race distance.

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
