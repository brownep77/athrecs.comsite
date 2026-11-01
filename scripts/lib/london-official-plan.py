"""Pure London profile planning from the official results website. No network or DB writes.

configure(context) binds one validated edition (scripts/lib/london-official-context.py).

Public API: load_sources(input_dir), normalize_official_row(record, captured_at),
build_plan(observations, snapshot, edition, batch_id, created_at),
validate_plan(plan, snapshot=None).

The retained year file was captured from results.tcslondonmarathon.com, which
the owner accepted as a primary verification source (15 October 2026). Each
row keeps its result locator (idp), event code, capture date and every mapped
field, so a new performance is `source_verified`. That verifies the result row,
not the athlete's identity: every profile remains provisional and unclaimed.

The duplicate screen reuses the Pace Notes London planner's helpers and hold
rules. Snapshot results (canonical or source histories, including earlier
Pace Notes, mika:timing and World Marathon Majors London histories) are matched
by the official result locator (same year and idp on the official results host)
or by the same bib within this London edition. Any name, time, gender,
nationality or age-category conflict holds the row. Names never establish identity.
"""

from __future__ import annotations

import copy
import importlib.util
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


def _load(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Definitions only; importing performs no network or database work.
base = _load("london_official_base_plan", "london-profile-plan.py")
_context = _load("london_official_context", "london-official-context.py")
evidence = _load("london_official_evidence", "london-official-evidence.py")
_screen = base._screen

OFFICIAL = "london-official"
PROVIDER_NAME = "TCS London Marathon results"
HOST = "results.tcslondonmarathon.com"
RECORD_KEYS = {
    "year", "event", "event_label", "gender", "place_overall", "place_gender", "place_category",
    "last_name", "first_name", "nationality", "club", "bib", "category", "half", "finish", "idp",
}
WHEELCHAIR_LABELS = {"Wheelchair", "Para wheelchair"}
MATCH_METHODS = {"exact_official_result_locator", "same_edition_bib", "same_name_time_edition_evidence"}

YEAR = None
DATE = None
EDITION_KEY = None
EDITION_CONTEXT = None

# Reused helpers (deliberately not copied).
_clean, name_key, screening_name_keys = base._clean, base.name_key, base.screening_name_keys
candidate_name_keys, snapshot_name_keys = base.candidate_name_keys, base.snapshot_name_keys
_hash, _file_hash, _timestamp, parse_finish_time = base._hash, base._file_hash, base._timestamp, base.parse_finish_time
_name_flags, _names, _entity_id, _result_times = base._name_flags, base._names, base._entity_id, base._result_times
_conflicting_facts, _existing_result_flags = base._conflicting_facts, base._existing_result_flags
_source_name_collisions = base._source_name_collisions


def configure(context):
    """Bind exactly one validated official edition; there is no default edition."""
    global YEAR, DATE, EDITION_KEY, EDITION_CONTEXT
    if context is None:
        raise ValueError("The official-results adapter requires an explicit edition configuration")
    context = _context.validate_context(context)
    EDITION_CONTEXT = context
    YEAR, DATE = context["year"], context["date"]
    EDITION_KEY = f"london-marathon:{YEAR}"
    return copy.deepcopy(context)


def _require_configured():
    if EDITION_CONTEXT is None:
        raise ValueError("Configure an official London edition first")


def detail_url(event, idp):
    """The results site's own detail-page address for an observed row locator."""
    return f"https://{HOST}/{YEAR}/?content=detail&idp={idp}&event={event}"


def official_locator(url):
    """(year, idp) when a URL is an official London results detail page, else None."""
    try:
        parts = urlsplit(str(url))
    except ValueError:
        return None
    if parts.scheme not in ("http", "https") or parts.netloc.lower() not in (HOST, "results.virginmoneylondonmarathon.com"):
        return None
    match = re.fullmatch(r"/(\d{4})/?", parts.path)
    query = parse_qs(parts.query)
    idp = query.get("idp") or query.get("id")
    if not match or not idp or len(idp) != 1 or not re.fullmatch(r"[A-Za-z0-9]{8,40}", idp[0]):
        return None
    return int(match[1]), idp[0].upper()


def _source_key(event, idp):
    return f"{EDITION_KEY}:{OFFICIAL}:{event}:{idp}"


def _place(value):
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ValueError("Official placings must be positive integers")
    return value


def _split(value):
    if value in (None, ""):
        return None
    try:
        return parse_finish_time(value)[0]
    except ValueError:
        return None


def discipline_for(label):
    return "Marathon (wheelchair)" if label in WHEELCHAIR_LABELS else "Marathon"


def normalize_official_row(record, captured_at):
    """Map one retained official row by its field names, promoting nothing."""
    _require_configured()
    if not isinstance(record, dict) or set(record) != RECORD_KEYS:
        raise ValueError("Official row does not match the retained schema")
    if record["year"] != YEAR:
        raise ValueError("Official row is outside the configured edition")
    event, label = record["event"], record["event_label"]
    if event not in EDITION_CONTEXT["expectedByEvent"] or _context.EVENTS.get(event) != label:
        raise ValueError("Unexpected official event code or label")
    idp = _clean(record["idp"]).upper()
    if not re.fullmatch(r"[A-Z0-9]{8,40}", idp):
        raise ValueError("Official row lacks a usable result locator")
    given, family = _clean(record["first_name"]), _clean(record["last_name"])
    name = _clean(f"{given} {family}")
    flags = list(_name_flags(name, given, family))
    try:
        finish_time, seconds = parse_finish_time(_clean(record["finish"]))
    except ValueError:
        finish_time, seconds = None, None
        flags.append("unparsed_official_finish_time")
    gender = {"M": "M", "W": "F", "X": "X"}.get(record["gender"])
    if record["gender"] not in ("M", "W", "X", None):
        flags.append("unrecognised_source_gender")
    nationality = _clean(record["nationality"]).upper() or None
    if nationality and not re.fullmatch(r"[A-Z]{3}", nationality):
        flags.append("unrecognised_source_nationality")
        nationality = None
    half = _split(record["half"])
    if record["half"] and half is None:
        flags.append("unparsed_official_half_split")
    places = {k: _place(record["place_" + k]) for k in ("overall", "gender", "category")}
    if not places["overall"]:
        flags.append("missing_official_overall_place")
    key = _source_key(event, idp)
    return {
        "observationKey": key, "sourceKey": key, "provider": OFFICIAL, "providerName": PROVIDER_NAME,
        "editionKey": EDITION_KEY, "sourceResultId": idp, "sourceScope": event, "eventLabel": label,
        "discipline": discipline_for(label), "sourceUrl": detail_url(event, idp),
        "publicationUrl": f"https://{HOST}/{YEAR}/", "capturedAt": _timestamp(captured_at),
        "name": name, "originalName": f"{family}, {given}" + (f" ({nationality})" if nationality else ""),
        "givenName": given or None, "familyName": family or None, "gender": gender,
        "originalGender": record["gender"], "category": _clean(record["category"]),
        "nationality": nationality, "dateOfBirth": None, "club": _clean(record["club"]) or None,
        "bib": _clean(record["bib"]) or None, "places": places,
        "finishTime": finish_time, "originalFinishTime": _clean(record["finish"]), "finishSeconds": seconds,
        # The site's finish column is the net (chip) time; gun time is not captured.
        "timing": {"basis": "chip", "chip": finish_time} if finish_time else {"basis": "unknown"},
        "halfSplit": half, "qualityFlags": sorted(set(flags)),
        "sourceVerification": "official_primary_source", "identityVerified": False,
        "original": dict(record),
    }


def load_sources(input_dir):
    """Load the checksum-pinned year file. Never drops a source record."""
    _require_configured()
    path = Path(input_dir) / EDITION_CONTEXT["sourceFile"]
    if _file_hash(path) != EDITION_CONTEXT["sourceSha256"]:
        raise ValueError("Retained official source checksum changed: " + path.name)
    records = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(records, list) or len(records) != EDITION_CONTEXT["expectedRows"]:
        raise ValueError("Official source row count differs from its configuration")
    if Counter(r.get("event") for r in records) != Counter(EDITION_CONTEXT["expectedByEvent"]):
        raise ValueError("Official source per-event counts differ from their configuration")
    observations = [normalize_official_row(r, EDITION_CONTEXT["capturedAt"]) for r in records]
    if len({o["sourceKey"] for o in observations}) != len(observations):
        raise ValueError("Duplicate official result locators")
    if len({o["sourceResultId"] for o in observations}) != len(observations):
        raise ValueError("One official result locator appears in several events")
    return observations


def _group(observation):
    return {
        "groupId": f"london-official-{YEAR}-performance-" + _hash(observation["sourceKey"])[:24],
        "primaryObservationKey": observation["observationKey"],
        "observationKeys": [observation["observationKey"]], "sourceKeys": [observation["sourceKey"]],
        "sourceUrls": [observation["sourceUrl"]], "sourceResultId": observation["sourceResultId"],
        "name": observation["name"], "names": [observation["name"]],
        "finishTime": observation["finishTime"], "finishSeconds": observation["finishSeconds"],
        "crossSourcePair": False, "identityVerified": False,
        "reasons": list(observation["qualityFlags"]),
    }


def _profile_slug(name, source_key):
    return base._profile_slug(name, source_key).replace(f"-london-{base.YEAR}-", f"-london-{YEAR}-")


def _history_and_athlete(group, observation, edition, batch_id):
    o = observation
    history_id = f"london-official-{YEAR}:{o['sourceScope'].lower()}:{o['sourceResultId']}"
    labels = ["Official results", "Chip time", "Athlete identity provisional"]
    if o["discipline"] != "Marathon":
        labels.append("Wheelchair race")
    if o["eventLabel"] not in ("Mass",):
        labels.append(o["eventLabel"] + " race")
    performance = {
        "year": YEAR, "date": edition["date"], "sourceDate": edition["date"],
        "ageGroup": o["category"], "discipline": o["discipline"], "division": o["eventLabel"],
        "performance": o["finishTime"], "timing": copy.deepcopy(o["timing"]),
        "wind": "", "place": str(o["places"]["overall"] or ""), "places": dict(o["places"]),
        "bib": o["bib"] or "", "splits": [{"label": "Half", "value": o["halfSplit"]}] if o["halfSplit"] else [],
        "sourceClub": o["club"] or "", "venue": "London", "meeting": edition["eventName"],
        "eventSlug": edition["eventSlug"], "country": edition["country"],
        "sourceUrls": group["sourceUrls"], "sourceKeys": group["sourceKeys"], "labels": labels,
        "providerName": PROVIDER_NAME, "verificationStatus": "source_verified",
        "notes": "Result row captured from the official London Marathon results website. Finish time is the published net (chip) time; gun time was not captured. The result row is source verified; the athlete identity is provisional.",
        "archiveReference": {
            "batchId": batch_id, "editionId": edition["id"], "groupId": group["groupId"],
            "identityVerified": False, "originalOfficialPageChecked": True,
            "rowLocator": {"idp": o["sourceResultId"], "event": o["sourceScope"], "year": YEAR},
            "capturedAt": o["capturedAt"],
            "sourceComparison": "Official listing row mapped by column heading; per-event counts equal the site's placed-finisher totals.",
            "observationKeys": group["observationKeys"],
            "sourceObservations": [{
                "provider": PROVIDER_NAME, "sourceResultId": o["sourceResultId"], "sourceKey": o["sourceKey"],
                "sourceUrl": o["sourceUrl"], "capturedAt": o["capturedAt"], "originalName": o["originalName"],
                "originalFinishTime": o["originalFinishTime"], "originalGender": o["originalGender"],
                "nationality": o["nationality"], "event": o["sourceScope"], "eventLabel": o["eventLabel"],
            }],
        },
    }
    history = {
        "provider": PROVIDER_NAME, "externalId": history_id, "sourceUrl": o["publicationUrl"],
        "capturedAt": o["capturedAt"], "complete": False,
        "yearsExpected": [YEAR], "yearsCaptured": [YEAR], "performances": [performance],
    }
    details = {
        "aliases": group["names"], "athlete_verified": False,
        "identity_review_status": "provisional_source_profile",
        "currentClubAssociationConfirmed": False,
        "archiveCreation": {
            "batchId": batch_id, "groupId": group["groupId"],
            "identityBasis": "Provisional profile for one official source-located performance; identity not independently verified.",
            "sourceResultKeys": group["sourceKeys"],
        },
    }
    ie = group.get("identityEvidence") or {}
    if ie.get("decision") == "create_possible_duplicate":
        # Staff-only (profile_details is never projected publicly beyond its allow-list).
        details["identity_review_status"] = evidence.DUPLICATE_REVIEW_STATUS
        details["possibleDuplicateOf"] = ie["possibleDuplicateOf"]
        details["possibleDuplicateReview"] = {"queue": "athlete_possible_duplicates", "policy": ie["policy"],
                                              "policyVersion": ie["policyVersion"], "batchId": batch_id}
    if o["nationality"]:
        details["sourceNationalityObservation"] = {"value": o["nationality"], "provider": PROVIDER_NAME, "sourceUrl": o["sourceUrl"]}
    draft = {
        "slug": _profile_slug(o["name"], o["sourceKey"]),
        "displayName": o["name"], "givenName": o["givenName"], "familyName": o["familyName"],
        "gender": o["gender"], "nationality": o["nationality"], "dateOfBirth": None,
        "aliases": group["names"], "identityVerified": False, "claimed": False,
        "sourceResultKeys": group["sourceKeys"], "profileDetails": details,
    }
    return history, draft


def build_plan(observations, snapshot, edition, batch_id, created_at, *, candidate_evidence=None, chains=None,
               policy=None, already_imported=None):
    """already_imported: {groupId: disposition} from an earlier published plan of this edition (top-up batches)."""
    policy = policy or evidence.CONSERVATIVE
    if policy not in evidence.POLICIES:
        raise ValueError("Unknown identity policy")
    if policy == evidence.PUBLISH_LEANING and candidate_evidence is None:
        raise ValueError("The publish-leaning policy needs candidate evidence")
    """Prepare an immutable, fully accounted plan. Creates nothing."""
    _require_configured()
    if edition != EDITION_CONTEXT["edition"] or batch_id != EDITION_CONTEXT["batchId"]:
        raise ValueError("Plan edition or batch differs from its frozen configuration")
    if (snapshot.get("metadata") or {}).get("editionContextDigest") != _hash(EDITION_CONTEXT):
        raise ValueError("Snapshot was not taken under this edition configuration")
    if Counter(o["sourceScope"] for o in observations) != Counter(EDITION_CONTEXT["expectedByEvent"]):
        raise ValueError("Plan input does not cover the complete configured collection")
    accepted_editions = {_entity_id(edition["id"]), *(_entity_id(v) for v in edition.get("equivalentIds", []))}
    _timestamp(created_at)
    observations = sorted(observations, key=lambda o: o["observationKey"])
    by_observation = {o["observationKey"]: o for o in observations}
    if len(by_observation) != len(observations):
        raise ValueError("Repeated source result key in planner input")
    for o in observations:
        if o["provider"] != OFFICIAL or o["editionKey"] != EDITION_KEY or o["sourceKey"] != _source_key(o["sourceScope"], o["sourceResultId"]):
            raise ValueError("Unexpected source observation scope or locator")
        if o["identityVerified"] is not False or o["sourceUrl"] != detail_url(o["sourceScope"], o["sourceResultId"]):
            raise ValueError("Observation identity or locator was altered")
    groups = [_group(o) for o in observations]
    snapshot_digest = _hash(snapshot)
    source_reasons, source_witnesses = _source_name_collisions(groups)
    allowed_keys = {key for g in groups for n in g["names"] for key in screening_name_keys(n)}
    directory_index, athlete_by_id, account_links = defaultdict(set), {}, {}
    for athlete in snapshot.get("athletes", []):
        athlete_id = _entity_id(athlete["id"])
        if athlete_id in athlete_by_id:
            raise ValueError("Snapshot repeats an athlete ID")
        athlete_by_id[athlete_id] = athlete
        for n in _names(athlete):
            for key in screening_name_keys(n) & allowed_keys:
                directory_index[key].add("athlete:" + athlete_id)
    for account in snapshot.get("accounts", []):
        account_id = _entity_id(account["id"])
        if account_id in account_links:
            raise ValueError("Snapshot repeats an account ID")
        account_links[account_id] = {_entity_id(v) for v in account.get("linkedAthleteIds", [])}
        for n in _screen.finder.names_from(account.get("names", [])):
            for key in screening_name_keys(n) & allowed_keys:
                directory_index[key].add("account:" + account_id)
    locator_index, performance_index, result_ids = defaultdict(list), defaultdict(list), set()
    bib_index = defaultdict(list)
    source_bibs = Counter(o["bib"].upper() for o in observations if o["bib"])

    def in_edition(result):
        if str(result.get("editionId")) in accepted_editions:
            return True
        # Year-only histories (e.g. ranking imports) count only with explicit London
        # marathon event text, this year and no conflicting date.
        return (result.get("editionId") is None and result.get("meetingIsLondon") is True
                and str(result.get("year")) == str(YEAR) and result.get("date") in (None, "", edition["date"])
                and result.get("distanceKm") in (None, edition["distanceKm"]))

    for result in snapshot.get("results", []):
        result_id = _entity_id(result["id"])
        if result_id in result_ids:
            raise ValueError("Snapshot repeats a result ID")
        result_ids.add(result_id)
        _entity_id(result["athleteId"])
        _result_times(result)
        if not isinstance(result.get("sourceUrls"), list):
            raise ValueError("Snapshot result sourceUrls must be a list")
        for locator in sorted({official_locator(u) for u in result["sourceUrls"]} - {None}):
            if locator[0] == YEAR:
                locator_index[locator[1]].append(result)
        if in_edition(result) and result.get("bib"):
            bib_index[str(result["bib"]).upper()].append(result)
        # Ranking places were checked against 2026 and are not the official
        # overall place, so they are never used as a locator. Same-name,
        # same-time performances in this edition are review candidates only.
        if in_edition(result):
            for seconds in _result_times(result):
                performance_index[seconds].append(result)
    if candidate_evidence is not None:
        meta = candidate_evidence.get("metadata") or {}
        if meta.get("snapshotDigest") != snapshot_digest or meta.get("digest") != _hash(candidate_evidence["athletes"]):
            raise ValueError("Candidate evidence was not read for this snapshot")
    if chains is not None and chains.get("policyVersion") != evidence.CHAIN_VERSION:
        raise ValueError("Unexpected cross-year chain index")
    exact_directory = defaultdict(set)
    for athlete_id, athlete in athlete_by_id.items():
        for n in _names(athlete):
            exact_directory[name_key(n)].add(athlete_id)
    field_names = Counter(name_key(o["name"]) for o in observations)
    linked_athletes = {a for links in account_links.values() for a in links}
    same_edition_athletes = {_entity_id(r["athleteId"]) for r in snapshot.get("results", []) if in_edition(r)}
    facts_cache = {}

    def facts_for(athlete_id):
        if athlete_id not in facts_cache:
            facts = evidence.candidate_facts(athlete_by_id[athlete_id], (candidate_evidence or {}).get("athletes", {}).get(athlete_id))
            facts["accountLinked"] = athlete_id in linked_athletes
            facts_cache[athlete_id] = facts
        return facts_cache[athlete_id]

    for group in groups:
        o = by_observation[group["primaryObservationKey"]]
        reasons = set(group["reasons"]) | source_reasons.get(group["groupId"], set())
        candidates = set()
        for n in group["names"]:
            for key in screening_name_keys(n):
                candidates.update(directory_index.get(key, ()))
        found = {}
        for result in locator_index.get(group["sourceResultId"], []):
            found.setdefault(_entity_id(result["id"]), (result, "exact_official_result_locator"))
        # A bib repeated across this year's events (e.g. elite and wheelchair) is not a locator.
        if o["bib"] and source_bibs[o["bib"].upper()] == 1:
            for result in bib_index.get(o["bib"].upper(), []):
                found.setdefault(_entity_id(result["id"]), (result, "same_edition_bib"))
        existing_matches, matched_athlete_ids = [], set()
        for _, (result, method) in sorted(found.items()):
            athlete_id = _entity_id(result["athleteId"])
            matched_athlete_ids.add(athlete_id)
            athlete = athlete_by_id.get(athlete_id)
            mismatch = []
            if (str(result.get("editionId")) not in accepted_editions and result.get("editionId") is not None
                    or result.get("date") not in (None, "", edition["date"])
                    or result.get("year") not in (None, YEAR, str(YEAR))
                    or result.get("distanceKm") not in (None, edition["distanceKm"])):
                mismatch.append("existing_locator_edition_conflict")
            if group["finishSeconds"] is None or group["finishSeconds"] not in _result_times(result):
                mismatch.append("existing_locator_time_conflict")
            if not athlete:
                mismatch.append("existing_locator_athlete_missing")
            else:
                if not {name_key(n) for n in _names(athlete)} & {name_key(n) for n in group["names"]}:
                    mismatch.append("existing_locator_name_conflict")
                mismatch.extend(_conflicting_facts([o], athlete, result, edition))
            mismatch.extend(_existing_result_flags(result))
            reasons.update(mismatch)
            existing_matches.append({
                "resultId": result["id"], "athleteId": result["athleteId"], "editionId": result.get("editionId"),
                "matchedUrls": sorted(u for u in result["sourceUrls"] if official_locator(u) == (YEAR, group["sourceResultId"])),
                "matchedBib": o["bib"] if method == "same_edition_bib" else None,
                "matchedTimeSeconds": group["finishSeconds"] if group["finishSeconds"] in _result_times(result) else None,
                "sourceKind": result.get("sourceKind"), "provider": result.get("provider"),
                "conflicts": sorted(set(mismatch)), "method": method,
                "basis": {
                    "exact_official_result_locator": "Same official result locator (year and idp)",
                    "same_edition_bib": "Same bib in the same London edition",
                }[method] + ", known full name/alias and compatible recorded time/facts.",
            })
        if len(matched_athlete_ids) > 1:
            reasons.add("same_result_locator_on_multiple_athletes")
        same_performance = []
        if group["finishSeconds"] is not None:
            for result in performance_index.get(group["finishSeconds"], []):
                if any(str(m["resultId"]) == str(result["id"]) for m in existing_matches):
                    continue
                athlete = athlete_by_id.get(_entity_id(result["athleteId"]))
                if not athlete or not {name_key(n) for n in _names(athlete)} & {name_key(n) for n in group["names"]}:
                    continue
                if _conflicting_facts([o], athlete, result, edition) or _existing_result_flags(result):
                    continue
                same_performance.append({
                    "resultId": result["id"], "athleteId": result["athleteId"], "editionId": result.get("editionId"),
                    "timeSeconds": group["finishSeconds"], "sourceKind": result.get("sourceKind"),
                    "existingSourceUrls": sorted(set(result["sourceUrls"])),
                    "action": "review_existing_same_performance",
                })
        if same_performance:
            reasons.add("same_performance_without_matching_locator_requires_review")
        if candidates and not existing_matches:
            reasons.add("existing_name_or_alias_requires_review")
        if existing_matches:
            for candidate in candidates:
                if candidate.startswith("account:"):
                    links = account_links[candidate[len("account:"):]]
                    if links and not links & matched_athlete_ids:
                        reasons.add("possible_account_identity_conflict")
        group["existingCandidates"] = sorted(candidates)[:20]
        group["existingCandidateCount"] = len(candidates)
        group["sourceNameCollisionWitnesses"] = sorted(source_witnesses.get(group["groupId"], ()))
        group["existingMatches"] = existing_matches
        group["samePerformanceCandidates"] = sorted(same_performance, key=lambda r: str(r["resultId"]))
        group["reasons"] = sorted(reasons)
        if candidate_evidence is not None and reasons and reasons <= evidence.soft_reasons(policy):
            athlete_tokens = sorted(c for c in candidates if c.startswith("athlete:"))
            account_tokens = sorted(c for c in candidates if c.startswith("account:"))
            incoming = evidence.birth_interval(YEAR, o["category"])
            chain = (chains or {}).get("chains", {}).get((chains or {}).get("members", {}).get(f"{YEAR}:{o['sourceResultId']}"))
            exact = name_key(o["name"])
            rare = (len(exact_directory.get(exact, ())) <= evidence.RARE_NAME_MAX_DIRECTORY and field_names[exact] <= evidence.RARE_NAME_MAX_FIELD
                    and chains is not None and evidence.corpus_consistent(chains.get("nameRows", {}).get(exact), o, incoming))
            scores = []
            for token in athlete_tokens:
                athlete_id = token[len("athlete:"):]
                facts = facts_for(athlete_id)
                scores.append(evidence.score_candidate(
                    o, facts, incoming, chain, rare and athlete_id in exact_directory.get(exact, ()), YEAR))
            decision, details = evidence.decide(
                o, group, scores, account_candidates=account_tokens, field_name_count=field_names[exact],
                same_edition_athletes=same_edition_athletes, incoming_interval=incoming, policy=policy)
            # A same-name, same-time record of this edition on the single compatible
            # candidate is the same performance: add evidence, never a second row.
            if (len(same_performance) == 1 and details.get("holdReason") == "candidate_already_has_this_edition"):
                only = [c for c in scores if not c["hardContradictions"]]
                chosen = only[0] if len(only) == 1 else None
                if (chosen and chosen["athleteId"] == _entity_id(same_performance[0]["athleteId"]) and not chosen["softConflicts"]
                        and not chosen["privacyFlags"] and not chosen["accountLinked"]
                        and chosen["signals"]["gender"] != "conflict" and chosen["signals"]["nationality"] != "conflict"):
                    decision = "link_existing_performance"
                    details = {**details, "chosenAthleteId": chosen["athleteId"],
                               "decisionBasis": "Single compatible candidate holds a same-name, same-time record of this London edition."}
            if chain:
                details["chainId"] = (chains or {}).get("members", {}).get(f"{YEAR}:{o['sourceResultId']}")
            group["identityEvidence"] = {"decision": decision, **details}
            if decision == "link_existing_performance":
                sp = same_performance[0]
                existing_matches = [{
                    "resultId": sp["resultId"], "athleteId": sp["athleteId"], "editionId": sp.get("editionId"),
                    "matchedUrls": [], "matchedBib": None, "matchedTimeSeconds": group["finishSeconds"],
                    "sourceKind": sp.get("sourceKind"), "provider": None, "conflicts": [],
                    "method": "same_name_time_edition_evidence",
                    "basis": "Same exact name and time in this London edition on the single compatible candidate; multi-signal evidence recorded.",
                }]
                group["existingMatches"] = existing_matches
                group["resolvedReasons"], reasons = sorted(reasons), set()
            elif decision in ("append_history", "distinct_person", "create_no_candidates", "create_possible_duplicate"):
                group["resolvedReasons"], reasons = sorted(reasons), set()
            group["reasons"] = sorted(reasons)
        if reasons:
            group["disposition"], group["action"] = "held", "hold_for_review"
        elif existing_matches:
            group["disposition"], group["action"] = "linked", "reuse_existing_performance"
            group["athleteId"] = existing_matches[0]["athleteId"]
            group["resultIds"] = [m["resultId"] for m in existing_matches]
        elif (group.get("identityEvidence") or {}).get("decision") == "append_history":
            group["disposition"], group["action"] = "evidence_linked", "append_official_performance_to_existing_athlete"
            group["athleteId"] = group["identityEvidence"]["chosenAthleteId"]
            group["history"] = _history_and_athlete(group, o, edition, batch_id)[0]
        else:
            group["disposition"], group["action"] = "new", "create_unclaimed_profile_with_one_performance"
            group["history"], group["athleteDraft"] = _history_and_athlete(group, o, edition, batch_id)
    for group in groups:
        earlier = (already_imported or {}).get(group["groupId"])
        if earlier in ("new", "linked", "evidence_linked"):
            # Published by an earlier batch of this edition: nothing to do again.
            for key in ("history", "athleteDraft"):
                group.pop(key, None)
            group["previousDisposition"] = earlier
            group["disposition"], group["action"] = "already_imported", "none"
    dispositions = Counter(g["disposition"] for g in groups)
    summary = {
        "sourceObservations": len(observations),
        "observationsByEvent": dict(sorted(Counter(o["sourceScope"] for o in observations).items())),
        "performanceGroups": len(groups), "new": dispositions["new"], "linked": dispositions["linked"],
        "held": dispositions["held"], "evidenceLinked": dispositions["evidence_linked"],
        "alreadyImported": dispositions["already_imported"], "policy": policy,
        "possibleDuplicateCreated": sum(g["disposition"] == "new" and (g.get("identityEvidence") or {}).get("decision") == "create_possible_duplicate" for g in groups),
        "linkedByMethod": dict(sorted(Counter(g["existingMatches"][0]["method"] for g in groups if g["disposition"] == "linked").items())),
        "distinctPersonCreated": sum(g["disposition"] == "new" and (g.get("identityEvidence") or {}).get("decision") == "distinct_person" for g in groups),
        "evidenceHoldReasons": dict(sorted(Counter((g.get("identityEvidence") or {}).get("holdReason") for g in groups if g["disposition"] == "held" and g.get("identityEvidence")).items())),
        "heldReasons": dict(sorted(Counter(r for g in groups if g["disposition"] == "held" for r in g["reasons"]).items())),
        "qualityFlaggedObservations": sum(bool(o["qualityFlags"]) for o in observations),
        "newWithSourceNationality": sum(bool(g.get("athleteDraft", {}).get("nationality")) for g in groups),
        "officialResultsVerified": dispositions["new"] + dispositions["evidence_linked"], "athleteIdentitiesVerified": 0,
    }
    plan = {
        "schemaVersion": "london-official-profile-plan/v1", "batchId": batch_id, "createdAt": created_at,
        "edition": dict(edition), "editionContext": copy.deepcopy(EDITION_CONTEXT),
        "sourceAttribution": [{
            "provider": OFFICIAL, "credit": PROVIDER_NAME, "publicationUrl": f"https://{HOST}/{YEAR}/",
            "sourceVerification": "official_primary_source",
            "acceptedBy": "Owner instruction, 15 October 2026 (AGENTS.md)",
            "coverage": "All placed finishers in the captured race-day events; counts equal the site's own totals.",
        }],
        "inputDigest": _hash(observations), "snapshotDigest": snapshot_digest,
        "previousPlanGroups": len(already_imported or {}),
        "identityEvidence": {
            "policyVersion": evidence.POLICY_VERSION, "policy": policy,
            "candidateEvidenceDigest": (candidate_evidence or {}).get("metadata", {}).get("digest"),
            "candidateEvidenceReadAt": (candidate_evidence or {}).get("metadata", {}).get("readAt"),
            "chainIndexDigest": _hash(chains) if chains is not None else None,
            "thresholds": {"RARE_NAME_MAX_DIRECTORY": evidence.RARE_NAME_MAX_DIRECTORY, "RARE_NAME_MAX_FIELD": evidence.RARE_NAME_MAX_FIELD,
                           "TIME_BAND": list(evidence.TIME_BAND), "OTHER_PROVIDER_AGE_WIDEN": evidence.OTHER_PROVIDER_AGE_WIDEN,
                           "MIN_AGE_GAP_FOR_CONTRADICTION": evidence.MIN_AGE_GAP_FOR_CONTRADICTION,
                           "MIN_STRICT_OVERLAP_YEARS": evidence.MIN_STRICT_OVERLAP_YEARS,
                           "RIEGEL_EXPONENT": evidence.RIEGEL_EXPONENT,
                           "AUTO_LINK_MIN_SCORE": evidence.AUTO_LINK_MIN_SCORE, "SCORE": evidence.SCORE},
        } if candidate_evidence is not None else None,
        "snapshotFingerprint": (snapshot.get("metadata") or {}).get("fingerprint"),
        "observations": observations, "groups": groups, "summary": summary,
        "accounting": {"inputObservations": len(observations), "assignedObservations": len(groups), "unassignedObservations": 0, "multiplyAssignedObservations": 0},
        "qualifications": [
            "New performances are official source rows (source_verified); athlete identities remain provisional.",
            "Source result locators are not persistent athlete identifiers.",
            "Linked groups add evidence to existing performances; they do not add duplicate history rows.",
            "Existing publication, privacy, ownership and verification settings must be preserved by the applier.",
        ],
    }
    validate_plan(plan, snapshot=snapshot)
    return plan


def validate_plan(plan, *, snapshot=None):
    """Reject lost observations, unsafe creation or accidental identity verification."""
    _require_configured()
    if plan.get("schemaVersion") != "london-official-profile-plan/v1":
        raise ValueError("Unexpected plan schema")
    if _context.validate_context(plan.get("editionContext")) != EDITION_CONTEXT:
        raise ValueError("Plan configuration differs from the configured adapter")
    if plan["edition"] != EDITION_CONTEXT["edition"] or plan["batchId"] != EDITION_CONTEXT["batchId"]:
        raise ValueError("Plan edition or batch differs from its frozen configuration")
    if snapshot is not None:
        if _hash(snapshot) != plan["snapshotDigest"]:
            raise ValueError("Plan validation was given a changed snapshot")
        if (snapshot.get("metadata") or {}).get("editionContextDigest") != _hash(EDITION_CONTEXT):
            raise ValueError("Snapshot configuration binding changed")
    observations = plan["observations"]
    if Counter(o["sourceScope"] for o in observations) != Counter(EDITION_CONTEXT["expectedByEvent"]):
        raise ValueError("Plan omits a configured source observation")
    if _hash(observations) != plan["inputDigest"]:
        raise ValueError("Plan observations changed after planning")
    by_key = {o["observationKey"]: o for o in observations}
    if len(by_key) != len(observations):
        raise ValueError("Plan repeats an observation")
    for o in observations:
        if o["provider"] != OFFICIAL or o["editionKey"] != EDITION_KEY or o["sourceKey"] != _source_key(o["sourceScope"], o["sourceResultId"]):
            raise ValueError("Plan contains observations from a different edition")
    assigned = Counter(k for g in plan["groups"] for k in g["observationKeys"])
    if set(assigned) != set(by_key) or any(n != 1 for n in assigned.values()):
        raise ValueError("Every source observation must be assigned exactly once")
    if len({g["groupId"] for g in plan["groups"]}) != len(plan["groups"]):
        raise ValueError("Plan repeats a performance group")
    slugs, histories = set(), set()
    policy = (plan.get("identityEvidence") or {}).get("policy") or evidence.CONSERVATIVE
    for g in plan["groups"]:
        if len(g["observationKeys"]) != 1 or g["primaryObservationKey"] != g["observationKeys"][0]:
            raise ValueError("Each official group has exactly one observation")
        o = by_key[g["primaryObservationKey"]]
        if g["sourceKeys"] != [o["sourceKey"]] or g["sourceUrls"] != [o["sourceUrl"]] or g["finishSeconds"] != o["finishSeconds"]:
            raise ValueError("Performance evidence does not match its observation")
        if g["identityVerified"] is not False:
            raise ValueError("A source row must not verify an identity")
        if g["disposition"] == "held":
            if not g["reasons"] or "history" in g or "athleteDraft" in g:
                raise ValueError("A held group cannot create a profile or history")
            continue
        if g["disposition"] == "already_imported":
            if "history" in g or "athleteDraft" in g or g.get("previousDisposition") not in ("new", "linked", "evidence_linked"):
                raise ValueError("An already imported group cannot create anything")
            continue
        if g["reasons"] or o["qualityFlags"]:
            raise ValueError("Unresolved source or identity flags must remain held")
        decision = (g.get("identityEvidence") or {}).get("decision")
        if g["disposition"] == "linked":
            if "history" in g or "athleteDraft" in g or not g["existingMatches"]:
                raise ValueError("A linked group reuses an existing performance only")
            if any(m["method"] not in MATCH_METHODS or m["conflicts"] for m in g["existingMatches"]):
                raise ValueError("A linked group needs a conflict-free official locator match")
            if len({str(m["athleteId"]) for m in g["existingMatches"]}) != 1 or str(g["athleteId"]) != str(g["existingMatches"][0]["athleteId"]):
                raise ValueError("A linked group must resolve to one existing athlete")
            if any(m["method"] == "same_name_time_edition_evidence" for m in g["existingMatches"]) and decision != "link_existing_performance":
                raise ValueError("A same-name, same-time link needs its recorded evidence decision")
            continue
        decision = (g.get("identityEvidence") or {}).get("decision")
        if decision and not set(g.get("resolvedReasons", [])) <= evidence.soft_reasons(policy):
            raise ValueError("Evidence may only resolve soft identity reasons")
        if g["disposition"] == "evidence_linked":
            ev = g["identityEvidence"]
            ranked = [c for c in ev["rankedCandidates"] if not c["hardContradictions"]]
            if (decision != "append_history" or "athleteDraft" in g or g["existingMatches"] or ev["accountCandidates"]
                    or str(g["athleteId"]) != str(ev["chosenAthleteId"]) or len(ranked) != 1
                    or ranked[0]["athleteId"] != str(ev["chosenAthleteId"]) or ranked[0]["privacyFlags"] or ranked[0]["accountLinked"]
                    or ranked[0]["score"] < evidence.AUTO_LINK_MIN_SCORE):
                raise ValueError("An evidence link needs one compatible, unprotected, strongly supported candidate")
            if g["history"] != _history_and_athlete(g, o, plan["edition"], plan["batchId"])[0]:
                raise ValueError("Appended history differs from its source observation")
            if g["history"]["externalId"] in histories:
                raise ValueError("Repeated history ID")
            histories.add(g["history"]["externalId"])
            continue
        if g["disposition"] != "new" or g["existingMatches"] or g["samePerformanceCandidates"]:
            raise ValueError("Only an unmatched clean group may create a profile")
        if g["existingCandidateCount"]:
            ev = g.get("identityEvidence") or {}
            if decision == "create_possible_duplicate":
                compatible = [c for c in ev.get("rankedCandidates", []) if not c["hardContradictions"]]
                if (policy != evidence.PUBLISH_LEANING or ev.get("accountCandidates") or not ev.get("possibleDuplicateOf")
                        or ev.get("candidateCount") != g["existingCandidateCount"]
                        or any(c["privacyFlags"] or c["accountLinked"] for c in compatible)):
                    raise ValueError("A possible-duplicate profile needs the publish-leaning policy and no protected candidate")
            elif (decision != "distinct_person" or ev.get("accountCandidates") or ev.get("candidateCount") != g["existingCandidateCount"]
                    or not ev.get("rankedCandidates") or any(not c["hardContradictions"] for c in ev["rankedCandidates"])):
                raise ValueError("A profile beside existing candidates needs every candidate excluded by a hard contradiction")
        expected = _history_and_athlete(g, o, plan["edition"], plan["batchId"])
        if [g["history"], g["athleteDraft"]] != list(expected):
            raise ValueError("Profile draft differs from its source observation")
        draft = g["athleteDraft"]
        if draft["identityVerified"] or draft["claimed"] or draft["dateOfBirth"] is not None:
            raise ValueError("A provisional profile cannot claim identity, ownership or a birth date")
        if draft["slug"] in slugs or g["history"]["externalId"] in histories:
            raise ValueError("Repeated profile slug or history ID")
        slugs.add(draft["slug"])
        histories.add(g["history"]["externalId"])
    counts = Counter(g["disposition"] for g in plan["groups"])
    summary = plan["summary"]
    if ([summary["new"], summary["linked"], summary["held"], summary.get("evidenceLinked", 0), summary.get("alreadyImported", 0)]
            != [counts["new"], counts["linked"], counts["held"], counts["evidence_linked"], counts["already_imported"]]):
        raise ValueError("Plan summary differs from its groups")
    return True
