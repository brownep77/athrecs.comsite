# Trackie batch 7 — 22 October 2026

Owner request: “Thank you can you do more please.” Continue the supervised Trackie athlete, result, club, meeting and event import.

The 15 listings on 2026 archive page 7 produced 11 privately retained PDFs and a retained unsupported spreadsheet. Eight reports contain 1,784 independently compared rows. The reviewed plan has 683 unclaimed profiles, 1,103 unverified performances, 20 new clubs plus 46 existing clubs, seven new meetings plus the existing Dinos Classic, and 411 event/category competitions. Another 681 compared rows are held for existing identities, ambiguous names or conflicting source details.

The February 18 BNAA report has a conflicting January 7 event-date field and stays held. The Guelph layout and relay-only report are unsupported. External result links and the unavailable Variety Village attachment remain follow-up work. ABAA Series 3 has a secondary Series 4 subtitle; the matching index, main title and February 7 date establish this edition, with the subtitle discrepancy retained as a qualification.

Club labels use previously reviewed aliases, exact Trackie team-directory names or unique directory prefixes. Ambiguous abbreviations stay unlinked. New club candidates were checked against the existing catalogue. Team Athletics SVG was registered disabled from Trackie's actual redirect; its direct page request returned HTTP 403 and no participant results were collected from it.

## Candidate screening

`scripts/screen-trackie-directory.py` runs a conservative candidate filter inside the database and applies the existing Python identity matcher to the returned records. It supports exact compact names, sorted name tokens, titles, nicknames and shared deletion signatures. Non-ASCII names remaining after decomposition and combining-mark removal are returned conservatively. Nested alias strings are included. The final index uses the unchanged Python matching rules.

The filter transferred 7,020 potential athlete records for this batch and found 405 athlete/account candidates. It does not download the entire directory. Full server-side fingerprints before and after screening, and again inside the publication transaction, detect catalogue changes. Temporary SQL functions do not modify canonical data. Synthetic candidate checks cover aliases, accents, underscores, apostrophes, nicknames and spelling variants.

Original attachments, source rows, identity candidates, club mapping decisions and publication receipts remain staff-only. No profile ownership, exact birth dates, nationality, residence or result verification is inferred.
