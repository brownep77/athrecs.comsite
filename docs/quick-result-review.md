# Quick result review

Staff can open **Athlete tools → Review results**. Saved proposal batches appear
before the profile editor and paste form. Opening an assigned batch also selects
its athlete. Unassigned submissions still require an explicit target selection.

The default review uses responsive cards with race, date, distance, timing basis,
bib, athlete response, validation issues, and Approve / Decline / Later actions.
The target's recorded club, residence, name, ID and visibility remain above the
list. Explicitly labelled source athlete names, clubs, ages/categories, nationalities,
residence and athlete IDs are retained from pasted tables and shown beside the
profile facts. A generic Country or City column does not establish nationality
or residence, and Bib does not populate Athlete ID. A source-name difference
requires a recorded independent explanation; the server checks the profile name
and stored aliases before publication. Source evidence stays staff-only.

- **Approve** opens a compact decision panel. Check the identity evidence actually
  inspected; those choices form the staff audit note. A name alone cannot enable
  approval. Record a provider-scoped athlete ID, linked-owner confirmation,
  name plus supporting evidence, or an independent explanation. Confirm the
  source facts, identity and publication authority for this exact selection.
  Unknown fields are not matches. Conflicts require a recorded resolution.
- **Decline** records an explicit selected reason without requiring source or
  publication confirmations. It retains the original proposal and audit.
- **Later** sets an uncertain item aside for the current mounted review only.
  It remains pending in storage. Reopening the review returns it to the queue.
- Search and select-visible act only on visible pending proposals. Hidden items
  are not silently selected. Inspect the exact selected races in the decision
  panel before applying a bulk action.

The existing staff endpoint still enforces revisions, immutable race facts,
owner confirmation for managed profiles, athlete denials, duplicate/conflict
checks, serializable publication and idempotent receipts. Quick review never
creates profiles or grants ownership. Failed saves retain the same request ID
for identical retries. Changing the proposal revision invalidates the open
decision. Detailed batch tools and recipient-bound review links remain available
under the expandable panel below the cards.

Stored-result suggestions also use stricter corroboration: different club names
cannot match by substring alone; city, county and country contribute at most
the strongest geography weight; age contradictions cannot be outweighed by
name, club and location boosts. Scores are ordering weights, not calibrated
probabilities. Exact-name labels do not mean verified identity and suggestions
do not automatically attach results.

Validation: `npm run verify:result-matches`, `npm run typecheck`, development
build, and the Athlete editing and result proposals workflow. Its browser test
covers both detailed tools and quick approval/decline, evidence changes,
name-only blocking, visible selection, Later, failed-save retry, and mobile
overflow with synthetic API responses. Database publication/ownership tests
run separately against disposable PostgreSQL.
