"""Verify that the new race can be found through the public collection pages."""
import concurrent.futures
import datetime
import html
import json
import re
import urllib.request
from pathlib import Path

slug = "race-over-the-glen"
query = "?sport=Running&q=Race%20Over%20the%20Glen&dateFrom=2026-10-01&dateTo=2027-01-31"
# RunRecs calendar filters are client state and are verified separately in the browser.
cases = [("www.runrecs.com", "races", True), ("www.athrecs.com", "races", False), ("www.athrecs.com", "calendar", False)]

def check(case):
    host, path, expected = case
    url = f"https://{host}/{path}{query}"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Cache-Control": "no-cache"})
    response = urllib.request.urlopen(request, timeout=45)
    body = response.read().decode("utf-8", errors="replace")
    links = [html.unescape(x) for x in re.findall(r'href="([^"]+)"', body)]
    present = any(f"/races/{slug}" in link for link in links)
    return {"url": url, "status": response.status, "race_link_present": present, "expected_present": expected, "passed": response.status == 200 and present == expected}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    checks = list(executor.map(check, cases))
report = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "checks": checks, "passed": all(x["passed"] for x in checks)}
Path(__file__).with_name("collection-verification.json").write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
raise SystemExit(0 if report["passed"] else 1)
