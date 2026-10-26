"""Fill reviewed weather gaps without replacing existing values or inventing dry hours.

Usage: python scripts/supplement-race-weather.py SNAPSHOT METAR_MANIFEST CACHE_DIR
IEM observations: public domain. NASA POWER: regional MERRA-2 estimates, credited.
"""
import csv
import gzip
import hashlib
import io
import json
import math
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo


def bounds(date, tz):
    start = datetime.fromisoformat(date).replace(tzinfo=ZoneInfo(tz))
    return start.astimezone(timezone.utc), (start + timedelta(days=1)).astimezone(timezone.utc)


def number(value):
    try:
        result = float(value)
        return result if math.isfinite(result) else None
    except (ValueError, TypeError):
        return None


def metar_codes(row):
    """Only explicit weather/sky reports. Missing, CAVOK and vicinity are not clear/dry."""
    codes = set()
    for token in row.get("wxcodes", "").split():
        if token.startswith("VC"):
            continue
        if "TS" in token:
            codes.add(25)
        if "GR" in token:
            codes.add(24)
        if "FZ" in token and any(x in token for x in ("RA", "DZ")):
            codes.add(10)
        elif ("SN" in token and "RA" in token) or "PL" in token or "GS" in token:
            codes.add(12)
        elif "SN" in token:
            codes.add(15)
        elif "RA" in token or "DZ" in token:
            codes.add(8)
        if "FG" in token:
            codes.add(6 if "FZ" in token else 5)
    for i in range(1, 5):
        sky = row.get(f"skyc{i}", "").strip()
        if sky in {"SKC", "CLR"}:
            codes.add(1)
        elif sky == "FEW":
            codes.add(2)
        elif sky in {"SCT", "BKN"}:
            codes.add(3)
        elif sky == "OVC":
            codes.add(4)
    return sorted(codes)


def metar_summary(rows, date, tz, station):
    start, end = bounds(date, tz)
    # The API returns UTC. Filter independently and discard duplicate timestamps.
    selected = {}
    for row in rows:
        if row.get("station") != station:
            continue
        stamp = datetime.fromisoformat(row["valid"]).replace(tzinfo=timezone.utc)
        if start <= stamp < end:
            selected[stamp] = row
    rows = list(selected.values())
    codes = sorted({code for row in rows for code in metar_codes(row)})
    gusts = [number(row.get("gust")) for row in rows]
    gusts = [v * 1.852 for v in gusts if v is not None and v >= 0]
    summary = {"conditionCodes": codes, "gustKph": round(max(gusts), 1) if gusts else None,
               "reports": len(rows), "conditionReports": sum(bool(metar_codes(r)) for r in rows),
               "weatherTokens": sorted({t for r in rows for t in r.get("wxcodes", "").split() if t != "M"})}
    # Use one routine observation nearest the hour, preventing specials from
    # over-weighting a stormy hour in temperature, wind and humidity means.
    hourly = {}
    for stamp, row in selected.items():
        hour = stamp.replace(minute=0, second=0)
        if hour not in hourly or stamp < hourly[hour][0]:
            hourly[hour] = (stamp, row)
    values = lambda key: [v for _, r in hourly.values() if (v := number(r.get(key))) is not None]
    temperatures = [(v - 32) * 5 / 9 for v in values("tmpf") if -130 <= v <= 140]
    expected = int((end - start).total_seconds() / 3600)
    if len(temperatures) >= expected * 0.75:
        wind, humidity = values("sknt"), values("relh")
        summary["temperatureSummary"] = {
            "minC": round(min(temperatures), 1), "maxC": round(max(temperatures), 1),
            "hours": len(temperatures), "expectedHours": expected,
            "windKph": round(sum(wind) / len(wind) * 1.852, 1) if wind else None,
            "humidityPct": round(sum(humidity) / len(humidity), 1) if humidity else None,
            "windHours": len(wind), "humidityHours": len(humidity),
        }
    return summary


def power_summary(data, date, tz):
    if data["header"]["time_standard"] != "UTC":
        raise ValueError("NASA response must use UTC")
    if data["parameters"]["PRECTOTCORR"]["units"] != "mm/hour":
        raise ValueError("Unexpected NASA precipitation units")
    start, end = bounds(date, tz)
    expected = int((end - start).total_seconds() / 3600)
    values = []
    for stamp, value in data["properties"]["parameter"]["PRECTOTCORR"].items():
        hour = datetime.strptime(stamp, "%Y%m%d%H").replace(tzinfo=timezone.utc)
        value = number(value)
        if start <= hour < end and value is not None and value >= 0:
            values.append(value)
    if len(values) != expected:
        return None
    return {"mm": round(sum(values), 1), "trace": 0 < sum(values) < 0.05,
            "hours": len(values), "expectedHours": expected,
            "sources": data["header"]["sources"], "parameter": "PRECTOTCORR",
            "resolutionDegrees": [0.5, 0.625], "timeStandard": "UTC",
            "queryCoordinates": data["geometry"]["coordinates"][:2]}


def supplement(snapshots, manifest, cache):
    cache.mkdir(parents=True, exist_ok=True)
    def fetch(url):
        path = cache / hashlib.sha256(url.encode()).hexdigest()
        if not path.exists():
            # Sequential requests and persistent cache respect provider limits.
            time.sleep(1.2)
            path.write_bytes(urllib.request.urlopen(url, timeout=90).read())
        raw = path.read_bytes()
        return raw, {"url": url, "sha256": hashlib.sha256(raw).hexdigest()}

    for key, weather in snapshots.items():
        attempts = []
        if key in manifest and "metarSupplement" not in weather:
            station = manifest[key]
            start, end = bounds(weather["date"], weather["timezone"])
            query = {"station": station["station"], "data": "all", "sts": start.isoformat(),
                     "ets": end.isoformat(), "tz": "UTC", "format": "onlycomma",
                     "latlon": "yes", "elev": "yes", "missing": "M", "trace": "T",
                     "direct": "no", "report_type": [3, 4]}
            url = "https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?" + urllib.parse.urlencode(query, doseq=True)
            try:
                raw, archive = fetch(url)
                rows = list(csv.DictReader(io.StringIO(raw.decode())))
                for row in rows:
                    lat, lon = number(row.get("lat")), number(row.get("lon"))
                    if lat is None or lon is None or abs(lat - station["latitude"]) > 0.15 or abs(lon - station["longitude"]) > 0.15:
                        raise ValueError("METAR station coordinates do not match the reviewed identity")
                summary = metar_summary(rows, weather["date"], weather["timezone"], station["station"])
                used = []
                if weather["status"] == "unavailable" and "temperatureSummary" in summary:
                    weather.update(summary["temperatureSummary"], status="available", modelFilled=False,
                                   stationName=station["name"], stationLatitude=station["latitude"],
                                   stationLongitude=station["longitude"], stationElevation=station["elevation"],
                                   temperatureSource="iem")
                    used.extend(["temperature", "wind", "humidity"])
                if not weather.get("conditionCodes") and summary["conditionCodes"]:
                    weather["conditionCodes"] = summary["conditionCodes"]
                    used.append("conditions")
                if weather.get("gustKph") is None and summary["gustKph"] is not None:
                    weather["gustKph"] = summary["gustKph"]
                    used.append("gust")
                weather["metarSupplement"] = {**station, "fields": used, "reports": summary["reports"],
                    "conditionReports": summary["conditionReports"], "weatherTokens": summary["weatherTokens"],
                    "archive": archive, "retrievedOn": datetime.now(timezone.utc).date().isoformat()}
            except Exception as error:
                attempts.append({"url": url, "error": str(error)})

        # ISD-Lite retains cloud cover even where it has no present-weather codes.
        # Retain it separately: cloud cover alone cannot tell us whether it rained.
        if not weather.get("conditionCodes"):
            clouds = []
            start, end = bounds(weather["date"], weather["timezone"])
            for archive in weather["archives"]:
                if "sha256" not in archive:
                    continue
                raw, _ = fetch(archive["url"])
                for row in csv.DictReader(io.StringIO(gzip.decompress(raw).decode())):
                    stamp = datetime(*(int(row[k]) for k in ("year", "month", "day", "hour")), tzinfo=timezone.utc)
                    value = number(row.get("cldc"))
                    if start <= stamp < end and value is not None and 0 <= value <= 8:
                        clouds.append(value)
            if clouds:
                weather["cloudCover"] = {"minOktas": min(clouds), "maxOktas": max(clouds), "hours": len(clouds)}

        if weather.get("precipitationMm") is None and "precipitationEstimate" not in weather:
            start, end = bounds(weather["date"], weather["timezone"])
            query = {"parameters": "PRECTOTCORR", "community": "AG",
                     "longitude": weather["stationLongitude"], "latitude": weather["stationLatitude"],
                     "start": start.strftime("%Y%m%d"), "end": (end - timedelta(seconds=1)).strftime("%Y%m%d"),
                     "format": "JSON", "time-standard": "UTC"}
            url = "https://power.larc.nasa.gov/api/temporal/hourly/point?" + urllib.parse.urlencode(query)
            try:
                raw, archive = fetch(url)
                summary = power_summary(json.loads(raw), weather["date"], weather["timezone"])
                if summary:
                    weather["precipitationEstimate"] = {**summary, "archive": archive,
                        "retrievedOn": datetime.now(timezone.utc).date().isoformat()}
                else:
                    attempts.append({"url": url, "error": "Incomplete hourly model coverage"})
            except Exception as error:
                attempts.append({"url": url, "error": str(error)})
        if attempts:
            weather["supplementAttempts"] = attempts
        else:
            weather.pop("supplementAttempts", None)
        print(key, "conditions", bool(weather.get("conditionCodes")), "cloud", bool(weather.get("cloudCover")),
              "rain estimate", weather.get("precipitationEstimate", {}).get("mm"), "errors", attempts, flush=True)
    return snapshots


if __name__ == "__main__":
    path = Path(sys.argv[1])
    result = supplement(json.loads(path.read_text()), json.loads(Path(sys.argv[2]).read_text()), Path(sys.argv[3]))
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
