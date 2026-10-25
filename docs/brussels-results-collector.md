# Brussels historical results collector

The local marathon collector now has an explicit Brussels document reader:

```bash
npm run collect:marathon-results -- --provider brussels --help
# Equivalent dedicated command:
npm run collect:brussels-results -- --help
```

It reads the inspected ChronoRace **full Marathon Details PDFs**, checks every
extracted cell with pdfplumber and PyMuPDF, retains the original document, and
exports CSV for **Central results archive → Import a race**. It does not require
Chromium or a hosted deployment. Use Node 24, the repository dependencies and
Python 3.10+ with:

```bash
python3 -m venv /path/to/private/pdf-reader
/path/to/private/pdf-reader/bin/pip install -r scripts/requirements-brussels-collector.txt
export ATHRECS_PDF_PYTHON=/path/to/private/pdf-reader/bin/python
```

## Find and check a report

Use an event index you have actually opened. Discovery returns only PDF links
present in that response, with their nearby source text. It does not guess
report IDs, advance years, follow registration/admin links or interpret an empty
historical web table as zero finishers.

```bash
npm run collect:brussels-results -- --discover '<observed ChronoRace event reports index URL>'
npm run collect:brussels-results -- \
  --url '<observed Marathon Details PDF URL>' \
  --authority '<actual authority to retain the results>' --dry-run
```

The dry run downloads and checks the whole PDF in a temporary private directory,
then removes that directory. Collection requires a supported event/division,
headings on every page, printed page sequence, printed entry totals, unique bibs,
valid statuses/times and agreement between the two PDF engines. Missing names,
unknown layouts and disagreements stop collection. No placeholder names or times
are made up. Rotated or older Sportsites reports and current web-only formats
need separate inspected adapters; this is not universal Brussels-year coverage.

## Collect, resume and export

The 2009 official report is an inspected example:

```bash
npm run collect:brussels-results -- \
  --url 'https://crdev.blob.core.windows.net/files/4719.pdf' \
  --job "$HOME/athrecs-collections/brussels-2009" \
  --authority '<actual authority to retain these results>'

npm run collect:brussels-results -- \
  --job "$HOME/athrecs-collections/brussels-2009" --resume

npm run collect:brussels-results -- \
  --job "$HOME/athrecs-collections/brussels-2009" --export-only
```

Use a separate private directory for each document/year. `--max-pages 10`
confirms at most ten additional PDF pages per invocation, after the **whole
document** has passed comparison. This budget does not limit the initial PDF
download or extraction. HTTP requests have a 20-second timeout and a 25 MiB
limit; extraction has a five-minute limit and a 500-page bound. HTTP 403/429,
redirects, wrong content types and failures stop without automatic retries.

The original PDF, source URL, capture date, SHA-256, authority and parsed rows
are private files. The shared collector lock and atomic-write utilities protect
jobs; directories use 0700 and files 0600. Resume/export checks the original
PDF, parsed document and checkpoint hashes, all source rows and progress. It
does not re-download or pretend to perform a fresh source check. A crash before
the first valid checkpoint, or a rejected document, leaves retained evidence;
preserve that directory and use a new job after resolving the problem. Never
overwrite a held report to force it through.

Once a checkpoint exists, Ctrl+C is resumable. Complete jobs export automatically;
`--export-only` also permits explicitly labelled partial exports. CSV parts are
at most 25 MiB and end on row boundaries. The manifest records printed versus
saved counts and the exact completion scope: **that document**, not an edition's
registration list or every historical year. No browser captures or URL query
page numbers are fabricated for PDF pages.

## Import and evidence

Choose the exact existing edition, inspect mappings, and use **Add to a saved
race** for every later part. Keep provider **ChronoRace**, the actual PDF URL and
the authority note. Stable `bib:` keys support unchanged replays and genuine
source revisions through the existing archive service. Fresh capture dates alone
do not revise unchanged rows. Switching an older import's original-column format
or a source's pagination can create an observation revision; review it first.

Original case, nationality, source age, city, flags, splits and source time strings
remain in staff evidence. A dash is missing data, not an inferred country. No age
or category is converted to a birth date. Overall and category placings stay
separate; a split/net rank is not a gender rank. The 2009 **Neto** column maps to
chip time and **Official** to gun time. In the inspected 2014/2015 layout,
**Brutto** maps to gun time and **Official** remains a generic finish time; it is
not inferred to be a chip time. Source precision is retained; no integer rounding
occurs in this collector. DNF/DNS/DSQ remain non-finish statuses (DSQ normalises to
DQ while the original label is kept).

The 2009 PDF prints 3 October, while the event index confirms **4 October 2009**.
The document heading is retained verbatim; the collector never chooses an edition
from that date label. Source comparison does not establish athlete identity or
ownership. Collection itself performs no database writes, athlete creation,
merging, verification upgrades or publication. Keep its files and private audits
out of Git and public/member profile responses. Existing staff identity matching,
publication and profile privacy controls remain the import path.

## Validation and known coverage

```bash
npm run verify:brussels-collection
```

The regression generates synthetic PDF reports locally, runs both actual PDF
readers, tests wrapped names, nationality, timing/status mapping, wrong distance,
unknown headings, missing names, duplicate bibs, wrong totals, HTTP errors,
interruption, resume, partial/bounded CSV and corrupt files. It imports the CSV
through the real archive service in a disposable database: four inserts, four
unchanged on replay, then one revision; no canonical results or athletes created.

Inspected sources include 2009 (`4719.pdf`, 1,648 printed entries), 2014
(`11102.pdf`, 1,952 entries) and 2015 (`12500.pdf`, 2,071 entries). The 2015
report contains blank athlete-name cells (including bib 2480, page 21), so it is
held by the strict importer. Do not describe it as a complete importable field.
Historical indexes without accessible PDFs remain explicit coverage gaps.
