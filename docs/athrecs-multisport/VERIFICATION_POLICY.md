# Athrecs Data Verification Policy

## 1. Status labels must describe what was actually checked

Recommended public labels:

- **Unverified** — submitted or imported but not independently checked.
- **Athlete confirmed** — the athlete says the result belongs to them.
- **Source matched** — matched to an identifiable published source.
- **Athrecs verified** — reviewed and approved through the Athrecs workflow.
- **Governing-body verified** — confirmed through an authorised governing-body source or integration.
- **Official partner** — supplied through a separately approved official data relationship.

“Uploaded by an organiser” is provenance, not verification by itself.

## 2. Source hierarchy

A reviewer should consider, in order:

1. Governing-body record or authorised official integration.
2. Official organiser or timing-company result file/page.
3. Event permit, programme, start list or signed organiser document.
4. Athlete certificate and corroborating official page.
5. Reliable public source that identifies the event and result.
6. Athlete statement, GPS activity or photograph as supporting evidence only.

The strongest available source should be stored in `evidence_items` and `data_provenance`.

## 3. Automated checks for event data

At minimum:

- User has an active organisation role.
- Organisation has a verified relationship to the event before editing or uploading results.
- Required fields and dates are valid.
- Sport, discipline and surface exist in the taxonomy.
- Competition times fall within sensible occurrence bounds or are flagged.
- Geography and source URLs are normalised.
- Duplicate series, occurrences and competitions are flagged.
- Event ownership conflicts are escalated rather than overwritten automatically.

## 4. Automated checks for result uploads

The included foundation performs or records:

- Organisation/event permission.
- Organisation verification status.
- Row-schema validation.
- Duplicate row fingerprints.
- Duplicate organiser `externalEntryKey` values.
- Source/evidence presence.
- Repeated rank warnings.
- Participant identity-matching warnings.
- Blocking error count before publication.

Additional sport-specific checks should be registered through `sport_data_schemas`, for example:

- Time format and plausible performance range.
- Score reconciliation for both teams.
- Heat/round progression.
- Split sum tolerance.
- Lane, apparatus or category validity.
- Tie handling.
- Governing-body membership or classification where relevant.

## 5. Reviewer decision

A reviewer can:

- **Approve** — apply or publish the reviewed data.
- **Request changes** — retain the submission and explain what is missing.
- **Reject** — preserve the submission and evidence but do not publish it.

Every decision records the reviewer, time, note, original data, applied data and audit event. A request for changes keeps the case open in `needs_information`; a resubmission reopens that same case and appends evidence, avoiding duplicate unresolved cases.

## 6. Corrections

Never silently overwrite history.

- Organisers should reuse the same `externalEntryKey` in corrected uploads.
- Athrecs updates the durable competition entry when that key matches, creates a new active result version for a corrected verified batch and marks the earlier result as superseded.
- Duplicate or removed results use `record_status` and `superseded_by_result_id`.
- Result claims can link, unlink, correct or mark a duplicate after review.
- Original batches, rows, evidence and provenance remain available to authorised reviewers.

## 7. Athlete identity matching

Names alone must not automatically merge athlete profiles. Safer match inputs include:

- Athrecs athlete ID.
- Organiser/timing external athlete ID.
- Verified governing-body identifier.
- Claimed account plus corroborating event details.
- Club/category/date evidence reviewed together.

Ambiguous identifiers remain name-only entries until reviewed.

## 8. Organisation verification

Before granting control of an existing event, check an appropriate combination of:

- Control of an official domain or email address.
- Company, charity, club or governing-body identity.
- Official event website listing.
- Previous timing/result publication relationship.
- Event permit or governing-body record.
- Confirmation from an existing verified owner.

The approved relationship should be no broader than required: organiser, co-organiser, timing partner, governing body or data partner.

## 9. Sensitive and child data

- Public and private athlete data must remain separate.
- Guardian claims require evidence and human review.
- Private address, emergency, accessibility and race-passport data are never returned by public functions.
- Medical data must be encrypted outside application logs; this bundle does not accept plaintext medical data.
- Product profiling and marketing must remain disabled for child accounts unless a separately approved safeguarding and consent design is implemented.

## 10. Publication rule

A public query should return only records whose visibility and verification state allow publication. The compatibility views and public APIs enforce this boundary for the new model.
