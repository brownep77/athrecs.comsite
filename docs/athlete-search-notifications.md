# Athlete search notifications

The notification workflow submits only athlete URLs from the live production
sitemap. It does not publish profiles, read private database records, or change
search-indexing permission. It is independent of the PostgreSQL quality gate.

## Why the old check failed

On 10 October 2026, production `www.athrecs.com` served commit
`2f559b7e79547b455968b9515a758cd305994313` from the READY Vercel deployment
`dpl_3tJV8L529tPqHyB3pGtSKhTMTQMo`. There was no pending deployment of that commit.

[PR #567](https://github.com/brownep77/athrecs.comsite/pull/567), merged on
5 October, deliberately required login for profiles, set `noindex`, and removed
athlete URLs and athlete sitemap shards from the public sitemap routes.
[PR #590](https://github.com/brownep77/athrecs.comsite/pull/590) later allowed a
restricted, audited public performance-history projection, retaining `noindex`.
Public viewing is therefore not equivalent to permission for search indexing.

The old workflow continued waiting for `id="suggest-edit"` and an `index, follow`
meta tag on one named profile. The live profile returned 200 with `noindex,
nofollow, noarchive` in both its HTTP header and HTML. The live sitemap index
contained pages, countries, races, clubs and results, with no athlete shards;
`/sitemaps/athletes-1.xml` returned 404. This was a stale readiness assumption,
not evidence of an undeployed public-profile release.

## Outcomes

- A valid, nonempty production sitemap index with no athlete candidates records
  `ready=false`. The submission job is **skipped**, with an explicit summary.
  This does not claim that any URL was submitted or indexed.
- An unavailable or invalid sitemap, a missing advertised shard, a foreign URL,
  a redirected/failed profile, conflicting robots permission, or a canonical
  mismatch fails validation and prevents submission.
- Every candidate must be anonymously available at its exact production URL,
  explicitly permit `index` and `follow`, and contain no conflicting robots
  meta tag or HTTP header. The complete set is checked before any submission.
- Submission requires the deployed ownership file and rechecks live candidates
  and their indexing permissions. A publication-set change stops submission.
  Only main/manual-main runs can submit; pull requests perform read-only checks.

Run the synthetic regression and the live read-only check:

```sh
node scripts/verify-athlete-search-notification.mjs
node scripts/submit-athlete-indexnow.mjs --check
```

The test suite intercepts all network calls, including the example IndexNow
receipt. It sends no real notifications. The live `--check` command never posts.
A real IndexNow HTTP 200/202 receipt is not a guarantee of crawling or indexing.

## Re-enabling athlete indexing

A separate, approved publication-policy change is required. It must make only
eligible profiles anonymously indexable, align both robots header and HTML
metadata, and restore privacy-filtered athlete sitemap routes. Preserve private
profiles, unapproved histories, owner withdrawals, hidden results and account
sharing choices. A database public flag alone does not authorize indexing.
After that approved release is live, rerun the notification workflow. Do not
remove `noindex`, sign-in checks, or publication restrictions just to pass it.
