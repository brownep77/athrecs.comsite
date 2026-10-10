# Provisional private profiles

`scripts/create-private-archive-profiles.py` creates unclaimed, private athlete
records from the private Total Race Timing inbox. It does not publish profiles,
send invitations, claim ownership, or create canonical result records.

The supervised workflow is `snapshot`, `prepare`, then `apply`. Each command
requires explicit paths; database commands also require a connection file and
matching `--confirm-branch`. Keep all snapshots, credentials, approvals, plans
and receipts outside the repository. Test `apply --review` against a fresh
Neon branch copied from the approved production target first.

Preparation uses the existing candidate screener, then holds possible surname
variants, existing source/bib links, conflicting numeric age bands, junior
categories and different races on the same date. Eligible candidates require
repeated source names and one recorded club across multiple dates. These are
provisional source groupings, not identity verification. Numeric age-band
consistency checks never create a date of birth or exact age.

Every participating source page must pass the independent strict source-row
comparison again. The plan retains capture IDs, hashes, source headings and
row locators. Source histories retain decimal times and non-finish statuses;
all rows have `verificationStatus: unverified`, and no history is published.
Historical club labels do not create current club memberships or residence.

Apply checks the plan hash, approved project/branch, original source hashes and
active private approvals. Each batch locks the screened directory inputs and
checks their fingerprint before writing. If another directory record changes,
stop and rescreen. Unique slugs and source-history keys make a completed batch
repeat-safe; existing athletes are never updated. Profile, history and audit
inserts are atomic and must pass a private/unclaimed receipt check before commit.

The staff results section also offers an independent, paginated source browser:
all stored race rows remain accessible even if no profile can safely be created.
Only current, compared captures with active private approval appear there.
Revoked sources and original compressed HTML are never returned to the browser.

Checks:

```sh
python scripts/verify-private-archive-profiles.py
node scripts/verify-captured-results.mjs
```
