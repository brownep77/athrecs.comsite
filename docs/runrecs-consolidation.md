# RunRecs consolidation into AthRecs

AthRecs serves the published Athletics, Running and Parkrun catalogue. Both brands already use the same event, edition, athlete and club database; this change does not copy results, invent fixtures or change athlete sharing permissions.

## Public destinations

| RunRecs path | AthRecs destination |
| --- | --- |
| `/` | `/running` |
| `/` with race search filters | `/running/events` with the original query |
| `/races` | `/running/events` with the original query |
| `/calendar` | `/running/calendar` |
| `/race-series` | `/running/race-series` |
| `/{language}/{country}` or its `/races` listing, without a sport filter | The localized AthRecs race listing, initially filtered to Running |
| Race details, athletes, clubs, news, account pages and other paths | The same path on AthRecs |

Host-scoped permanent redirects apply only to `runrecs.com` and `www.runrecs.com`. AthRecs and preview URLs do not match these rules. Vercel handles the redirect before application rendering. Query strings are retained. The existing RunRecs domain and implementation remain available for rollback; no domain, project, database or catalogue is deleted.

## Release order

1. Deploy and check the consolidated AthRecs pages, including running searches, calendar, series, old race URLs, public profiles and sitemap scope.
2. Deploy the host redirects only after those destinations are live.
3. Check HTTP status, Location and final destination for both RunRecs hosts, filtered searches and representative deep links. Check that AthRecs does not redirect back.

Accounts retain their data because the database is shared. A browser may need to sign in again on the AthRecs domain. Private, hidden and unshared athlete results stay governed by the existing profile and result APIs.

Google Search Console must recrawl the changed pages. The separate archived-race schema fix uses WebPage markup when there is no valid future event date, avoiding a SportsEvent without startDate.

## Rollback

Revert the RunRecs redirect commit to restore its previous public frontend. The AthRecs consolidation can remain in place. Reverting the consolidation as well should only be done after redirects are removed, so old running URLs remain reachable.
