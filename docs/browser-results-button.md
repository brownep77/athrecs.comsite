# Browser results import

Setup: `/tools/browser-results.html?v=3`. Replace any older bookmark by dragging
**Save results to AthRecs** to the bookmarks bar. On an HTTPS results page, run
the bookmark, select a detected table and check its preview. **Send to AthRecs**
opens a receiving tab. **Continue to import** opens the staff import wizard;
sign in first if needed. **Download a file instead** remains available if popups,
browser storage or opener access are blocked. Existing `.athrecs.json`, CSV and
TSV files can be selected or dropped into the same wizard.

The wizard has four steps: choose results, confirm the exact race edition,
check and save, then athlete matching. Recognised headings are suggested;
the preview shows readable times and separate placings. Staff must confirm the
race and mapping before saving. **Add to a saved race** reuses its edition,
provider, stable source key, source URL, expected total and retention authority.
Choose it for later pages instead of inventing another race source. Saving is
resumable and repeat imports report new, changed and unchanged rows.

The receiver validates the capture before retaining it in IndexedDB on the staff
origin. It accepts messages only from its opening window with the matching
random token and an HTTPS origin matching the capture URL. The bookmark only
sends to the fixed staff origin and receiving window. Captures are never placed
in URLs, cookies or analytics. At most ten pending pages are retained; browser
copies older than 24 hours are discarded when the queue is next opened. A saved
page is removed from the queue. Handoff and login alone make no database writes.
All database calls continue to require the existing authenticated staff middleware.

This captures the loaded page, not a whole race. It does not follow pagination,
load remote bookmark scripts or read credentials/inputs. Unsupported layouts
fail visibly. London/Mika lists with a heading row and typed fields are supported;
a wide desktop window is required so every heading is visible.

After saving, **Review athlete matches** opens the imported race's unmatched
entries. Saved-name suggestions and member claim requests use the existing
private archive matching system. Name matches remain suggestions: staff identity
review is still required to attach a canonical result. Creating or linking an
archive result does not grant account ownership or public visibility. Public
unclaimed profiles still require the separate publication review.

The file preserves the visible column values, row links, source page, title,
capture time and explicit partial-page scope. JSON avoids spreadsheet formula
execution. The importer validates shape, size and row widths before offering
the guided archive preview. It retains provenance in `original` fields.
An imported capture never supplies an authority to publish or a verified identity.

Choose the exact event edition and keep the same provider and stable race source
ID across pages. The existing archive recognises repeated rows by an actual
source result ID or unique edition bib. Page ordinals are never used as IDs.
The captured row count does not populate the expected whole-field count.
For the supported London host and headings, the explicit `Surname, Given (IRL)`
format supplies a readable name and source-reported nation in additional columns.
The untouched `Name` field remains in the original evidence. No name/tag parsing
is applied to unknown providers. Other nationality columns must be mapped from
an explicit source heading. Never infer nationality from residence. `Finish`
maps to finish time, not an assumed chip or gun time; `Half` remains original
split evidence. Overall, gender and category placings map separately.

Recapturing the same values with a different capture timestamp, page title or
pagination URL does not create a new performance revision. The first capture's
provenance is retained until a source value or row link changes. Changed source
values retain the usual revision and staff-review process.

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
make database writes. The London regression fixture reproduces the supplied
2026 markup using synthetic values; it checks heading/value alignment, inline
label exclusion, malformed rows, hidden headings and downloaded-file validation.

Version 2 was also checked offline against the user-supplied 2026 HTML: all
1,000 rows and ten original columns matched, with runner-detail links retained.
The saved page was isolated from scripts and external resources, using desktop
visibility styles for the responsive labels. This is saved-page verification,
not a successful live fetch or identity verification. The uploaded HTML is not
committed to source control.

To update an installed button, delete the old bookmark and drag the new button
from the setup page. Existing bookmarks embed their code and do not auto-update.

Version 3 verification includes the real generated bookmark across two synthetic
HTTPS origins, the generated receiving page/script, IndexedDB persistence over a
reload, the React wizard, validated API calls and a disposable database. Reimport
of the same rows returns unchanged counts without creating results or athletes.
The existing member request and staff-link path confirms that account ownership
and private visibility are preserved. No production results are imported by tests.
