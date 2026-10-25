"""Pure, conservative London source-profile planning. No network or DB writes.

configure(context=None) selects a frozen edition or restores legacy London 2025.

Public API: load_sources(input_dir), build_plan(observations, snapshot, edition,
batch_id, created_at, review_manifest=None, review_approval=None),
validate_plan(plan, snapshot=None). The two row normalizers are also
exported for focused synthetic verification. The loader checks the retained
raw files and independently compares the mapped fields with both saved CSVs.

Snapshot contract:
  athletes: [{id, displayName, aliases: [], gender?, nationality?, dateOfBirth?}]
  results: [{id, athleteId, editionId, sourceUrls: [], finishSeconds?,
             timeSeconds?: [], gender?, nationality?, category?, sourceKind?}]
  accounts: [{id, names: [], linkedAthleteIds: []}]

Result IDs, idp tokens and source keys are result locators, never athlete IDs.
Only strict full-name/time source pairs are combined. Broad name keys screen
for review; they never establish identity. An existing result can be reused
only through its exact retained locator, edition, time and compatible identity
facts. New profiles require a licensed Pace Notes observation. MarathonGuide-
only observations and unresolved identities remain held in private evidence.
An explicit frozen independent review plus root approval can resolve named
same-performance associations; this adds evidence without altering the existing
performance's fields, date precision, identity or verification status.
"""

from __future__ import annotations

import copy
import csv
import datetime as dt
import hashlib
import importlib.util
import json
import math
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit


PACE = "pace-notes"
GUIDE = "marathonguide"
PACE_NAME = "Pace Notes"
PACE_CREDIT = "Andrew Kam / Pace Notes"
PACE_PUBLICATION = "https://figshare.com/articles/dataset/Pace_Notes_marathon_race_results_corpus_5_km_splits_/33965155"
GUIDE_PUBLICATION = "https://marathonguide.com/races/run/london-marathon-21/2025/results/"
EDITION_KEY = "london-marathon:2025"
PACE_COLUMNS = [
    "id", "race", "year", "city", "runner", "sex", "age", "age_group",
    "split_5km", "split_10km", "split_15km", "split_20km", "split_25km",
    "split_30km", "split_35km", "split_40km", "split_42_2km", "source_url",
    "ingested_at", "age_or_group",
]
GUIDE_HEADINGS = ["Place", "Full Name", "Distance", "Final Time", "Gender", "BQ", "Actions"]
QUALITY_FLAG_FIELDS = (
    "dnf_split_as_finish", "split_nonmonotonic", "last_split_after_finish",
    "pace_implausible", "shifted_mat", "age_is_group_floor",
    "sex_fixed_from_category", "splits_corrected",
)
INPUT_SHA256 = {
    "raw/pace_notes_2025.jsonl": "70fbeafda57d5800edec01da89913ddc02583ae11fd2cb26906863661453da8c",
    "raw/pace_notes_schema.json": "221578972fbf0436f1eebb9f4e4d423a76000751c26941e4a074a511fbcf5c7d",
    "raw/pace_notes_metadata.json": "dd411cddefc320e4fbfa856d9feb225476ac8e0249dbebf45597c6d3b6262eef",
    "raw/marathonguide_pages.json": "aa77e2759ee8dc8fecdd6451576cb4393f3824f6559396bf650b5154e32f751f",
    "London_Marathon_2025_Pace_Notes.csv": "d7dfe58e3468bcccb3311f02ba877e8237f564ce2e17b0849911171cd5b451ba",
    "London_Marathon_2025_MarathonGuide.csv": "532033fba6555238ea6edf9ea02e51567172c92d31387f01b7eba32e58caf99f",
}
SOURCE_ATTRIBUTION = [
    {
        "provider": PACE,
        "credit": PACE_CREDIT,
        "publicationUrl": PACE_PUBLICATION,
        "doi": "https://doi.org/10.6084/m9.figshare.33965155.v3",
        "release": "private-export-20261021-1050",
        "licence": "CC BY 4.0",
        "licenceUrl": "https://creativecommons.org/licenses/by/4.0/",
        "publicLicenceAttributionRequired": True,
        "changes": "Mapped retained name components, represented the published time as a generic finish time, and grouped unique exact name/time cross-source observations. No official-result verification was added.",
        "sourceVerification": "unverified_secondary_source",
        "coverage": "Partial publisher edition; whole-race completeness not established.",
    },
    {
        "provider": GUIDE,
        "credit": "MarathonGuide",
        "publicationUrl": GUIDE_PUBLICATION,
        "licence": None,
        "publicLicenceAttributionRequired": False,
        "reuseReview": "No open bulk-reuse licence established; standalone observations are held.",
        "sourceVerification": "unverified_secondary_source",
        "coverage": "All 56,186 records in the observed published archive; whole-race completeness not established.",
    },
]

# Legacy defaults remain byte-for-byte compatible with the reviewed 2025 plan.
# New editions require their complete retained-source configuration.
YEAR = 2025
DATE = "2025-04-27"
PACE_RECORDS = 55047
GUIDE_RECORDS = 56186
GUIDE_SUBEVENT = "694227"
PACE_ROWS_FILE = "raw/pace_notes_2025.jsonl"
PACE_CSV_FILE = "London_Marathon_2025_Pace_Notes.csv"
GUIDE_CSV_FILE = "London_Marathon_2025_MarathonGuide.csv"
EDITION_CONTEXT = None
_LEGACY_INPUT_SHA256 = copy.deepcopy(INPUT_SHA256)
_LEGACY_SOURCE_ATTRIBUTION = copy.deepcopy(SOURCE_ATTRIBUTION)
_context_spec = importlib.util.spec_from_file_location("london_planner_context", Path(__file__).with_name("london-edition-context.py"))
_context = importlib.util.module_from_spec(_context_spec)
_context_spec.loader.exec_module(_context)


def configure(context=None):
    """Select one validated edition; None restores the original 2025 adapter."""
    global YEAR, DATE, EDITION_KEY, GUIDE_PUBLICATION, GUIDE_SUBEVENT
    global PACE_RECORDS, GUIDE_RECORDS, PACE_ROWS_FILE, PACE_CSV_FILE, GUIDE_CSV_FILE
    global INPUT_SHA256, SOURCE_ATTRIBUTION, EDITION_CONTEXT
    context = _context.validate_context(context) if context is not None else None
    EDITION_CONTEXT = context
    YEAR = context["year"] if context else 2025
    DATE = context["date"] if context else "2025-04-27"
    EDITION_KEY = f"london-marathon:{YEAR}"
    GUIDE_PUBLICATION = context["guidePublication"] if context else _LEGACY_SOURCE_ATTRIBUTION[1]["publicationUrl"]
    GUIDE_SUBEVENT = context["guideSubevent"] if context else "694227"
    PACE_RECORDS = context["paceRecords"] if context else 55047
    GUIDE_RECORDS = context["guideRecords"] if context else 56186
    PACE_ROWS_FILE = context["paceRowsFile"] if context else "raw/pace_notes_2025.jsonl"
    PACE_CSV_FILE = context["paceCsvFile"] if context else "London_Marathon_2025_Pace_Notes.csv"
    GUIDE_CSV_FILE = context["guideCsvFile"] if context else "London_Marathon_2025_MarathonGuide.csv"
    INPUT_SHA256 = copy.deepcopy(context["inputSha256"] if context else _LEGACY_INPUT_SHA256)
    SOURCE_ATTRIBUTION = copy.deepcopy(_LEGACY_SOURCE_ATTRIBUTION)
    if context:
        SOURCE_ATTRIBUTION[1]["publicationUrl"] = GUIDE_PUBLICATION
        SOURCE_ATTRIBUTION[1]["coverage"] = f"All {GUIDE_RECORDS:,} records in the observed published archive; whole-race completeness not established."
    return copy.deepcopy(context)


# Reuse the earlier supervised profile-import screening rules. These modules
# contain definitions only at import; no network or database work is invoked.
_screen_path = Path(__file__).resolve().parents[1] / "prepare-wmm-profiles.py"
_screen_spec = importlib.util.spec_from_file_location("london_name_screen", _screen_path)
_screen = importlib.util.module_from_spec(_screen_spec)
_screen_spec.loader.exec_module(_screen)


def _text(value):
    return "" if value is None else str(value)


def _clean(value):
    return " ".join(unicodedata.normalize("NFC", _text(value)).split())


def name_key(value):
    """Strict comparison key; punctuation and diacritics are deliberately kept."""
    return _clean(value).casefold()


def screening_name_keys(value):
    """Possible duplicate keys, never an identity or source-pairing rule."""
    return set(_screen.name_keys(value))


def candidate_name_keys(value):
    """Public alias for streaming only potentially relevant directory rows."""
    return screening_name_keys(value)


def snapshot_name_keys(athlete):
    """Union of the exact same screen applied by build_plan to this athlete."""
    return {key for name in _names(athlete) for key in screening_name_keys(name)}


def _hash(value):
    digest = hashlib.sha256()
    for part in json.JSONEncoder(ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).iterencode(value):
        digest.update(part.encode("utf-8"))
    return digest.hexdigest()


def _file_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _timestamp(value):
    value = _text(value)
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("A capture timestamp must include its time zone")
    return value


def parse_finish_time(value):
    """Preserve integer-second source precision without assigning chip/gun."""
    value = _text(value)
    match = re.fullmatch(r"(\d{1,3}):([0-5]\d):([0-5]\d)", value)
    if not match:
        raise ValueError("Expected an explicit HH:MM:SS published finish time")
    hours, minutes, seconds = map(int, match.groups())
    total = hours * 3600 + minutes * 60 + seconds
    if total <= 0:
        raise ValueError("A completed finish must have a positive published time")
    return f"{hours:02}:{minutes:02}:{seconds:02}", total


def _gender(value):
    key = _text(value).strip().casefold()
    return {"m": "M", "male": "M", "f": "F", "female": "F"}.get(key)


def _source_key(provider, scope, result_id):
    return f"{EDITION_KEY}:{provider}:{scope}:{result_id}"


def _name_flags(name, given=None, family=None):
    flags = []
    tokens = _screen.norm(name).split()
    if len(tokens) < 2 or any(len(x) == 1 for x in (tokens[:1] + tokens[-1:])):
        flags.append("incomplete_source_name")
    if given is not None and (not _clean(given) or not _clean(family)):
        flags.append("incomplete_source_name")
    if re.search(r"\b(?:unknown|anonymous|unnamed|no name|test|runner|participant)\b", name, re.I):
        flags.append("placeholder_source_name")
    return flags


def normalize_pace_row(row, flags=None):
    """Map an already header-matched raw Pace Notes row without promoting facts."""
    if not isinstance(row, dict) or set(row) != set(PACE_COLUMNS):
        raise ValueError("Pace Notes row does not match the retained schema")
    if row["race"] != "London Marathon" or row["year"] != YEAR or row["city"] != "London":
        raise ValueError("Pace Notes observation is outside the requested edition")
    raw_url = _text(row["source_url"])
    url = urlsplit(raw_url)
    query = parse_qs(url.query, keep_blank_values=True)
    if url.scheme != "https" or url.netloc != "results.tcslondonmarathon.com" or url.path != f"/{YEAR}/" or url.fragment:
        raise ValueError("Unexpected retained London result URL")
    if any(len(query.get(k, [])) != 1 for k in ("content", "idp", "event")) or query["content"] != ["detail"]:
        raise ValueError("London result URL lacks a unique observed row locator")
    result_id, event_code = query["idp"][0], query["event"][0]
    if not re.fullmatch(r"[A-Z0-9]{14}", result_id) or event_code not in ("MAS", "ELIT"):
        raise ValueError("Unexpected London result locator format")
    finish_time, seconds = parse_finish_time(row["split_42_2km"])
    original_name = _text(row["runner"])
    name_match = re.fullmatch(r"\s*([^,]+),\s*(.+?)\s+\(([A-Z]{3})\)\s*", original_name)
    quality_flags = []
    given = family = country_code = None
    if name_match:
        family, given, country_code = name_match.groups()
        family, given = _clean(family), _clean(given)
        name = _clean(given + " " + family)
    else:
        name = _clean(original_name)
        quality_flags.append("unparsed_pace_name_components")
    quality_flags.extend(_name_flags(name, given, family))
    flags = dict(flags or {})
    if flags and str(flags.get("record_id")) != str(row["id"]):
        raise ValueError("Publisher flags refer to a different record")
    if _clean(flags.get("note")):
        # The publisher's 'DQ step1' is a data-quality note, not an official DQ.
        quality_flags.append("publisher_quality_note")
    for field in QUALITY_FLAG_FIELDS:
        if flags.get(field) not in (None, "", 0, False, "0"):
            quality_flags.append("publisher_" + field)
    if row["sex"] not in (None, "", "M", "F"):
        quality_flags.append("unrecognised_source_gender")
    key = _source_key(PACE, event_code, result_id)
    return {
        "observationKey": key, "sourceKey": key, "provider": PACE,
        "providerName": PACE_NAME, "editionKey": EDITION_KEY,
        "sourceResultId": result_id, "sourceScope": event_code,
        "publisherRecordId": _text(row["id"]), "sourceUrl": raw_url,
        "publicationUrl": PACE_PUBLICATION, "capturedAt": _timestamp(row["ingested_at"]),
        "name": name, "originalName": original_name, "givenName": given, "familyName": family,
        "gender": _gender(row["sex"]), "category": _text(row["age_group"]),
        "countryCodeInOriginalName": country_code, "nationality": None, "dateOfBirth": None,
        "finishTime": finish_time, "originalFinishTime": _text(row["split_42_2km"]),
        "finishSeconds": seconds, "timing": {"basis": "unknown"},
        "sourceReportedPlace": None, "division": flags.get("division"),
        "qualityFlags": sorted(set(quality_flags)), "publisherFlags": flags,
        "sourceVerification": "unverified_secondary_source", "identityVerified": False,
        "splits": [{"label": f"{km} km", "value": _text(row[f"split_{km}km"])} for km in range(5, 41, 5)],
        "original": dict(row),
    }


def normalize_guide_row(record, page, subevent=None):
    """Map the displayed headings and retain the observed relative result path."""
    if page.get("headings") != GUIDE_HEADINGS or page.get("headings_verified") is not True:
        raise ValueError("MarathonGuide page headings were not retained and checked")
    cells, fields = record.get("cells"), record.get("fields")
    if not isinstance(cells, list) or len(cells) != len(GUIDE_HEADINGS) or fields != dict(zip(GUIDE_HEADINGS, cells)):
        raise ValueError("MarathonGuide field map differs from its displayed row")
    result_id = _text(record.get("provider_result_id"))
    source_path = _text(record.get("sourcePath"))
    subevent = GUIDE_SUBEVENT if subevent is None else subevent
    expected_path = urlsplit(GUIDE_PUBLICATION).path + result_id + "/"
    if not result_id.isdigit() or source_path != expected_path or str(subevent) != GUIDE_SUBEVENT:
        raise ValueError("MarathonGuide row does not contain the expected observed result locator")
    # This resolves an observed href; it never manufactures a provider result ID.
    source_url = urljoin(GUIDE_PUBLICATION, source_path)
    if fields["Distance"] != "Marathon":
        raise ValueError("MarathonGuide row is not the requested marathon distance")
    finish_time, seconds = parse_finish_time(fields["Final Time"])
    place_match = re.fullmatch(r"[🥇🥈🥉]?(\d+)", _text(fields["Place"]))
    if not place_match or int(place_match[1]) < 1:
        raise ValueError("Unexpected qualified MarathonGuide place cell")
    name = _clean(fields["Full Name"])
    quality_flags = _name_flags(name)
    if fields["Gender"] not in ("Male", "Female", ""):
        quality_flags.append("unrecognised_source_gender")
    key = _source_key(GUIDE, str(subevent), result_id)
    return {
        "observationKey": key, "sourceKey": key, "provider": GUIDE,
        "providerName": "MarathonGuide", "editionKey": EDITION_KEY,
        "sourceResultId": result_id, "sourceScope": str(subevent),
        "sourceUrl": source_url, "publicationUrl": GUIDE_PUBLICATION,
        "capturedAt": _timestamp(page["observed_at"]), "sourcePage": int(page["page"]),
        "name": name, "originalName": _text(fields["Full Name"]),
        # A full-name cell does not establish given/family components.
        "givenName": None, "familyName": None, "gender": _gender(fields["Gender"]),
        "category": "", "countryCodeInOriginalName": None, "nationality": None, "dateOfBirth": None,
        "finishTime": finish_time, "originalFinishTime": _text(fields["Final Time"]),
        "finishSeconds": seconds, "timing": {"basis": "unknown"},
        "sourceReportedPlace": int(place_match[1]), "division": None,
        "qualityFlags": sorted(set(quality_flags)), "publisherFlags": {},
        "sourceVerification": "unverified_secondary_source", "identityVerified": False,
        "splits": [],
        "original": {
            "fields": dict(fields), "cells": list(cells), "sourcePath": source_path,
            "provider_result_id": record["provider_result_id"], "page": page["page"],
            "visiblePageUrl": page.get("visible_page_url"),
            "observedPrintHref": page.get("observed_print_href"),
            "bqQualification": "Blank BQ text does not establish a negative qualification.",
        },
    }


def _compare_saved_csv(path, observations, provider):
    by_key = {f"{o['sourceScope']}:{o['sourceResultId']}": o for o in observations}
    seen = set()
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            key = row["Source Key"]
            if key in seen or key not in by_key:
                raise ValueError("Saved CSV repeats or adds an unknown result locator")
            seen.add(key)
            obs = by_key[key]
            compare = {
                "Athlete Name": obs["name"], "Finish Time": obs["finishTime"],
                "Original Result ID": obs["sourceResultId"], "Publication": obs["publicationUrl"],
                "Source Verification": obs["sourceVerification"],
            }
            if provider == PACE:
                compare.update({
                    "Gender": obs["gender"] or "", "Age Category": obs["category"],
                    "Country Code in Original Name": obs["countryCodeInOriginalName"] or "",
                    "Source Event Code": obs["sourceScope"], "Publisher Record ID": obs["publisherRecordId"],
                    "Original Name": obs["originalName"], "Original Source URL": obs["sourceUrl"],
                    "Publisher Collected At": obs["capturedAt"],
                    "Publisher Quality Note": _text(obs["publisherFlags"].get("note")),
                    "Publisher Pace Flag": _text(obs["publisherFlags"].get("pace_implausible")),
                    "Publisher Division": _text(obs["division"]),
                })
                compare.update({s["label"]: s["value"] for s in obs["splits"]})
            else:
                compare.update({
                    "Gender": {"M": "Male", "F": "Female", None: ""}[obs["gender"]],
                    "Source Place": str(obs["sourceReportedPlace"]), "Distance": "Marathon",
                    "Source Result URL": obs["sourceUrl"], "Source Page": str(obs["sourcePage"]),
                    "Captured At": obs["capturedAt"], "Original Place Cell": obs["original"]["fields"]["Place"],
                    "Original BQ Text": obs["original"]["fields"]["BQ"],
                })
            if any((_clean(row.get(k)) if k == "Athlete Name" else row.get(k)) != v for k, v in compare.items()):
                raise ValueError("Mapped source fields differ from the retained CSV for " + key)
    if seen != set(by_key):
        raise ValueError("Saved CSV omits retained source observations")


def load_sources(input_dir):
    """Load the immutable recovered collection. Never drops a source record."""
    folder = Path(input_dir)
    for relative, expected in INPUT_SHA256.items():
        if _file_hash(folder / relative) != expected:
            raise ValueError("Retained input checksum changed: " + relative)
    columns = json.loads((folder / "raw/pace_notes_schema.json").read_text())
    if columns != PACE_COLUMNS:
        raise ValueError("Unexpected retained Pace Notes schema")
    metadata = json.loads((folder / "raw/pace_notes_metadata.json").read_text())
    flag_rows = metadata["record_flags"]["rows"]
    flags = {str(row["record_id"]): row for row in flag_rows}
    if len(flags) != len(flag_rows):
        raise ValueError("Duplicate publisher record flags")
    pace = []
    with (folder / PACE_ROWS_FILE).open(encoding="utf-8") as handle:
        for line in handle:
            values = json.loads(line)
            if not isinstance(values, list) or len(values) != len(columns):
                raise ValueError("Raw Pace Notes values do not match their headers")
            row = dict(zip(columns, values))
            pace.append(normalize_pace_row(row, flags.get(str(row["id"]))))
    if len(pace) != PACE_RECORDS or not set(flags) <= {o["publisherRecordId"] for o in pace}:
        raise ValueError("Pace Notes source coverage changed")
    raw_guide = json.loads((folder / "raw/marathonguide_pages.json").read_text())
    if raw_guide.get("collection_complete") is not True or raw_guide.get("advertised_total") != GUIDE_RECORDS or raw_guide.get("year") != YEAR:
        raise ValueError("MarathonGuide archive is incomplete or has changed scope")
    pages = raw_guide["pages"]
    page_count = (GUIDE_RECORDS + 99) // 100
    if [p["page"] for p in pages] != list(range(1, page_count + 1)):
        raise ValueError("MarathonGuide source pages are not consecutive")
    guide = []
    for page in pages:
        if len(page["records"]) != ((GUIDE_RECORDS - 1) % 100 + 1 if page["page"] == page_count else 100):
            raise ValueError("Unexpected MarathonGuide page size")
        for record in page["records"]:
            observation = normalize_guide_row(record, page, raw_guide["source_subevent"])
            if observation["sourceReportedPlace"] != len(guide) + 1:
                raise ValueError("MarathonGuide retained archive place order changed")
            guide.append(observation)
    if len(guide) != GUIDE_RECORDS:
        raise ValueError("MarathonGuide source coverage changed")
    _compare_saved_csv(folder / PACE_CSV_FILE, pace, PACE)
    _compare_saved_csv(folder / GUIDE_CSV_FILE, guide, GUIDE)
    observations = pace + guide
    if len({o["sourceKey"] for o in observations}) != len(observations):
        raise ValueError("Duplicate retained source result keys")
    if len({o["sourceUrl"] for o in observations}) != len(observations):
        raise ValueError("Duplicate retained source result URLs")
    return observations


def _entity_id(value):
    if isinstance(value, bool) or not isinstance(value, (int, str)) or not str(value):
        raise ValueError("Snapshot identifiers must be nonempty strings or integers")
    return str(value)


def _names(athlete):
    return sorted({n for n in [athlete.get("displayName"), *_screen.finder.names_from(athlete.get("aliases", []))] if isinstance(n, str) and _clean(n)})


def _result_times(result):
    supplied = result.get("timeSeconds") or []
    if not isinstance(supplied, list):
        raise ValueError("Snapshot timeSeconds must be a list of explicit recorded timing values")
    values = [result.get("finishSeconds"), *supplied]
    times = set()
    for value in values:
        if value is None:
            continue
        if isinstance(value, bool) or not isinstance(value, (float, int)) or not math.isfinite(value) or value <= 0:
            raise ValueError("Snapshot contains a nonnumeric or invalid recorded time")
        times.add(value)
    return times


def _age_band(value):
    value = _clean(value).upper()
    match = re.fullmatch(r"[MFV]*\s*(\d{1,2})\s*[-/]\s*(\d{1,2})", value)
    if match:
        low, high = map(int, match.groups())
        return (low, high) if low <= high else None
    match = re.fullmatch(r"[MFV]*\s*(\d{1,2})\s*\+", value)
    return (int(match[1]), 120) if match else None


def _conflicting_facts(observations, athlete, result, edition):
    conflicts = []
    for field in ("gender", "nationality", "dateOfBirth"):
        normalize = _gender if field == "gender" else name_key
        incoming = {normalize(o.get(field)) for o in observations if o.get(field)} - {None, ""}
        existing = {normalize(x.get(field)) for x in (athlete, result) if x.get(field)} - {None, ""}
        if len(incoming) > 1 or len(existing) > 1 or incoming and existing and incoming != existing:
            conflicts.append("existing_" + field + "_conflict")
    incoming_bands = [b for o in observations if (b := _age_band(o.get("category")))]
    existing_band = _age_band(result.get("category"))
    if existing_band and any(max(b[0], existing_band[0]) > min(b[1], existing_band[1]) for b in incoming_bands):
        conflicts.append("existing_age_category_conflict")
    dob = athlete.get("dateOfBirth")
    if dob and incoming_bands:
        try:
            born, raced = dt.date.fromisoformat(dob), dt.date.fromisoformat(edition["date"])
            age = raced.year - born.year - ((raced.month, raced.day) < (born.month, born.day))
        except (TypeError, ValueError):
            conflicts.append("existing_birth_date_requires_review")
        else:
            if any(not low <= age <= high for low, high in incoming_bands):
                conflicts.append("existing_birth_date_age_category_conflict")
    return sorted(set(conflicts))


def _existing_result_flags(result):
    flags = []
    original = result.get("original") or {}
    performance = original.get("performance") or {}
    if result.get("profileExcluded") or performance.get("profileExcluded"):
        flags.append("existing_result_excluded")
    if result.get("status") not in (None, "", "finished", "FIN"):
        flags.append("existing_non_finish_result")
    if performance.get("syntheticTest") or performance.get("disqualification"):
        flags.append("existing_invalid_or_disqualified_result")
    return flags


REVIEW_DECISION = "unique_existing_athlete_and_performance"
REVIEW_METHOD = "reviewed_same_performance_evidence_association"
REVIEW_RESOLVABLE_REASONS = {
    "repeated_source_display_name", "possible_source_name_variant",
    "existing_name_or_alias_requires_review",
    "same_performance_without_matching_locator_requires_review",
}


def load_review_manifest(path, expected_file_sha256):
    """Read the explicitly pinned independent review; never obtain approval."""
    raw = Path(path).read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected_file_sha256:
        raise ValueError("Approved same-performance review file changed")
    return json.loads(raw)


def _review_header(manifest, approval, snapshot_digest, snapshot_fingerprint, batch_id):
    if not isinstance(manifest, dict) or not isinstance(approval, dict):
        raise ValueError("A reviewed association needs both its frozen manifest and explicit root approval")
    if approval.get("approvedBy") != "root" or approval.get("action") != "reuse_existing_performance_evidence_only" or not approval.get("approvalId"):
        raise ValueError("The reviewed performance association has not been explicitly approved")
    if approval.get("batchId") != batch_id or approval.get("preserveExistingPerformanceFields") is not True or approval.get("preserveVerification") is not True or approval.get("structuralMerges") is not False:
        raise ValueError("Review approval exceeds or differs from the evidence-only batch scope")
    _timestamp(approval.get("recordedAt"))
    digest = _hash(manifest)
    if digest != approval.get("manifestDigest"):
        raise ValueError("Approved same-performance manifest digest changed")
    if not re.fullmatch(r"[0-9a-f]{64}", approval.get("manifestFileSha256", "")):
        raise ValueError("Original review-file digest is required for provenance")
    if snapshot_digest != manifest.get("snapshotDigest") or snapshot_digest != approval.get("snapshotDigest"):
        raise ValueError("Reviewed directory snapshot content changed")
    if snapshot_fingerprint != manifest.get("snapshotFingerprint") or snapshot_fingerprint != approval.get("snapshotFingerprint") or not snapshot_fingerprint:
        raise ValueError("Reviewed live snapshot fingerprint changed")
    recommendation = manifest.get("recommendation") or {}
    if recommendation.get("eligibleDecision") != REVIEW_DECISION or recommendation.get("structuralMergesAuthorizedByThisReview") is not False or recommendation.get("resultVerificationUpgraded") is not False or recommendation.get("accountOwnershipVerified") is not False:
        raise ValueError("Independent review does not preserve identity and verification distinctions")
    decisions = manifest.get("decisions")
    if not isinstance(decisions, list) or len({d["groupId"] for d in decisions}) != len(decisions):
        raise ValueError("Review decisions are missing or repeat a source group")
    approved = {d["groupId"]: d for d in decisions if d["decision"] == REVIEW_DECISION}
    held = {d["groupId"]: d for d in decisions if d["decision"] != REVIEW_DECISION}
    if len(approved) != approval.get("approvedGroupCount") or len(approved) != recommendation.get("eligibleGroups") or len(approved) != (manifest.get("counts") or {}).get(REVIEW_DECISION):
        raise ValueError("Explicitly approved reviewed group count changed")
    if len(held) != recommendation.get("heldMatchedGroups"):
        raise ValueError("Independent reviewed hold count changed")
    return {"digest": digest, "approved": approved, "held": held}


def _review_context(manifest, approval, snapshot, snapshot_digest, groups, observations, edition, batch_id):
    """Recheck every approved association against the unchanged private snapshot."""
    header = _review_header(manifest, approval, snapshot_digest, (snapshot.get("metadata") or {}).get("fingerprint"), batch_id)
    if (snapshot.get("metadata") or {}).get("batchId") != batch_id:
        raise ValueError("Reviewed snapshot was prepared for a different batch")
    group_by_id = {g["groupId"]: g for g in groups}
    observation_by_key = {o["observationKey"]: o for o in observations}
    athlete_by_id = {_entity_id(a["id"]): a for a in snapshot["athletes"]}
    result_by_id = {_entity_id(r["id"]): r for r in snapshot["results"]}
    accepted_editions = {_entity_id(edition["id"]), *(_entity_id(value) for value in edition.get("equivalentIds", []))}
    associations = {}
    candidate_index = defaultdict(set)
    for association in manifest.get("associations", []):
        result_id = _entity_id(association["resultId"])
        if result_id in associations or result_id not in result_by_id:
            raise ValueError("Review association repeats or loses an existing performance")
        result = result_by_id[result_id]
        if str(association["athleteId"]) != str(result["athleteId"]) or association.get("originalDate") != result.get("date") or association.get("originalYear") != result.get("year") or association.get("provider") != result.get("provider") or association.get("historyIdentity") != result.get("historyIdentity") or not association.get("associationBasis"):
            raise ValueError("Review association differs from the original retained performance")
        dated = str(result.get("editionId")) in accepted_editions and result.get("date") == edition["date"] and result.get("distanceKm") == edition["distanceKm"]
        year_only_wmm = (
            result.get("provider") == "Abbott World Marathon Majors"
            and result.get("sourceKind") == "history" and result.get("editionId") is None
            and result.get("date") in (None, "") and result.get("year") == YEAR
            and name_key(result.get("eventName")) == "london marathon"
            and name_key(result.get("distanceCode")) == "marathon"
            and result.get("distanceKm") == edition["distanceKm"]
        )
        if not dated and not year_only_wmm:
            raise ValueError("Manifest tries to associate an unsupported edition or distance")
        if year_only_wmm:
            original = (result.get("original") or {}).get("performance") or {}
            source = (original.get("archiveReference") or {}).get("original") or {}
            if original.get("date") not in (None, "") or original.get("year") != YEAR or name_key(original.get("meeting")) != "london marathon" or name_key(original.get("discipline")) != "marathon":
                raise ValueError("Year-only WMM history does not contain the explicit reviewed event/year/distance")
            if source.get("result_year") != YEAR or name_key(source.get("event_title")) != "london marathon" or str(source.get("athlete_id")) != str((result.get("historyIdentity") or {}).get("externalId")):
                raise ValueError("Original WMM row does not corroborate its retained history identity")
            original_seconds = parse_finish_time(original.get("performance"))[1]
            if original_seconds not in _result_times(result) or source.get("finish_time_secs") != original_seconds or parse_finish_time(source.get("finish_time"))[1] != original_seconds:
                raise ValueError("Original WMM time differs from the associated retained performance")
        associations[result_id] = association
        athlete = athlete_by_id.get(str(result["athleteId"]))
        if athlete:
            for name in _names(athlete):
                for seconds in _result_times(result):
                    candidate_index[(name_key(name), seconds)].add(result_id)
    if len(associations) != manifest.get("associatedPerformanceCount"):
        raise ValueError("Reviewed edition-association scope changed")
    selected_results, selected_athletes = set(), set()
    for group_id, decision in {**header["approved"], **header["held"]}.items():
        group = group_by_id.get(group_id)
        if not group or sorted(decision["sourceKeys"]) != group["sourceKeys"] or name_key(decision["name"]) != name_key(group["name"]) or decision["finishSeconds"] != group["finishSeconds"] or bool(decision["crossSourcePNandMG"]) != group["crossSourcePair"]:
            raise ValueError("Reviewed decision differs from its source-located performance group")
        if group_id not in header["approved"]:
            continue
        if len(decision["athleteIds"]) != 1 or len(decision["resultIds"]) != 1 or decision.get("sourceQualityFlags") or decision.get("reasons"):
            raise ValueError("An approved decision has unresolved quality or identity ambiguity")
        result_id, athlete_id = str(decision["resultIds"][0]), str(decision["athleteIds"][0])
        if result_id not in associations or result_id in selected_results or athlete_id in selected_athletes:
            raise ValueError("An approved performance or athlete is reused by more than one source group")
        result, athlete = result_by_id[result_id], athlete_by_id.get(athlete_id)
        if not athlete or str(result["athleteId"]) != athlete_id:
            raise ValueError("Reviewed athlete/performance association changed")
        candidates = set()
        for name in group["names"]:
            candidates.update(candidate_index.get((name_key(name), group["finishSeconds"]), ()))
        if candidates != {result_id}:
            raise ValueError("Reviewed exact name/time association is no longer one unique existing performance")
        members = [observation_by_key[k] for k in group["observationKeys"]]
        if any(o["qualityFlags"] for o in members) or not any(o["provider"] == PACE for o in members):
            raise ValueError("Reviewed source quality or licensed-source requirement is not satisfied")
        if _conflicting_facts(members, athlete, result, edition) or _existing_result_flags(result):
            raise ValueError("Reviewed existing performance has conflicting or excluded evidence")
        if athlete.get("visibility") != "public":
            raise ValueError("Reviewed existing visibility differs from the approved public-profile scope")
        if decision.get("originalDatePrecision") != ["day" if result.get("date") else "year"]:
            raise ValueError("Review would change existing date precision")
        selected_results.add(result_id)
        selected_athletes.add(athlete_id)
    return {**header, "associations": associations, "results": result_by_id}


def _make_groups(observations):
    by_key = defaultdict(list)
    for observation in observations:
        by_key[(name_key(observation["name"]), observation["finishSeconds"])].append(observation)
    groups = []
    for key in sorted(by_key):
        rows = by_key[key]
        counts = Counter(o["provider"] for o in rows)
        genders = {o["gender"] for o in rows if o.get("gender")}
        can_pair = len(rows) == 2 and counts == {PACE: 1, GUIDE: 1} and len(genders) <= 1
        issue = []
        if len(rows) > 1 and not can_pair:
            issue.append("ambiguous_same_name_time_observations" if len(genders) <= 1 else "cross_source_gender_conflict")
        for members in [rows] if can_pair else [[row] for row in rows]:
            members = sorted(members, key=lambda o: (o["provider"] != PACE, o["sourceKey"]))
            primary = members[0]
            groups.append({
                "groupId": f"london-{YEAR}-performance-" + _hash(primary["sourceKey"])[:24],
                "primaryObservationKey": primary["observationKey"],
                "observationKeys": [o["observationKey"] for o in members],
                "sourceKeys": sorted(o["sourceKey"] for o in members),
                "sourceUrls": sorted(o["sourceUrl"] for o in members),
                "name": primary["name"], "names": sorted({o["name"] for o in members}),
                "finishTime": primary["finishTime"], "finishSeconds": primary["finishSeconds"],
                "crossSourcePair": can_pair, "identityVerified": False,
                "reasons": sorted(set(issue + [flag for o in members for flag in o["qualityFlags"]])),
            })
    return sorted(groups, key=lambda g: g["groupId"])


def _source_name_collisions(groups):
    """Store one witness per key; every colliding group is held, without O(n²)."""
    exact_seen, variant_seen = {}, {}
    witnesses = defaultdict(set)
    reasons = defaultdict(set)
    for group in groups:
        group_id = group["groupId"]
        for name in group["names"]:
            for key, index, reason in [
                (name_key(name), exact_seen, "repeated_source_display_name"),
                *((key, variant_seen, "possible_source_name_variant") for key in sorted(screening_name_keys(name))),
            ]:
                first = index.setdefault(key, group_id)
                if first != group_id:
                    reasons[first].add(reason)
                    reasons[group_id].add(reason)
                    if len(witnesses[first]) < 20:
                        witnesses[first].add(group_id)
                    if len(witnesses[group_id]) < 20:
                        witnesses[group_id].add(first)
    return reasons, witnesses


def _profile_slug(name, source_key):
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    readable = re.sub(r"[^a-z0-9]+", "-", ascii_name).strip("-")[:90].rstrip("-") or "athlete"
    return readable + f"-london-{YEAR}-" + _hash(source_key)[:16]


def _history_and_athlete(group, observations, edition, batch_id):
    primary = next(o for o in observations if o["observationKey"] == group["primaryObservationKey"])
    if primary["provider"] != PACE:
        raise ValueError("A new profile needs its licensed Pace Notes observation")
    history_id = f"london-{YEAR}:{primary['sourceScope'].lower()}:{primary['sourceResultId']}"
    performance = {
        "year": YEAR, "date": edition["date"], "sourceDate": edition["date"],
        "ageGroup": primary["category"], "discipline": "Marathon",
        "performance": primary["finishTime"], "timing": {"basis": "unknown"},
        "wind": "", "place": "", "places": {"overall": None, "gender": None, "category": None},
        "venue": "London", "meeting": edition["eventName"], "eventSlug": edition["eventSlug"],
        "country": edition["country"], "sourceUrls": group["sourceUrls"], "sourceKeys": group["sourceKeys"],
        "labels": ["Secondary-source result", "Time basis unspecified", "Athlete identity provisional"],
        "providerName": PACE_NAME, "verificationStatus": "unverified",
        "notes": "Published finish time retained from the Pace Notes dataset. Chip/gun basis is not established. The original timing-provider row was not independently checked. Source result identifiers locate this performance and do not establish an athlete identity. Secondary archive placing is retained only as qualified staff evidence.",
        "archiveReference": {
            "batchId": batch_id, "editionId": edition["id"], "groupId": group["groupId"],
            "identityVerified": False, "originalOfficialPageChecked": False,
            "sourceComparison": "Retained secondary rows compared; no primary-source verification.",
            "observationKeys": group["observationKeys"],
            "sourceObservations": [{
                "provider": o["providerName"], "sourceResultId": o["sourceResultId"],
                "sourceKey": o["sourceKey"], "sourceUrl": o["sourceUrl"], "capturedAt": o["capturedAt"],
                "originalName": o["originalName"], "originalFinishTime": o["originalFinishTime"],
                "countryCodeInOriginalName": o["countryCodeInOriginalName"],
                "sourceReportedPlace": o["sourceReportedPlace"], "division": o["division"],
            } for o in observations],
            "attribution": copy.deepcopy(SOURCE_ATTRIBUTION[0]),
        },
    }
    history = {
        "provider": PACE_NAME, "externalId": history_id, "sourceUrl": PACE_PUBLICATION,
        "capturedAt": primary["capturedAt"], "complete": False,
        "yearsExpected": [YEAR], "yearsCaptured": [YEAR], "performances": [performance],
    }
    draft = {
        "slug": _profile_slug(primary["name"], primary["sourceKey"]),
        "displayName": primary["name"], "givenName": primary["givenName"], "familyName": primary["familyName"],
        "gender": primary["gender"], "nationality": None, "dateOfBirth": None,
        "aliases": group["names"], "identityVerified": False, "claimed": False,
        "sourceResultKeys": group["sourceKeys"],
        "profileDetails": {
            "aliases": group["names"], "athlete_verified": False,
            "identity_review_status": "provisional_source_profile",
            "currentClubAssociationConfirmed": False,
            "archiveCreation": {
                "batchId": batch_id, "groupId": group["groupId"],
                "identityBasis": "Provisional profile for one source-located performance; identity not independently verified.",
                "sourceResultKeys": group["sourceKeys"],
            },
        },
    }
    return history, draft


def build_plan(observations, snapshot, edition, batch_id, created_at, *, review_manifest=None, review_approval=None):
    """Prepare an immutable, fully accounted plan from source rows and a snapshot.

    This function creates no accounts, profiles, results or publication records.
    A linked group means reuse/append evidence to an existing performance; it
    deliberately contains no extra history performance or athlete draft.
    """
    if not batch_id or edition.get("date") != DATE or edition.get("distanceKm") != 42.195:
        raise ValueError(f"An explicit London {YEAR} marathon edition and batch ID are required")
    if EDITION_CONTEXT:
        if edition != EDITION_CONTEXT["edition"] or batch_id != EDITION_CONTEXT["batchId"]:
            raise ValueError("Plan edition or batch differs from its frozen configuration")
        if (snapshot.get("metadata") or {}).get("editionContextDigest") != _hash(EDITION_CONTEXT):
            raise ValueError("Snapshot was not taken under this edition configuration")
        if Counter(o["provider"] for o in observations) != {PACE: PACE_RECORDS, GUIDE: GUIDE_RECORDS}:
            raise ValueError("Plan input does not cover the complete configured collection")
    _entity_id(edition.get("id"))
    accepted_editions = {_entity_id(edition["id"]), *(_entity_id(value) for value in edition.get("equivalentIds", []))}
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", edition.get("eventSlug", "")) or not edition.get("eventName") or not edition.get("country"):
        raise ValueError("Reviewed canonical event name, slug and race country are required")
    _timestamp(created_at)
    observations = sorted(observations, key=lambda o: o["observationKey"])
    by_observation = {o["observationKey"]: o for o in observations}
    if len(by_observation) != len(observations) or len({o["sourceUrl"] for o in observations}) != len(observations):
        raise ValueError("Repeated source result key or URL in planner input")
    for observation in observations:
        if observation["provider"] not in (PACE, GUIDE) or observation["editionKey"] != EDITION_KEY:
            raise ValueError("Unexpected source observation scope")
        if observation["sourceKey"] != observation["observationKey"] or observation["sourceKey"] != _source_key(observation["provider"], observation["sourceScope"], observation["sourceResultId"]):
            raise ValueError("Source result key does not match its locator")
        time, seconds = parse_finish_time(observation["finishTime"])
        if time != observation["finishTime"] or seconds != observation["finishSeconds"]:
            raise ValueError("Canonical generic finish time differs from source seconds")
        if observation["timing"] != {"basis": "unknown"} or observation["sourceVerification"] != "unverified_secondary_source" or observation["identityVerified"] is not False:
            raise ValueError("Secondary evidence was incorrectly promoted")
    groups = _make_groups(observations)
    snapshot_digest = _hash(snapshot)
    review = None
    if review_manifest is not None or review_approval is not None:
        review = _review_context(review_manifest, review_approval, snapshot, snapshot_digest, groups, observations, edition, batch_id)
    source_reasons, source_witnesses = _source_name_collisions(groups)
    allowed_keys = {key for group in groups for name in group["names"] for key in screening_name_keys(name)}
    directory_index = defaultdict(set)
    athlete_by_id = {}
    account_links = {}
    for athlete in snapshot.get("athletes", []):
        athlete_id = _entity_id(athlete["id"])
        if athlete_id in athlete_by_id:
            raise ValueError("Snapshot repeats an athlete ID")
        athlete_by_id[athlete_id] = athlete
        for name in _names(athlete):
            for key in screening_name_keys(name) & allowed_keys:
                directory_index[key].add("athlete:" + athlete_id)
    for account in snapshot.get("accounts", []):
        account_id = _entity_id(account["id"])
        if account_id in account_links:
            raise ValueError("Snapshot repeats an account ID")
        account_links[account_id] = {_entity_id(value) for value in account.get("linkedAthleteIds", [])}
        for name in _screen.finder.names_from(account.get("names", [])):
            for key in screening_name_keys(name) & allowed_keys:
                directory_index[key].add("account:" + account_id)
    locator_index = defaultdict(list)
    performance_index = defaultdict(list)
    result_ids = set()
    for result in snapshot.get("results", []):
        result_id = _entity_id(result["id"])
        if result_id in result_ids:
            raise ValueError("Snapshot repeats a result ID; combine its retained source URLs first")
        result_ids.add(result_id)
        _entity_id(result["athleteId"])
        _result_times(result)
        if not isinstance(result.get("sourceUrls"), list):
            raise ValueError("Snapshot result sourceUrls must be a list")
        for url in sorted(set(result["sourceUrls"])):
            locator_index[url].append(result)
        if str(result.get("editionId")) in accepted_editions:
            for seconds in _result_times(result):
                performance_index[seconds].append(result)
    for group in groups:
        members = [by_observation[key] for key in group["observationKeys"]]
        reasons = set(group["reasons"]) | source_reasons.get(group["groupId"], set())
        if not any(o["provider"] == PACE for o in members):
            reasons.add("marathonguide_only_source_review")
        candidates = set()
        for name in group["names"]:
            for key in screening_name_keys(name):
                candidates.update(directory_index.get(key, ()))
        matches_by_id = {}
        for url in group["sourceUrls"]:
            for result in locator_index.get(url, []):
                result_id = _entity_id(result["id"])
                if result_id not in matches_by_id:
                    matches_by_id[result_id] = {"result": result, "matchedUrls": []}
                matches_by_id[result_id]["matchedUrls"].append(url)
        existing_matches = []
        matched_athlete_ids = set()
        for result_id in sorted(matches_by_id):
            item = matches_by_id[result_id]
            result = item["result"]
            athlete_id = _entity_id(result["athleteId"])
            matched_athlete_ids.add(athlete_id)
            athlete = athlete_by_id.get(athlete_id)
            mismatch = []
            # The caller may supply explicitly reviewed duplicate catalogue
            # edition IDs for this same date/distance; no name-based fallback.
            if (str(result.get("editionId")) not in accepted_editions
                    or result.get("date") not in (None, "", edition["date"])
                    or result.get("year") not in (None, YEAR)
                    or result.get("distanceKm") not in (None, edition["distanceKm"])):
                mismatch.append("existing_locator_edition_conflict")
            if group["finishSeconds"] not in _result_times(result):
                mismatch.append("existing_locator_time_conflict")
            if not athlete:
                mismatch.append("existing_locator_athlete_missing")
            else:
                if not {name_key(n) for n in _names(athlete)} & {name_key(n) for n in group["names"]}:
                    mismatch.append("existing_locator_name_conflict")
                mismatch.extend(_conflicting_facts(members, athlete, result, edition))
            mismatch.extend(_existing_result_flags(result))
            reasons.update(mismatch)
            existing_matches.append({
                "resultId": result["id"], "athleteId": result["athleteId"],
                "editionId": result.get("editionId"), "matchedUrls": sorted(item["matchedUrls"]),
                "matchedTimeSeconds": group["finishSeconds"] if group["finishSeconds"] in _result_times(result) else None,
                "sourceKind": result.get("sourceKind"), "conflicts": sorted(set(mismatch)),
                "method": "exact_retained_result_locator",
                "basis": "Exact retained result URL, reviewed edition, known full name/alias and compatible recorded time/facts.",
            })
        if len(matched_athlete_ids) > 1:
            reasons.add("same_result_locator_on_multiple_athletes")
        same_performance_candidates = []
        for result in performance_index.get(group["finishSeconds"], []):
            result_id = _entity_id(result["id"])
            if result_id in matches_by_id:
                continue
            athlete = athlete_by_id.get(_entity_id(result["athleteId"]))
            if not athlete or not {name_key(n) for n in _names(athlete)} & {name_key(n) for n in group["names"]}:
                continue
            if _conflicting_facts(members, athlete, result, edition) or _existing_result_flags(result):
                continue
            same_performance_candidates.append({
                "resultId": result["id"], "athleteId": result["athleteId"], "editionId": result["editionId"],
                "timeSeconds": group["finishSeconds"], "sourceKind": result.get("sourceKind"),
                "existingSourceUrls": sorted(set(result["sourceUrls"])),
                "basis": f"Same known full name/alias, reviewed London {YEAR} edition, exact recorded time, no supplied demographic conflict; retained result URL not matched.",
                "action": "review_existing_same_performance",
            })
        if same_performance_candidates:
            # These are useful concrete review candidates, not an automatic
            # identity merge or a second stored performance.
            reasons.add("same_performance_without_matching_locator_requires_review")
        if candidates and not existing_matches:
            reasons.add("existing_name_or_alias_requires_review")
        if existing_matches:
            # An account explicitly linked elsewhere is a conflict; unrelated
            # same-name accounts alone are not proof about this known result.
            for candidate in candidates:
                if candidate.startswith("account:"):
                    links = account_links[candidate[len("account:"):]]
                    if links and not links & matched_athlete_ids:
                        reasons.add("possible_account_identity_conflict")
        if review and group["groupId"] in review["held"]:
            decision = review["held"][group["groupId"]]
            reasons.add("independent_review_hold")
            reasons.update("reviewed_" + reason for reason in decision.get("reasons", []))
            group["independentReview"] = {"decision": decision["decision"], "reasons": decision.get("reasons", []), "manifestDigest": review["digest"]}
        if review and group["groupId"] in review["approved"]:
            decision = review["approved"][group["groupId"]]
            result_id = str(decision["resultIds"][0])
            result = review["results"][result_id]
            association = review["associations"][result_id]
            if set(matches_by_id) - {result_id}:
                raise ValueError("An approved association conflicts with a different retained result URL")
            resolvable = set(REVIEW_RESOLVABLE_REASONS)
            if result.get("editionId") is None:
                resolvable.add("existing_locator_edition_conflict")
            if reasons - resolvable:
                raise ValueError("Approved association still has a non-resolvable source or identity hold: " + ",".join(sorted(reasons - resolvable)))
            group["resolvedReviewReasons"] = sorted(reasons)
            reasons.clear()
            existing_matches = [{
                "resultId": result["id"], "athleteId": result["athleteId"],
                "editionId": result.get("editionId"), "associatedEditionId": edition["id"],
                "matchedUrls": sorted(set(result["sourceUrls"]) & set(group["sourceUrls"])),
                "matchedTimeSeconds": group["finishSeconds"], "sourceKind": result.get("sourceKind"),
                "conflicts": [], "method": REVIEW_METHOD, "basis": association["associationBasis"],
                "reviewManifestDigest": review["digest"], "reviewApprovalId": review_approval["approvalId"],
                "reviewDecisionId": group["groupId"], "existingSnapshotResultDigest": _hash(result),
                "historyIdentity": result.get("historyIdentity"), "canonicalResultId": result.get("canonicalResultId"),
                "originalDate": result.get("date"), "originalYear": result.get("year"),
                "originalDatePrecision": "day" if result.get("date") else "year",
                "preserveExistingPerformanceFields": True, "preserveVerification": True,
            }]
            group["independentReview"] = {"decision": REVIEW_DECISION, "reasons": [], "manifestDigest": review["digest"]}
        group["existingCandidates"] = sorted(candidates)[:20]
        group["existingCandidateCount"] = len(candidates)
        group["sourceNameCollisionWitnesses"] = sorted(source_witnesses.get(group["groupId"], ()))
        group["existingMatches"] = existing_matches
        group["samePerformanceCandidates"] = sorted(same_performance_candidates, key=lambda r: str(r["resultId"]))
        group["reasons"] = sorted(reasons)
        if reasons:
            group["disposition"] = "held"
            group["action"] = "hold_for_review"
        elif existing_matches:
            group["disposition"] = "linked"
            group["action"] = "reuse_existing_performance"
            group["athleteId"] = existing_matches[0]["athleteId"]
            group["resultIds"] = [m["resultId"] for m in existing_matches]
        else:
            group["disposition"] = "new"
            group["action"] = "create_unclaimed_profile_with_one_performance"
            group["history"], group["athleteDraft"] = _history_and_athlete(group, members, edition, batch_id)
    dispositions = Counter(g["disposition"] for g in groups)
    source_counts = Counter(o["provider"] for o in observations)
    summary = {
        "sourceObservations": len(observations), "observationsBySource": dict(sorted(source_counts.items())),
        "performanceGroups": len(groups), "crossSourcePairs": sum(g["crossSourcePair"] for g in groups),
        "new": dispositions["new"], "linked": dispositions["linked"], "held": dispositions["held"],
        "heldReasons": dict(sorted(Counter(r for g in groups if g["disposition"] == "held" for r in g["reasons"]).items())),
        "qualityFlaggedObservations": sum(bool(o["qualityFlags"]) for o in observations),
        "samePerformanceReviewGroups": sum(bool(g["samePerformanceCandidates"]) and g["disposition"] == "held" for g in groups),
        "reviewedExistingPerformanceLinks": sum(g["disposition"] == "linked" and any(m.get("method") == REVIEW_METHOD for m in g["existingMatches"]) for g in groups),
        "independentReviewHeldGroups": len(review["held"]) if review else 0,
        "officialResultsVerified": 0, "athleteIdentitiesVerified": 0,
        "wholeRaceCompletenessVerified": False,
    }
    plan = {
        "schemaVersion": "london-source-profile-plan/v1", "batchId": batch_id, "createdAt": created_at,
        "edition": dict(edition), "sourceAttribution": copy.deepcopy(SOURCE_ATTRIBUTION),
        "inputDigest": _hash(observations), "snapshotDigest": snapshot_digest,
        "snapshotFingerprint": (snapshot.get("metadata") or {}).get("fingerprint"),
        "observations": observations, "groups": groups, "summary": summary,
        "accounting": {"inputObservations": len(observations), "assignedObservations": sum(len(g["observationKeys"]) for g in groups), "unassignedObservations": 0, "multiplyAssignedObservations": 0},
        "qualifications": [
            "All results remain unverified secondary-source evidence.",
            "Grouped source observations do not establish a verified athlete identity or complete race field.",
            "Source result locators are not persistent athlete identifiers.",
            "Linked groups reuse existing performances; they do not add duplicate history rows.",
            "Existing publication, privacy, ownership and verification settings must be preserved by the applier.",
            "Pace Notes licence attribution must accompany any public reuse.",
        ],
    }
    if EDITION_CONTEXT:
        plan["editionContext"] = copy.deepcopy(EDITION_CONTEXT)
    if review:
        plan["reviewedReuse"] = {"approval": copy.deepcopy(review_approval), "manifest": copy.deepcopy(review_manifest)}
    validate_plan(plan, snapshot=snapshot)
    return plan


def validate_plan(plan, *, snapshot=None):
    """Reject lost observations, unsafe creation or accidental verification."""
    frozen_context = plan.get("editionContext")
    if frozen_context is not None:
        frozen_context = _context.validate_context(frozen_context)
    if frozen_context != EDITION_CONTEXT:
        raise ValueError("Plan configuration differs from the configured adapter")
    if EDITION_CONTEXT:
        if plan["edition"] != EDITION_CONTEXT["edition"] or plan["batchId"] != EDITION_CONTEXT["batchId"]:
            raise ValueError("Plan edition or batch differs from its frozen configuration")
        if snapshot is not None and (snapshot.get("metadata") or {}).get("editionContextDigest") != _hash(EDITION_CONTEXT):
            raise ValueError("Snapshot configuration binding changed")
    observations = plan["observations"]
    if EDITION_CONTEXT and Counter(o["provider"] for o in observations) != {PACE: PACE_RECORDS, GUIDE: GUIDE_RECORDS}:
        raise ValueError("Plan omits a configured source observation")
    if any(o["editionKey"] != EDITION_KEY or o["sourceKey"] != _source_key(o["provider"], o["sourceScope"], o["sourceResultId"]) for o in observations):
        raise ValueError("Plan contains observations from a different edition")
    if plan["edition"]["date"] != DATE:
        raise ValueError("Plan edition date changed")
    by_key = {o["observationKey"]: o for o in observations}
    if len(by_key) != len(observations):
        raise ValueError("Plan repeats an observation")
    assigned = Counter(key for g in plan["groups"] for key in g["observationKeys"])
    if set(assigned) != set(by_key) or any(n != 1 for n in assigned.values()):
        raise ValueError("Every source observation must be assigned exactly once")
    if len({g["groupId"] for g in plan["groups"]}) != len(plan["groups"]):
        raise ValueError("Plan repeats a performance group")
    new_slugs, histories = set(), set()
    review = None
    if plan.get("reviewedReuse"):
        evidence = plan["reviewedReuse"]
        review = _review_header(evidence["manifest"], evidence["approval"], plan["snapshotDigest"], plan.get("snapshotFingerprint"), plan["batchId"])
        review["associations"] = {str(a["resultId"]): a for a in evidence["manifest"]["associations"]}
    if snapshot is not None and _hash(snapshot) != plan["snapshotDigest"]:
        raise ValueError("Plan validation was given a changed snapshot")
    snapshot_results = {str(r["id"]): r for r in snapshot["results"]} if snapshot is not None else {}
    reviewed_groups = set()
    for group in plan["groups"]:
        rows = [by_key[k] for k in group["observationKeys"]]
        if sorted(group["sourceKeys"]) != sorted(o["sourceKey"] for o in rows) or sorted(group["sourceUrls"]) != sorted(o["sourceUrl"] for o in rows):
            raise ValueError("Performance evidence does not match its observations")
        if len({(name_key(o["name"]), o["finishSeconds"]) for o in rows}) != 1 or len(rows) > 2:
            raise ValueError("A group contains incompatible source performances")
        if len(rows) == 2 and ({o["provider"] for o in rows} != {PACE, GUIDE} or len({o["gender"] for o in rows if o["gender"]}) > 1):
            raise ValueError("A cross-source pair is ambiguous or contradictory")
        if group["identityVerified"] is not False:
            raise ValueError("Source pairing must not verify an identity")
        if group["disposition"] == "held":
            if not group["reasons"] or "history" in group or "athleteDraft" in group:
                raise ValueError("A held group cannot create a profile or history")
            if review and group["groupId"] in review["approved"]:
                raise ValueError("An explicitly approved association was left unresolved")
            continue
        if group["reasons"] or any(o["qualityFlags"] for o in rows):
            raise ValueError("Unresolved source or identity flags must remain held")
        if group["disposition"] == "linked":
            if "history" in group or "athleteDraft" in group or not group["existingMatches"]:
                raise ValueError("An existing performance must be reused without duplication")
            # The applier's targets must be the exact targets supported below.
            target_athlete_id = _entity_id(group.get("athleteId"))
            matched_athlete_ids = {_entity_id(m["athleteId"]) for m in group["existingMatches"]}
            matched_result_ids = [_entity_id(m["resultId"]) for m in group["existingMatches"]]
            target_result_ids = group.get("resultIds")
            if (matched_athlete_ids != {target_athlete_id}
                    or any(m["athleteId"] != group["athleteId"] for m in group["existingMatches"])
                    or not isinstance(target_result_ids, list)
                    or [_entity_id(value) for value in target_result_ids] != matched_result_ids
                    or target_result_ids != [m["resultId"] for m in group["existingMatches"]]
                    or len(set(matched_result_ids)) != len(matched_result_ids)):
                raise ValueError("Linked group targets differ from existing performance evidence")
            for match in group["existingMatches"]:
                if snapshot is not None:
                    target = snapshot_results.get(_entity_id(match["resultId"]))
                    if target is None or _entity_id(target["athleteId"]) != target_athlete_id:
                        raise ValueError("Linked target performance or athlete differs from the frozen snapshot")
                if match["conflicts"] or match["matchedTimeSeconds"] != group["finishSeconds"]:
                    raise ValueError("Existing performance linkage lacks compatible evidence")
                if match.get("method") != REVIEW_METHOD:
                    if not match["matchedUrls"]:
                        raise ValueError("Unreviewed existing performance linkage lacks an exact retained locator")
                    continue
                if not review or group["groupId"] not in review["approved"] or len(group["existingMatches"]) != 1:
                    raise ValueError("Reviewed linkage lacks a unique explicitly approved decision")
                decision = review["approved"][group["groupId"]]
                association = review["associations"].get(str(match["resultId"]))
                approval = plan["reviewedReuse"]["approval"]
                if not association or decision["resultIds"] != [str(match["resultId"])] or decision["athleteIds"] != [str(match["athleteId"])] or sorted(decision["sourceKeys"]) != group["sourceKeys"] or decision["finishSeconds"] != group["finishSeconds"]:
                    raise ValueError("Reviewed linkage differs from its approved decision")
                if match.get("reviewManifestDigest") != review["digest"] or match.get("reviewApprovalId") != approval["approvalId"] or match.get("reviewDecisionId") != group["groupId"]:
                    raise ValueError("Reviewed linkage lost its approval provenance")
                if match.get("originalDate") != association.get("originalDate") or match.get("originalYear") != association.get("originalYear") or match.get("historyIdentity") != association.get("historyIdentity") or match.get("preserveExistingPerformanceFields") is not True or match.get("preserveVerification") is not True:
                    raise ValueError("Reviewed linkage would rewrite existing history precision or verification")
                if snapshot is not None and _hash(snapshot_results.get(str(match["resultId"]))) != match.get("existingSnapshotResultDigest"):
                    raise ValueError("Reviewed target performance changed after planning")
                if set(group.get("resolvedReviewReasons", [])) - (REVIEW_RESOLVABLE_REASONS | {"existing_locator_edition_conflict"}):
                    raise ValueError("Reviewed association improperly cleared a source or identity conflict")
                reviewed_groups.add(group["groupId"])
            continue
        if group["disposition"] != "new" or not any(o["provider"] == PACE for o in rows):
            raise ValueError("Only a licensed Pace Notes observation can create a new profile")
        history, draft = group["history"], group["athleteDraft"]
        key = (history["provider"], history["externalId"])
        if draft["slug"] in new_slugs or key in histories:
            raise ValueError("New profile or history identifiers collide")
        new_slugs.add(draft["slug"])
        histories.add(key)
        if draft["claimed"] is not False or draft["identityVerified"] is not False or draft["nationality"] is not None or draft["dateOfBirth"] is not None:
            raise ValueError("A provisional profile contains unsupported identity facts")
        if history["complete"] is not False or len(history["performances"]) != 1:
            raise ValueError("A new source profile must contain one incomplete-history observation")
        performance = history["performances"][0]
        primary = by_key[group["primaryObservationKey"]]
        expected_external_id = f"london-{YEAR}:{primary['sourceScope'].lower()}:{primary['sourceResultId']}"
        if (history["externalId"] != expected_external_id or draft["slug"] != _profile_slug(primary["name"], primary["sourceKey"])
                or history["yearsExpected"] != [YEAR] or history["yearsCaptured"] != [YEAR]
                or performance["year"] != YEAR or performance["date"] != DATE or performance["sourceDate"] != DATE):
            raise ValueError("New profile or performance crosses the configured edition")
        if performance["verificationStatus"] != "unverified" or performance["timing"] != {"basis": "unknown"}:
            raise ValueError("Secondary history evidence must remain unverified with unknown time basis")
        if performance["places"] != {"overall": None, "gender": None, "category": None} or performance["place"] != "":
            raise ValueError("A qualified secondary archive place was promoted")
        if performance["performance"] != group["finishTime"] or performance["sourceKeys"] != group["sourceKeys"]:
            raise ValueError("History performance differs from the retained source group")
    counts = Counter(g["disposition"] for g in plan["groups"])
    summary = plan["summary"]
    if any(summary[k] != counts[k] for k in ("new", "linked", "held")) or summary["sourceObservations"] != len(observations) or summary["performanceGroups"] != len(plan["groups"]):
        raise ValueError("Plan summary does not account for its records")
    expected_accounting = {"inputObservations": len(observations), "assignedObservations": len(observations), "unassignedObservations": 0, "multiplyAssignedObservations": 0}
    if plan["accounting"] != expected_accounting:
        raise ValueError("Plan accounting is inconsistent")
    if review and (reviewed_groups != set(review["approved"]) or any(g["disposition"] != "held" for g in plan["groups"] if g["groupId"] in review["held"])):
        raise ValueError("Reviewed decisions and held conflicts were not applied exactly")
    if summary.get("reviewedExistingPerformanceLinks") != len(reviewed_groups):
        raise ValueError("Reviewed linkage summary is inconsistent")
    return True


def _main():
    import argparse
    import gzip

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inputs", type=Path, required=True, help="Recovered immutable source directory")
    parser.add_argument("--snapshot", type=Path, required=True, help="Private normalized directory/result snapshot JSON")
    parser.add_argument("--edition", type=Path, required=True, help="Reviewed canonical edition JSON")
    parser.add_argument("--batch-id", required=True)
    parser.add_argument("--created-at", required=True, help="Explicit ISO timestamp, for a reproducible plan")
    parser.add_argument("--output", type=Path, required=True, help="Private output outside the source-control tree")
    parser.add_argument("--review-manifest", type=Path, help="Optional frozen independent same-performance review")
    parser.add_argument("--review-manifest-sha256", help="Exact approved byte SHA256 of the review file")
    parser.add_argument("--review-approval", type=Path, help="Explicit root approval record, bound to review and snapshot")
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[2]
    output = args.output.resolve()
    if output.is_relative_to(repo):
        parser.error("Private source observations and plans must be saved outside the source-control tree")
    review_args = [args.review_manifest, args.review_manifest_sha256, args.review_approval]
    if any(review_args) and not all(review_args):
        parser.error("Reviewed reuse requires --review-manifest, --review-manifest-sha256 and --review-approval together")
    rows = load_sources(args.inputs)
    snapshot = json.loads(args.snapshot.read_text())
    edition = json.loads(args.edition.read_text())
    review_manifest = load_review_manifest(args.review_manifest, args.review_manifest_sha256) if args.review_manifest else None
    review_approval = json.loads(args.review_approval.read_text()) if args.review_approval else None
    if review_approval and review_approval.get("manifestFileSha256") != args.review_manifest_sha256:
        parser.error("The review approval and explicit review-file digest differ")
    result = build_plan(rows, snapshot, edition, args.batch_id, args.created_at, review_manifest=review_manifest, review_approval=review_approval)
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_suffix(output.suffix + ".writing")
    if output.suffix == ".gz":
        with gzip.GzipFile(filename=str(temp), mode="wb", compresslevel=3, mtime=0) as handle:
            chunks, size = [], 0
            for chunk in json.JSONEncoder(ensure_ascii=False, separators=(",", ":"), allow_nan=False).iterencode(result):
                chunks.append(chunk)
                size += len(chunk)
                if size >= 1024 * 1024:
                    handle.write("".join(chunks).encode("utf-8"))
                    chunks, size = [], 0
            if chunks:
                handle.write("".join(chunks).encode("utf-8"))
    else:
        with temp.open("w", encoding="utf-8") as handle:
            json.dump(result, handle, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    temp.replace(output)
    print(json.dumps({"output": str(output), "summary": result["summary"], "accounting": result["accounting"]}))


if __name__ == "__main__":
    _main()
