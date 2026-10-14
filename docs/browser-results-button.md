# Browser results button pilot

Setup: `/tools/browser-results.html`. Drag **Save results to AthRecs** to the
bookmarks bar. On an HTTPS results page, run the bookmark, select a detected
table, review the sample and download the `.athrecs.json` capture. In the staff
Collected results screen, select **Import a race** and upload the capture.

This is a loaded-page capture, not a whole-race crawler. It makes no network
requests, follows no pagination, reads no credentials or input values, and does
not alter verification, publication or athlete matching rules. Unsupported table
layouts fail visibly. Provider-specific layouts and bookmark-script restrictions
need checking on the first real capture; London compatibility is not yet proven.

The file preserves the visible column values, row links, source page, title,
capture time and explicit partial-page scope. JSON avoids spreadsheet formula
execution. The importer validates shape, size and row widths before offering
ordinary archive column mapping. It retains provenance in `original` fields.
An imported capture never supplies an authority to publish or a verified identity.

Choose the exact event edition and keep the same provider and stable race source
ID across pages. The existing archive recognises repeated rows by an actual
source result ID or unique edition bib. Page ordinals are never used as IDs.
The captured row count does not populate the expected whole-field count.
Unmapped nationality remains in the original fields; explicitly map it only
when the source heading establishes its meaning. Never infer it from residence.

The separate **Import athletes & race results** screen remains restricted to its
independently checked Total Race Timing workflow. This pilot uses the generic
archive and does not weaken that source check.

Rebuild the committed self-contained setup page after editing the collector:

```sh
node scripts/build-browser-results-button.mjs
node scripts/verify-browser-results-button.mjs
```

The browser check accepts `CHROMIUM_PATH` for an already installed executable.
Its network is intercepted with synthetic fixtures. It exercises the encoded
bookmark URL, preview, download, archive parsing, field mapping, original time
precision, DNF, hidden values, conflicting IDs and malformed input. It does not
establish live-provider compatibility or make database writes.
