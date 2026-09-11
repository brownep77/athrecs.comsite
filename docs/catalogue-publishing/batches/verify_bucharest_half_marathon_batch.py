#!/usr/bin/env python3
"""Check this prepared import offline; never stage or publish catalogue data."""

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

SLUG = "bucharest-half-marathon"
ENTRY_URL = "https://in.njuko.com/bucharest21k2027"
SOURCE_ROOT = "https://www.bucuresti21km.ro"
EXPECTED = {
    "Half": ("2027-05-09", 21.0975, 6, "/en/cursa-21km-half-marathon-bucharest/"),
    "10K": ("2027-05-08", 10, 5, "/en/cursa-10km-10k-bucharest-race/"),
}


def require(condition: bool, message: str) -> None:
    """Keep validation enabled even when Python runs with -O."""
    if not condition:
        raise ValueError(message)


def official_url(value: str) -> None:
    parsed = urlsplit(value)
    require(
        parsed.scheme == "https" and parsed.netloc == "www.bucuresti21km.ro",
        f"Unexpected organiser URL: {value}",
    )


def validate(batch: dict) -> dict:
    require(
        batch["sourceKey"] == "runrecs:bucharest-half-marathon:2027:2026-09-08",
        "Unexpected source key",
    )
    require(batch["sourceUrl"] == SOURCE_ROOT + "/en/rules/", "Wrong batch source")
    require(len(batch["events"]) == 1, "Expected one proposed event")
    require(len(batch["editions"]) == 2, "Expected two editions")
    event = batch["events"][0]
    for field, expected in {
        "slug": SLUG,
        "name": "OMV Petrom Bucharest Half Marathon",
        "sport": "Running",
        "country": "Romania",
        "city": "Bucharest",
        "surface": "Road",
        "organiser": "Bucharest Running Club",
        "website": SOURCE_ROOT + "/en/",
        "distances": ["Half", "10K"],
    }.items():
        require(event[field] == expected, f"Unexpected event {field}")

    keys = set()
    distances = set()
    for edition in batch["editions"]:
        distance = edition["distance"]
        require(distance in EXPECTED, f"Unexpected distance: {distance}")
        race_date, km, weekday, source_path = EXPECTED[distance]
        for field, expected in {
            "eventSlug": SLUG,
            "eventName": event["name"],
            "date": race_date,
            "distanceKm": km,
            "startTime": "09:00",
            "status": "Open",
            "entryUrl": ENTRY_URL,
            "source": SOURCE_ROOT + source_path,
        }.items():
            require(edition[field] == expected, f"Unexpected {distance} {field}")
        require(date.fromisoformat(edition["date"]).weekday() == weekday, "Wrong weekday")
        require("Europe/Bucharest" in edition["notes"], "Missing local-time context")
        require(len(edition["entryOptions"]) == 1, "Expected one official entry option")
        option = edition["entryOptions"][0]
        for field, expected in {
            "providerCode": "bucharest-running-club",
            "providerName": "Bucharest Running Club / njuko",
            "entryUrl": ENTRY_URL,
            "entryType": "official",
            "status": "open",
            "checkedAt": "2026-09-10",
        }.items():
            require(option[field] == expected, f"Unexpected entry option {field}")
        require(option["isPrimary"] is True, "Entry option must be primary")
        require(option["isVerified"] is True, "Entry option must be verified")
        official_url(option["sourceUrl"])
        key = (edition["eventSlug"], edition["date"], distance)
        require(key not in keys, f"Duplicate edition key: {key}")
        keys.add(key)
        distances.add(distance)
    require(distances == set(EXPECTED), "Both race distances must be represented")
    return {
        "structuralValidation": "passed",
        "events": len(batch["events"]),
        "editions": len(batch["editions"]),
        "duplicateKeysWithinBatch": 0,
        "productionReceiptRecorded": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "payload",
        nargs="?",
        type=Path,
        default=Path(__file__).with_name("bucharest-half-marathon-2027.json"),
    )
    args = parser.parse_args()
    try:
        report = validate(json.loads(args.payload.read_text(encoding="utf-8")))
    except (OSError, ValueError, KeyError, TypeError, AttributeError, IndexError) as error:
        print(f"Validation failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
