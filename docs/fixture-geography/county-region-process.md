# Fixture counties and broader regions

Owner request: 26 October 2026. Fixtures show the recorded town/venue locality,
then county/local administrative area, then broader region, then country. County
and region are separate searchable fields. The compact homepage has an explicit
race/town/county/region search. Country-specific equivalents (state, province,
department, council area) retain their own meaning; do not call every subdivision
a county or invent one where none is recorded.

## Evidence rules

- England: ceremonial county where an authoritative mapping establishes it.
  Scotland: council area; Wales: principal area. Ireland: traditional county and
  province, retaining Republic of Ireland / Northern Ireland as separate countries.
- Exact recorded-locality enrichment is **not** a fresh verification of an event's
  start venue. OS Open Names via Postcodes.io supplies place geography. All exact
  matches must agree; a popular city does not automatically beat a same-name hamlet.
  No fuzzy, partial or truncated-result acceptance. A county name in the city field
  must not be geocoded as a small same-name locality (the Kent/Hampshire regression).
- Check the actual venue/address when it differs from the marketed city, is near
  a boundary, or there are several starts. A town-centre coordinate is not proof of
  an outlying venue's county. Route crossings do not justify claiming the entire
  course lies in its starting county. Hold uncertain starts and multi-venue series.
- Existing compatible broad labels such as South of England are preserved in the
  region field. Incompatible old directory groupings (for example Bath/Midlands)
  are replaced with the source-supported region; original values remain in audit.
- Existing Irish county labels can supply their province using Tourism Ireland's
  explicit county lists. This validates the county-to-province relationship, not
  the original event-to-county attribution. Ulster must never change the country.
- Overseas records use supplied, evidenced county/state/province/region fields.
  The presentation and query support is global; this release does not claim a
  worldwide location audit or geocode every overseas event.

## 26 October release scope

The ledger `county-region-2026-10-26.json` contains 469 guarded changes: 148 county
changes and 321 province/region additions without changing the existing county.
It records source dates, OS exact matches and response hashes, previous values,
method distinctions and 618 unresolved records. The starting inventory was events
with upcoming editions on 26 October; this is not a verification of every race or
of the dates/distances in the inventory. A number of later geographic requests
returned access errors, which are recorded rather than treated as evidence.

The retained 11 October ONS metropolitan-district mappings keep their original
check dates. The Lieutenancies Act Schedule 1 was read again on 26 October.
Stockton-on-Tees is never mapped wholesale because the ceremonial boundary follows
the River Tees. Venue-owner addresses resolve the Athlone/TUS and Tullamore tracks;
the federation's National Indoor Arena address resolves its county only, without
copying the old programme to a future edition.

The bounded SQL compares slug, country, city, county, region, area, website and
original source URL. It locks eligible rows, stores each full original event in
`app_meta` with prefix `fixture-geography:2026-10-26:county-region:`, and changes only
county, region and updated_at. A stale record is skipped. A second run is a no-op.
The public seed projection contains location labels only and refuses to transfer
them to a changed city/area. Existing nonblank regions are retained by seeding.
No event, edition, result, entry option or athlete is created or deleted.

Run `node scripts/verify-fixture-county-regions.mjs`, the sport-fixture query,
fixture-presentation and geography regressions, and TypeScript checks. Reconcile
the actual production audit count and read back changed county/region values after
release; report skipped rows separately. Continue the ledger holds using exact
organiser/venue sources, prioritising imminent races. Do not declare completion
from one successful batch.

Contains OS data © Crown copyright and database right 2026. Contains ONS public
sector information licensed under the Open Government Licence v3.0.
