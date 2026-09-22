# PR #447: bounded RunRecs publication

Reviewed 22 September 2026. This replaces the draft's catalogue seed bump and
new Shakespeare identity with an explicit, audited database batch. Both Vercel
projects build this repository; a Ready preview does not publish race records.
There is no build hook for this batch.

| Race                          | Publication                                                                           | Evidence checked on 22 September                                                                                                                                                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rugeley 10 Mile               | New permanent event; 14 February 2027, 10:00; open                                    | [EntryCentral](https://www.entrycentral.com/Rugeley-10-miler): £24 affiliated, £26 standard; Redbrook Hayes School HQ, Brereton Road start                                                                                                                                                       |
| Walled City 10 Mile           | New permanent event; 13 March 2027, 10:00; entry TBC                                  | [Derry Marathon's public poster](https://www.facebook.com/photo/?fbid=1641342294698774&set=a.559416112891403): date, distance and start; no verified checkout                                                                                                                                    |
| Shakespeare Half and Marathon | Update both existing editions under `shakespeare-marathon-half`; 25 April 2027, 09:00 | [RunThrough](https://www.runthrough.co.uk/event/shakespeare-marathon-half-marathon-april-2027): dated programme and ticket selections say 2027 despite stale 2026 page title; £41 half / £45 marathon                                                                                            |
| Dundalk Half                  | Enrich existing half; preserve separate 10K unchanged                                 | [Eventmaster](https://eventmaster.ie/event/02RwczqsA1): 31 January 2027, 10:20; approved permit 26/320; €44.50 early bird including postage                                                                                                                                                      |
| Central Lancashire Half       | Update existing edition's primary entry; preserve older routes                        | [SiEntries](https://www.sientries.co.uk/event/central-lancs-new-years-half-marathon-2027): 10 January 2027; £30 member / £32 non-member. Existing 10:00 start retained, not independently reverified on this page                                                                                |
| John Treacy Dungarvan 10 Mile | Correct existing listing's permit caveat; retain TBC and no entry                     | [Organiser](https://www.westwaterfordathletics.org/dungarvan-10-mile/) says permitted; [Athletics Ireland calendar](https://athleticsireland.eventmaster.ie/event-calendar/) search for Dungarvan says pending approval. Fees also conflict. Neither approval nor entry availability is asserted |

The new edition insertion audits use the established `runrecs:uk:0-100km:`
manual-publication source namespace. AthRecs excludes those edition IDs; existing
shared records retain their current visibility. This is a manually reviewed
batch, not a `race_collector_runs` job.

## Identity and preservation review

The production catalogue already has Shakespeare half and marathon editions,
and separate Dundalk half and 10K editions. No replacement identity is needed.
Global name/source checks, historic redirects, nearby-date/distance candidates
and pending work were reviewed. A pending collector batch contains a duplicate
Dundalk **10K** candidate; this publication only enriches the existing **Half**
and does not publish or modify that pending batch. Chasewater candidates that
mention Rugeley concern different races, dates and distances.

Removing Dungarvan from a seed cannot withdraw a live database row. Its existing
public listing therefore remains with an explicit pending-permit caveat. The
seed wording is corrected too. No result, athlete, old URL, edition ID or old
entry route is removed. Prices in the batch are the lowest evidenced tier;
qualification is stated in the edition notes.

## Execution

`batch.json` is the complete public payload. With a persistent `DATABASE_URL`:

```sh
node scripts/publish-pr447.mjs snapshot /secure/path/baseline.json
node scripts/publish-pr447.mjs rehearse /secure/path/baseline.json /secure/path/rehearsal.json
node scripts/publish-pr447.mjs publish /secure/path/baseline.json /secure/path/publication.json
```

Take the baseline on production and rehearse on its isolated Neon branch before
publication. The rehearsal applies staging, validation and publication then
rolls back and checks the baseline. A committed run on the isolated branch also
checks repeat-run idempotence. Production uses the exact reviewed payload and
baseline; changed records, duplicate candidates or revision pointer stop the
transaction for fresh review. Publication uses the repository's staged API in
one transaction, locks the revision and relevant catalogue tables, and verifies
two inserted events, two inserted editions and five updated editions before
commit. Before/after evidence is written outside the repository.

## Earlier research retained

The original draft's 18–19 September Cork City permit conflict and Waterford
Viking main-race date correction remain in the existing research queue. They
are not included in this publication and were not newly verified on 22
September. The earlier Nenagh date (21 February 2027; permit pending), Borrowdale
licence concern and other held candidates also remain research leads, with no
publication asserted by this PR. The original proposal is preserved in commit
`105d6d0eff56474403f30028e17a1d666072ad18` for provenance.
