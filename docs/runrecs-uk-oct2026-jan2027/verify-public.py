"""Read-only public verification after the catalogue release."""
import concurrent.futures
import datetime
import html
import json
import re
import urllib.error
import urllib.request
from pathlib import Path

CASES = [
    ("https://www.runrecs.com/races/race-over-the-glen", 200, "Race Over the Glen", "2027-01-01", "10K"),
    ("https://www.runrecs.com/races/jingle-hells", 200, "Jingle Hells", "2026-12-20", "10K"),
    ("https://www.runrecs.com/races/beyond-the-lune-winter-ultra", 200, "Beyond the Lune", "2026-12-19", "65K"),
    ("https://www.runrecs.com/races/tour-de-yr-wyddfa", 200, "Tour De Yr Wyddfa", "2027-01-23", "43.5K"),
    ("https://www.runrecs.com/races/christmas-cracker-glasgow", 200, "Christmas Cracker Glasgow", "2026-12-27", "5K"),
    ("https://www.runrecs.com/races/yorkshire-coast-10k-fun-run", 200, "Yorkshire Coast", "2026-10-11", "5K"),
    ("https://www.athrecs.com/races/race-over-the-glen", 404, None, None, None),
    ("https://www.athrecs.com/races/jingle-hells", 404, None, None, None),
    ("https://www.athrecs.com/races/yorkshire-coast-10k-fun-run", 404, None, None, None),
    ("https://www.athrecs.com/races/315-national-fitness-5k", 200, "National Fitness", "2026-09-26", "5K"),
]

def check(case):
    url, expected_status, name, date, distance = case
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Cache-Control": "no-cache"})
    try:
        response = urllib.request.urlopen(request, timeout=45)
    except urllib.error.HTTPError as error:
        response = error
    raw = response.read().decode("utf-8", errors="replace")
    text = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    title = re.findall(r"<title>(.*?)</title>", raw)
    tests = {"status": response.status == expected_status}
    if name:
        tests["name"] = name.casefold() in text.casefold()
        tests["date"] = date in raw
        tests["distance"] = distance in raw
    return {"url": url, "status": response.status, "title": title, "checks": tests, "passed": all(tests.values())}

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    checks = list(executor.map(check, CASES))
report = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "checks": checks, "passed": all(x["passed"] for x in checks)}
Path(__file__).with_name("public-verification.json").write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
raise SystemExit(0 if report["passed"] else 1)
