"""Bounded read-only verification of the completed London 2025 production import.

No queries execute at import. --check-inputs validates local plan/snapshot only.
Private plan, receipt, snapshot and report paths must remain outside this repo.
All database requests use the existing read-only RepeatableRead connection path.
"""
from __future__ import annotations

import argparse
import collections
import datetime as dt
import html
import importlib.util
import json
import os
from pathlib import Path
import re
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parent
BATCH = "london-2025-20261024"
PRODUCTION = "br-flat-unit-aydbwlfk"
PROJECT = "lively-resonance-04577945"


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


apply = load("london_verify_apply", "apply-london-profiles.py")
snapshotter = load("london_verify_snapshot", "snapshot-london-profiles.py")
planner = apply.planner


class VerificationFailure(Exception):
    pass


def require(condition, code):
    if not condition:
        raise VerificationFailure(code)


def private_dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, temporary = tempfile.mkstemp(prefix=path.name + ".", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2, allow_nan=False)
        Path(temporary).replace(path)
    finally:
        Path(temporary).unlink(missing_ok=True)


def chunks(values, size):
    for start in range(0, len(values), size):
        yield values[start:start + size]


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def safe_paths(args):
    for key in ("connection", "plan", "snapshot", "receipt", "output"):
        path = getattr(args, key)
        require(not path.resolve().is_relative_to(ROOT.parent), "private_path_inside_repository")


CAPTURES_SQL = """WITH expected AS (SELECT value p FROM jsonb_array_elements($1::jsonb))
SELECT p->>'sourceKey' expected_key,c.id,
 (c.id IS NOT NULL) capture_exists,
 (md5((to_jsonb(c)-'last_seen_at')::text)=p->>'integrityHash'
  AND c.provider=p->>'provider' AND c.source_key=p->>'sourceKey'
  AND c.payload_hash=p->>'payloadHash' AND c.html_sha256=p->>'rawSha256') exact_retained_capture,
 (c.row_count=(p->>'rowCount')::int AND jsonb_array_length(c.payload->'rows')=c.row_count
  AND c.source_check='compared' AND c.source_url=p->>'sourceUrl'
  AND c.captured_at=(p->>'capturedAt')::timestamptz) capture_metadata,
 (c.payload->>'publication'='staff_only' AND c.payload->>'batchId'=$2
  AND c.audit->>'batchId'=$2 AND c.audit->>'planHash'=$3
  AND c.audit->>'identityVerified'='false' AND c.audit->>'officialResultsVerified'='false'
  AND a.id=p->>'approvalId' AND a.scope='staff_only' AND a.revoked_at IS NULL
  AND a.provider=c.provider AND r.id=(p->>'runId')::uuid AND r.status='completed') private_and_approved,
 (s.index_version=1 AND s.staff_only AND s.expected_rows=c.row_count AND s.indexed_rows=c.row_count
  AND (SELECT count(*) FROM athlete_finder_capture_search_rows actual_index WHERE actual_index.capture_id=c.id)=c.row_count
  AND search.correct_rows=c.row_count) searchable_complete,
 (search.keys=p->'observationKeys' AND search.unique_keys=c.row_count) source_keys_exact
FROM expected
LEFT JOIN result_archive_source_captures c ON c.id=(p->>'id')::bigint
LEFT JOIN result_archive_capture_approvals a ON a.id=c.approval_id
LEFT JOIN result_archive_capture_runs r ON r.id=c.run_id
LEFT JOIN athlete_finder_capture_search_state s ON s.capture_id=c.id
LEFT JOIN LATERAL (
 SELECT count(*) FILTER(WHERE search_row.name_vector=
   to_tsvector('simple',regexp_replace(normalize(left(coalesce(
     item.value->>'name',''),2000),NFKC),'[^[:alnum:]]+',' ','g'))) correct_rows,
 jsonb_agg(item.value->>'sourceKey' ORDER BY item.ordinality) keys,
 count(DISTINCT item.value->>'sourceKey') unique_keys
 FROM jsonb_array_elements(c.payload->'rows') WITH ORDINALITY item(value,ordinality)
 LEFT JOIN athlete_finder_capture_search_rows search_row ON search_row.capture_id=c.id
  AND search_row.row_ordinal=item.ordinality::int
) search ON true"""

NEW_SQL = """WITH expected AS (SELECT value p FROM jsonb_array_elements($1::jsonb))
SELECT p->>'groupId' group_id,a.id,a.slug,
 (a.id IS NOT NULL AND h.athlete_id=a.id) profile_and_history_exist,
 (a.display_name=p#>>'{athleteDraft,displayName}'
  AND a.given_name IS NOT DISTINCT FROM p#>>'{athleteDraft,givenName}'
  AND a.family_name IS NOT DISTINCT FROM p#>>'{athleteDraft,familyName}'
  AND a.gender=coalesce(nullif(p#>>'{athleteDraft,gender}',''),'U')
  AND a.profile_details=p#>'{athleteDraft,profileDetails}') exact_planned_profile,
 (a.profile_visibility='public' AND a.profile_type='Athlete' AND a.parent_athlete_id IS NULL
  AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)) public_unclaimed_profile,
 (a.date_of_birth IS NULL AND a.nation IS NULL AND a.city IS NULL AND a.country='' AND a.county=''
  AND a.club_id IS NULL AND a.second_club_id IS NULL AND a.bio='' AND a.profile_roles=''
  AND a.profile_source_checked_at IS NULL AND a.profile_details->>'athlete_verified'='false'
  AND a.profile_details#>>'{archiveCreation,profileIdentityVerified}'='false'
  AND a.profile_details#>>'{archiveCreation,primarySourceChecked}'='false') no_invented_profile_facts,
 (h.performances=p#>'{history,performances}' AND jsonb_array_length(h.performances)=1
  AND h.performances->0->>'verificationStatus'='unverified'
  AND h.performances->0->'timing'='{"basis":"unknown"}'::jsonb
  AND h.performances->0->>'discipline'='Marathon' AND h.performances->0->>'date'='2025-04-27'
  AND h.performances->0->>'place'='' AND h.performances->0->'places'=
    '{"overall":null,"gender":null,"category":null}'::jsonb) one_exact_unverified_generic_result,
 (h.published_at IS NOT NULL AND NOT h.complete AND h.years_expected=ARRAY[2025] AND h.years_captured=ARRAY[2025]
  AND h.source_url=p#>>'{history,sourceUrl}' AND a.source_url=h.source_url
  AND h.captured_at=(p#>>'{history,capturedAt}')::timestamptz) history_publication_and_capture_date,
 ((SELECT count(*) FROM athlete_source_histories hh WHERE hh.athlete_id=a.id)=1
  AND NOT EXISTS(SELECT 1 FROM results rr WHERE rr.athlete_id=a.id)) no_duplicate_public_result,
 ((SELECT count(*) FROM network_audit_log l
  WHERE l.action='athlete.history_admin_published' AND l.entity_type='athlete_source_history'
  AND l.entity_id='Pace Notes:'||h.external_id AND l.after_value->>'batchId'=$2
  AND l.after_value->>'planHash'=$3 AND l.after_value->>'groupId'=p->>'groupId'
  AND l.after_value->>'athleteId'=a.id::text AND l.after_value->'sourceCaptureIds'=p->'captureIds'
  AND l.after_value->>'sourceCompared'='true' AND l.after_value->>'officialSourceChecked'='false'
  AND l.after_value->>'identityVerified'='false')=1) publication_audit_exact
FROM expected
LEFT JOIN athletes a ON a.slug=p#>>'{athleteDraft,slug}'
LEFT JOIN LATERAL (
 SELECT hx.* FROM athlete_source_histories hx WHERE hx.athlete_id=a.id AND hx.provider='Pace Notes'
 AND hx.external_id=p#>>'{history,externalId}' OFFSET 0
) h ON true"""

AUDITS_SQL = """SELECT id,entity_type,entity_id,after_value FROM network_audit_log
WHERE action='athlete.london2025_evidence_reused' AND after_value->>'batchId'=$1
AND id>$2 ORDER BY id LIMIT 500"""

HISTORY_ORIGINALS_SQL = """SELECT p->>'resultId' verification_result_id,
h.athlete_id,h.provider,h.external_id,h.source_url,h.captured_at::text captured_at,
h.published_at::text published_at,(p->>'ordinal')::bigint ordinal,
h.performances->((p->>'ordinal')::int-1) performance
FROM jsonb_array_elements($1::jsonb) p LEFT JOIN athlete_source_histories h
ON h.athlete_id=(p->>'athleteId')::int AND h.provider=p->>'provider'
AND h.external_id=p->>'externalId'"""


def check_rows(rows, expected_count, key, exempt, failures):
    require(len(rows) == expected_count, "verification_row_count_changed")
    for row in rows:
        bad = [field for field, value in row.items() if field not in exempt and value is not True]
        if bad:
            failures.append({"record": row.get(key), "failedChecks": bad})


def public_checks(base_url, profiles, groups_by_slug):
    url = urllib.parse.urlsplit(base_url)
    require(url.scheme == "https" and url.hostname in ("athrecs.com", "www.athrecs.com", "runrecs.com", "www.runrecs.com") and not url.username and not url.password, "public_check_host_not_allowlisted")
    selected = sorted(profiles, key=lambda row: row["id"])
    indices = sorted({0, len(selected)//2, len(selected)-1}) if selected else []
    checks = []
    for index in indices:
        profile = selected[index]
        group = groups_by_slug[profile["slug"]]
        page_url = base_url.rstrip("/") + "/athletes/" + urllib.parse.quote(profile["slug"], safe="-")
        request = urllib.request.Request(page_url, headers={"User-Agent": "AthRecs-profile-verification/1.0"})
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                raw_document = response.read(6_000_001)
                status = response.status
            require(len(raw_document) <= 6_000_000, "public_page_exceeds_read_limit")
            document = raw_document.decode("utf-8", errors="replace")
            normalized = html.unescape(document).replace("\\/", "/").replace("\\u0026", "&")
            performance = group["history"]["performances"][0]
            private_urls = [source for source in performance.get("sourceUrls", []) if "results.tcslondonmarathon.com" in source or ("marathonguide.com" in source and "result" in source)]
            checks.append({"slug": profile["slug"], "url": page_url, "status": status,
                "hasLicenceCredit": all(part in normalized for part in ("Andrew Kam", "Pace Notes", "https://doi.org/10.6084/m9.figshare.33965155.v3", "https://creativecommons.org/licenses/by/4.0/")),
                "hasUnverifiedLabel": "unverified" in normalized.lower(),
                "hasPerformance": performance["performance"] in normalized or performance["performance"].lstrip("0") in normalized,
                "individualSourceUrlsHidden": all(source not in normalized for source in private_urls),
                "privateArchiveReferenceHidden": '"archiveReference"' not in normalized})
        except Exception as exc:
            checks.append({"slug": profile["slug"], "url": page_url, "errorType": type(exc).__name__})
    return checks


def verify(args):
    safe_paths(args)
    plan = apply.read_json(args.plan)
    planner.validate_plan(plan)
    snapshot_path = args.snapshot / "snapshot.json" if args.snapshot.is_dir() else args.snapshot
    snapshot = apply.read_json(snapshot_path)
    require(plan["batchId"] == BATCH and planner._hash(snapshot) == plan["snapshotDigest"], "plan_snapshot_binding_changed")
    require((snapshot.get("metadata") or {}).get("branchId") == PRODUCTION, "snapshot_is_not_production")
    new_groups = [group for group in plan["groups"] if group["disposition"] == "new"]
    linked_groups = [group for group in plan["groups"] if group["disposition"] == "linked"]
    source_keys = [row["observationKey"] for row in plan["observations"]]
    require(len(source_keys) == 111233 and len(set(source_keys)) == len(source_keys), "source_observation_coverage_changed")
    require(len(linked_groups) == 10608, "reviewed_reuse_count_changed")
    require(all(len(group["resultIds"]) == 1 for group in linked_groups), "reuse_target_not_unique")
    require(len({str(group["athleteId"]) for group in linked_groups}) == len(linked_groups), "reused_athlete_repeated")
    require(len({str(group["resultIds"][0]) for group in linked_groups}) == len(linked_groups), "reused_result_repeated")
    require(len({group["athleteDraft"]["slug"] for group in new_groups}) == len(new_groups), "new_slug_repeated")
    counts = {"plannedNewProfiles": len(new_groups), "plannedReuses": len(linked_groups), "heldGroups": sum(group["disposition"] == "held" for group in plan["groups"]), "sourceObservations": len(source_keys)}
    if args.check_inputs:
        print(json.dumps({"phase": "local_inputs_checked", **counts}), flush=True)
        return
    receipt = apply.read_json(args.receipt)
    plan_hash = planner._hash(plan)
    require(receipt.get("completed") is True and receipt.get("mode") == "production" and receipt.get("branchId") == PRODUCTION and receipt.get("projectId") == PROJECT, "production_receipt_not_complete")
    require(receipt.get("planHash") == plan_hash and receipt.get("batchId") == BATCH, "receipt_plan_binding_changed")
    require(receipt.get("existingDataFingerprintUnchanged") is True and receipt.get("snapshotFingerprint") == snapshot["metadata"]["fingerprint"], "receipt_original_fingerprint_proof_missing")
    require(len(receipt.get("profiles", [])) == len(new_groups) and len(receipt.get("reusedGroups", [])) == len(linked_groups), "receipt_group_counts_changed")
    require(receipt.get("created", 0) + receipt.get("alreadyPresent", 0) == len(new_groups), "receipt_creation_counts_changed")
    capture_receipts = receipt.get("captures") or []
    require(capture_receipts and len({row["source_key"] for row in capture_receipts}) == len(capture_receipts)
            and len({int(row["id"]) for row in capture_receipts}) == len(capture_receipts), "strict_capture_receipts_missing_or_repeated")
    receipt_captures_by_key = {row["source_key"]: row for row in capture_receipts}
    cfg, query = apply.base.connection(args.connection, args.confirm_branch, timeout=70)
    require(cfg["projectId"] == PROJECT and cfg["branchId"] == PRODUCTION and args.confirm_branch == PRODUCTION, "explicit_production_branch_required")

    def read(sql, params):
        require(sql.lstrip().upper().startswith(("SELECT", "WITH")), "non_select_verification_query")
        return query([(sql, params)], True)[0]

    failures = []
    report = {"batchId": BATCH, "projectId": PROJECT, "branchId": PRODUCTION, "planHash": plan_hash,
              "snapshotDigest": plan["snapshotDigest"], "startedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
              "creditDeployment": receipt.get("creditDeployment"),
              "mode": "read_only", "counts": counts, "failures": failures, "passed": False,
              "checks": {"planAndSnapshotBound": True, "completedProductionReceipt": True,
                         "distinctSourceObservationPlan": True, "uniqueReviewedReuseTargets": True}}
    private_dump(args.output, report)

    def checkpoint(name, condition, code):
        report["checks"][name] = bool(condition)
        private_dump(args.output, report)
        require(condition, code)
    evidence = {}
    capture_ids = set()
    run_ids = set()
    pending, expected_capture_count = [], 0

    def verify_captures(parts):
        nonlocal expected_capture_count
        rows = read(CAPTURES_SQL, [encoded(parts), BATCH, plan_hash])
        check_rows(rows, len(parts), "expected_key", {"expected_key", "id"}, failures)
        by_key = {row["expected_key"]: row for row in rows}
        for part in parts:
            row = by_key[part["sourceKey"]]
            if row["id"] is not None:
                require(row["id"] not in capture_ids, "capture_repeated_across_source_parts")
                capture_ids.add(row["id"])
                for key in part["observationKeys"]:
                    require(key not in evidence, "observation_in_multiple_captures")
                    evidence[key] = {"id": row["id"]}
        expected_capture_count += len(parts)

    for part in apply.capture_parts(plan):
        part["approvalId"] = BATCH + "-" + part["providerKey"] + "-owner"
        part["runId"] = str(uuid.uuid5(uuid.NAMESPACE_URL, "https://athrecs.com/imports/" + part["approvalId"]))
        run_ids.add(part["runId"])
        retained = receipt_captures_by_key.get(part["sourceKey"])
        require(retained is not None and retained["provider"] == part["provider"]
                and retained["approval_id"] == part["approvalId"]
                and retained["payload_hash"] == part["payloadHash"] and retained["html_sha256"] == part["rawSha256"]
                and int(retained["row_count"]) == part["rowCount"] and retained["source_check"] == "compared"
                and re.fullmatch(r"[0-9a-f]{32}", retained.get("integrity_hash", "")), "capture_receipt_does_not_match_reconstructed_plan")
        expected = {key: part[key] for key in ("provider", "sourceKey", "sourceUrl", "payloadHash", "rawSha256", "rowCount", "capturedAt", "observationKeys", "approvalId", "runId")}
        expected.update({"id": retained["id"], "integrityHash": retained["integrity_hash"]})
        if len(pending) >= 16:
            verify_captures(pending)
            pending = []
        pending.append(expected)
    if pending:
        verify_captures(pending)
    checkpoint("privateCapturesAndSearchIndexExact", not failures, "private_capture_or_search_verification_failed")
    checkpoint("captureReceiptsBoundToReconstructedPlan", expected_capture_count == len(capture_receipts), "capture_receipt_coverage_changed")
    checkpoint("allSourceObservationsRetainedOnce", set(evidence) == set(source_keys), "capture_observations_incomplete")
    counts.update({"verifiedCaptures": expected_capture_count, "searchableObservations": len(evidence)})
    print(json.dumps({"phase": "private_capture_verification", **counts}), flush=True)

    new_profiles = []
    for batch in chunks(new_groups, args.batch_size):
        expected = [apply.prepare_new(group, evidence, plan) for group in batch]
        rows = read(NEW_SQL, [encoded(expected), BATCH, plan_hash])
        check_rows(rows, len(batch), "group_id", {"group_id", "id", "slug"}, failures)
        new_profiles.extend({"id": row["id"], "slug": row["slug"]} for row in rows)
    checkpoint("newProfileFactsAndUnverifiedTimingExact", not failures, "new_profile_fact_verification_failed")
    checkpoint("newProfilesMatchReceipt", {row["id"] for row in new_profiles} == {row["id"] for row in receipt["profiles"]}, "receipt_new_profile_ids_changed")
    counts["verifiedNewProfiles"] = len(new_profiles)
    print(json.dumps({"phase": "new_profile_verification", "verified": len(new_profiles)}), flush=True)

    linked_by_id = {group["groupId"]: group for group in linked_groups}
    seen_audits, last_audit = set(), 0
    while True:
        rows = read(AUDITS_SQL, [BATCH, last_audit])
        if not rows:
            break
        for audit in rows:
            group_id = (audit.get("after_value") or {}).get("groupId")
            require(group_id in linked_by_id and group_id not in seen_audits, "unexpected_or_duplicate_reuse_audit")
            seen_audits.add(group_id)
            group = linked_by_id[group_id]
            expected = {"groupId": group_id, "athleteId": group["athleteId"], "resultIds": group["resultIds"],
                        "existingMatches": group["existingMatches"], "sourceKeys": group["sourceKeys"], "sourceUrls": group["sourceUrls"],
                        "captureIds": sorted({int(evidence[key]["id"]) for key in group["observationKeys"]}),
                        "batchId": BATCH, "planHash": plan_hash, "ownerInstruction": apply.INSTRUCTION,
                        "identityVerified": False, "existingPerformancePreserved": True}
            if audit["entity_type"] != "athlete" or audit["entity_id"] != str(group["athleteId"]) or audit["after_value"] != expected:
                failures.append({"record": group_id, "failedChecks": ["reuse_audit_exact"]})
        last_audit = rows[-1]["id"]
    require(seen_audits == set(linked_by_id), "reused_evidence_audit_coverage_incomplete")
    checkpoint("reuseAuditsMatchReviewedPlan", not failures, "reused_evidence_audit_verification_failed")

    result_by_id = {str(row["id"]): row for row in snapshot["results"]}
    originals = [result_by_id[str(group["resultIds"][0])] for group in linked_groups]
    history_originals = [row for row in originals if row["sourceKind"] == "history"]
    canonical_originals = [row for row in originals if row["sourceKind"] == "canonical"]
    for batch in chunks(history_originals, args.batch_size):
        wanted = [{"resultId": row["id"], "athleteId": row["athleteId"], "provider": row["historyIdentity"]["provider"],
                   "externalId": row["historyIdentity"]["externalId"], "ordinal": row["historyIdentity"]["performanceOrdinal"]} for row in batch]
        actual = read(HISTORY_ORIGINALS_SQL, [encoded(wanted)])
        require(len(actual) == len(wanted), "original_history_missing")
        for row in actual:
            identifier = row.pop("verification_result_id")
            if row != result_by_id[identifier]["original"]:
                failures.append({"record": identifier, "failedChecks": ["original_history_changed"]})
    if canonical_originals:
        ids = [row["canonicalResultId"] for row in canonical_originals]
        actual = read("SELECT * FROM (" + snapshotter.RESULTS_SQL + ") scoped WHERE id=ANY($2::int[])", [BATCH, ids])
        before = {row["canonicalResultId"]: row["original"] for row in canonical_originals}
        require(len(actual) == len(ids), "original_canonical_result_missing")
        for row in actual:
            if row != before[row["id"]]:
                failures.append({"record": "canonical:" + str(row["id"]), "failedChecks": ["original_canonical_result_changed"]})
    athletes_before = {int(row["id"]): row for row in snapshot["athletes"]}
    existing_ids = sorted({int(group["athleteId"]) for group in linked_groups})
    for batch in chunks(existing_ids, args.batch_size):
        actual = read(snapshotter.ATHLETES_SQL + " AND a.id=ANY($2::int[])", [BATCH, batch])
        require(len(actual) == len(batch), "original_athlete_missing")
        for row in actual:
            if snapshotter.athlete_record(row) != athletes_before[row["id"]]:
                failures.append({"record": row["id"], "failedChecks": ["existing_athlete_matching_or_visibility_facts_changed"]})
    checkpoint("originalPerformancesAndProfileFactsUnchanged", not failures, "existing_performance_or_profile_changed")
    counts.update({"verifiedReusedAthletes": len(existing_ids), "unchangedHistoryPerformances": len(history_originals), "unchangedCanonicalResults": len(canonical_originals)})

    # These small original-state parts include ownership and sharing decisions;
    # do not rehash the entire athlete directory for this post-import check.
    privacy_parts = {"accounts", "links", "shares", "historyChoices", "hiddenSourceResults"}
    privacy_hashes = {}
    for name, sql, order in snapshotter.PARTS:
        if name not in privacy_parts:
            continue
        sql_hash = "SELECT md5(coalesce(string_agg(md5(to_jsonb(t)::text),'' ORDER BY " + order + "),'')) fingerprint FROM (" + sql + ") t"
        actual = read(sql_hash, [BATCH] if "$1" in sql else [])[0]["fingerprint"]
        privacy_hashes[name] = actual == snapshot["metadata"]["partHashes"][name]
    report["privacyStateChecks"] = privacy_hashes
    checkpoint("originalOwnershipAndPrivacyStateUnchanged", set(privacy_hashes) == privacy_parts and all(privacy_hashes.values()), "ownership_or_privacy_state_changed")

    totals = read("""SELECT
      (SELECT count(*)::int FROM athletes WHERE id=ANY($2::int[]) AND profile_details#>>'{archiveCreation,batchId}'=$1) profiles,
      (SELECT count(*)::int FROM athlete_source_histories h WHERE h.provider='Pace Notes' AND h.performances @>
        jsonb_build_array(jsonb_build_object('archiveReference',jsonb_build_object('batchId',$1::text)))) histories,
      (SELECT count(*)::int FROM network_audit_log l JOIN athlete_source_histories h
       ON l.entity_id='Pace Notes:'||h.external_id AND h.provider='Pace Notes'
       WHERE h.athlete_id=ANY($2::int[]) AND l.action='athlete.history_admin_published'
       AND l.entity_type='athlete_source_history' AND l.after_value->>'batchId'=$1) publication_audits,
      (SELECT count(*)::int FROM result_archive_source_captures WHERE run_id=ANY($3::uuid[])) captures""", [BATCH, [row["id"] for row in new_profiles], sorted(run_ids)])[0]
    totals["reuse_audits"] = len(seen_audits)
    report["batchTotals"] = totals
    checkpoint("batchCountsAndNoDuplicateRows", totals == {"profiles": len(new_groups), "histories": len(new_groups), "publication_audits": len(new_groups), "reuse_audits": len(linked_groups), "captures": expected_capture_count}, "batch_totals_or_duplicate_rows_changed")
    report["examples"] = [new_profiles[index] for index in sorted({0, len(new_profiles)//2, len(new_profiles)-1})] if new_profiles else []
    if args.public_base_url:
        checks = public_checks(args.public_base_url, new_profiles, {group["athleteDraft"]["slug"]: group for group in new_groups})
        report["publicChecks"] = checks
        checkpoint("publicProfileSamples", all(row.get("status") == 200 and all(row.get(field) is True for field in ("hasLicenceCredit", "hasUnverifiedLabel", "hasPerformance", "individualSourceUrlsHidden", "privateArchiveReferenceHidden")) for row in checks), "public_profile_read_verification_failed")
    report.update({"passed": True, "completedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
                   "originalDatePrecisionPreserved": True, "newVerificationUpgrades": 0,
                   "privateSourceObservationsDistinct": len(evidence), "fullDirectoryRefetched": False})
    private_dump(args.output, report)
    print(json.dumps({"phase": "verification_complete", "passed": True, **counts, "examples": report["examples"]}), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("connection", "plan", "snapshot", "receipt", "output"):
        parser.add_argument("--" + name, type=Path, required=True)
    parser.add_argument("--confirm-branch", required=True)
    parser.add_argument("--check-inputs", action="store_true")
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--public-base-url")
    args = parser.parse_args()
    if not 1 <= args.batch_size <= 1000:
        parser.error("Use bounded batches of 1–1000")
    try:
        verify(args)
    except Exception as exc:
        # Keep query inputs, source names, URLs and credentials out of logs.
        error = str(exc) if isinstance(exc, VerificationFailure) else type(exc).__name__
        if not args.check_inputs and not args.output.resolve().is_relative_to(ROOT.parent):
            prior = apply.read_json(args.output) if args.output.exists() else {}
            private_dump(args.output, {"checks": {}, "counts": {}, "examples": [], **prior, "passed": False, "errorCode": error,
                                      **({"privateDiagnostic": str(exc)[:400]} if not isinstance(exc, VerificationFailure) else {}),
                                      "failedAt": dt.datetime.now(dt.timezone.utc).isoformat()})
        print(json.dumps({"phase": "verification_failed", "errorCode": error}), flush=True)
        raise SystemExit(1)
