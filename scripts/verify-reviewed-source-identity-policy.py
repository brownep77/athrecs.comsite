"""Synthetic policy/workflow regressions. No credentials, network or database."""

import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("reviewed_source_identity_policy", ROOT / "scripts/lib/reviewed-source-identity-policy.py")
policy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(policy)
CLI = ROOT / "scripts/review-source-identity-policy.py"


def age_fact(low, high, evidence="source", **updates):
    value = {"low": low, "high": high, "basis": "bounded_category", "atEditionDate": "2024-04-21", "evidenceIds": [evidence],
             "referenceDescription": "Original bounded source category translated to the incoming edition, including every plausible reference year and birthday boundary.",
             "originalFieldsCompared": True, "sourceSemanticsResolved": True, "uncertaintyIncluded": True}
    value.update(updates)
    return value


def candidate_review(ref="athlete:17"):
    return {"ref": ref, "requestedDisposition": "different_person", "originalNames": ["Alexandra Alder"],
            "nameRelationship": "possible_alias",
            "rationale": "The original source names could be aliases, but the independently reviewed source age intervals at this edition are disjoint and no shared source identity or contradictory fact is retained.",
            "evidenceIds": ["state", "source"], "allRetainedNamesReviewed": True, "sourceFactsConsistent": True,
            "identityBridgePresent": False, "unresolvedIssues": [],
            "ageEvidence": {"incomingFacts": [age_fact(40, 44)], "candidateFacts": [age_fact(53, 57, "state")]}}


def review_fixture():
    """Complete synthetic input contract, also usable by future review adapters."""
    return {"schemaVersion": 1, "policyVersion": policy.POLICY_VERSION,
            "reviewedBy": "synthetic independent reviewer", "reviewedAt": "2026-10-25T18:00:00Z",
            "snapshotFingerprint": "synthetic-current-directory",
            "bindings": {"snapshot": "snapshot", "candidateState": "state", "sourceCorpus": "source"},
            "evidenceFiles": [{"id": key, "path": key + ".json", "sha256": "a" * 64}
                              for key in ("snapshot", "state", "source")],
            "cases": [{"groupId": "synthetic-race-2024-result-a", "groupDigest": "b" * 64,
                       "editionDate": "2024-04-21", "sourceObservationKeys": ["synthetic-source:row-a"],
                       "originalNames": ["Alex Alder"], "sourceEvidenceIds": ["source"],
                       "sourceEligible": True, "sourceQualityFlags": [],
                       "safeguards": {key: True for key in policy.SAFEGUARDS},
                       "candidateTokens": ["athlete:17"], "sourceCollisionGroupIds": [],
                       "candidateReviews": [candidate_review()], "collisionReviews": []}]}


class ReviewedPolicyTests(unittest.TestCase):
    def setUp(self):
        self.review = review_fixture()
        self.case = self.review["cases"][0]
        self.candidate = self.case["candidateReviews"][0]

    def result(self):
        return policy.evaluate_review(self.review)["cases"][0]

    def test_nine_year_gap_without_sex_requirement_can_support_review(self):
        result = self.result()
        self.assertEqual(result["status"], "eligible_distinct_profile_review")
        self.assertEqual(result["candidateReviews"][0]["ageComparison"]["minimumSeparation"], 9)

    def test_small_source_resolved_gap_is_not_rejected_by_an_arbitrary_threshold(self):
        self.candidate["ageEvidence"]["candidateFacts"] = [age_fact(45, 49)]
        self.assertEqual(self.result()["status"], "eligible_distinct_profile_review")

    def test_same_name_with_supported_age_contradiction_can_be_distinct(self):
        self.candidate.update(originalNames=["Alex Alder"], nameRelationship="same_or_recorded_alias")
        self.assertEqual(self.result()["status"], "eligible_distinct_profile_review")

    def test_same_name_and_compatible_cross_year_age_stays_held(self):
        self.candidate.update(originalNames=["Alex Alder"], nameRelationship="same_or_recorded_alias")
        self.candidate["ageEvidence"]["candidateFacts"] = [age_fact(43, 49)]
        self.assertEqual(self.result()["status"], "hold")

    def test_touching_interval_does_not_establish_distinction(self):
        self.candidate["ageEvidence"]["candidateFacts"] = [age_fact(44, 49)]
        self.assertEqual(self.result()["status"], "hold")

    def test_age_interval_must_describe_the_incoming_edition(self):
        self.candidate["ageEvidence"]["candidateFacts"][0]["atEditionDate"] = "2023-04-23"
        with self.assertRaises(ValueError):
            self.result()

    def test_year_reference_uncertainty_cannot_be_dropped(self):
        self.assertEqual(policy.category_interval(65, 69, [2024, 2026], 2023), {"low": 61, "high": 69})
        for key in ("sourceSemanticsResolved", "uncertaintyIncluded", "originalFieldsCompared"):
            with self.subTest(key=key):
                item = copy.deepcopy(self.review)
                item["cases"][0]["candidateReviews"][0]["ageEvidence"]["candidateFacts"][0][key] = False
                self.assertEqual(policy.evaluate_review(item)["cases"][0]["status"], "hold")

    def test_birth_year_retains_unknown_birthday(self):
        self.assertEqual(policy.birth_year_interval(1984, 2024), {"low": 39, "high": 40})

    def test_open_upper_bound_is_not_invented(self):
        self.assertEqual(policy.category_interval(40, None, [2024, 2025], 2023), {"low": 37, "high": None})
        self.candidate["ageEvidence"]["candidateFacts"] = [age_fact(40, None, basis="lower_bound_category")]
        self.assertEqual(self.result()["status"], "hold")
        self.candidate["ageEvidence"]["candidateFacts"][0]["high"] = 44
        with self.assertRaises(ValueError):
            self.result()

    def test_compatible_facts_can_narrow_but_conflicting_facts_hold(self):
        self.candidate["ageEvidence"]["candidateFacts"].append(age_fact(50, None, basis="lower_bound_category"))
        self.assertEqual(self.result()["status"], "eligible_distinct_profile_review")
        self.candidate["ageEvidence"]["candidateFacts"].append(age_fact(20, 29))
        self.assertEqual(self.result()["status"], "hold")

    def test_existing_positive_identity_bridge_blocks_new_identity(self):
        self.candidate["identityBridgePresent"] = True
        self.assertEqual(self.result()["status"], "hold")

    def test_same_edition_collision_and_cross_year_uncertainty_are_not_omitted(self):
        self.case["sourceCollisionGroupIds"] = ["synthetic-race-2024-result-b"]
        with self.assertRaises(ValueError):
            self.result()
        collision = candidate_review("synthetic-race-2024-result-b")
        collision["unresolvedIssues"] = ["possible_same_person_in_another_edition"]
        self.case["collisionReviews"] = [collision]
        self.assertEqual(self.result()["status"], "hold")

    def test_every_fresh_candidate_review_required_exactly_once(self):
        self.case["candidateTokens"].append("athlete:18")
        with self.assertRaises(ValueError):
            self.result()
        self.case["candidateReviews"].append(candidate_review("athlete:18"))
        self.assertEqual(self.result()["status"], "eligible_distinct_profile_review")
        self.case["candidateReviews"].append(candidate_review("athlete:18"))
        with self.assertRaises(ValueError):
            self.result()

    def test_account_candidate_cannot_be_disposed_by_age_only(self):
        self.case["candidateTokens"] = ["account:synthetic"]
        self.candidate["ref"] = "account:synthetic"
        self.assertEqual(self.result()["status"], "hold")

    def test_source_privacy_and_freshness_guards_still_hold(self):
        for key in policy.SAFEGUARDS:
            with self.subTest(key=key):
                item = copy.deepcopy(self.review)
                item["cases"][0]["safeguards"][key] = False
                self.assertEqual(policy.evaluate_review(item)["cases"][0]["status"], "hold")
        self.case["sourceEligible"] = False
        self.assertEqual(self.result()["status"], "hold")
        self.case["sourceEligible"] = True
        self.case["sourceQualityFlags"] = ["original_category_unresolved"]
        self.assertEqual(self.result()["status"], "hold")

    def test_weak_suggestion_is_never_coerced_into_different_person(self):
        self.candidate.update(requestedDisposition="not_a_plausible_match", nameRelationship="weak_fuzzy_only",
                              originalNames=["Augustus Alder"], ageEvidence=None)
        result = self.result()
        self.assertEqual(result["status"], "requires_nonblocking_publisher_adapter")
        self.assertEqual(result["candidateReviews"][0]["outcome"], "not_a_plausible_match")
        self.candidate["requestedDisposition"] = "different_person"
        self.assertEqual(self.result()["status"], "hold")

    def test_nickname_and_omission_uncertainty_cannot_use_weak_route(self):
        self.candidate.update(requestedDisposition="not_a_plausible_match", ageEvidence=None)
        self.assertEqual(self.result()["status"], "hold")
        self.candidate.update(nameRelationship="weak_fuzzy_only", originalNames=["A. Alder"])
        self.assertEqual(self.result()["status"], "hold")

    def test_punctuation_accents_and_word_order_do_not_establish_different_names(self):
        for incoming, existing in (("James D’Arcy", "James Darcy"), ("Éva Alder", "Eva Alder"),
                                   ("Alder Alex", "Alex Alder"), ("Alex Alder (GBR)", "Alex Alder")):
            with self.subTest(incoming=incoming):
                item = copy.deepcopy(self.review)
                item["cases"][0]["originalNames"] = [incoming]
                candidate = item["cases"][0]["candidateReviews"][0]
                candidate.update(originalNames=[existing], nameRelationship="weak_fuzzy_only",
                                 requestedDisposition="not_a_plausible_match", ageEvidence=None)
                self.assertEqual(policy.evaluate_review(item)["cases"][0]["status"], "hold")

    def test_unknown_evidence_or_schema_is_rejected(self):
        self.candidate["evidenceIds"] = ["not-pinned"]
        with self.assertRaises(ValueError):
            self.result()
        self.candidate["evidenceIds"] = ["state"]
        self.candidate["profileGender"] = "F"
        with self.assertRaises(ValueError):
            self.result()

    def test_schema_version_requires_an_integer_not_a_boolean_or_float(self):
        for value in (True, 1.0, "1", None):
            with self.subTest(value=value):
                self.review["schemaVersion"] = value
                with self.assertRaises(ValueError):
                    self.result()
    def test_receipt_has_no_publication_link_merge_or_verification_authority(self):
        receipt = policy.evaluate_review(self.review)
        for key in ("publicationAuthorized", "existingLinksAuthorized", "structuralMergesAuthorized", "sourceVerificationChanged"):
            self.assertIs(receipt[key], False)
        self.assertTrue(receipt["requiresFreshPublicationValidation"])


class ReviewCliTests(unittest.TestCase):
    def test_cli_hashes_real_synthetic_files_and_writes_one_immutable_receipt(self):
        with tempfile.TemporaryDirectory(prefix="synthetic-identity-policy-") as folder:
            directory = Path(folder)
            review = review_fixture()
            for evidence in review["evidenceFiles"]:
                path = directory / evidence["path"]
                path.write_text(json.dumps({"syntheticEvidence": evidence["id"]}))
                evidence["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
            source, output = directory / "review.json", directory / "receipt.json"
            source.write_text(json.dumps(review))
            command = [sys.executable, str(CLI), "--review", str(source), "--output", str(output)]
            completed = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(completed.returncode, 0, completed.stderr)
            receipt_bytes = output.read_bytes()
            receipt = json.loads(receipt_bytes)
            self.assertTrue(receipt["evidenceFileHashesChecked"])
            self.assertEqual(receipt["reviewFile"]["sha256"], hashlib.sha256(source.read_bytes()).hexdigest())
            self.assertEqual(receipt["counts"]["eligible_distinct_profile_review"], 1)
            self.assertEqual(output.stat().st_mode & 0o777, 0o600)
            repeated = subprocess.run(command, capture_output=True, text=True)
            self.assertNotEqual(repeated.returncode, 0)
            self.assertEqual(output.read_bytes(), receipt_bytes)
            (directory / "state.json").write_text("changed synthetic state")
            command[-1] = str(directory / "changed-receipt.json")
            changed = subprocess.run(command, capture_output=True, text=True)
            self.assertNotEqual(changed.returncode, 0)
            self.assertIn("Evidence file changed: state", changed.stderr)
            self.assertFalse(Path(command[-1]).exists())


if __name__ == "__main__":
    unittest.main()
