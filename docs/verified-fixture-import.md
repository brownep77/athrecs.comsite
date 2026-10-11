# Verified fixture file import

Open `https://update.athrecs.com/admin/fixture-import` with the existing staff account.

1. Download the CSV template or prepare a JSON array of fixtures.
2. Keep one row per dated distance, using the same programme name across distances.
3. Enter the actual primary source, evidence and the date it was checked. Use the organiser, its authorised entry page, a governing body or the timing provider’s race programme. RunABC can help discovery but cannot be the primary source or entry link.
4. Upload up to 500 rows / 2 MB. The default scope is the United Kingdom, 2026–2027, through 500 miles. Northern Ireland is included; Ireland is separately selectable.
5. Preview. Correct invalid rows using the row-specific explanations. Existing races are excluded from publication, repetitions within the file are skipped, and ambiguous identities are held.
6. Save for review. The URL contains the saved import ID and can be reopened later. Re-uploading the same file and scope opens the same review, including after a lost response or changed filename.
7. Read the primary programmes. Choose ready races individually or use **Select ready races on this page**, then **Publish selected**. Each selection is limited to 50 distances. Confirmation stages, validates and publishes atomically through the existing catalogue publisher.

Required fields: `name`, `country`, `city`, `date`, `distance`, `sourceUrl`, `sourceKind`, `evidence`, `checkedAt`. Numeric distances also require `unit` (`km` or `mi`). Recognised distance text includes `10K`, `10 miles`, `half marathon` and `marathon`. Dates and checkedAt use YYYY-MM-DD. JSON accepts an array or an object containing a `fixtures` or `candidates` array. Header case, spaces, underscores and BOMs are supported; quoted CSV can contain commas and multiline evidence.

Optional fields: `region`, `surface`, `startTime`, `entryUrl`, `entryStatus`, `notes`, `distanceLabel`, `countryCode`, `regionCode`, `distanceKm`. A supplied distanceKm must agree with the measured distance. Keep uncertain start times blank; confirmed local times use HH:mm. Entry status is Open, Closed or TBC; missing status is TBC. `sourceKind` is organiser, entry, governing-body or timing-provider. Country must describe the start location; a supplied countryCode must agree.

The import saves proposals, not a claim that software independently verified the websites. A source reviewer remains responsible for the linked date, distance, start venue, entry route and any supplied start time. Checked dates and source evidence survive publication. Parkrun recurrence and athlete results are outside this import.

Duplicate checks use the global Running event/edition inventory, retained aliases, equivalent distances within 0.025 km, proposed programme groupings and pending publication batches. Different dates within the same year are held when they may represent reschedules. Name similarity alone never merges events. Checks repeat under the publisher’s revision lock, so a race published after preview cannot slip into a second live listing.

This workflow does not require the research provider, a cron job or an active scan. It does not resume a paused research scan. The legacy source registry queue is retained as history and clearly labelled unprocessed; its former queue-only button now points to the working file import. The separate automated researcher remains available from the import page and still needs a working research connection.

Verification: `npm run verify:fixture-upload`, `npm run verify:race-collector`, `npm run verify:collector-bulk`, and `node scripts/verify-fixture-upload-ui.mjs` (Chromium required). Tests use isolated synthetic fixtures, cover import/publication/retry and preserve existing approval and authentication controls.
