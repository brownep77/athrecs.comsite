# Race-page presentation and search rollout

Requested by the owner after reviewing the Hamburg example. Applies the shared
search/presentation rules to every race route, including archives and country
routes, and adds a Suggest an edit panel at the bottom. Existing URLs, aliases,
canonical targets and indexing controls are retained. No indexing submission is
part of this release.

## Behaviour

- Upcoming titles use the race name, edition year and Date & Entry. Repeated years
  are avoided. Long names keep their identity while dropping the extra suffix.
  Archive and undated titles use Results & History and Race Details respectively.
- Descriptions put the day and date before secondary location/distance details.
- Visible headers and search metadata select the same earliest noncancelled,
  valid edition. A complete same-day programme can supply its earliest start;
  incomplete programmes remain date-only unless a specific programme start was
  reviewed. The Hamburg first-wave exception is preserved.
- Explicit fixture zones and unambiguous country/region mappings supply the
  exact-date UTC offset. Ambiguous/nonexistent DST clocks, unknown zones and
  unknown starts remain date-only. End offsets are calculated independently.
- Guide locations and postcodes require the same edition and matching distances.
  A headquarters address is not relabelled as a start line. No postcode is inferred.
- Placeholder organiser instructions are excluded from visible organiser fields,
  biographies and structured data. Organiser URLs require an explicit reviewed
  association; an arbitrary directory website is not used as the organiser URL.
- RunRecs uses the same event schema rules with its own brand and canonical host.

## Suggested edits

Signed-in visitors can send a correction and an optional public supporting URL.
The race is resolved on the server, including existing aliases. The visitor sees
sending, failure and success states; text survives a failure. Suggestions remain
private and never modify a race automatically.

Staff review suggestions in Event register → Suggested race edits. The queue is
paginated, and review/dismiss actions record the staff user and date. Authorised
staff must check and apply the correction separately before marking it reviewed.
An atomic per-account limit permits five submissions per hour. User deletion
removes their suggestions. The privacy notice covers this workflow.

## Source check: Holkham 2027

Opened on 25 October 2026:
https://www.runthrough.co.uk/event/holkham-half-marathon-10k-may-2027

The live AthRecs page previously showed Half 09:00 BST and an unverified 10K
start, broad Holkham Estate location, Mixed surface and organiser placeholder “See website / TRT”.
The exact-date guide adds RunThrough, 10K 09:40, Holkham Hall venue details and
separate parking entrance/arrival instructions. The organiser confirms a road course;
the selected 2027 page uses Road, retaining the stored Mixed value for other editions.
The venue postcode NR23 1AB and
parking entrance postcode NR23 1RH serve different purposes and remain distinct.
The half-marathon start remains 09:00. No prices or availability are invented.
RunThrough already exists in the source registry.

## Coverage and limits

The reproducible structural audit checks all 9,669 seed catalogue pages and
26,948 editions, including 3,144 pages with upcoming programmes and 6,525 archive
or undated pages. The shared rules also apply to additional live database rows;
the seed audit is not a count or re-verification of the production database.

In the final audit, 1,284 upcoming pages could supply a complete
timed programme and supported zone; 1,860 remained date-only. 1,339 upcoming pages
had no usable organiser name. These are source-data gaps, not facts established
by code validation. The audit writes exact current counts and the affected public
slugs to `artifacts/race-page-rollout-audit.json`. It does not claim that every
organiser website was manually rechecked. Seventy-seven official names remain
over 80 characters even after shortening surrounding title text; identities are
preserved rather than arbitrarily truncated.

Checks cover schema, date and distance boundaries, UTC/DST transitions, cancelled
and undated races, full catalogue rendering inputs, privacy, real HTTP suggestion
submission and staff permissions. Browser checks cover keyboard interaction,
mobile width, sign-in return, failures, submitting state and confirmation in
Chromium, Firefox and WebKit. The dedicated workflow publishes the audit and
screenshots. Calendar and existing public-results checks remain enabled.
