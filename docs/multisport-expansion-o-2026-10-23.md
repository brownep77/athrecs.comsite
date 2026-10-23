# Source-directory reconciliation and Canadian swimming — 23 October 2026

The staff Sources list now links every one of the 643 directory organisations to a registered page. It adds 419 previously missing exact URLs and five newly inspected Canadian fixture, result and athlete-profile pages, bringing the static registry to 776 sources. Existing 352 rows and the 36 enabled collectors are preserved.

## Source coverage

The directory contains 453 distinct website URLs after normalising www, scheme and a trailing slash. Thirty-four already had exact registry matches. Different member pages on the same host remain different sources; shared membership-directory URLs generate one source linked to all relevant organisations. Searches include organisation names, aliases, sports and countries. Linked organisations are visible on staff source rows.

This retrospective reconciliation retains each directory record's original check date. It does not claim a fresh inspection of all websites or that all federations provide all three data types. Membership-only references and unassessed websites are labelled explicitly and remain disabled. Four newly inspected Swimming Canada pages distinguish national fixtures, upcoming sanctioned meets, completed meet results and swimmer biographies. The Canadian Olympic Committee athlete directory supplies biographies and Olympic result summaries. Summary results without exact dates and marks are not imported as performances.

The source-sync command registers future missing organisation pages as disabled research leads. `npm run verify:sources` checks complete directory coverage, exact-page deduplication and unchanged collection enablement. The staff athlete finder reads the same registry. No ongoing schedule or collection permission is created by registration.

## Athletes and results

Summer McIntosh receives 34 individual performances and Josh Liendo 17. Both official World Aquatics profiles explicitly report CAN nationality. Raw HTML PB tables were mapped by headings and independently compared with fresh retrieved text. Exact decimal marks, dates, competition countries, equal marks on different dates and 25m/50m pool distinctions are preserved. Relay rows are excluded; numerical placings and rounds are not inferred. These are incomplete PB-table histories, not complete careers or canonical race-result archives.

Exact birthdays and Toronto, Ontario birthplaces come from the Canadian Olympic Committee. Swimming Canada explicitly lists residences as Austin, TX and Gainesville, FL; those are normalised separately from sporting nationality to United States locations. Hometowns are not treated as residence. Club and coach observations are retained privately. Conflicting Josh Liendo height observations (192/193 cm) remain held. No representative is inferred.

New unclaimed public profiles receive individually approved birth facts. Generic source birthday publication requires matching athlete, observed date, approved date and visibility; later privacy choices or changed dates cannot reuse approval. Source evidence stays out of public and member-facing responses. Name, alias, stable provider-ID and existing-history checks precede creation; source comparison does not verify account ownership.

## Fixtures

Six 2027 Canadian meeting listings preserve official full ranges and venues: U SPORTS (4–6 March, Calgary), Canadian Trials (5–10 April, Victoria), Masters (21–23 May, Edmonton), Canadian Open (3–5 June, Edmonton), national open water (24–25 July, Gravenhurst) and national pool championships (27 July–1 August, Toronto). The two July components have different venues and non-overlapping dates. No duplicate Ontario open-water listing is created. Individual distances, session times and entry availability remain unconfirmed; no recurrence is inferred.

## Validation and publication

Source reconciliation and publication are separate checks. Validation covers preserved registry rows, source-row comparison, performance schemas, source-birthday privacy guards, directory linkage, source and bulk manifests, TypeScript, focused lint, fixture duplicates/geography, a development build, isolated database rehearsal and exact production readback. Private audits retain source observations, hashes, original rows and publication receipts. Final deployment and live checks are recorded in the staff completion receipt.
