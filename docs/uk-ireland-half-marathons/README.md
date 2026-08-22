# UK and Ireland half-marathon follow-up

Checked on 22 August 2026 for the catalogue horizon ending 31 December 2027.

## Published coverage

- Added 31 officially dated half-marathon event series across Ireland and Northern Ireland.
- Reused five existing catalogue cards for Antrim Coast, Belfast City, Rock the Lough, Medieval Marathon Kilkenny and Run Galway Bay.
- Corrected Belfast City Half Marathon from Scotland to Northern Ireland.
- Expanded multi-distance cards in place so Rock the Lough, Medieval Marathon Kilkenny and Run Galway Bay are discoverable as half marathons without duplicate event cards.
- Preserved the existing England, Scotland and Wales half-marathon catalogue rather than importing a second copy of those fixtures.

## Duplicate controls

The workflow rejects duplicate slugs, duplicate normalized names, duplicate `seriesSlug|date` editions, dropped catalogue rows and held candidates that leak into the public catalogue. Multi-distance events already present in the 5K, 10K or marathon feeds are enriched through overrides.

## Held candidates

Nenagh, Cork City and Waterford Viking 2027 remain unpublished while their official pages show permit approval as pending. Carlingford and Mullingar 2027 remain unpublished until exact dates are available.

Run `npm run verify:uk-ireland-half-marathons` to validate the batch, official-source provenance, in-place enrichments, research-queue isolation, catalogue wiring and persistent seed version.
