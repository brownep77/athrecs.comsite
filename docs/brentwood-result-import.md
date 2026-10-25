# Brentwood historical result import

The import keeps source comparison, athlete identity and ownership separate. New public source profiles are unclaimed and identity-unverified. Existing profiles require an exact name or stored alias plus a specific corroborating historical club and compatible supplied gender. Claimed/private profiles, ambiguous names, inconsistent timings and conflicting same-edition records stay held. Club evidence does not create current club membership.

`brentwood-profile-import.py` snapshots the name/alias directory and scoped evidence with checkpoints. `lib/brentwood-source-plan.py` maps original HTML/spreadsheet headings, fixed-width heading/ruler columns, named JSON keys and headed PDF columns. Headerless 2011, 2012 and 2014 sheets remain research-only. Independent re-extraction found five additional 2008 gun-only finishers. Differences between the 2010/2013 source versions remain evidence; disputed places are omitted and name/time conflicts are held.

`apply-brentwood-profiles.py` requires the exact plan hash from a successful rehearsal before production publication. It rechecks name/alias and account state, screens newly added identities, checks each inserted source history, preserves original profiles and audits additions. Stable source identities make replay idempotent. Existing-history guards preserve privacy decisions and refuse an already recorded edition.

All plans, captures, credentials, database snapshots and receipts live outside this repository. The importer stores source evidence in the staff archive; public profile projections continue to omit provider URLs and review notes. Private correction jobs preserve original results and references before changing any fields. No historical Brentwood canonical-result seed exists to update.

Validation: `python scripts/verify-brentwood-profiles.py`, `node --experimental-strip-types scripts/verify-brentwood-plan.mjs <private-plan.json>` and `npm run verify:sources`. Rehearse on a disposable Neon branch, inspect all holds and receipts, then use the explicit production branch and `--publish`. The source registry additions remain manual-only.

## Resolving retained observations

`resolve-brentwood-held.py` rechecks the retained hold ledger against a fresh directory snapshot. Archived organiser tables now establish the 2011 headings, and individually corroborated club rows can resolve selected 2012 observations. The 2012 and 2014 spreadsheets still do not establish their own headings. Source versions, age/gender contradictions, privacy choices and same-edition collisions remain explicit checks.

`expand-brentwood-resolution.py` uses the headed 2010 companions and can create one provisional profile from a clear source-located appearance when no existing or near-name candidate exists. Other same-name appearances are not automatically attached. A matching specific historical club is still required for cross-edition consolidation. At most one new profile is proposed for each normalized full name.

`apply-brentwood-resolution.py` preserves previous histories, checks the actual content of stable source identities before replay, and compares the complete stored plan after publication. Existing targets additionally require unchanged birth date, gender, club references and historical matching evidence. The exact expanded plan must be rehearsed before production. Credentials, snapshots, held ledgers and receipts remain private. Run `python scripts/verify-brentwood-resolution.py` as well as the original regressions and application-schema checks.

If the directory changes after rehearsal, `refresh-brentwood-resolution-directory.py` refreshes the duplicate-screening names, aliases and accounts for the unchanged plan. It does not rematch existing targets or relax publication checks. New candidates cause explicit holds; an identity change during the refresh stops it again.
