"""Versioned, pure checks for supervised *new-profile* identity reviews.

This module does not find candidates, read files, grant publication authority,
link results, merge profiles, or infer a date of birth. A caller must supply the
complete fresh candidate/collision sets and retain the evidence they reviewed.
See docs/reviewed-source-identity-policy.md for the workflow and limitations.
"""

from __future__ import annotations

import datetime as dt
import re
import unicodedata


POLICY_VERSION = "reviewed-source-identity/v1"
SCHEMA_VERSION = 1
SAFEGUARDS = {
    "freshDirectoryAndAccounts", "completeCandidateState", "originalRowsCompared",
    "uncappedSameEditionCollisions", "crossEditionCandidatesReviewed",
    "sourceReuseAndPublication", "privacyAndClaimsRespected", "incomingLocatorAbsent",
}
RELATIONSHIPS = {"same_or_recorded_alias", "possible_alias", "materially_different", "weak_fuzzy_only"}
DISPOSITIONS = {"different_person", "not_a_plausible_match", "hold"}
AGE_BASES = {"birth_year", "bounded_category", "lower_bound_category", "explicit_age"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def fields(value, expected, label):
    require(isinstance(value, dict) and set(value) == set(expected), f"Unknown or missing {label} fields")


def text(value, label, minimum=1):
    require(isinstance(value, str) and minimum <= len(value.strip()) <= 8000, f"Invalid {label}")
    return value


def strings(value, label, *, nonempty=False):
    require(isinstance(value, list) and (value or not nonempty), f"Invalid {label}")
    for item in value:
        text(item, label)
    require(len(value) == len(set(value)), f"Repeated {label}")
    return value


def sha256(value, label):
    require(isinstance(value, str) and re.fullmatch(r"[a-f0-9]{64}", value), f"Invalid {label} SHA-256")


def age_interval(low, high):
    require(type(low) is int and low >= 0, "Age lower bound must be a nonnegative integer")
    require(high is None or (type(high) is int and high >= low), "Invalid age upper bound")
    return {"low": low, "high": high}


def birth_year_interval(birth_year, target_year):
    """Year-only birth evidence; never manufacture a birthday."""
    require(type(birth_year) is int and type(target_year) is int and 0 < birth_year <= target_year,
            "Invalid original birth year or target year")
    return age_interval(max(0, target_year - birth_year - 1), target_year - birth_year)


def category_interval(low, high, reference_years, target_year):
    """Union all plausible category years, including a birthday boundary each way.

    The provider adapter supplies *every* plausible reference year. Passing only
    a convenient year is not source comparison. None means an open upper bound.
    """
    age_interval(low, high)
    require(isinstance(reference_years, list) and reference_years
            and all(type(year) is int and year > 0 for year in reference_years)
            and type(target_year) is int and target_year > 0, "Invalid category reference years")
    lower = max(0, low + target_year - max(reference_years) - 1)
    upper = None if high is None else high + target_year - min(reference_years) + 1
    return age_interval(lower, upper)


def _intersection(intervals):
    lower = max(value["low"] for value in intervals)
    upper = min((value["high"] for value in intervals if value["high"] is not None), default=None)
    return None if upper is not None and lower > upper else age_interval(lower, upper)


def age_separation(first, second):
    """Zero includes overlap/touching. A positive value has no universal cutoff."""
    return max(0,
               first["low"] - second["high"] if second["high"] is not None else 0,
               second["low"] - first["high"] if first["high"] is not None else 0)


def _name_parts(name):
    # Only an explicit trailing source country code is removed; no nationality is inferred.
    name = re.sub(r"\s*\([A-Z]{3}\)\s*$", "", name)
    folded = unicodedata.normalize("NFKD", name.casefold())
    return "".join(char if char.isalnum() else " " for char in folded
                   if not unicodedata.combining(char)).split()


def equivalent_names(first, second):
    """Conservative additional guard; this is not a nickname/identity resolver."""
    for left in first:
        a = _name_parts(left)
        for right in second:
            b = _name_parts(right)
            if a and b and ("".join(a) == "".join(b) or sorted(a) == sorted(b)):
                return True
    return False


def _complete_names(names):
    return all(len(parts := _name_parts(name)) >= 2 and len(parts[0]) > 1 and len(parts[-1]) > 1
               for name in names)


def _evidence_ids(values, available, label):
    strings(values, label, nonempty=True)
    require(set(values) <= available, f"Unknown {label}")


def _age_facts(facts, available, label, edition_date):
    require(isinstance(facts, list) and facts, f"Missing {label} age facts")
    intervals, issues = [], []
    for fact in facts:
        fields(fact, {"low", "high", "basis", "atEditionDate", "evidenceIds", "referenceDescription",
                      "originalFieldsCompared", "sourceSemanticsResolved", "uncertaintyIncluded"}, "age fact")
        intervals.append(age_interval(fact["low"], fact["high"]))
        require(fact["atEditionDate"] == edition_date, "Age intervals refer to different editions")
        require(fact["basis"] in AGE_BASES, "Unsupported source age basis")
        if fact["basis"] == "lower_bound_category":
            require(fact["high"] is None, "A lower-bound category cannot acquire an invented upper bound")
        else:
            require(fact["high"] is not None, "A bounded category, birth year or explicit age needs a bounded interval")
        _evidence_ids(fact["evidenceIds"], available, "age evidence IDs")
        text(fact["referenceDescription"], "age reference/uncertainty explanation", 20)
        for key in ("originalFieldsCompared", "sourceSemanticsResolved", "uncertaintyIncluded"):
            require(type(fact[key]) is bool, f"Invalid {key}")
            if not fact[key]:
                issues.append(label + ":" + key + "_unresolved")
    combined = _intersection(intervals)
    if combined is None:
        issues.append(label + ":contradictory_age_facts")
    return combined, issues


def _judge(review, case, available):
    fields(review, {"ref", "requestedDisposition", "originalNames", "nameRelationship", "rationale",
                    "evidenceIds", "ageEvidence", "allRetainedNamesReviewed", "sourceFactsConsistent",
                    "identityBridgePresent", "unresolvedIssues"}, "candidate/collision review")
    text(review["ref"], "candidate/collision reference")
    require(review["requestedDisposition"] in DISPOSITIONS, "Unsupported requested disposition")
    strings(review["originalNames"], "candidate original names", nonempty=True)
    require(review["nameRelationship"] in RELATIONSHIPS, "Unknown name relationship")
    text(review["rationale"], "individual source/name rationale", 30)
    _evidence_ids(review["evidenceIds"], available, "review evidence IDs")
    strings(review["unresolvedIssues"], "unresolved identity issues")
    for key in ("allRetainedNamesReviewed", "sourceFactsConsistent", "identityBridgePresent"):
        require(type(review[key]) is bool, f"Invalid {key}")
    issues = list(review["unresolvedIssues"])
    if review["ref"].startswith("account:"):
        issues.append("account_name_candidate_requires_separate_identity_review")
    if not review["allRetainedNamesReviewed"]:
        issues.append("retained_names_or_aliases_unreviewed")
    if not review["sourceFactsConsistent"]:
        issues.append("source_facts_conflict_or_incomplete")
    if review["identityBridgePresent"]:
        issues.append("positive_identity_bridge_requires_existing_identity_review")
    same_names = equivalent_names(case["originalNames"], review["originalNames"])
    if same_names and review["nameRelationship"] in {"materially_different", "weak_fuzzy_only"}:
        issues.append("name_assessment_conflicts_with_equivalent_original_names")
    comparison = None
    if review["ageEvidence"] is not None:
        fields(review["ageEvidence"], {"incomingFacts", "candidateFacts"}, "age evidence")
        allowed = set(review["evidenceIds"]) | set(case["sourceEvidenceIds"])
        incoming, flags = _age_facts(review["ageEvidence"]["incomingFacts"], allowed, "incoming", case["editionDate"])
        candidate, more = _age_facts(review["ageEvidence"]["candidateFacts"], allowed, "candidate", case["editionDate"])
        issues.extend(flags + more)
        if incoming is not None and candidate is not None:
            comparison = {"editionDate": case["editionDate"], "incomingInterval": incoming,
                          "candidateInterval": candidate, "minimumSeparation": age_separation(incoming, candidate)}
    requested = review["requestedDisposition"]
    outcome = "hold"
    if requested == "hold":
        issues.append("reviewer_retained_hold")
    elif not issues and requested == "different_person":
        if comparison and comparison["minimumSeparation"] > 0:
            outcome = "different_person"
        else:
            issues.append("source_age_does_not_establish_a_distinct_person")
    elif not issues and requested == "not_a_plausible_match":
        if review["nameRelationship"] != "weak_fuzzy_only" or same_names:
            issues.append("plausible_name_or_alias_is_not_a_weak_fuzzy_only_suggestion")
        elif not _complete_names(case["originalNames"] + review["originalNames"]):
            issues.append("incomplete_names_cannot_clear_a_weak_suggestion")
        else:
            outcome = "not_a_plausible_match"
    return {"ref": review["ref"], "outcome": outcome, "requestedDisposition": requested,
            "nameRelationship": review["nameRelationship"], "originalNames": review["originalNames"],
            "rationale": review["rationale"], "evidenceIds": review["evidenceIds"],
            "ageComparison": comparison, "holdReasons": sorted(set(issues)),
            "identityVerified": False}


def evaluate_review(manifest):
    """Validate an explicit review. Evidence file bytes are checked by the CLI."""
    fields(manifest, {"schemaVersion", "policyVersion", "reviewedBy", "reviewedAt", "evidenceFiles",
                      "bindings", "snapshotFingerprint", "cases"}, "review manifest")
    require(type(manifest["schemaVersion"]) is int and manifest["schemaVersion"] == SCHEMA_VERSION
            and manifest["policyVersion"] == POLICY_VERSION,
            "Unsupported reviewed identity policy version")
    text(manifest["reviewedBy"], "reviewer")
    timestamp = dt.datetime.fromisoformat(text(manifest["reviewedAt"], "review time").replace("Z", "+00:00"))
    require(timestamp.tzinfo is not None, "Review time requires a timezone")
    text(manifest["snapshotFingerprint"], "snapshot fingerprint")
    require(isinstance(manifest["evidenceFiles"], list), "Missing evidence files")
    available = set()
    for evidence in manifest["evidenceFiles"]:
        fields(evidence, {"id", "path", "sha256"}, "evidence file")
        text(evidence["id"], "evidence file ID")
        text(evidence["path"], "evidence file path")
        sha256(evidence["sha256"], "evidence file")
        require(evidence["id"] not in available, "Repeated evidence file ID")
        available.add(evidence["id"])
    fields(manifest["bindings"], {"snapshot", "candidateState", "sourceCorpus"}, "review bindings")
    require(set(manifest["bindings"].values()) <= available, "Missing pinned snapshot/state/corpus binding")
    require(isinstance(manifest["cases"], list) and 0 < len(manifest["cases"]) <= 200, "Review 1..200 cases")
    cases, seen = [], set()
    for case in manifest["cases"]:
        fields(case, {"groupId", "groupDigest", "editionDate", "sourceObservationKeys", "originalNames",
                      "sourceEvidenceIds", "sourceEligible", "sourceQualityFlags", "safeguards", "candidateTokens",
                      "sourceCollisionGroupIds", "candidateReviews", "collisionReviews"}, "case")
        group_id = text(case["groupId"], "group ID")
        require(group_id not in seen, "Repeated source group")
        seen.add(group_id)
        sha256(case["groupDigest"], "source group")
        dt.date.fromisoformat(text(case["editionDate"], "edition date"))
        strings(case["sourceObservationKeys"], "source observation keys", nonempty=True)
        strings(case["originalNames"], "incoming original names", nonempty=True)
        _evidence_ids(case["sourceEvidenceIds"], available, "incoming source evidence IDs")
        require(type(case["sourceEligible"]) is bool, "Invalid source eligibility")
        strings(case["sourceQualityFlags"], "source quality flags")
        fields(case["safeguards"], SAFEGUARDS, "safeguard checks")
        require(all(type(value) is bool for value in case["safeguards"].values()), "Invalid safeguard check")
        issues = list(case["sourceQualityFlags"])
        if not case["sourceEligible"]:
            issues.append("source_not_eligible_for_publication")
        issues.extend(key + "_not_satisfied" for key, value in case["safeguards"].items() if not value)
        require(group_id not in case["sourceCollisionGroupIds"], "A source group cannot be its own collision")
        reviewed = {}
        for list_key, expected_key in (("candidateReviews", "candidateTokens"), ("collisionReviews", "sourceCollisionGroupIds")):
            strings(case[expected_key], expected_key)
            require(isinstance(case[list_key], list), f"Missing {list_key}")
            reviewed[list_key] = [_judge(value, case, available) for value in case[list_key]]
            refs = [value["ref"] for value in reviewed[list_key]]
            require(len(refs) == len(set(refs)) and set(refs) == set(case[expected_key]),
                    f"Review exactly every {expected_key}; never truncate or omit candidates")
        outcomes = {value["outcome"] for values in reviewed.values() for value in values}
        if "hold" in outcomes:
            issues.append("candidate_or_source_collision_unresolved")
        status = ("hold" if issues else "requires_nonblocking_publisher_adapter" if "not_a_plausible_match" in outcomes
                  else "eligible_distinct_profile_review")
        cases.append({"groupId": group_id, "groupDigest": case["groupDigest"],
                      "sourceObservationKeys": case["sourceObservationKeys"], "originalNames": case["originalNames"],
                      "status": status, "holdReasons": sorted(set(issues)), **reviewed})
    return {"schemaVersion": SCHEMA_VERSION, "policyVersion": POLICY_VERSION,
            "reviewedBy": manifest["reviewedBy"], "reviewedAt": manifest["reviewedAt"],
            "snapshotFingerprint": manifest["snapshotFingerprint"], "bindings": manifest["bindings"],
            "evidenceFiles": manifest["evidenceFiles"], "cases": cases,
            "counts": {status: sum(case["status"] == status for case in cases) for status in
                       ("eligible_distinct_profile_review", "requires_nonblocking_publisher_adapter", "hold")},
            "publicationAuthorized": False, "existingLinksAuthorized": False, "structuralMergesAuthorized": False,
            "sourceVerificationChanged": False, "requiresFreshPublicationValidation": True}
