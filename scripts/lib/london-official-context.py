"""Validated configuration for one London edition captured from the official results site.

The configuration identifies one retained year file (by SHA-256) from the
official London Marathon results website and one explicitly reviewed canonical
edition. It cannot grant identity verification, change matching rules or
enable another source. Callers embed the complete validated value in the plan.
"""
from __future__ import annotations

import copy
import datetime as dt
import re


KEYS = {
    "formatVersion", "year", "date", "batchId", "edition", "sourceFile", "sourceSha256",
    "expectedRows", "expectedByEvent", "capturedAt", "ownerInstruction", "instructionDate",
}

# Event codes captured from each year's results-site event menu. Virtual runs,
# 5Ks, flying-400 sprints and combined "mass and virtual" lists are excluded.
EVENTS = {
    "MAS": "Mass", "ELIT": "Elite", "ELIW": "Elite women", "LMRM": "Elite men", "LMRW": "Elite women",
    "WHL": "Wheelchair", "VLMW": "Wheelchair", "PARA": "Para ambulatory", "IPC": "Para ambulatory",
    "IPCW": "Para wheelchair",
}

# Reference race dates, for operator review only. The canonical edition row in
# the database (listed by the snapshot script's --list-editions) is authoritative.
REFERENCE_DATES = {
    2010: "2010-04-25", 2011: "2011-04-17", 2012: "2012-04-22", 2013: "2013-04-21",
    2014: "2014-04-13", 2015: "2015-04-26", 2016: "2016-04-24", 2017: "2017-04-23",
    2018: "2018-04-22", 2019: "2019-04-28", 2020: "2020-10-04", 2021: "2021-10-03",
    2022: "2022-10-02", 2023: "2023-04-23", 2024: "2024-04-21", 2025: "2025-04-27",
    2026: "2026-04-26",
}


def _positive_integer(value, label):
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(label + " must be a positive integer")
    return value


def validate_context(value):
    """Return an independent copy, rejecting edition, file or authority ambiguity."""
    if not isinstance(value, dict) or set(value) != KEYS:
        raise ValueError("London official-results configuration has missing or unknown fields")
    context = copy.deepcopy(value)
    if type(context["formatVersion"]) is not int or context["formatVersion"] != 1:
        raise ValueError("Unsupported London official-results configuration version")
    year = _positive_integer(context["year"], "Edition year")
    if year not in REFERENCE_DATES:
        raise ValueError("The official-results adapter covers the 2010–2026 editions")
    try:
        date = dt.date.fromisoformat(context["date"])
    except (TypeError, ValueError):
        raise ValueError("An explicit ISO edition date is required") from None
    if date.year != year or date.isoformat() != context["date"]:
        raise ValueError("Edition date differs from the configured year")
    if not isinstance(context["batchId"], str) or not re.fullmatch(rf"london-official-{year}-[a-z0-9]+(?:-[a-z0-9]+)*", context["batchId"]):
        raise ValueError("Batch ID must explicitly identify this official London edition")
    edition = context["edition"]
    expected_edition_keys = {"id", "equivalentIds", "eventSlug", "eventName", "date", "distanceKm", "country"}
    if not isinstance(edition, dict) or set(edition) != expected_edition_keys:
        raise ValueError("A complete reviewed canonical London edition is required")
    _positive_integer(edition["id"], "Canonical edition ID")
    if not isinstance(edition["equivalentIds"], list):
        raise ValueError("Equivalent edition IDs must be a list")
    ids = [edition["id"], *(_positive_integer(item, "Equivalent edition ID") for item in edition["equivalentIds"])]
    if len(ids) != len(set(ids)):
        raise ValueError("Canonical and equivalent edition IDs must be distinct")
    if (edition["eventSlug"] != "london-marathon" or edition["eventName"] != "London Marathon"
            or edition["date"] != context["date"] or edition["distanceKm"] != 42.195
            or edition["country"] != "United Kingdom"):
        raise ValueError("Reviewed edition must be this London Marathon date and distance")
    if context["sourceFile"] != f"london_{year}.json":
        raise ValueError("The retained source file must identify the configured year")
    if not isinstance(context["sourceSha256"], str) or not re.fullmatch(r"[0-9a-f]{64}", context["sourceSha256"]):
        raise ValueError("The retained source file needs its exact SHA-256")
    rows = _positive_integer(context["expectedRows"], "Expected row count")
    by_event = context["expectedByEvent"]
    if not isinstance(by_event, dict) or not by_event or set(by_event) - set(EVENTS):
        raise ValueError("Expected per-event counts must name captured official event codes")
    if sum(_positive_integer(n, "Event row count") for n in by_event.values()) != rows:
        raise ValueError("Per-event counts must add up to the expected row count")
    captured = context["capturedAt"]
    try:
        parsed = dt.datetime.fromisoformat(str(captured).replace("Z", "+00:00"))
    except ValueError:
        raise ValueError("Capture time must be an ISO timestamp") from None
    if parsed.tzinfo is None:
        raise ValueError("Capture time must include its time zone")
    if not isinstance(context["ownerInstruction"], str) or not context["ownerInstruction"].strip():
        raise ValueError("Retain the owner's import instruction")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(context["instructionDate"])):
        raise ValueError("Retain the owner's instruction date")
    return context
