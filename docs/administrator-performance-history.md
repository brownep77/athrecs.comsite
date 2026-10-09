# Administrator-approved performance history

An authenticated staff member may explicitly approve a historical performance batch for an already-public athlete profile. `publishStaffPerformanceHistory` requires an approval declaration, a reason, a stable request ID and a bounded, schema-validated snapshot. The approval is recorded as `athlete.history_admin_published` in the audit log. It is not athlete consent or independent source verification.

This route preserves sprint precision, field marks, qualifiers, year-only records and unresolved dates. Entries are visibly unverified and do not enter verified PB or race-win calculations. Referenced pending proposals are resolved as administrator-published without altering their athlete responses. Denied proposals, private profiles and disabled athlete sharing are rejected. Account ownership and the normal verified-result publication flow are unchanged.

The linked athlete can remove or restore each entry in `/athlete-results`. Public reads filter excluded entries and honor profile/result sharing. Removal retains the original source record and writes an audit event. Ordinary staff cannot reverse an account owner's removal through that endpoint. Replaying a publication ID does not restore excluded entries.

No participant data or publication payloads belong in this repository. Run `npm run verify:athlete-publication` for the synthetic database checks.
