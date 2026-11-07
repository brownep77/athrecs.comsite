# Automatic fixtures

Owner instruction, 7 November 2026: fixtures from every approved source are collected
and published automatically. Staff only see possible duplicates and races whose details
could not be confirmed, even after automated research.

## How it runs

1. **Collect** (GitHub Actions, `fixture-autoingest.yml`, daily 01:17 UTC). Eight parallel
   shares of the enabled sources run `scripts/source-importer/run.mjs` (robots.txt, crawl
   delays and page budgets honoured), plus the Racebest JavaScript reader. The send job runs
   the fixture quality checker over every row and posts the rows, their checker flags and
   the skipped pages to `POST /api/fixture-autoingest`. Rows seen on an earlier day are
   ignored, so each run only adds what is new or changed.
2. **Check and publish** (Vercel cron, `/api/fixture-autoingest-worker`, every 5 minutes).
   Each row goes through the normal collector duplicate check:
   - clean and new → published through the same atomic Publish path staff use, under
     `automation@athrecs.com`, with the collector publication guard and batch validation
   - already in fixtures → recorded as already listed, nothing to do
   - possible duplicate (alias, reschedule, overlapping pending import, slug clash) →
     staff (the "Compare and decide" link opens the normal import review)
   - details missing, or the quality checker found a contradiction → automated research
3. **Research** (same worker, up to `FIXTURE_ENRICH_DAILY_LIMIT` races a day, default 300).
   Grok with web search is asked to read the organiser's own page for that edition. Any
   distance it confirms goes back through step 2 as a new row. If nothing can be confirmed,
   the race goes to staff with the reason and the pages checked.
4. **Summary email** (Vercel cron, `/api/fixture-daily-summary`) at 08:00 and 18:00 London
   time to `FIXTURE_SUMMARY_TO` (default paul@athrecs.com): fixtures added (and how many
   automatically), events that took place, results brought in (on profiles and in the
   results archive), what is waiting for staff, and races waiting for results. The 08:00
   email also gives yesterday's full-day figures. One email per slot.
5. **Results list.** Races whose date has passed (last 14 days) join `fixture_results_queue`
   with a next-check date. Automatic results collection from that list is the next step.

## Staff page

`/admin/fixture-autoingest` — today's count, totals by outcome, and the rows waiting for a
person. **Check again** sends a row back for another automatic attempt (for example after an
organiser publishes the distance). **Done** removes it from the list once handled.

## Settings

| Where | Name | Purpose |
| --- | --- | --- |
| Vercel (production) | `FIXTURE_AUTOINGEST_TOKEN` | Shared secret the collector uses to post rows (32+ random characters) |
| GitHub repository secret | `FIXTURE_AUTOINGEST_TOKEN` | The same value |
| GitHub repository variable (optional) | `FIXTURE_AUTOINGEST_URL` | Defaults to `https://www.athrecs.com/api/fixture-autoingest` |
| Vercel (optional) | `FIXTURE_AUTOPUBLISH=off` | Pauses checking and publishing; collected rows wait |
| Vercel (optional) | `FIXTURE_ENRICH_DAILY_LIMIT` | Research calls per day (default 300) |
| Vercel (optional) | `FIXTURE_SUMMARY_TO` | Summary recipient (must be a staff notification address) |

Existing settings used: `CRON_SECRET`, `XAI_API_KEY` (research), `RESEND_API_KEY` (email).

## Not yet automatic

- A newly found start time for a fixture that is already listed is recorded, not applied.
  The start-time process in `AGENTS.md` continues to handle existing fixtures.
- Results collection after a race (the results list above is ready for it).

Run `npm run verify:fixture-autoingest` after changes.
