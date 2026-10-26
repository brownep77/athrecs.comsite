"""Synthetic timezone, missing-data and source-quality regressions."""
import importlib.util
from datetime import datetime, timedelta, timezone
from pathlib import Path

spec = importlib.util.spec_from_file_location("weather", Path(__file__).with_name("collect-race-weather.py"))
weather = importlib.util.module_from_spec(spec)
spec.loader.exec_module(weather)


def hours(start, count):
    rows = []
    for i in range(count):
        stamp = start + timedelta(hours=i)
        rows.append(dict(year=stamp.year, month=stamp.month, day=stamp.day, hour=stamp.hour,
                         temp=str(i), temp_source="metar", prcp="0", prcp_source="metar"))
    return rows


rows = hours(datetime(2025, 3, 29, tzinfo=timezone.utc), 72)
spring = weather.summarize(rows, "2025-03-30", "Europe/London")
assert spring["hours"] == spring["expectedHours"] == 23
assert (spring["minC"], spring["maxC"]) == (24, 46)
rows = hours(datetime(2025, 10, 25, tzinfo=timezone.utc), 72)
autumn = weather.summarize(rows, "2025-10-26", "Europe/London")
assert autumn["hours"] == autumn["expectedHours"] == 25
assert (autumn["minC"], autumn["maxC"]) == (23, 47)

rows = hours(datetime(2025, 1, 1, tzinfo=timezone.utc), 72)
east = weather.summarize(rows, "2025-01-02", "Asia/Manila")
west = weather.summarize(rows, "2025-01-02", "America/Toronto")
assert (east["minC"], east["maxC"]) == (16, 39)
assert (west["minC"], west["maxC"]) == (29, 52)
assert east["precipitationMm"] == 0
rows[20]["prcp"] = ""
rows[20]["temp_source"] = "dwd_mosmix"
mixed = weather.summarize(rows, "2025-01-02", "Asia/Manila")
assert mixed["precipitationMm"] is None
assert mixed["modelFilled"] is True
assert mixed["conditionCodes"] == []
assert weather.summarize(rows[:20], "2025-01-02", "Asia/Manila") is None
print("PASS: local days, both DST boundaries, missing precipitation and model provenance")
