"""Read-only, streamed London 2025 duplicate-screening snapshot.

Private outputs and connection files belong outside the repository. The SQL
fingerprint is reusable under table locks before publication. New rows from this
batch are excluded only by their explicit archiveCreation/archiveReference marker.
"""

import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import pathlib
import re
import time
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent
BATCH = "london-2025-20261024"
PRODUCTION_BRANCH = "br-flat-unit-aydbwlfk"
PROJECT = "lively-resonance-04577945"
EDITION_IDS = (71613035, 109240293, 109241811)
FINGERPRINT_TABLES = (
    'athletes', '"user"', 'athlete_private_profiles', 'athlete_account_links',
    'results', 'editions', 'events', 'result_source_references', 'athlete_source_histories',
    'athlete_public_shares', 'athlete_profile_history_choices',
    'athlete_profile_hidden_source_results', 'source_history_claim_results',
)


def load_module(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


base = load_module("london_snapshot_connection", "create-private-archive-profiles.py")
plan = load_module("london_snapshot_plan", "lib/london-profile-plan.py")

ATHLETES_SQL = """SELECT a.id,a.slug,a.display_name,a.given_name,a.family_name,
 a.race_entry_name,a.gender,a.nation,a.date_of_birth::text date_of_birth,
 a.profile_visibility,a.profile_type,a.parent_athlete_id,
 a.profile_details#>>'{nameReview,mode}' name_review_mode,
 jsonb_strip_nulls(jsonb_build_object(
 'aliases',a.profile_details->'aliases','nameAliases',a.profile_details->'nameAliases',
 'previous_names',a.profile_details->'previous_names',
 'research_name_variants',a.profile_details->'research_name_variants',
 'canonicalName',a.profile_details->'canonicalName','sourceName',a.profile_details->'sourceName',
 'requestedName',a.profile_details->'requestedName')) name_details
 FROM athletes a
 WHERE a.profile_details#>>'{archiveCreation,batchId}' IS DISTINCT FROM $1"""

ACCOUNTS_SQL = """SELECT u.id,u.name,p.full_name,p.display_name,p.previous_names
 FROM "user" u LEFT JOIN athlete_private_profiles p ON p.user_id=u.id"""
LINKS_SQL = "SELECT athlete_id,user_id,status FROM athlete_account_links"
SHARES_SQL = "SELECT user_id,enabled,share_bio,share_results,share_club,share_location FROM athlete_public_shares"
CHOICES_SQL = "SELECT user_id,athlete_id,provider,external_id,performance_hash,excluded FROM athlete_profile_history_choices"
HIDDEN_SQL = """SELECT h.user_id,h.source_result_id,s.athlete_id,s.provider,s.external_id,s.source_key
 FROM athlete_profile_hidden_source_results h JOIN source_history_claim_results s ON s.id=h.source_result_id"""

RESULTS_SQL = """SELECT r.id,r.athlete_id,r.edition_id,r.status,
 r.finish_time_seconds,r.chip_time_seconds,r.gun_time_seconds,r.bib,
 r.overall_place,r.gender_place,r.category_place,r.category,
 r.source_url,r.result_source,r.result_visibility,r.result_details,
 d.event_date::text event_date,d.distance_code,d.distance_km,
 e.name event_name,e.slug event_slug,
 coalesce((SELECT jsonb_agg(jsonb_build_object('url',s.source_url,'name',s.source_name)
 ORDER BY s.source_url) FROM result_source_references s WHERE s.result_id=r.id),'[]'::jsonb) source_references
 FROM results r JOIN editions d ON d.id=r.edition_id JOIN events e ON e.id=d.event_id
 WHERE r.edition_id IN (71613035,109240293,109241811)
 AND r.result_details#>>'{archiveReference,batchId}' IS DISTINCT FROM $1"""

# The year is a filter only in combination with London event text. In particular,
# a global history's years_captured containing 2025 never establishes an edition.
HISTORIES_SQL = r"""SELECT h.athlete_id,h.provider,h.external_id,h.source_url,
 h.captured_at::text captured_at,h.published_at::text published_at,
 p.ordinal,p.performance
 FROM athlete_source_histories h
 CROSS JOIN LATERAL jsonb_array_elements(h.performances) WITH ORDINALITY p(performance,ordinal)
 WHERE p.performance#>>'{archiveReference,batchId}' IS DISTINCT FROM $1
 AND (
   ((coalesce(p.performance->>'meeting','')||' '||coalesce(p.performance->>'eventSlug','')) ~* 'london'
     AND (p.performance->>'year'='2025' OR p.performance->>'date' LIKE '2025-%'
       OR coalesce(p.performance->>'yearLabel','') ~ '(^|[^0-9])2025([^0-9]|$)'))
   OR h.source_url ~* '^https?://results\.(tcslondonmarathon|virginmoneylondonmarathon)\.com/2025(/|[?#]|$)'
   OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(
       CASE WHEN jsonb_typeof(p.performance->'sourceUrls')='array'
       THEN p.performance->'sourceUrls' ELSE '[]'::jsonb END) u(url)
     WHERE u.url ~* '^https?://results\.(tcslondonmarathon|virginmoneylondonmarathon)\.com/2025(/|[?#]|$)')
 )"""

PARTS = (
    ("athletes", ATHLETES_SQL, "id"),
    ("accounts", ACCOUNTS_SQL, "id"),
    ("links", LINKS_SQL, "athlete_id,user_id"),
    ("results", RESULTS_SQL, "id"),
    ("histories", HISTORIES_SQL, "athlete_id,provider,external_id,ordinal"),
    ("shares", SHARES_SQL, "user_id"),
    ("historyChoices", CHOICES_SQL, "user_id,athlete_id,provider,external_id,performance_hash"),
    ("hiddenSourceResults", HIDDEN_SQL, "user_id,source_result_id"),
)


def fingerprint_sql():
    """Parameter $1 is this immutable batch ID; call under FINGERPRINT_TABLES locks."""
    parts = [
        "(SELECT md5(coalesce(string_agg(md5(to_jsonb(t)::text),'' ORDER BY "
        + order + "),'')) FROM (" + sql + ") t)"
        for _, sql, order in PARTS
    ]
    return "SELECT md5(" + " || ".join(parts) + ") AS fingerprint"


def hashed_rows_sql(sql, order):
    return "SELECT t.*,md5(to_jsonb(t)::text) row_hash FROM (" + sql + ") t ORDER BY " + order


def digest_rows(rows):
    digest = hashlib.md5()
    for row in rows:
        digest.update(row.pop("row_hash").encode("ascii"))
    return digest.hexdigest()


def dump(path, value):
    temporary = path.with_suffix(path.suffix + ".writing")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    temporary.chmod(0o600)
    temporary.replace(path)


def progress(**value):
    print(json.dumps(value, ensure_ascii=False), flush=True)


def athlete_record(row):
    names = [row["display_name"], row.get("race_entry_name"),
             " ".join([row.get("given_name") or "", row.get("family_name") or ""])]
    for value in (row.get("name_details") or {}).values():
        names.extend(plan._screen.finder.names_from(value))
    aliases = sorted({name for name in names if isinstance(name, str) and name.strip()})
    return {
        "id": row["id"], "slug": row["slug"], "displayName": row["display_name"],
        "aliases": aliases, "gender": row["gender"], "nationality": row.get("nation"),
        "dateOfBirth": row.get("date_of_birth"), "visibility": row["profile_visibility"],
        "profileType": row["profile_type"], "parentAthleteId": row.get("parent_athlete_id"),
        "nameReviewMode": row.get("name_review_mode"),
    }


def seconds(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d+:[0-5]\d:[0-5]\d(?:\.\d+)?", value):
        return None
    h, m, s = map(float, value.split(":"))
    result = h * 3600 + m * 60 + s
    return int(result) if result.is_integer() else result


def source_urls(value):
    """Retain supplied URL strings in private snapshot evidence; never construct a locator."""
    found = set()
    if isinstance(value, str):
        if re.match(r"^https?://", value):
            found.add(value)
    elif isinstance(value, dict):
        for key, item in value.items():
            if key.lower() in {"url", "sourceurl", "source_url", "sourceurls", "source_urls", "original"}:
                found.update(source_urls(item))
            elif isinstance(item, (dict, list)):
                found.update(source_urls(item))
    elif isinstance(value, list):
        for item in value:
            found.update(source_urls(item))
    return found


def normalize_result(row, kind):
    if kind == "canonical":
        times = [row.get(field) for field in ("finish_time_seconds", "chip_time_seconds", "gun_time_seconds")]
        return {
            "id": "canonical:" + str(row["id"]), "canonicalResultId": row["id"],
            "athleteId": row["athlete_id"], "editionId": row["edition_id"],
            "date": row["event_date"], "distanceCode": row["distance_code"],
            "distanceKm": row["distance_km"], "eventName": row["event_name"], "eventSlug": row["event_slug"],
            "finishSeconds": row.get("finish_time_seconds"), "timeSeconds": sorted({t for t in times if t is not None and t > 0}),
            "sourceUrls": sorted(source_urls(row)), "category": row.get("category"),
            "sourceKind": kind, "status": row["status"], "visibility": row["result_visibility"],
            "original": row,
        }
    performance = row["performance"]
    urls = source_urls(performance) | source_urls(row["source_url"])
    marathon = str(performance.get("discipline") or "").strip().lower() in {"marathon", "42.195km", "42.195 km"}
    london = bool(re.search(r"\blondon\s+marathon\b", str(performance.get("meeting") or ""), re.I)) or performance.get("eventSlug") == "london-marathon"
    exact_date = performance.get("date") == "2025-04-27"
    official_url = any(re.match(r"^https?://results\.(?:tcslondonmarathon|virginmoneylondonmarathon)\.com/2025(?:/|[?#]|$)", url, re.I) for url in urls)
    compatible_edition = performance.get("date") in (None, "", "2025-04-27") and str(performance.get("year")) == "2025"
    explicit_edition = marathon and ((london and exact_date) or (official_url and compatible_edition))
    identity = [row["athlete_id"], row["provider"], row["external_id"], row["ordinal"]]
    finish = seconds(performance.get("performance"))
    timing = performance.get("timing") or {}
    times = {value for value in [finish, seconds(timing.get("chip")), seconds(timing.get("gun"))] if value is not None and value > 0}
    return {
        "id": "history:" + hashlib.sha256(json.dumps(identity, ensure_ascii=False).encode()).hexdigest(),
        "athleteId": row["athlete_id"], "editionId": EDITION_IDS[0] if explicit_edition else None,
        "date": performance.get("date"), "year": performance.get("year"),
        "distanceCode": performance.get("discipline"), "distanceKm": 42.195 if marathon else None,
        "eventName": performance.get("meeting"), "eventSlug": performance.get("eventSlug"),
        "editionEvidence": "exact_date_event_distance" if marathon and london and exact_date else "official_edition_url" if explicit_edition else "year_event_candidate_only",
        "finishSeconds": finish, "timeSeconds": sorted(times), "sourceUrls": sorted(urls),
        "category": performance.get("ageGroup"), "sourceKind": "history", "provider": row["provider"],
        "profileExcluded": performance.get("profileExcluded", False),
        "historyIdentity": {"athleteId": row["athlete_id"], "provider": row["provider"], "externalId": row["external_id"], "performanceOrdinal": row["ordinal"]},
        "original": row,
    }


def snapshot(args):
    args.output.mkdir(parents=True, exist_ok=True)
    args.output.chmod(0o700)
    if ROOT.parent.resolve() in args.output.resolve().parents:
        raise ValueError("Private snapshot output must be outside the repository")
    observations = plan.load_sources(args.source)
    allowed_keys = {key for observation in observations for key in plan.candidate_name_keys(observation["name"])}
    progress(phase="source_keys_ready", sourceObservations=len(observations), allowedNameKeys=len(allowed_keys))
    del observations
    cfg, query = base.connection(args.connection, args.confirm_branch, timeout=120)
    if cfg["projectId"] != PROJECT:
        raise ValueError("Wrong project")
    started = dt.datetime.now(dt.timezone.utc).isoformat()
    begin = time.monotonic()
    data = query([
        ("SELECT count(*) count,coalesce(max(id),0) max_id FROM (" + ATHLETES_SQL + ") t", [args.batch]),
        *[(hashed_rows_sql(sql, order), [args.batch] if "$1" in sql else []) for _, sql, order in PARTS[1:]],
    ], True)
    counts = data[0]
    by_part = {name: rows for (name, _, _), rows in zip(PARTS[1:], data[1:])}
    account_rows, link_rows = by_part["accounts"], by_part["links"]
    canonical_rows, history_rows = by_part["results"], by_part["histories"]
    maximum = int(counts[0]["max_id"])
    part_hashes = {name: digest_rows(rows) for (name, _, _), rows in zip(PARTS[1:], data[1:])}
    results = [normalize_result(row, "canonical") for row in canonical_rows]
    results.extend(normalize_result(row, "history") for row in history_rows)
    required_ids = {int(row["athleteId"]) for row in results}
    active_links = {}
    for row in link_rows:
        if row["status"] == "active":
            active_links.setdefault(row["user_id"], []).append(row["athlete_id"])
    accounts = [{"id": row["id"], "names": sorted({name for value in [row.get("name"), row.get("full_name"), row.get("display_name"), row.get("previous_names")] for name in plan._screen.finder.names_from(value)}),
                 "linkedAthleteIds": sorted(active_links.get(row["id"], []))} for row in account_rows]
    progress(phase="scoped_records_ready", directoryCount=int(counts[0]["count"]), accounts=len(accounts), canonicalResults=len(canonical_rows), historyPerformances=len(history_rows), historyProviders=dict(Counter(row["provider"] for row in history_rows)))
    athletes = []
    directory_digest = hashlib.md5()
    scanned = last = 0
    while last < maximum:
        page_sql = ATHLETES_SQL + " AND a.id>$2 AND a.id<=$3 ORDER BY a.id LIMIT 20000"
        page = query([(hashed_rows_sql(page_sql, "id"), [args.batch, last, maximum])], True)[0]
        if not page:
            break
        for row in page:
            directory_digest.update(row.pop("row_hash").encode("ascii"))
            athlete = athlete_record(row)
            if athlete["id"] in required_ids or plan.snapshot_name_keys(athlete) & allowed_keys:
                athletes.append(athlete)
        scanned += len(page)
        last = page[-1]["id"]
        progress(phase="directory_page", scanned=scanned, retained=len(athletes), maximum=maximum, elapsedSeconds=round(time.monotonic()-begin, 1))
    if scanned != int(counts[0]["count"]):
        raise ValueError("Directory count changed during read; snapshot was not finalized")
    part_hashes["athletes"] = directory_digest.hexdigest()
    expected = hashlib.md5("".join(part_hashes[name] for name, _, _ in PARTS).encode("ascii")).hexdigest()
    # This final scan returns only one digest, never a second directory/history download.
    live = query([(fingerprint_sql(), [args.batch])], True)[0][0]["fingerprint"]
    if live != expected:
        dump(args.output / "stale-snapshot-diagnostic.private.json", {"expected": expected, "actual": live, "partHashes": part_hashes, "scanned": scanned})
        raise ValueError("Relevant source data changed during snapshot; no usable snapshot finalized")
    by_id = {row["id"]: row for row in athletes}
    for result in results:
        owner = by_id.get(result["athleteId"])
        if not owner:
            raise ValueError("A scoped result has no retained athlete")
        result.update({"gender": owner["gender"], "nationality": owner.get("nationality"), "dateOfBirth": owner.get("dateOfBirth")})
    output = {"athletes": athletes, "accounts": accounts, "results": results,
              "privacy": {name: by_part[name] for name in ("shares", "historyChoices", "hiddenSourceResults")},
              "metadata": {"snapshotAt": started, "completedAt": dt.datetime.now(dt.timezone.utc).isoformat(), "branchId": cfg["branchId"], "projectId": cfg["projectId"], "batchId": args.batch, "fingerprint": expected, "partHashes": part_hashes, "directoryScanned": scanned, "directoryMaximumId": maximum, "allowedNameKeys": len(allowed_keys), "scope": "All directory names/aliases; accounts/links; reviewed London2025 canonical editions and London2025 candidate history performances. Year-only histories have no inferred edition date."}}
    dump(args.output / "snapshot.json", output)
    summary = {**output["metadata"], "counts": {"athletes": len(athletes), "accounts": len(accounts), "results": len(results), "canonicalResults": len(canonical_rows), "historyPerformances": len(history_rows)}, "historyProviders": dict(Counter(row["provider"] for row in history_rows)), "editionEvidence": dict(Counter(row.get("editionEvidence", "canonical") for row in results))}
    dump(args.output / "metadata.json", summary)
    (args.output / "fingerprint.sql").write_text(fingerprint_sql() + ";\n")
    (args.output / "fingerprint.sql").chmod(0o600)
    progress(phase="snapshot_complete", **summary)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--connection", type=pathlib.Path, required=True)
    parser.add_argument("--confirm-branch", required=True)
    parser.add_argument("--source", type=pathlib.Path, required=True)
    parser.add_argument("--output", type=pathlib.Path, required=True)
    parser.add_argument("--batch", default=BATCH)
    snapshot(parser.parse_args())
