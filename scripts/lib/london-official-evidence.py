"""Multi-signal identity evidence for official London imports. Pure: no network or DB.

Owner instruction, 1 November 2026: "can you make it more intelligent please"
(matching official London runners to existing AthRecs athletes). See AGENTS.md.

A name never decides anything on its own. For a held group whose only reasons
are soft (an existing same/similar name, an in-field fuzzy variant or a
same-name same-time record), every candidate is scored on independent signals:

* gender and nationality (contradiction only when both sides are explicit);
* age: birth-year intervals from dated age categories (never an exact birthday;
  other providers' categories are widened by a year each way because their
  reference dates are not established);
* club (equal non-generic labels support; different clubs never contradict);
* marathon-time plausibility against the candidate's other marathon times;
* name rarity in the directory and in the field;
* bridges: the same official runner in another London year (a provisional
  cross-year chain) already on the candidate by exact official locator or bib
  and time, or the candidate's same-name, same-time record of this edition.

Decisions (thresholds are the constants below):
* ``link_existing_performance`` — a bridge to the candidate's own record of this
  edition: add evidence only, as for exact-locator links.
* ``append_history`` — one compatible candidate with strong evidence and no
  other compatible candidate: append the official performance to that athlete.
* ``distinct_person`` — every candidate excluded by a hard, source-supported
  contradiction (age-interval gap or both-sides-explicit source nationality
  difference), per docs/reviewed-source-identity-policy.md. Gender differences
  corroborate but never decide (profile gender is not original sex evidence).
* ``create_no_candidates`` — no directory/account candidate at all; the only
  flag was a similar name elsewhere in the same race (separate entries).
* ``hold`` — everything else, with a ranked candidate list and per-signal evidence.

Account links, non-public/derived profiles and any candidate already holding a
result for this edition force a hold.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
import unicodedata
from collections import Counter, defaultdict

POLICY_VERSION = "london-official-evidence/v1"

# Explicit thresholds.
RARE_NAME_MAX_DIRECTORY = 1      # exact-name profiles in the directory (the candidate itself)
RARE_NAME_MAX_FIELD = 1          # exact-name rows in this edition's field
TIME_BAND = (1.2, 1.4)           # incoming within [fastest/1.2, fastest*1.4] of the candidate's fastest (predicted) marathon
RIEGEL_EXPONENT = 1.06           # marathon prediction from other road distances (no marathon on record)
RIEGEL_DISTANCES = {"5 kilometres": 5, "5k": 5, "5.0": 5, "5000": 5, "5000m": 5, "10 kilometres": 10, "10k": 10, "10.0": 10,
                    "10000": 10, "10000m": 10, "10km": 10, "half marathon 21.0975": 21.0975,
                    "half marathon": 21.0975, "half": 21.0975, "21.0975": 21.0975}
OTHER_PROVIDER_AGE_WIDEN = 1     # years added to each side for non-London category semantics
MIN_AGE_GAP_FOR_CONTRADICTION = 2  # widened birth intervals must be separated by at least this many years
MIN_STRICT_OVERLAP_YEARS = 2     # compatible only if the strict birth intervals share >= 2 years (or a DOB fits)
AUTO_LINK_MIN_SCORE = 6
SCORE = {
    "gender_match": 1, "nationality_match": 2, "age_compatible": 2, "club_match": 2,
    "rare_name": 2, "time_plausible": 1, "chain_bridge": 6, "same_edition_record": 6,
}
SOFT_REASONS = {
    "existing_name_or_alias_requires_review",
    "possible_source_name_variant",
    "same_performance_without_matching_locator_requires_review",
}
GENERIC_CLUBS = {"", "none", "n a", "na", "unattached", "una", "independent", "no club", "-", "private"}


def _clean(value):
    return " ".join(unicodedata.normalize("NFC", "" if value is None else str(value)).split())


def name_key(value):
    return _clean(value).casefold()


def club_key(value):
    text = unicodedata.normalize("NFKD", _clean(value)).encode("ascii", "ignore").decode().lower()
    text = re.sub(r"[^a-z0-9]+", " ", text).strip()
    text = re.sub(r"\b(ac|a c|athletic club|running club|rc|r c|harriers|hc|club|tri|triathlon club)\b$", "", text).strip()
    return None if text in GENERIC_CLUBS or len(text) < 3 else text


def band(category):
    """(low, high) for a numeric age category, else None. 'NN+' is open-ended."""
    value = _clean(category).upper()
    match = re.fullmatch(r"[MFVW]?\s*(\d{1,2})\s*[-–/]\s*(\d{1,2})", value)
    if match:
        low, high = map(int, match.groups())
        return (low, high) if low <= high else None
    match = re.fullmatch(r"[MFVW]?\s*(\d{1,2})\s*\+", value)
    return (int(match[1]), 120) if match else None


def birth_interval(year, category, widen=0):
    """Possible birth years for an age band on a race day in `year` (birthday unknown)."""
    b = band(category)
    if not b or not isinstance(year, int):
        return None
    return (year - b[1] - 1 - widen, year - b[0] + widen)


def intersect(a, b):
    if a is None:
        return b
    if b is None:
        return a
    low, high = max(a[0], b[0]), min(a[1], b[1])
    return (low, high) if low <= high else False


def interval_gap(a, b):
    return max(a[0] - b[1], b[0] - a[1])


def _first_mark(value):
    """The leading mark of a cell such as '28:50 (28:50)'; annotations are ignored."""
    parts = _clean(value).split(" ")
    return parts[0] if parts else ""


def seconds(value):
    match = re.fullmatch(r"(\d{1,3}):([0-5]\d):([0-5]\d)(?:\.\d+)?", _first_mark(value))
    if not match:
        return None
    h, m, s = map(int, match.groups())
    return h * 3600 + m * 60 + s


def short_seconds(value):
    match = re.fullmatch(r"(\d{1,3}):([0-5]\d)(?:\.\d+)?", _first_mark(value))
    return int(match[1]) * 60 + int(match[2]) if match else None


def _digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


# --------------------------------------------------------------------------
# Cross-year provisional chains from the official year files
# --------------------------------------------------------------------------

def build_chains(rows_by_year):
    """Provisional chains: exact name + gender + nationality, unique in each year, compatible ages.

    rows_by_year: {year: [official row dicts]}. Returns a JSON-able index.
    """
    by_key = defaultdict(dict)
    name_counts = {year: Counter(name_key(f"{r['first_name']} {r['last_name']}") for r in rows) for year, rows in rows_by_year.items()}
    for year, rows in sorted(rows_by_year.items()):
        for r in rows:
            name = name_key(f"{r['first_name']} {r['last_name']}")
            gender = {"M": "M", "W": "F"}.get(r.get("gender"))
            nat = _clean(r.get("nationality")).upper() or None
            if not name or len(name.split()) < 2 or not gender or not nat or name_counts[year][name] != 1:
                continue
            by_key[(name, gender, nat)][year] = {
                "idp": _clean(r["idp"]).upper(), "event": r["event"], "bib": _clean(r.get("bib")) or None,
                "category": _clean(r.get("category")), "finish": _clean(r.get("finish")),
            }
    chains, members = {}, {}
    stats = Counter()
    # Every row of every name, to tell whether a "rare" name ever belonged to
    # someone of another gender, nationality or age in the London corpus.
    name_rows = defaultdict(list)
    for year, rows in rows_by_year.items():
        for r in rows:
            name = name_key(f"{r['first_name']} {r['last_name']}")
            interval = birth_interval(year, r.get("category"))
            name_rows[name].append([year, {"M": "M", "W": "F"}.get(r.get("gender")), _clean(r.get("nationality")).upper() or None,
                                    *(interval if interval else (None, None))])
    for (name, gender, nat), years in by_key.items():
        if len(years) < 2:
            stats["single_year"] += 1
            continue
        interval = None
        for year, row in years.items():
            interval = intersect(interval, birth_interval(year, row["category"]))
            if interval is False:
                break
        if interval is False:
            stats["age_progression_conflict"] += 1
            continue
        chain_id = "chain-" + _digest([name, gender, nat, sorted(years)])[:20]
        chains[chain_id] = {"name": name, "gender": gender, "nationality": nat, "birthInterval": list(interval) if interval else None,
                            "years": {str(y): row for y, row in sorted(years.items())}}
        for year, row in years.items():
            members[f"{year}:{row['idp']}"] = chain_id
        stats["chains"] += 1
        stats[f"length_{len(years)}"] += 1
    return {"policyVersion": POLICY_VERSION, "chains": chains, "members": members, "nameRows": dict(name_rows), "stats": dict(stats)}


def corpus_consistent(name_rows, o, incoming):
    """True when every London row with this exact name could be the same runner."""
    for year, gender, nat, low, high in name_rows or []:
        if gender and o["gender"] in ("M", "F") and gender != o["gender"]:
            return False
        if nat and o["nationality"] and nat != o["nationality"]:
            return False
        if low is not None and incoming and intersect((low, high), incoming) is False:
            return False
    return True


# --------------------------------------------------------------------------
# Candidate facts from the snapshot and the read-only candidate evidence file
# --------------------------------------------------------------------------

OFFICIAL_URL = re.compile(r"^https?://results\.(?:tcslondonmarathon|virginmoneylondonmarathon)\.com/(\d{4})/?\?(.*)$", re.I)


def official_idp(url):
    match = OFFICIAL_URL.match(str(url or ""))
    if not match:
        return None
    idp = re.search(r"(?:^|&)idp?=([A-Za-z0-9]{8,40})(?:&|$)", match[2])
    return (int(match[1]), idp[1].upper()) if idp else None


def candidate_facts(athlete, evidence):
    """Aggregate one candidate's explicit facts. `evidence` is its candidate-evidence record or None."""
    facts = {
        "id": str(athlete["id"]), "displayName": athlete.get("displayName"),
        "gender": athlete.get("gender") if athlete.get("gender") in ("M", "F") else None,
        "nationality": None, "nationalitySource": None, "birthInterval": None, "ageFacts": [],
        "ageConflict": False, "strictBirthInterval": None, "strictAgeConflict": False, "clubs": set(), "marathonSeconds": [], "predictedMarathonSeconds": [], "londonRecords": {},
        "visibility": athlete.get("visibility"), "profileType": athlete.get("profileType"),
        "parentAthleteId": athlete.get("parentAthleteId"), "accountLinked": False, "privacyFlags": [],
    }
    ev = evidence or {}
    source_nat = _clean(ev.get("sourceNationality")).upper() or None
    profile_nat = _clean(athlete.get("nationality")).upper() or None
    if source_nat and re.fullmatch(r"[A-Z]{3}", source_nat):
        facts["nationality"], facts["nationalitySource"] = source_nat, "source_observation"
    elif profile_nat and re.fullmatch(r"[A-Z]{3}", profile_nat):
        facts["nationality"], facts["nationalitySource"] = profile_nat, "profile"
    for club in ev.get("clubs", []):
        key = club_key(club)
        if key:
            facts["clubs"].add(key)
    dob = athlete.get("dateOfBirth")
    if dob and re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(dob)):
        year = int(str(dob)[:4])
        facts["ageFacts"].append({"basis": "date_of_birth", "interval": [year, year]})
        facts["birthInterval"] = facts["strictBirthInterval"] = (year, year)
    for perf in ev.get("performances", []):
        year = perf.get("year")
        if isinstance(year, str) and year.isdigit():
            year = int(year)
        if not isinstance(year, int):
            date = str(perf.get("date") or "")
            year = int(date[:4]) if re.match(r"\d{4}-", date) else None
        london = bool(re.search(r"london\s+marathon", str(perf.get("meeting") or ""), re.I)) or perf.get("eventSlug") == "london-marathon"
        widen = 0 if london and perf.get("officialSemantics") else OTHER_PROVIDER_AGE_WIDEN
        interval = birth_interval(year, perf.get("ageGroup"), widen) if year else None
        if interval:
            facts["ageFacts"].append({"basis": "category", "year": year, "category": perf.get("ageGroup"),
                                      "provider": perf.get("provider"), "interval": list(interval)})
            merged = intersect(facts["birthInterval"], interval)
            if merged is False:
                facts["ageConflict"] = True
            else:
                facts["birthInterval"] = merged
            strict = intersect(facts["strictBirthInterval"], birth_interval(year, perf.get("ageGroup")))
            if strict is False:
                facts["strictAgeConflict"] = True
            else:
                facts["strictBirthInterval"] = strict
        discipline = _clean(perf.get("discipline")).lower()
        t = seconds(perf.get("performance"))
        if t and discipline == "marathon" and not perf.get("profileExcluded"):
            facts["marathonSeconds"].append(t)
        elif discipline in RIEGEL_DISTANCES and not perf.get("profileExcluded"):
            mark = t or short_seconds(perf.get("performance"))
            if mark:
                facts["predictedMarathonSeconds"].append(mark * (42.195 / RIEGEL_DISTANCES[discipline]) ** RIEGEL_EXPONENT)
        if london and year:
            record = facts["londonRecords"].setdefault(str(year), {"idps": set(), "bibs": set(), "seconds": set()})
            for url in perf.get("sourceUrls") or []:
                found = official_idp(url)
                if found and found[0] == year:
                    record["idps"].add(found[1])
            if _clean(perf.get("bib")):
                record["bibs"].add(_clean(perf.get("bib")).upper())
            if t:
                record["seconds"].add(t)
        if perf.get("profileExcluded") or perf.get("hidden"):
            facts["privacyFlags"].append("excluded_or_hidden_performance")
    if facts["visibility"] not in (None, "public"):
        facts["privacyFlags"].append("non_public_profile")
    if facts["profileType"] not in (None, "Athlete"):
        facts["privacyFlags"].append("non_athlete_profile_type")
    if facts["parentAthleteId"]:
        facts["privacyFlags"].append("derived_profile")
    for flag in ev.get("privacyFlags", []):
        facts["privacyFlags"].append(flag)
    return facts


# --------------------------------------------------------------------------
# Scoring and decision
# --------------------------------------------------------------------------

def score_candidate(o, facts, incoming_interval, chain, name_rarity, edition_year):
    signals, hard, soft_conflicts = {}, [], []
    if o["gender"] in ("M", "F") and facts["gender"]:
        signals["gender"] = "match" if o["gender"] == facts["gender"] else "conflict"
        if signals["gender"] == "conflict":
            soft_conflicts.append("gender_differs")
    else:
        signals["gender"] = "unknown"
    if o["nationality"] and facts["nationality"]:
        if o["nationality"] == facts["nationality"]:
            signals["nationality"] = "match"
        else:
            signals["nationality"] = "conflict"
            # Only an explicitly source-supplied nationality on both sides is a hard contradiction.
            (hard if facts["nationalitySource"] == "source_observation" else soft_conflicts).append("nationality_differs")
    else:
        signals["nationality"] = "unknown"
    if facts["ageConflict"]:
        signals["age"] = "candidate_facts_inconsistent"
        soft_conflicts.append("candidate_age_facts_inconsistent")
    elif incoming_interval and facts["birthInterval"]:
        merged = intersect(incoming_interval, facts["birthInterval"])
        if merged is False:
            gap = interval_gap(incoming_interval, facts["birthInterval"])
            signals["age"] = f"contradiction_gap_{gap}y"
            (hard if gap >= MIN_AGE_GAP_FOR_CONTRADICTION else soft_conflicts).append("age_progression_impossible")
        elif (facts["strictAgeConflict"] or not facts["strictBirthInterval"]
              or intersect(incoming_interval, facts["strictBirthInterval"]) is False
              or (facts["strictBirthInterval"][0] != facts["strictBirthInterval"][1]
                  and intersect(incoming_interval, facts["strictBirthInterval"])[1]
                  - intersect(incoming_interval, facts["strictBirthInterval"])[0] + 1 < MIN_STRICT_OVERLAP_YEARS)):
            # Overlap exists only after allowing for unknown provider category
            # semantics: neither support nor contradiction.
            signals["age"] = "uncertain_category_semantics"
        else:
            signals["age"] = "compatible"
    else:
        signals["age"] = "unknown"
    clubs_in = {club_key(o.get("club"))} - {None}
    if clubs_in and facts["clubs"]:
        signals["club"] = "match" if clubs_in & facts["clubs"] else "different"
    else:
        signals["club"] = "unknown"
    references = facts["marathonSeconds"] + facts["predictedMarathonSeconds"]
    if o["finishSeconds"] and references and o["discipline"] == "Marathon":
        # Relative to the candidate's fastest marathon or predicted marathon.
        fastest = min(references)
        signals["time"] = "plausible" if fastest / TIME_BAND[0] <= o["finishSeconds"] <= fastest * TIME_BAND[1] else "implausible"
        if signals["time"] == "implausible":
            soft_conflicts.append("marathon_time_implausible")
    else:
        signals["time"] = "unknown"
    signals["rareName"] = name_rarity
    bridges = []
    if chain:
        for year, row in chain["years"].items():
            if int(year) == edition_year:
                continue
            record = facts["londonRecords"].get(year)
            if not record:
                continue
            row_seconds = seconds(row["finish"])
            if row["idp"] in record["idps"]:
                bridges.append({"type": "chain_official_locator", "year": int(year), "idp": row["idp"]})
            elif row.get("bib") and row["bib"].upper() in record["bibs"] and row_seconds in record["seconds"]:
                bridges.append({"type": "chain_bib_and_time", "year": int(year), "bib": row["bib"]})
    signals["bridges"] = bridges
    score = 0
    breakdown = {}
    for key, cond in (("gender_match", signals["gender"] == "match"), ("nationality_match", signals["nationality"] == "match"),
                      ("age_compatible", signals["age"] == "compatible"), ("club_match", signals["club"] == "match"),
                      ("rare_name", name_rarity), ("time_plausible", signals["time"] == "plausible"),
                      ("chain_bridge", bool(bridges))):
        if cond:
            breakdown[key] = SCORE[key]
            score += SCORE[key]
    return {"athleteId": facts["id"], "displayName": facts["displayName"], "score": score, "breakdown": breakdown,
            "signals": signals, "hardContradictions": sorted(set(hard)), "softConflicts": sorted(set(soft_conflicts)),
            "privacyFlags": sorted(set(facts["privacyFlags"])), "accountLinked": facts["accountLinked"],
            "ageFacts": facts["ageFacts"][:12], "candidateBirthInterval": list(facts["birthInterval"]) if facts["birthInterval"] else None}


def decide(o, group, candidate_scores, *, account_candidates, field_name_count, same_edition_athletes, incoming_interval):
    """Return (decision, details). Decisions: append_history, distinct_person, hold."""
    ranked = sorted(candidate_scores, key=lambda c: (-c["score"], c["athleteId"]))
    details = {"policyVersion": POLICY_VERSION, "incomingBirthInterval": list(incoming_interval) if incoming_interval else None,
               "fieldExactNameCount": field_name_count, "rankedCandidates": ranked[:10], "candidateCount": len(ranked),
               "accountCandidates": sorted(account_candidates)}
    if account_candidates:
        return "hold", {**details, "holdReason": "account_candidate_requires_owner_review"}
    if field_name_count > 1:
        return "hold", {**details, "holdReason": "repeated_name_in_field"}
    if not ranked:
        # Only an in-field name variant was flagged: separate rows of one race are
        # separate entries, and nobody in the directory shares the name.
        return "create_no_candidates", {**details, "decisionBasis": "No existing candidate; the only flag was a similar name elsewhere in this race."}
    compatible = [c for c in ranked if not c["hardContradictions"]]
    if ranked and not compatible:
        if any(c["privacyFlags"] for c in ranked):
            return "hold", {**details, "holdReason": "protected_candidate_requires_review"}
        return "distinct_person", {**details, "decisionBasis": "Every candidate excluded by a hard source-supported contradiction."}
    if len(compatible) != 1:
        return "hold", {**details, "holdReason": "multiple_compatible_candidates" if compatible else "no_candidates"}
    best = compatible[0]
    if best["privacyFlags"] or best["accountLinked"]:
        return "hold", {**details, "holdReason": "protected_candidate_requires_review"}
    if best["athleteId"] in same_edition_athletes:
        return "hold", {**details, "holdReason": "candidate_already_has_this_edition"}
    if best["softConflicts"]:
        return "hold", {**details, "holdReason": "candidate_soft_conflict:" + ",".join(best["softConflicts"])}
    s = best["signals"]
    core = s["gender"] == "match" and s["nationality"] == "match" and s["age"] == "compatible"
    positive = bool(s["bridges"]) or s["club"] == "match" or s["rareName"]
    if core and positive and best["score"] >= AUTO_LINK_MIN_SCORE:
        return "append_history", {**details, "chosenAthleteId": best["athleteId"], "score": best["score"],
                                  "decisionBasis": "Single compatible candidate: gender, nationality and age progression agree, plus "
                                  + ", ".join(k for k, ok in (("an official cross-year bridge", bool(s["bridges"])),
                                                              ("the same club", s["club"] == "match"),
                                                              ("a rare exact name", s["rareName"])) if ok) + "."}
    return "hold", {**details, "holdReason": "insufficient_positive_evidence"}
