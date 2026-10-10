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

## Approved public athlete indexing

Paul approved removing the indexing restriction on 10 October 2026. Only the
existing anonymous, administrator-published performance-history projection is
eligible. Public visibility, a published source history, its matching publication
audit and a resolvable athlete identifier are all required. A public database
flag or public-figure label alone is insufficient.

For active account owners, sharing and results sharing must be enabled and
`search_indexable` must be explicitly true. A missing sharing record or any owner
opt-out excludes the page from search. Unmanaged approved public histories are
eligible. Member-only shared-account routes and the member directory remain
excluded. No database privacy setting, history approval or profile data is changed.

The page and sitemap use the same SQL eligibility predicate. HTML metadata and
HTTP robots headers agree; request middleware accepts only a successful profile
response marked by the validated route loader, and removes that internal marker.
Incoming request headers cannot enable indexing. Responses remain uncached so
withdrawals and privacy choices take effect on the next request. Existing hidden
results and personal-field exclusions stay in the public projection.

After the approved release is live, run the read-only check, then rerun the
notification workflow to validate and submit its live eligible URLs. A push
check can precede the Vercel deployment, so its result alone is not proof that
the new release has been checked.
