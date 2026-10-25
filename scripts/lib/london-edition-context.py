"""Validated, immutable-input configuration for supervised London editions.

Configuration identifies retained evidence and an explicitly reviewed canonical
edition. It cannot grant verification, change identity matching, or enable a
source. Callers embed the complete validated value in the immutable plan.
"""
from __future__ import annotations

import copy
import datetime as dt
from pathlib import PurePosixPath
import re


KEYS = {
    "formatVersion", "year", "date", "batchId", "edition", "inputSha256",
    "paceRowsFile", "paceCsvFile", "guideCsvFile", "paceRecords", "guideRecords",
    "guideSubevent", "guidePublication", "collectionFileId", "collectionSha256",
    "ownerInstruction",
}


def _positive_integer(value, label):
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(label + " must be a positive integer")
    return value


def validate_context(value):
    """Return an independent copy, rejecting edition/path/authority ambiguity."""
    if not isinstance(value, dict) or set(value) != KEYS:
        raise ValueError("London edition configuration has missing or unknown fields")
    context = copy.deepcopy(value)
    if type(context["formatVersion"]) is not int or context["formatVersion"] != 1:
        raise ValueError("Unsupported London edition configuration version")
    year = _positive_integer(context["year"], "Edition year")
    if year not in (2023, 2024, 2025):
        raise ValueError("London adapter is reviewed for the 2023–2025 editions")
    try:
        date = dt.date.fromisoformat(context["date"])
    except (TypeError, ValueError):
        raise ValueError("An explicit ISO edition date is required") from None
    if date.year != year or date.isoformat() != context["date"]:
        raise ValueError("Edition date differs from the configured year")
    if not isinstance(context["batchId"], str) or not re.fullmatch(rf"london-{year}-[a-z0-9]+(?:-[a-z0-9]+)*", context["batchId"]):
        raise ValueError("Batch ID must explicitly identify this London edition")
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
    expected_files = {
        "paceRowsFile": f"raw/pace_notes_{year}.jsonl",
        "paceCsvFile": f"London_Marathon_{year}_Pace_Notes.csv",
        "guideCsvFile": f"London_Marathon_{year}_MarathonGuide.csv",
    }
    if any(context[key] != name for key, name in expected_files.items()):
        raise ValueError("Retained source filenames must identify the configured edition")
    required = {*expected_files.values(), "raw/pace_notes_schema.json", "raw/pace_notes_metadata.json", "raw/marathonguide_pages.json"}
    pins = context["inputSha256"]
    if not isinstance(pins, dict) or not required <= set(pins):
        raise ValueError("Every original source, schema, metadata and CSV needs a checksum")
    for relative, digest in pins.items():
        if not isinstance(relative, str) or not relative or PurePosixPath(relative).is_absolute() or ".." in PurePosixPath(relative).parts or "\\" in relative or str(PurePosixPath(relative)) != relative:
            raise ValueError("Input checksum paths must be normalized relative paths")
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise ValueError("Input checksums must be explicit SHA-256 values")
    _positive_integer(context["paceRecords"], "Pace Notes record count")
    _positive_integer(context["guideRecords"], "MarathonGuide record count")
    if not isinstance(context["guideSubevent"], str) or not re.fullmatch(r"[1-9][0-9]*", context["guideSubevent"]):
        raise ValueError("Observed MarathonGuide subevent ID is required")
    if not isinstance(context["guidePublication"], str) or not re.fullmatch(rf"https://marathonguide\.com/races/run/london-marathon-[0-9]+/{year}/results/", context["guidePublication"]):
        raise ValueError("Observed MarathonGuide publication must be for this edition")
    if not isinstance(context["collectionFileId"], str) or not re.fullmatch(r"libfile_[A-Za-z0-9_-]+", context["collectionFileId"]):
        raise ValueError("The retained collection must have a Library identity")
    if not isinstance(context["collectionSha256"], str) or not re.fullmatch(r"[0-9a-f]{64}", context["collectionSha256"]):
        raise ValueError("The retained collection needs its exact SHA-256")
    if not isinstance(context["ownerInstruction"], str) or not context["ownerInstruction"].strip():
        raise ValueError("Retain the owner's import instruction")
    return context
