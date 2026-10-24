"""Focused synthetic checks for London secondary-source profile planning.

No private inputs, credentials, network requests, database writes or builds.
Run: python3 scripts/verify-london-profile-plan.py
"""

import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("london_profile_plan", ROOT / "scripts/lib/london-profile-plan.py")
planner = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(planner)

EDITION = {
    "id": 101, "equivalentIds": [102, 103], "eventSlug": "london-marathon",
    "eventName": "London Marathon", "date": "2025-04-27", "distanceKm": 42.195, "country": "United Kingdom",
}
CREATED = "2026-10-24T15:00:00Z"


def pace(number=1, name="Marlow, Amber (GBR)", time="03:10:00", sex="F", category="18-39", flags=None, event="MAS"):
    row = {column: None for column in planner.PACE_COLUMNS}
    row.update({
        "id": number, "race": "London Marathon", "year": 2025, "city": "London",
        "runner": name, "sex": sex, "age_group": category, "split_42_2km": time,
        "source_url": f"https://results.tcslondonmarathon.com/2025/?content=detail&idp={number:014}&lang=EN&event={event}",
        "ingested_at": "2026-09-01T18:31:57Z",
    })
    return planner.normalize_pace_row(row, flags)


def guide(number=1, name="Amber MARLOW", time="03:10:00", sex="Female", place="🥇1"):
    fields = dict(zip(planner.GUIDE_HEADINGS, [place, name, "Marathon", time, sex, "", "Claim"]))
    record = {
        "fields": fields, "cells": list(fields.values()), "provider_result_id": str(9000 + number),
        "sourcePath": f"/races/run/london-marathon-21/2025/results/{9000 + number}/",
    }
    page = {
        "page": 1, "observed_at": "2026-10-24T12:10:38Z", "headings": planner.GUIDE_HEADINGS,
        "headings_verified": True, "visible_page_url": planner.GUIDE_PUBLICATION,
        "observed_print_href": "/print/synthetic-observation",
    }
    return planner.normalize_guide_row(record, page)


def plan(rows, snapshot=None):
    return planner.build_plan(rows, snapshot or {"athletes": [], "results": [], "accounts": []}, EDITION, "synthetic-london-test", CREATED)


def snapshot(row, **result_updates):
    result = {
        "id": "history:57:0", "athleteId": 7, "editionId": 101,
        "finishSeconds": row["finishSeconds"], "sourceUrls": [row["sourceUrl"]],
        "sourceKind": "source_history", "gender": row["gender"], "category": row["category"],
    }
    result.update(result_updates)
    return {
        "athletes": [{"id": 7, "displayName": "Amber Marlow", "aliases": [], "gender": "F"}],
        "results": [result], "accounts": [],
    }


def reviewed_fixture(rows, *, year_only=False, excluded=False):
    """Synthetic independent review and explicit approval; never real DB input."""
    row = rows[0]
    existing = snapshot(row, sourceUrls=["https://example.test/independently-retained-result"])
    existing["metadata"] = {"fingerprint": "synthetic-frozen-fingerprint", "batchId": "synthetic-london-test"}
    existing["athletes"][0]["visibility"] = "public"
    result = existing["results"][0]
    result.update(date="2025-04-27", year=2025, distanceKm=42.195, distanceCode="Marathon", profileExcluded=excluded)
    if year_only:
        source_id = "synthetic-wmm-athlete-id"
        result.update({
            "editionId": None, "date": "", "provider": "Abbott World Marathon Majors",
            "sourceKind": "history", "eventName": "London Marathon",
            "historyIdentity": {"athleteId": 7, "provider": "Abbott World Marathon Majors", "externalId": source_id, "performanceOrdinal": "1"},
            "original": {"performance": {
                "date": "", "year": 2025, "meeting": "London Marathon", "discipline": "Marathon",
                "performance": row["finishTime"], "profileExcluded": excluded,
                "archiveReference": {"original": {
                    "result_year": 2025, "event_title": "London Marathon", "athlete_id": source_id,
                    "finish_time_secs": row["finishSeconds"], "finish_time": row["finishTime"],
                }},
            }},
        })
    group = next(g for g in planner._make_groups(rows) if row["observationKey"] in g["observationKeys"])
    decision = {
        "groupId": group["groupId"], "name": group["name"], "finishSeconds": group["finishSeconds"],
        "sourceKeys": group["sourceKeys"], "decision": planner.REVIEW_DECISION,
        "athleteIds": ["7"], "resultIds": [str(result["id"])], "sourceQualityFlags": [], "reasons": [],
        "originalDatePrecision": ["year" if year_only else "day"], "crossSourcePNandMG": group["crossSourcePair"],
    }
    manifest = {
        "snapshotFingerprint": existing["metadata"]["fingerprint"], "snapshotDigest": planner._hash(existing),
        "counts": {planner.REVIEW_DECISION: 1}, "associatedPerformanceCount": 1,
        "associations": [{
            "resultId": result["id"], "athleteId": 7, "originalDate": result["date"], "originalYear": result["year"],
            "associationBasis": "Synthetic explicit event/year/distance review; retain original date precision.",
            "provider": result.get("provider"), "historyIdentity": result.get("historyIdentity"),
        }],
        "decisions": [decision],
        "recommendation": {
            "eligibleDecision": planner.REVIEW_DECISION, "eligibleGroups": 1, "heldMatchedGroups": 0,
            "structuralMergesAuthorizedByThisReview": False, "resultVerificationUpgraded": False, "accountOwnershipVerified": False,
        },
    }
    approval = {
        "approvalId": "synthetic-root-approved-evidence-reuse", "approvedBy": "root", "recordedAt": CREATED,
        "batchId": "synthetic-london-test", "action": "reuse_existing_performance_evidence_only", "approvedGroupCount": 1,
        "manifestDigest": planner._hash(manifest), "manifestFileSha256": "0" * 64,
        "snapshotDigest": planner._hash(existing), "snapshotFingerprint": existing["metadata"]["fingerprint"],
        "preserveExistingPerformanceFields": True, "preserveVerification": True, "structuralMerges": False,
    }
    return existing, manifest, approval


def reviewed_plan(rows, existing, manifest, approval):
    return planner.build_plan(rows, existing, EDITION, "synthetic-london-test", CREATED, review_manifest=manifest, review_approval=approval)


class LondonPlanTests(unittest.TestCase):
    def test_unique_cross_source_pair_creates_one_generic_unverified_performance(self):
        result = plan([pace(), guide()])
        self.assertEqual((result["summary"]["sourceObservations"], result["summary"]["performanceGroups"], result["summary"]["new"]), (2, 1, 1))
        group = result["groups"][0]
        history, draft = group["history"], group["athleteDraft"]
        performance = history["performances"][0]
        self.assertEqual(performance["timing"], {"basis": "unknown"})
        self.assertEqual(performance["verificationStatus"], "unverified")
        self.assertEqual(performance["places"], {"overall": None, "gender": None, "category": None})
        self.assertEqual(performance["place"], "")
        self.assertEqual(draft["givenName"], "Amber")
        self.assertIsNone(draft["nationality"])
        self.assertIsNone(draft["dateOfBirth"])
        self.assertFalse(history["complete"])
        self.assertEqual(history["provider"], "Pace Notes")
        self.assertEqual(draft["profileDetails"]["archiveCreation"]["batchId"], "synthetic-london-test")
        self.assertEqual(performance["archiveReference"]["attribution"]["credit"], "Andrew Kam / Pace Notes")
        self.assertEqual(history["capturedAt"], "2026-09-01T18:31:57Z")
        self.assertEqual(len(performance["archiveReference"]["sourceObservations"]), 2)
        self.assertEqual(result["accounting"]["assignedObservations"], 2)

    def test_country_suffix_is_private_original_evidence_not_nationality(self):
        row = pace()
        self.assertEqual(row["countryCodeInOriginalName"], "GBR")
        existing = snapshot(row)
        existing["athletes"][0]["nationality"] = "Canada"
        self.assertEqual(plan([row], existing)["groups"][0]["disposition"], "linked")

    def test_standalone_guide_held_and_does_not_invent_name_components(self):
        row = guide()
        self.assertIsNone(row["givenName"])
        self.assertIsNone(row["familyName"])
        group = plan([row])["groups"][0]
        self.assertEqual(group["disposition"], "held")
        self.assertIn("marathonguide_only_source_review", group["reasons"])
        self.assertNotIn("history", group)

    def test_repeated_display_name_and_different_times_are_held(self):
        result = plan([pace(1), pace(2, time="04:00:00"), guide(1)])
        self.assertEqual(result["summary"]["performanceGroups"], 2)
        self.assertEqual(result["summary"]["held"], 2)
        self.assertTrue(all("repeated_source_display_name" in g["reasons"] for g in result["groups"]))

    def test_variants_are_only_holds_never_merged(self):
        for names in [("Marlow, Robert (GBR)", "Bob Marlow"), ("García, Lucía (ESP)", "Lucia Garcia"), ("Marlow, Amber (GBR)", "Marlow Amber")]:
            with self.subTest(names=names):
                result = plan([pace(name=names[0]), guide(name=names[1])])
                self.assertEqual(result["summary"]["crossSourcePairs"], 0)
                self.assertEqual(result["summary"]["held"], 2)
                self.assertTrue(all("possible_source_name_variant" in g["reasons"] for g in result["groups"]))

    def test_publisher_quality_note_holds_otherwise_matching_pair(self):
        row = pace(flags={"record_id": 1, "note": "DQ step1: data quality only", "pace_implausible": 1})
        group = plan([row, guide()])["groups"][0]
        self.assertEqual(group["disposition"], "held")
        self.assertIn("publisher_quality_note", group["reasons"])
        self.assertIn("publisher_pace_implausible", group["reasons"])
        self.assertNotIn("disqualification", row)

    def test_elite_division_alone_is_not_a_quality_failure(self):
        row = pace(flags={"record_id": 1, "division": "elite", "division_evidence": "retained ELIT URL", "note": None}, event="ELIT")
        self.assertEqual(row["qualityFlags"], [])
        self.assertEqual(plan([row])["groups"][0]["disposition"], "new")

    def test_exact_existing_locator_reuses_result_without_second_history(self):
        row = pace()
        group = plan([row, guide()], snapshot(row))["groups"][0]
        self.assertEqual(group["disposition"], "linked")
        self.assertEqual(group["athleteId"], 7)
        self.assertEqual(group["resultIds"], ["history:57:0"])
        self.assertEqual(group["existingMatches"][0]["matchedUrls"], [row["sourceUrl"]])
        self.assertNotIn("history", group)
        self.assertNotIn("athleteDraft", group)

    def test_generic_time_can_corroborate_explicit_existing_chip_or_gun(self):
        row = pace()
        existing = snapshot(row, finishSeconds=row["finishSeconds"] + 30, timeSeconds=[row["finishSeconds"], row["finishSeconds"] + 30], editionId=102, id=20)
        group = plan([row], existing)["groups"][0]
        self.assertEqual(group["disposition"], "linked")
        self.assertEqual(group["existingMatches"][0]["resultId"], 20)
        self.assertEqual(row["timing"], {"basis": "unknown"})

    def test_explicit_known_alias_can_match_but_fuzzy_name_cannot(self):
        row = pace()
        existing = snapshot(row)
        existing["athletes"][0].update(displayName="Amber Previous", aliases=["Amber Marlow"])
        self.assertEqual(plan([row], existing)["groups"][0]["disposition"], "linked")
        existing["athletes"][0]["aliases"] = ["Amber Marloe"]
        self.assertIn("existing_locator_name_conflict", plan([row], existing)["groups"][0]["reasons"])

    def test_names_only_and_account_names_require_review(self):
        row = pace()
        existing = snapshot(row)
        existing["results"] = []
        group = plan([row], existing)["groups"][0]
        self.assertEqual(group["disposition"], "held")
        self.assertIn("existing_name_or_alias_requires_review", group["reasons"])
        existing = {"athletes": [], "results": [], "accounts": [{"id": "acct-1", "names": ["Amber Marlow"], "linkedAthleteIds": []}]}
        group = plan([row], existing)["groups"][0]
        self.assertEqual(group["existingCandidates"], ["account:acct-1"])
        self.assertEqual(group["disposition"], "held")

    def test_cross_provider_same_performance_is_explicit_review_candidate(self):
        row = pace()
        existing = snapshot(row, sourceUrls=["https://example.test/retained-other-result"])
        group = plan([row], existing)["groups"][0]
        self.assertEqual(group["disposition"], "held")
        self.assertEqual(group["existingMatches"], [])
        self.assertEqual(group["samePerformanceCandidates"][0]["resultId"], "history:57:0")
        self.assertIn("same_performance_without_matching_locator_requires_review", group["reasons"])
        self.assertNotIn("history", group)

    def test_conflicting_edition_time_gender_and_dob_are_held(self):
        row = pace()
        cases = [({"editionId": 999}, "existing_locator_edition_conflict"), ({"finishSeconds": 9900}, "existing_locator_time_conflict"), ({"gender": "M"}, "existing_gender_conflict"), ({"category": "65-69"}, "existing_age_category_conflict")]
        for updates, reason in cases:
            with self.subTest(reason=reason):
                group = plan([row], snapshot(row, **updates))["groups"][0]
                self.assertEqual(group["disposition"], "held")
                self.assertIn(reason, group["reasons"])
        existing = snapshot(row)
        existing["athletes"][0]["dateOfBirth"] = "1950-01-01"
        self.assertIn("existing_birth_date_age_category_conflict", plan([row], existing)["groups"][0]["reasons"])

    def test_same_locator_attached_to_two_athletes_never_merges_them(self):
        row = pace()
        existing = snapshot(row)
        existing["athletes"].append({"id": 8, "displayName": "Amber Marlow", "aliases": [], "gender": "F"})
        existing["results"].append({**existing["results"][0], "id": "canonical:88", "athleteId": 8})
        group = plan([row], existing)["groups"][0]
        self.assertEqual(group["disposition"], "held")
        self.assertIn("same_result_locator_on_multiple_athletes", group["reasons"])

    def test_duplicate_same_name_time_rows_are_not_silently_discarded(self):
        result = plan([pace(1), pace(2), guide()])
        self.assertEqual(result["summary"]["sourceObservations"], 3)
        self.assertEqual(result["summary"]["performanceGroups"], 3)
        self.assertEqual(result["summary"]["held"], 3)
        self.assertEqual(result["accounting"]["assignedObservations"], 3)

    def test_gender_conflict_prevents_cross_source_pairing(self):
        result = plan([pace(), guide(sex="Male")])
        self.assertEqual(result["summary"]["crossSourcePairs"], 0)
        self.assertEqual(result["summary"]["held"], 2)
        self.assertTrue(all("cross_source_gender_conflict" in g["reasons"] for g in result["groups"]))

    def test_duplicate_ids_and_mutated_accounting_rejected(self):
        with self.assertRaises(ValueError):
            plan([pace(), pace()])
        result = plan([pace(), guide()])
        result["groups"][0]["observationKeys"].pop()
        with self.assertRaises(ValueError):
            planner.validate_plan(result)

    def test_stable_identifiers_do_not_depend_on_input_order_or_corroboration(self):
        rows = [pace(), guide(), pace(2, name="Qi, Zelda (CHN)", time="04:20:00")]
        first, second = plan(rows), plan(list(reversed(rows)))
        self.assertEqual(first, second)
        solo = plan([rows[0]])["groups"][0]
        paired = next(g for g in first["groups"] if g["primaryObservationKey"] == rows[0]["observationKey"])
        self.assertEqual(solo["groupId"], paired["groupId"])
        self.assertEqual(solo["athleteDraft"]["slug"], paired["athleteDraft"]["slug"])
        self.assertEqual(solo["history"]["externalId"], paired["history"]["externalId"])

    def test_source_locator_is_not_a_global_athlete_identifier(self):
        group = plan([pace()])["groups"][0]
        self.assertNotIn("sourceAthleteId", json.dumps(group))
        self.assertIn("sourceResultId", json.dumps(group))
        self.assertTrue(group["history"]["externalId"].startswith("london-2025:mas:"))

    def test_header_mapping_and_actual_href_are_required(self):
        observation = guide()
        self.assertEqual(observation["sourceReportedPlace"], 1)
        record = {"fields": {}, "cells": [], "provider_result_id": "42", "sourcePath": "/guessed/42/"}
        page = {"headings": planner.GUIDE_HEADINGS, "headings_verified": True}
        with self.assertRaises(ValueError):
            planner.normalize_guide_row(record, page)

    def test_no_verification_upgrades_are_accepted(self):
        row = pace()
        row["sourceVerification"] = "source_verified"
        with self.assertRaises(ValueError):
            plan([row])
        result = plan([pace()])
        result["groups"][0]["history"]["performances"][0]["verificationStatus"] = "source_verified"
        with self.assertRaises(ValueError):
            planner.validate_plan(result)

    def test_approved_review_resolves_only_the_exact_performance_among_name_collisions(self):
        rows = [pace(), guide(), pace(2, time="04:00:00")]
        existing, manifest, approval = reviewed_fixture(rows)
        result = reviewed_plan(rows, existing, manifest, approval)
        self.assertEqual(result["summary"]["linked"], 1)
        self.assertEqual(result["summary"]["held"], 1)
        linked = next(g for g in result["groups"] if g["disposition"] == "linked")
        self.assertEqual(linked["existingMatches"][0]["matchedUrls"], [])
        self.assertEqual(linked["existingMatches"][0]["method"], planner.REVIEW_METHOD)
        self.assertIn("repeated_source_display_name", linked["resolvedReviewReasons"])
        self.assertNotIn("history", linked)
        self.assertEqual(linked["resultIds"], ["history:57:0"])

    def test_reviewed_wmm_year_association_preserves_original_empty_date_and_verification(self):
        rows = [pace(), guide()]
        existing, manifest, approval = reviewed_fixture(rows, year_only=True)
        before = copy.deepcopy(existing)
        result = reviewed_plan(rows, existing, manifest, approval)
        match = result["groups"][0]["existingMatches"][0]
        self.assertEqual(match["originalDate"], "")
        self.assertEqual(match["originalYear"], 2025)
        self.assertEqual(match["originalDatePrecision"], "year")
        self.assertIsNone(match["editionId"])
        self.assertEqual(match["associatedEditionId"], EDITION["id"])
        self.assertTrue(match["preserveVerification"])
        self.assertEqual(existing, before)

    def test_review_rejects_changed_manifest_and_changed_snapshot(self):
        rows = [pace(), guide()]
        existing, manifest, approval = reviewed_fixture(rows)
        altered = copy.deepcopy(manifest)
        altered["decisions"][0]["finishSeconds"] += 1
        with self.assertRaisesRegex(ValueError, "manifest digest changed"):
            reviewed_plan(rows, existing, altered, approval)
        changed = copy.deepcopy(existing)
        changed["athletes"][0]["visibility"] = "private"
        with self.assertRaisesRegex(ValueError, "snapshot content changed"):
            reviewed_plan(rows, changed, manifest, approval)

    def test_pinned_review_file_rejects_even_unapproved_byte_changes(self):
        rows = [pace()]
        _, manifest, _ = reviewed_fixture(rows)
        raw = json.dumps(manifest).encode()
        digest = hashlib.sha256(raw).hexdigest()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "synthetic-review.json"
            path.write_bytes(raw)
            self.assertEqual(planner.load_review_manifest(path, digest), manifest)
            path.write_bytes(raw + b"\n")
            with self.assertRaisesRegex(ValueError, "review file changed"):
                planner.load_review_manifest(path, digest)

    def test_review_cannot_clear_exclusion_or_incoming_quality_flags(self):
        for rows, excluded in [([pace(), guide()], True), ([pace(flags={"record_id": 1, "note": "Synthetic quality concern"}), guide()], False)]:
            with self.subTest(excluded=excluded):
                existing, manifest, approval = reviewed_fixture(rows, excluded=excluded)
                with self.assertRaises(ValueError):
                    reviewed_plan(rows, existing, manifest, approval)

    def test_even_repinned_review_cannot_clear_conflicting_demographics(self):
        rows = [pace(), guide()]
        existing, manifest, approval = reviewed_fixture(rows)
        existing["results"][0]["gender"] = "M"
        manifest["snapshotDigest"] = planner._hash(existing)
        approval["snapshotDigest"] = planner._hash(existing)
        approval["manifestDigest"] = planner._hash(manifest)
        with self.assertRaisesRegex(ValueError, "conflicting or excluded"):
            reviewed_plan(rows, existing, manifest, approval)

    def test_review_requires_one_existing_performance_across_the_reviewed_scope(self):
        rows = [pace(), guide()]
        existing, manifest, approval = reviewed_fixture(rows)
        duplicate = {**existing["results"][0], "id": "history:58:0"}
        existing["results"].append(duplicate)
        manifest["associations"].append({**manifest["associations"][0], "resultId": duplicate["id"]})
        manifest["associatedPerformanceCount"] = 2
        manifest["snapshotDigest"] = planner._hash(existing)
        approval["snapshotDigest"] = planner._hash(existing)
        approval["manifestDigest"] = planner._hash(manifest)
        with self.assertRaisesRegex(ValueError, "one unique existing performance"):
            reviewed_plan(rows, existing, manifest, approval)

    def test_review_requires_explicit_approval_and_does_not_relax_automatic_linking(self):
        rows = [pace(), guide()]
        existing, manifest, approval = reviewed_fixture(rows)
        with self.assertRaises(ValueError):
            planner.build_plan(rows, existing, EDITION, "synthetic-london-test", CREATED, review_manifest=manifest)
        unreviewed = plan(rows, existing)
        self.assertEqual(unreviewed["groups"][0]["disposition"], "held")
        automatic = plan([rows[0]], snapshot(rows[0]))
        automatic["groups"][0]["existingMatches"][0]["matchedUrls"] = []
        with self.assertRaisesRegex(ValueError, "exact retained locator"):
            planner.validate_plan(automatic)

    def test_plan_validation_rejects_reviewed_date_or_approval_tampering(self):
        rows = [pace()]
        existing, manifest, approval = reviewed_fixture(rows, year_only=True)
        result = reviewed_plan(rows, existing, manifest, approval)
        result["groups"][0]["existingMatches"][0]["originalDate"] = "2025-04-27"
        with self.assertRaisesRegex(ValueError, "history precision or verification"):
            planner.validate_plan(result)

    def test_new_history_passes_the_existing_typescript_source_history_schema(self):
        histories = [plan([pace(), guide()])["groups"][0]["history"]]
        javascript = """
import { readFileSync } from 'node:fs';
import { sourceHistorySchema } from './src/lib/athrecs/source-performance-history.ts';
const histories = JSON.parse(readFileSync(0, 'utf8'));
for (const history of histories) sourceHistorySchema.parse(history);
console.log(JSON.stringify({histories: histories.length, valid: true}));
"""
        checked = subprocess.run(
            ["node", "--experimental-strip-types", "--input-type=module", "-e", javascript],
            input=json.dumps(histories), text=True, capture_output=True, cwd=ROOT,
        )
        self.assertEqual(checked.returncode, 0, checked.stderr)
        self.assertEqual(json.loads(checked.stdout), {"histories": 1, "valid": True})


if __name__ == "__main__":
    unittest.main(verbosity=2)
