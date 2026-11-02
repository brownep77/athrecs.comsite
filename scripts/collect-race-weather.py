"""Cache local-day weather from Meteostat; never infer a race start or a dry hour.

Usage: python scripts/collect-race-weather.py MANIFEST OUTPUT [CACHE_DIR]
Meteostat redistributed data: CC BY 4.0. No API key or runtime requests.
"""
import csv
import gzip
import hashlib
import io
import json
import sys
import urllib.request
from urllib.error import HTTPError
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import Lock
from zoneinfo import ZoneInfo

MODELS = {"dwd_mosmix", "metno_forecast"}


def summarize(rows, date, tz):
    """Only use UTC hours falling within this race's actual local calendar day."""
    zone = ZoneInfo(tz)
    start = datetime.fromisoformat(date).replace(tzinfo=zone)
    end = start + timedelta(days=1)
    expected = int((end.astimezone(timezone.utc) - start.astimezone(timezone.utc)).total_seconds() / 3600)
    selected = []
    for row in rows:
        stamp = datetime(*(int(row[k]) for k in ("year", "month", "day", "hour")), tzinfo=timezone.utc)
        if start <= stamp < end:
            selected.append(row)
    def values(key):
        return [float(r[key]) for r in selected if r.get(key, "") != ""]
    temperatures = values("temp")
    if len(temperatures) < expected * 0.75:
        return None
    wind, humidity, rain, gusts = (values(k) for k in ("wspd", "rhum", "prcp", "wpgt"))
    codes = sorted({int(v) for v in values("coco") if 1 <= v <= 27})
    sources = sorted({r[k] for r in selected for k in r if k.endswith("_source") and r[k]})
    mean = lambda v: round(sum(v) / len(v), 1) if v else None
    return {
        "minC": min(temperatures), "maxC": max(temperatures),
        "windKph": mean(wind), "gustKph": max(gusts) if gusts else None,
        "humidityPct": mean(humidity),
        # Partial precipitation must never be presented as a whole-day total.
        "precipitationMm": round(sum(rain), 1) if len(rain) == expected else None,
        "conditionCodes": codes,
        "hours": len(temperatures), "expectedHours": expected,
        "windHours": len(wind), "humidityHours": len(humidity),
        "conditionHours": len(values("coco")), "precipitationHours": len(rain),
        "modelFilled": bool(MODELS.intersection(sources)), "sourceIds": sources,
    }


def collect(manifest, cache):
    cache.mkdir(parents=True, exist_ok=True)
    locks = {}
    def download(url):
        path = cache / hashlib.sha256(url.encode()).hexdigest()
        if not path.exists():
            last_error = None
            for _ in range(3):
                try:
                    body = urllib.request.urlopen(url, timeout=30).read()
                    path.write_bytes(body)
                    break
                except Exception as error:
                    if isinstance(error, HTTPError) and error.code == 404:
                        raise
                    last_error = error
            else:
                raise last_error
        return path.read_bytes()
    def fetch(url):
        # Several editions can share a station/year. Download and cache it once.
        with locks.setdefault(url, Lock()):
            return download(url)
    def one(event):
        key = event["eventSlug"] + "|" + event["date"]
        station_id = event["stationId"]
        station = json.loads(fetch(f"https://data.meteostat.net/stations/{station_id}.json"))
        # A local day at New Year may cross the UTC year boundary.
        zone = ZoneInfo(event["timezone"])
        start = datetime.fromisoformat(event["date"]).replace(tzinfo=zone)
        years = {start.astimezone(timezone.utc).year,
                 (start + timedelta(days=1) - timedelta(seconds=1)).astimezone(timezone.utc).year}
        rows, archives = [], []
        for y in sorted(years):
            url = f"https://data.meteostat.net/hourly/{y}/{station_id}.csv.gz"
            try:
                raw = fetch(url)
            except Exception as error:
                print("Weather archive unavailable:", url, str(error), flush=True)
                archives.append({"url": url, "error": str(error)})
                continue
            rows.extend(csv.DictReader(io.StringIO(gzip.decompress(raw).decode())))
            archives.append({"url": url, "sha256": hashlib.sha256(raw).hexdigest()})
        summary = summarize(rows, event["date"], event["timezone"])
        value = {
            "date": event["date"], "locality": event["locality"],
            "timezone": event["timezone"], "stationId": station_id,
            "stationName": station["name"]["en"],
            "stationLatitude": station["location"]["latitude"],
            "stationLongitude": station["location"]["longitude"],
            "stationElevation": station["location"].get("elevation"),
            "retrievedOn": datetime.now(timezone.utc).date().isoformat(),
            "archives": archives,
            "status": "available" if summary else "unavailable",
            **(summary or {}),
        }
        print(key, value["status"], flush=True)
        return key, value
    with ThreadPoolExecutor(max_workers=5) as pool:
        return dict(pool.map(one, manifest))


if __name__ == "__main__":
    manifest = json.loads(Path(sys.argv[1]).read_text())
    result = collect(manifest, Path(sys.argv[3] if len(sys.argv) > 3 else "/tmp/athrecs-weather-cache"))
    Path(sys.argv[2]).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
