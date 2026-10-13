# Result-search adversarial verification — 13 October 2026

Scope: an authenticated athlete searches canonical results and unmatched archive rows using saved names, distance and year; optionally requests an external search; reviews suggestions before making a claim. All created identities and performances in these tests are synthetic and use disposable databases. No production athlete data or emails are changed.

## Reproduced faults and repairs

| Area | Reproduction | Repair |
| --- | --- | --- |
| Name discovery | Unaccented saved names missed José García and Siobhán O’Neill before scoring. A title was used as the given name for former surnames. | Unicode decomposition and apostrophe handling in canonical and archive SQL; skip titles when building surname aliases. |
| Match confidence | Different full first names or conflicting middle names could receive strong labels. Model-provided confidence could label an initial-only name exact. | Reject incompatible full first names; keep ambiguous middle/initial evidence conservative; compute external labels and reasons locally. |
| Manual filters | Lowercase miles abbreviations and uppercase units missed results; punctuation-only distance silently removed the filter; a saved source ID overrode a selected name. | Case-insensitive distance aliases, invalid-input rejection and explicit-name filtering even with source IDs. |
| Candidate limits | The previous date-first SQL window omitted an older exact match behind 1,001 newer similar-name candidates. | Prioritise normalised exact names before applying canonical/archive candidate limits. Keep truncation warnings. |
| External response handling | Malformed JSON became a cached successful empty search; 20 unrelated candidates hid a valid later result; duplicate rows repeated; URL paths spoofed provider labels. | Malformed responses remain retryable errors; filter before the final limit; deduplicate; classify recognised providers by hostname. |
| Private links | Token-bearing fragments, nested redirect links and unsafe legacy profile URLs could enter a provider request. | Validate encoded/nested parameters and fragments; validate every outgoing source link, including legacy fields. |
| Consent and stale results | Withdrawing consent while a response was in flight could recreate the deleted cache. Identity edits could leave obsolete results. | Recheck revisions/consent before sending athlete data and before saving a response; lock settings during the final cache write; cancel stale client queries; key cache by profile revision. |
| Validation feedback | The live invalid-distance check correctly rejected input but exposed the validator's JSON object to the athlete. | Validate filters before submission, display the readable message, and explain that invalid filters have not been applied. Browser regression checks exclude raw schema JSON. |

External search now uses POST. An authenticated cross-site navigation must fail before triggering provider processing. Its adult check and zero-retention probe remain in place, and model output still cannot attach a result ID or make an ownership claim.

## Repeatable evidence

- `npm run verify:search-adversarial`: 35 named checks through real authenticated server functions, actual PostgreSQL-compatible SQL and controlled provider responses. Includes anonymous/cross-site rejection, account isolation, malformed/oversized inputs, accents, aliases, overlapping names, distance/year filters, source IDs, dismissal, archive suggestions, candidate limits, timeouts, provider failures, consent withdrawal before/after the privacy probe, private payloads, cache reuse/expiry and profile changes.
- Existing suites: `verify:intelligent-result-matching`, `verify:result-matches`, `verify:results-archive`, `verify:grok-runner-search`, `verify:result-claims`, `verify:claim-experience`, TypeScript and lint on changed files.
- `scripts/verify-recruitment-ui.mjs`: browser signup, a distance that excludes the fixture, a distance/year that restores it, rejection of an unsaved name, clearing filters, and proceeding to claim review. The account-navigation workflow runs this alongside the adversarial suite and existing claim/mobile journeys.
- The first adversarial run had 15 failures in 26 checks. The source-ID and candidate-window checks were added during follow-up investigation. Fixtures and assertions retain the actual reproductions instead of simply checking source-code strings.

## Limits of this verification

Provider responses are mocked, including errors and privacy-header changes. These tests do not establish that xAI can currently access every saved source, that any particular source permits reuse, that suggested performances are independently verified, or that recall across the public web is complete. Production environment metadata confirms a configured XAI key, not successful provider processing or a verified retention agreement.

The 1,001-candidate test exercises result-window correctness; it is not a production concurrency/load benchmark. Internal searches remain bounded, and external results remain suggestions requiring source and identity review. No claim of complete security or legal certification is made.
