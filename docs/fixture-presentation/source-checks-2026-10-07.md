# Fixture listing preview — organiser checks, 7 October 2026

This preview adds country flags, one-line summaries and source links to sport fixture rows. Times are venue-local and use IANA rules on the edition date, including GMT/BST and other daylight-saving transitions. Country alone never selects a time zone for the USA, Canada or Australia. Unknown zones remain explicit.

| Edition | Distances and local starts | Organiser source |
| --- | --- | --- |
| Battersea Chase the Moon, 7 Oct 2026 | 5K 19:00 BST; 10K 19:04 BST | https://www.runthrough.co.uk/event/chase-the-moon-battersea-park-5k-10k-october-2026 |
| EvenSplits York, 9 Oct 2026 | 5K 19:30 BST | https://evensplits.events/york5k |
| EvenSplits York, 13 Nov 2026 | 5K 19:30 GMT | https://evensplits.events/york5k |
| Eindhoven, 10 Oct 2026 | 1.5K 14:00 CEST; 2.5K 15:00 CEST; 5K 16:00 CEST | https://asmlmarathoneindhoven.nl/event-info/ |
| Eindhoven, 11 Oct 2026 | Quarter marathon first wave 08:30 CEST; marathon first wave 09:30 CEST; half first wave 11:30 CEST | https://asmlmarathoneindhoven.nl/event-info/ |
| Hartford, 10 Oct 2026 | Marathon/half main field 08:00 EDT; wheelchair 07:57 EDT; 5K 08:10 EDT | https://www.hartfordmarathon.com/eversource-hartford-marathon/ |

All four organiser pages were opened and the schedule inspected. Eindhoven labels the timetable as 2026 and says information may change; the listing explicitly identifies first-wave times. York lists both October and November dates and a single 19:30 wave. The short descriptions paraphrase these same organiser pages.

These are 13 distance schedules across six edition dates, not a verification of the entire catalogue. The Croí page returned HTTP 403, so its start has not been inferred. Other source-backed stored starts retain their provenance internally; no-source values and legacy runABC clocks (known UTC shifts and midnight placeholders) display TBC pending organiser checking. Unknown locations do not default to UK time.

The enrichment is an edition-and-distance-keyed presentation layer; no production database migration or catalogue write is performed. It does not create new events or duplicate distances. Source records can be extended in `src/data/fixture-details.ts`. Existing country/distance filters, pagination and sporting scope remain intact. Other race-detail templates and imported catalogue values are outside this preview.

Verification passed: existing disposable-Postgres fixture query tests (including combined filters, pagination and edition-specific source enrichment); new DST/unknown-zone checks; TypeScript; scoped lint; Vite production build. A separate interactive sample preview was created and its generated content, combined filters, distance isolation and empty state were exercised. Browser visual QA of the application was not completed: the browser download failed and the hosted-preview branch push was blocked by automatic approval review. No PR or hosted preview was created.

## Compact layout revision

The listing now uses the full row width rather than reserved date and action columns. Date and race title share the heading; location and description flow together; distances, starts and links wrap in a compact metadata row. Shared time zones, identical source links and identical wave notes appear once. Full descriptions remain visible and can wrap on narrow screens.

The database's existing county/region field is now included and searchable (it also holds states in some imported records). Source-backed presentation records can separately supply town, city, county and state. Supplied location parts are deduplicated; no missing administrative level is invented. Country labels use short codes with the full name retained for accessibility.

The compact sample preview preserves all seven sample dates and all original timing/source information, adds stored county/state details where available, and passes interaction checks for regional search, combined filters, shared zones and notes. TypeScript, scoped lint and existing fixture integration checks passed after the layout change. Hosted upload remains unapproved and was not retried.

## Wording revision

At the user's request, visible source-check labels and dates have been removed. Fixture organiser links now read “Details” and broadcast source links read “Coverage details”. Provenance remains in the data layer. No ChatGPT or Grok wording appears in the fixture page or sample preview.
