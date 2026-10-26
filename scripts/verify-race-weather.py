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

spec = importlib.util.spec_from_file_location("supplement", Path(__file__).with_name("supplement-race-weather.py"))
supplement = importlib.util.module_from_spec(spec)
spec.loader.exec_module(supplement)

assert supplement.metar_codes({"wxcodes": "M", "skyc1": "M", "metar": "CAVOK"}) == []
assert supplement.metar_codes({"wxcodes": "VCTS VCSH"}) == []
assert supplement.metar_codes({"wxcodes": "TSSHRA", "skyc1": "BKN"}) == [3, 8, 25]
assert supplement.metar_codes({"wxcodes": "-FZRA FZFG"}) == [6, 10]
assert supplement.metar_codes({"wxcodes": "-RASN SHRAGS"}) == [12]
assert supplement.metar_codes({"wxcodes": "BR HZ", "skyc1": "FEW"}) == [2]

# Local-day boundaries exclude the neighbouring UTC dates; specials within an
# hour do not inflate coverage or bias the mean. A missing gust is not zero.
rows = [dict(station="TEST", valid=f"2025-01-{day:02d} {hour:02d}:00", tmpf="50", sknt="10", relh="80", gust="M")
        for day in (1, 2) for hour in range(24)]
rows += [dict(station="TEST", valid="2025-01-02 07:30", tmpf="68", sknt="50", relh="99", gust="20", wxcodes="TSRA")]
summary = supplement.metar_summary(rows, "2025-01-02", "Asia/Manila", "TEST")
assert summary["temperatureSummary"]["hours"] == 24
assert summary["temperatureSummary"]["windKph"] == 18.5
assert summary["temperatureSummary"]["maxC"] == 10
assert summary["gustKph"] == 37
assert summary["conditionCodes"] == [8, 25]
assert supplement.metar_summary(rows[:3], "2025-01-02", "Asia/Manila", "TEST")["gustKph"] is None

def power_data(start, count):
    return {"header": {"time_standard": "UTC", "sources": ["MERRA2"]},
            "parameters": {"PRECTOTCORR": {"units": "mm/hour"}},
            "geometry": {"coordinates": [0, 52]},
            "properties": {"parameter": {"PRECTOTCORR": {
                (start + timedelta(hours=i)).strftime("%Y%m%d%H"): 1 for i in range(count)}}}}

data = power_data(datetime(2025, 10, 25), 72)
summary = supplement.power_summary(data, "2025-10-26", "Europe/London")
assert summary["mm"] == 25 and summary["hours"] == summary["expectedHours"] == 25
data["properties"]["parameter"]["PRECTOTCORR"]["2025102601"] = -999
assert supplement.power_summary(data, "2025-10-26", "Europe/London") is None
data = power_data(datetime(2025, 3, 29), 72)
assert supplement.power_summary(data, "2025-03-30", "Europe/London")["mm"] == 23
data["header"]["time_standard"] = "LST"
try:
    supplement.power_summary(data, "2025-03-30", "Europe/London")
    raise AssertionError("Solar-time response must not pass as UTC")
except ValueError:
    pass
print("PASS: METAR missing/vicinity/conditions, unique hourly coverage, NASA local days and missing estimates")
