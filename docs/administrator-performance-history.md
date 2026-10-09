# Administrator-approved performance history

An authenticated staff member may explicitly approve a historical performance batch for an already-public athlete profile. `publishStaffPerformanceHistory` requires an approval declaration, a reason, a stable request ID and a bounded, schema-validated snapshot. The approval is recorded as `athlete.history_admin_published` in the audit log. It is not athlete consent or independent source verification.

This route preserves sprint precision, field marks, qualifiers, year-only records and unresolved dates. Entries are visibly unverified and do not enter verified PB or race-win calculations. Referenced pending proposals are resolved as administrator-published without altering their athlete responses. Denied proposals, private profiles and disabled athlete sharing are rejected. Account ownership and the normal verified-result publication flow are unchanged.

The linked athlete can remove or restore each entry in `/athlete-results`. Public reads filter excluded entries and honor profile/result sharing. Removal retains the original source record and writes an audit event. Ordinary staff cannot reverse an account owner's removal through that endpoint. Replaying a publication ID does not restore excluded entries.

Additional performances appear in the main Results history alongside recorded race results, using the same desktop table and mobile cards. The sport and year filters include these entries; track, field, combined events and relays are labelled Athletics, while road distances are labelled Running. Original marks, wind readings, indoor annotations and uncertain date labels are retained. Field marks display metres and combined-event scores display points. Unverified additions remain separate from the numeric race-result model and from verified PB calculations.

At the site owner's request, result source links are hidden on the public history display. Source URLs and provider names remain in the stored history and evidence views. This is a presentation change, not deletion of provenance, a verification decision or a change to athlete removal controls.

No participant data or publication payloads belong in this repository. Run `npm run verify:athlete-publication` for the synthetic database checks.

Verification is separate from publication. An explicit administrator confirmation can be recorded as `verified_by_administrator`, with the confirming actor, original snapshot, reason and scope retained in a private audit event. Independent result-row verification uses `source_verified`; corroborating selected fields alone does not justify that status. New imports still start unverified. Verified entries stay in the same main Results history and no longer show the Unverified warning. Owner removal/restore and privacy settings still apply. Administrator confirmation does not manufacture missing dates or advance entries into independently evidenced race-win badges.
