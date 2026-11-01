"""Synthetic checks for the official-results London planner. No real athletes, network or DB.

Run: python3 scripts/verify-london-official-plan.py
"""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import pathlib
import tempfile
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent


def load(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


plan = load("verify_official_plan", "lib/london-official-plan.py")
YEAR, DATE = 2025, "2025-04-27"
CREATED = "2026-11-01T09:00:00+00:00"
EDITION = {"id": 71613035, "equivalentIds": [109240293], "eventSlug": "london-marathon", "eventName": "London Marathon",
           "date": DATE, "distanceKm": 42.195, "country": "United Kingdom"}


def row(idp, first, last, finish, event="MAS", label="Mass", gender="M", nat="GBR", place=1, half="01:50:00"):
    return {"year": YEAR, "event": event, "event_label": label, "gender": gender, "place_overall": place,
            "place_gender": place, "place_category": 1, "last_name": last, "first_name": first,
            "nationality": nat, "club": "Synthetic AC", "bib": str(1000 + place), "category": "18-39",
            "half": half, "finish": finish, "idp": idp}


ROWS = [
    row("SYNTH0000000001", "Aster", "Quill", "03:40:00", place=1),
    row("SYNTH0000000002", "Bramble", "Okonkwo-Lane", "03:41:00", place=2, gender="W", nat="NGA"),
    row("SYNTH0000000003", "Corin", "Vale", "03:42:00", place=3),          # repeated name below
    row("SYNTH0000000004", "Corin", "Vale", "04:12:00", place=4),
    row("SYNTH0000000005", "Delphine", "Marsh", "03:43:00", place=5),      # existing same-name athlete
    row("SYNTH0000000006", "Emrys", "Tallow", "04:01:00", place=6),        # existing Pace Notes history
    {**row("SYNTH0000000007", "Fenna", "Rook", "01:35:00", event="VLMW", label="Wheelchair", gender="W", nat="", place=1, half=""), "bib": "W7"},
]


def context(path):
    by_event = Counter(r["event"] for r in ROWS)
    return {"formatVersion": 1, "year": YEAR, "date": DATE, "batchId": f"london-official-{YEAR}-synthetic",
            "edition": EDITION, "sourceFile": f"london_{YEAR}.json",
            "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(), "expectedRows": len(ROWS),
            "expectedByEvent": dict(by_event), "capturedAt": "2026-10-31T23:00:00+00:00",
            "ownerInstruction": "Synthetic test authority; never a real import.", "instructionDate": "2026-11-01"}


def expect_error(callable_, text):
    try:
        callable_()
    except ValueError as error:
        assert text in str(error), (text, str(error))
        return
    raise AssertionError("Expected rejection: " + text)


def main():
    with tempfile.TemporaryDirectory() as private:
        folder = pathlib.Path(private)
        source = folder / f"london_{YEAR}.json"
        source.write_text(json.dumps(ROWS))
        ctx = context(source)
        plan.configure(ctx)
        observations = plan.load_sources(folder)

        # Normalization: heading-mapped fields, chip basis, separate places, nationality, wheelchair.
        first = next(o for o in observations if o["sourceResultId"] == "SYNTH0000000002")
        assert first["gender"] == "F" and first["nationality"] == "NGA" and first["name"] == "Bramble Okonkwo-Lane"
        assert first["timing"] == {"basis": "chip", "chip": "03:41:00"} and first["finishSeconds"] == 13260
        assert first["places"] == {"overall": 2, "gender": 2, "category": 1} and first["halfSplit"] == "01:50:00"
        assert first["sourceUrl"] == f"https://results.tcslondonmarathon.com/{YEAR}/?content=detail&idp=SYNTH0000000002&event=MAS"
        wheel = next(o for o in observations if o["sourceScope"] == "VLMW")
        assert wheel["discipline"] == "Marathon (wheelchair)" and wheel["nationality"] is None and wheel["halfSplit"] is None

        # Locator parsing tolerates parameter order and extra parameters, never another year.
        assert plan.official_locator(f"https://results.tcslondonmarathon.com/{YEAR}/?event=MAS&lang=EN_CAP&content=detail&idp=synth0000000006") == (YEAR, "SYNTH0000000006")
        assert plan.official_locator("https://example.test/2025/?idp=SYNTH0000000006") is None

        pace_url = f"https://results.tcslondonmarathon.com/{YEAR}/?content=detail&event=MAS&idp=SYNTH0000000006&lang=EN_CAP"
        snapshot = {
            "athletes": [
                {"id": 11, "displayName": "Delphine Marsh", "aliases": [], "gender": "F"},
                {"id": 12, "displayName": "Emrys Tallow", "aliases": [], "gender": "M"},
                {"id": 13, "displayName": "Aster Quill", "aliases": [], "gender": "M"},
            ],
            "accounts": [],
            "results": [{"id": "history:pace-emrys", "athleteId": 12, "editionId": EDITION["id"], "date": DATE, "year": YEAR,
                         "distanceKm": 42.195, "finishSeconds": 14460, "timeSeconds": [14460],
                         "sourceUrls": [pace_url], "sourceKind": "history", "provider": "Pace Notes",
                         "gender": "M", "category": "18-39"},
                        # A year-only ranking history with London event text and the same bib.
                        {"id": "history:ranking-aster", "athleteId": 13, "editionId": None, "date": "", "year": YEAR,
                         "distanceKm": 42.195, "finishSeconds": 13200, "timeSeconds": [13200], "bib": "1001",
                         "meetingIsLondon": True, "overallPlace": 999, "sourceUrls": ["https://example.test/rankings"],
                         "sourceKind": "history", "provider": "Synthetic rankings", "gender": "M"}],
            "metadata": {"editionContextDigest": plan._hash(plan.EDITION_CONTEXT), "fingerprint": "synthetic"},
        }
        built = plan.build_plan(observations, snapshot, EDITION, ctx["batchId"], CREATED)
        by_id = {g["sourceResultId"]: g for g in built["groups"]}
        aster = by_id["SYNTH0000000001"]
        assert aster["disposition"] == "linked" and aster["athleteId"] == 13
        assert aster["existingMatches"][0]["method"] == "same_edition_bib"
        assert by_id["SYNTH0000000003"]["disposition"] == by_id["SYNTH0000000004"]["disposition"] == "held"
        assert "repeated_source_display_name" in by_id["SYNTH0000000003"]["reasons"]
        assert by_id["SYNTH0000000005"]["reasons"] == ["existing_name_or_alias_requires_review"]
        linked = by_id["SYNTH0000000006"]
        assert linked["disposition"] == "linked" and linked["athleteId"] == 12
        assert linked["existingMatches"][0]["method"] == "exact_official_result_locator"
        assert linked["existingMatches"][0]["matchedUrls"] == [pace_url]
        new = by_id["SYNTH0000000002"]
        assert new["disposition"] == "new"
        perf = new["history"]["performances"][0]
        assert new["history"]["provider"] == "TCS London Marathon results"
        assert perf["verificationStatus"] == "source_verified" and perf["timing"]["basis"] == "chip"
        assert perf["places"] == {"overall": 2, "gender": 2, "category": 1} and perf["bib"] == "1002"
        assert perf["archiveReference"]["rowLocator"] == {"idp": "SYNTH0000000002", "event": "MAS", "year": YEAR}
        draft = new["athleteDraft"]
        assert draft["nationality"] == "NGA" and draft["dateOfBirth"] is None and draft["identityVerified"] is False
        assert draft["profileDetails"]["sourceNationalityObservation"]["provider"] == "TCS London Marathon results"
        wheel_group = by_id["SYNTH0000000007"]
        assert wheel_group["history"]["performances"][0]["discipline"] == "Marathon (wheelchair)"
        assert "Wheelchair race" in wheel_group["history"]["performances"][0]["labels"]
        assert "sourceNationalityObservation" not in wheel_group["athleteDraft"]["profileDetails"]
        assert [built["summary"][k] for k in ("new", "linked", "held")] == [2, 2, 3]

        # A bib repeated across this year's events is never used as a locator.
        dup = [dict(o) for o in observations]
        dup_wheel = next(o for o in dup if o["sourceScope"] == "VLMW"); dup_wheel["bib"] = "1001"
        assert {g["sourceResultId"]: g for g in plan.build_plan(dup, snapshot, EDITION, ctx["batchId"], CREATED)["groups"]}["SYNTH0000000001"]["disposition"] == "held"
        # A bib match in another year, or with a different time, is never linked.
        other = copy.deepcopy(snapshot)
        other["results"][1]["year"] = YEAR - 1
        assert {g["sourceResultId"]: g for g in plan.build_plan(observations, other, EDITION, ctx["batchId"], CREATED)["groups"]}["SYNTH0000000001"]["disposition"] == "held"
        other = copy.deepcopy(snapshot)
        other["results"][1]["finishSeconds"], other["results"][1]["timeSeconds"] = 13201, [13201]
        assert "existing_locator_time_conflict" in {g["sourceResultId"]: g for g in plan.build_plan(observations, other, EDITION, ctx["batchId"], CREATED)["groups"]}["SYNTH0000000001"]["reasons"]
        # A time conflict on the same locator is held, not linked.
        conflict = copy.deepcopy(snapshot)
        conflict["results"][0]["finishSeconds"], conflict["results"][0]["timeSeconds"] = 14461, [14461]
        held = {g["sourceResultId"]: g for g in plan.build_plan(observations, conflict, EDITION, ctx["batchId"], CREATED)["groups"]}
        assert "existing_locator_time_conflict" in held["SYNTH0000000006"]["reasons"]

        # Tampering is rejected.
        plan.validate_plan(built, snapshot=snapshot)
        t = copy.deepcopy(built)
        next(g for g in t["groups"] if g["disposition"] == "new")["athleteDraft"]["nationality"] = "USA"
        expect_error(lambda: plan.validate_plan(t), "Profile draft differs")
        t = copy.deepcopy(built)
        next(g for g in t["groups"] if g["disposition"] == "held")["disposition"] = "new"
        expect_error(lambda: plan.validate_plan(t), "flags must remain held")
        t = copy.deepcopy(built)
        t["observations"].pop()
        expect_error(lambda: plan.validate_plan(t), "omits a configured source observation")
        t = copy.deepcopy(built)
        t["groups"][0]["identityVerified"] = True
        expect_error(lambda: plan.validate_plan(t), "verify an identity")
        expect_error(lambda: plan.validate_plan(built, snapshot={**snapshot, "accounts": [{"id": "x", "names": []}]}), "changed snapshot")
        expect_error(lambda: plan.build_plan(observations, {**snapshot, "metadata": {}}, EDITION, ctx["batchId"], CREATED), "edition configuration")

        # Changed source bytes and bad configurations are rejected.
        source.write_text(json.dumps(ROWS[:-1] + [row("SYNTH0000000007", "Fenna", "Rook", "01:36:00", event="VLMW", label="Wheelchair")]))
        expect_error(lambda: plan.load_sources(folder), "checksum changed")
        bad = copy.deepcopy(ctx); bad["year"] = 2009
        expect_error(lambda: plan.configure(bad), "2010–2026")
        bad = copy.deepcopy(ctx); bad["batchId"] = "london-2025-synthetic"
        expect_error(lambda: plan.configure(bad), "Batch ID")
        bad = copy.deepcopy(ctx); bad["expectedByEvent"]["MAS"] += 1
        expect_error(lambda: plan.configure(bad), "add up")
    evidence_checks()
    scoped_guard_checks()
    print("London official-results planner verified: normalization, wheelchair labelling, holds, exact-locator reuse, tamper rejection (synthetic data only).")


def scoped_guard_checks():
    """Name-collision screening used by the scoped publish guard (synthetic)."""
    guard = load("verify_official_guard", "lib/london-official-guard.py")
    snap = load("verify_official_snapshot", "snapshot-london-official-profiles.py").snap
    keys = set().union(*(plan.screening_name_keys(n) for n in ["Aster Quill", "Bramble Okonkwo-Lane"]))
    def row(i, name):
        return {"id": i, "slug": f"s{i}", "display_name": name, "given_name": None, "family_name": None, "race_entry_name": None,
                "gender": "M", "nation": None, "date_of_birth": None, "profile_visibility": "public", "profile_type": "Athlete",
                "parent_athlete_id": None, "name_review_mode": None, "name_details": {}}
    snapshot_athletes = {"7": snap.athlete_record(row(7, "Aster Quill"))}
    screen = lambda rows: guard.screen_rows(rows, keys, snapshot_athletes, snap.athlete_record, plan.snapshot_name_keys)
    assert screen([row(900, "Wendell Ombrage")]) == [], "An unrelated new athlete does not block"
    assert [c["athleteId"] for c in screen([row(901, "Aster Quill")])] == [901], "A colliding new athlete blocks"
    assert [c["athleteId"] for c in screen([row(902, "Bramble Okonkwo Lane")])] == [902], "A screening-key variant blocks"
    assert screen([row(7, "Aster Quill")]) == [], "An unchanged snapshot athlete is not a new collision"
    assert [c["athleteId"] for c in screen([row(55, "Aster Quill")])] == [55], "A rename into a colliding name blocks"
    accounts = lambda rows, before: guard.screen_accounts(rows, keys, before, plan._screen.finder.names_from, plan.screening_name_keys)
    assert accounts([{"id": "u1", "name": "Wendell Ombrage"}], {}) == []
    assert accounts([{"id": "u2", "name": "Aster Quill"}], {}) == [{"accountId": "u2"}]
    built = {"groups": [{"disposition": "linked", "athleteId": 3, "existingMatches": [{"athleteId": 3}], "names": ["X Y"]},
                        {"disposition": "new", "names": ["Aster Quill"], "existingCandidates": ["athlete:4", "account:z"],
                         "identityEvidence": {"rankedCandidates": [{"athleteId": "5"}], "possibleDuplicateOf": [{"athleteId": "6"}]}}]}
    assert set().union(*(guard.referenced_ids(g) for g in built["groups"])) == {3, 4, 5, 6}
    assert guard.batch_name_keys(built, plan) == plan.screening_name_keys("Aster Quill")


def evidence_checks():
    """Multi-signal identity decisions (owner instruction, 1 November 2026), synthetic only."""
    ev = plan.evidence
    rows = [
        row("SYNTH0000000101", "Ione", "Farrow", "03:40:00", gender="W", place=11),   # auto-link
        row("SYNTH0000000102", "Jory", "Penhale", "03:50:00", place=12),               # distinct person
        row("SYNTH0000000103", "Kit", "Marlow", "03:55:00", place=13),                 # two compatible
        row("SYNTH0000000104", "Lark", "Vance", "03:56:00", gender="W", place=14),     # account-linked
        row("SYNTH0000000105", "Nell", "Quarry", "03:57:00", gender="W", place=15),    # protected (private)
    ]
    with tempfile.TemporaryDirectory() as private:
        folder = pathlib.Path(private)
        source = folder / f"london_{YEAR}.json"
        source.write_text(json.dumps(rows))
        ctx = context(source)
        ctx["expectedRows"], ctx["expectedByEvent"] = len(rows), {"MAS": len(rows)}
        plan.configure(ctx)
        observations = plan.load_sources(folder)
        athletes = [
            {"id": 21, "displayName": "Ione Farrow", "aliases": [], "gender": "F", "nationality": "GBR", "visibility": "public", "profileType": "Athlete"},
            {"id": 22, "displayName": "Jory Penhale", "aliases": [], "gender": "M", "nationality": None, "visibility": "public", "profileType": "Athlete"},
            {"id": 23, "displayName": "Kit Marlow", "aliases": [], "gender": "M", "nationality": "GBR", "visibility": "public", "profileType": "Athlete"},
            {"id": 24, "displayName": "Kit Marlow", "aliases": [], "gender": "M", "nationality": "GBR", "visibility": "public", "profileType": "Athlete"},
            {"id": 25, "displayName": "Lark Vance", "aliases": [], "gender": "F", "nationality": "GBR", "visibility": "public", "profileType": "Athlete"},
            {"id": 26, "displayName": "Nell Quarry", "aliases": [], "gender": "F", "nationality": "GBR", "visibility": "private", "profileType": "Athlete"},
        ]
        snapshot = {"athletes": athletes, "results": [],
                    "accounts": [{"id": "acct-1", "names": ["Unrelated Person"], "linkedAthleteIds": [25]}],
                    "metadata": {"editionContextDigest": plan._hash(plan.EDITION_CONTEXT), "fingerprint": "synthetic"}}
        half = {"provider": "Synthetic", "year": 2025, "discipline": "Half Marathon", "performance": "1:40:00", "ageGroup": "30-34"}
        perf = {"21": [half], "22": [{**half, "ageGroup": "60-64"}], "23": [half], "24": [half], "25": [half], "26": [half]}
        athletes_ev = {k: {"clubs": [], "performances": v, "sourceNationality": None, "privacyFlags": []} for k, v in perf.items()}
        candidate = {"metadata": {"snapshotDigest": plan._hash(snapshot), "digest": plan._hash(athletes_ev)}, "athletes": athletes_ev}
        chains = ev.build_chains({YEAR: rows})
        built = plan.build_plan(observations, snapshot, EDITION, ctx["batchId"], CREATED, candidate_evidence=candidate, chains=chains)
        by_name = {g["name"]: g for g in built["groups"]}
        ione = by_name["Ione Farrow"]
        assert ione["disposition"] == "evidence_linked" and str(ione["athleteId"]) == "21", ione.get("identityEvidence")
        assert ione["history"]["provider"] == "TCS London Marathon results" and "athleteDraft" not in ione
        top = ione["identityEvidence"]["rankedCandidates"][0]
        assert top["signals"]["age"] == "compatible" and top["signals"]["time"] == "plausible" and top["signals"]["rareName"] is True
        jory = by_name["Jory Penhale"]
        assert jory["disposition"] == "new" and jory["identityEvidence"]["decision"] == "distinct_person"
        assert jory["identityEvidence"]["rankedCandidates"][0]["hardContradictions"] == ["age_progression_impossible"]
        kit = by_name["Kit Marlow"]
        assert kit["disposition"] == "held" and kit["identityEvidence"]["holdReason"] in ("multiple_compatible_candidates", "repeated_name_in_field")
        assert kit["identityEvidence"]["holdReason"] == "multiple_compatible_candidates"
        lark = by_name["Lark Vance"]
        assert lark["disposition"] == "held" and lark["identityEvidence"]["holdReason"] == "protected_candidate_requires_review"
        nell = by_name["Nell Quarry"]
        assert nell["disposition"] == "held" and nell["identityEvidence"]["holdReason"] == "protected_candidate_requires_review"
        assert built["summary"]["evidenceLinked"] == 1 and built["summary"]["distinctPersonCreated"] == 1
        # A gender difference alone never creates a distinct person (profile gender is not source sex evidence).
        g_snap = copy.deepcopy(snapshot); g_snap["athletes"][1]["gender"] = "F"
        g_cand = {"metadata": {"snapshotDigest": plan._hash(g_snap), "digest": plan._hash({**athletes_ev, "22": {**athletes_ev["22"], "performances": [half]}})},
                  "athletes": {**athletes_ev, "22": {**athletes_ev["22"], "performances": [half]}}}
        g_plan = plan.build_plan(observations, g_snap, EDITION, ctx["batchId"], CREATED, candidate_evidence=g_cand, chains=chains)
        assert {g["name"]: g for g in g_plan["groups"]}["Jory Penhale"]["disposition"] == "held"
        # Tampering with an evidence link is rejected.
        t = copy.deepcopy(built)
        next(g for g in t["groups"] if g["disposition"] == "evidence_linked")["athleteId"] = 23
        expect_error(lambda: plan.validate_plan(t), "evidence link")
        t = copy.deepcopy(built)
        next(g for g in t["groups"] if g["name"] == "Kit Marlow").update(disposition="new", reasons=[])
        expect_error(lambda: plan.validate_plan(t), "")
        # Evidence read for another snapshot is refused.
        expect_error(lambda: plan.build_plan(observations, snapshot, EDITION, ctx["batchId"], CREATED,
                                             candidate_evidence={**candidate, "metadata": {**candidate["metadata"], "snapshotDigest": "x"}}, chains=chains),
                     "Candidate evidence")
        # Publish-leaning policy (owner instruction, 1 November 2026, 13:14).
        lean = plan.build_plan(observations, snapshot, EDITION, ctx["batchId"], CREATED, candidate_evidence=candidate,
                               chains=chains, policy=ev.PUBLISH_LEANING)
        by = {g["name"]: g for g in lean["groups"]}
        kit = by["Kit Marlow"]
        assert kit["disposition"] == "new" and kit["identityEvidence"]["decision"] == "create_possible_duplicate"
        details = kit["athleteDraft"]["profileDetails"]
        assert details["identity_review_status"] == ev.DUPLICATE_REVIEW_STATUS
        assert sorted(c["athleteId"] for c in details["possibleDuplicateOf"]) == ["23", "24"]
        assert by["Ione Farrow"]["disposition"] == "evidence_linked"
        assert by["Lark Vance"]["disposition"] == "held" and by["Nell Quarry"]["disposition"] == "held"
        assert lean["summary"]["possibleDuplicateCreated"] == 1
        plan.validate_plan(lean)
        t = copy.deepcopy(lean)
        t["identityEvidence"]["policy"] = ev.CONSERVATIVE
        expect_error(lambda: plan.validate_plan(t), "")
        # Top-up: groups published by an earlier plan of this edition are skipped.
        top = plan.build_plan(observations, snapshot, EDITION, ctx["batchId"], CREATED, candidate_evidence=candidate, chains=chains,
                              policy=ev.PUBLISH_LEANING, already_imported={by["Ione Farrow"]["groupId"]: "evidence_linked"})
        assert {g["name"]: g for g in top["groups"]}["Ione Farrow"]["disposition"] == "already_imported"
        assert top["summary"]["alreadyImported"] == 1

    # Publish-leaning: a repeated name in one race creates separate profiles; a
    # candidate already holding this edition still holds.
    rows2 = [row("SYNTH0000000201", "Quin", "Ashby", "03:30:00", place=21), row("SYNTH0000000202", "Quin", "Ashby", "04:30:00", place=22),
             row("SYNTH0000000203", "Rue", "Calder", "03:31:00", place=23)]
    with tempfile.TemporaryDirectory() as private:
        folder = pathlib.Path(private)
        (folder / f"london_{YEAR}.json").write_text(json.dumps(rows2))
        ctx2 = context(folder / f"london_{YEAR}.json")
        ctx2["expectedRows"], ctx2["expectedByEvent"] = 3, {"MAS": 3}
        plan.configure(ctx2)
        obs2 = plan.load_sources(folder)
        snap2 = {"athletes": [{"id": 31, "displayName": "Rue Calder", "aliases": [], "gender": "M", "nationality": "GBR", "visibility": "public", "profileType": "Athlete"}],
                 "results": [{"id": "history:x", "athleteId": 31, "editionId": EDITION["id"], "date": DATE, "year": YEAR, "distanceKm": 42.195,
                              "finishSeconds": 15000, "timeSeconds": [15000], "sourceUrls": [], "sourceKind": "history", "provider": "Synthetic"}],
                 "accounts": [], "metadata": {"editionContextDigest": plan._hash(plan.EDITION_CONTEXT), "fingerprint": "synthetic"}}
        ev2 = {"31": {"clubs": [], "performances": [], "sourceNationality": None, "privacyFlags": []}}
        cand2 = {"metadata": {"snapshotDigest": plan._hash(snap2), "digest": plan._hash(ev2)}, "athletes": ev2}
        lean2 = plan.build_plan(obs2, snap2, EDITION, ctx2["batchId"], CREATED, candidate_evidence=cand2,
                                chains=ev.build_chains({YEAR: rows2}), policy=ev.PUBLISH_LEANING)
        quins = [g for g in lean2["groups"] if g["name"] == "Quin Ashby"]
        assert [g["disposition"] for g in quins] == ["new", "new"] and quins[0]["athleteDraft"]["slug"] != quins[1]["athleteDraft"]["slug"]
        rue = next(g for g in lean2["groups"] if g["name"] == "Rue Calder")
        assert rue["disposition"] == "held" and rue["identityEvidence"]["holdReason"] == "candidate_already_has_this_edition"
        conservative2 = plan.build_plan(obs2, snap2, EDITION, ctx2["batchId"], CREATED, candidate_evidence=cand2, chains=ev.build_chains({YEAR: rows2}))
        assert all(g["disposition"] == "held" for g in conservative2["groups"] if g["name"] == "Quin Ashby")

    # Cross-year chains: compatible age progression chains; an impossible one does not.
    def r(year, first, last, cat):
        return {**row("SYNTH%010d" % (year * 10 + len(first)), first, last, "04:00:00"), "year": year, "category": cat}
    chains = ev.build_chains({2010: [r(2010, "Odo", "Brant", "18-39"), r(2010, "Pim", "Selby", "60-64")],
                              2020: [r(2020, "Odo", "Brant", "40-44"), r(2020, "Pim", "Selby", "18-39")]})
    assert chains["stats"]["chains"] == 1 and chains["stats"]["age_progression_conflict"] == 1
    assert next(iter(chains["chains"].values()))["name"] == "odo brant"


if __name__ == "__main__":
    main()
