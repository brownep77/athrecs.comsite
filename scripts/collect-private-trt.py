"""Capture observed public TRT result URLs sequentially; never crawl photo URLs.

The supplied approval is the site owner's decision for private acquisition, not
an assertion that the provider issued a licence. Importing and publication are
separate. Captures require independent source comparisons before database writes.
"""
import argparse
import datetime as dt
import hashlib
import json
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import urllib.error
import urllib.request
import urllib.robotparser
from html.parser import HTMLParser
from pathlib import Path

from lxml import html

AGENT = "AthRecsResultsArchive/1.0 (+https://athrecs.com)"
ORIGIN = "https://totalracetiming.co.uk"


def clean(value):
    return " ".join(str(value or "").split())


class ReferenceParser(HTMLParser):
    """Independent stdlib parser retains displayed source tables, not proposals."""
    def __init__(self):
        super().__init__()
        self.tables = []
        self.table = None
        self.row = None
        self.cell = None
        self.header = False

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.table = {"headers": [], "rows": []}
        elif tag == "tr" and self.table is not None:
            self.row = []
            self.header = False
        elif tag in ("td", "th") and self.row is not None:
            self.cell = []
            self.header = self.header or tag == "th"
        elif tag == "br" and self.cell is not None:
            self.cell.append(" ")

    def handle_data(self, value):
        if self.cell is not None:
            self.cell.append(value)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell is not None:
            self.row.append(clean("".join(self.cell)))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            self.table["headers" if self.header else "rows"] = (
                self.row if self.header else self.table["rows"] + [self.row]
            )
            self.row = None
        elif tag == "table" and self.table is not None:
            self.tables.append(self.table)
            self.table = None


def cell_text(element):
    for br in element.xpath(".//br"):
        br.tail = " " + (br.tail or "")
    return clean(element.text_content())


def seconds(value):
    if not re.fullmatch(r"\d+:\d{2}(?::\d{2})?(?:\.\d+)?", value or ""):
        return None
    total = 0
    for part in value.split(":"):
        total = total * 60 + float(part)
    return round(total, 6)


def rank(value):
    return int(value) if re.fullmatch(r"\d+", value or "") else None


def parse_capture(body, source, captured_at):
    # These pages are served as UTF-8 but do not always declare a charset in the
    # markup. Decode explicitly so lxml cannot silently turn accents into mojibake.
    source_text = body.decode("utf-8-sig")
    root = html.fromstring(source_text)
    reference = ReferenceParser()
    reference.feed(source_text)
    tables = root.xpath("//table")
    if len(tables) != len(reference.tables):
        raise ValueError("Independent parsers disagree on table count")
    headings = [clean(x.text_content()) for x in root.xpath("//h2")]
    records, source_tables = [], []
    errors = []
    for table_index, (table, ref) in enumerate(zip(tables, reference.tables)):
        headers = [cell_text(x) for x in table.xpath("./thead/tr/th")]
        rows = [[cell_text(x) for x in row.xpath("./td")] for row in table.xpath("./tbody/tr")]
        if headers != ref["headers"] or rows != ref["rows"]:
            raise ValueError("Independent parsers disagree on displayed source cells")
        h3 = table.xpath("preceding::h3[1]")
        section = clean(h3[0].text_content()) if h3 else ""
        table_key = h3[0].get("id") if h3 else None
        table_key = table_key or "table-" + str(table_index + 1)
        preceding = table.xpath("preceding::p[1]")
        displayed_start = clean(preceding[0].text_content()) if preceding else ""
        found_date = re.search(r"\d{2}/\d{2}/\d{4}(?:\s+\d{2}:\d{2})?", displayed_start)
        date_text = found_date.group(0) if found_date else ""
        event_date = dt.datetime.strptime(date_text[:10], "%d/%m/%Y").date().isoformat() if date_text else None
        source_tables.append({"key": table_key, "heading": section, "startTime": date_text, **ref})
        useful = [h for h in headers if h]
        if len(set(useful)) != len(useful):
            errors.append("duplicate_named_headers:" + table_key)
        if not {"Position", "Forename", "Surname"}.issubset(headers):
            errors.append("unrecognised_headers:" + table_key)
        for ordinal, cells in enumerate(rows, 1):
            if len(cells) != len(headers):
                errors.append("column_count:" + table_key + ":" + str(ordinal))
            data = {h: cells[i] for i, h in enumerate(headers) if h and i < len(cells)}
            chip = seconds(data.get("Chip Time"))
            gun = seconds(data.get("Gun Time"))
            generic = seconds(data.get("Time") or data.get("Total Time"))
            finish = chip if chip is not None else gun if gun is not None else generic
            status_values = [data.get(k, "").upper() for k in ("Position", "Time", "Chip Time", "Gun Time", "Status")]
            status = next((s for s in ("DNF", "DNS", "DQ", "DSQ") if s in status_values), "finished" if finish is not None else "unknown")
            records.append({
                "sourceRow": str(ordinal), "tableKey": table_key,
                "bib": data.get("Tag") or None,
                "name": clean(data.get("Forename", "") + " " + data.get("Surname", "")),
                "gender": data.get("Gender"), "category": data.get("Category"),
                "club": data.get("Club"), "country": data.get("Country"),
                "date": event_date, "distanceLabel": section,
                "status": status, "finishSeconds": finish,
                "chipSeconds": chip, "gunSeconds": gun, "displayedTimeSeconds": generic,
                "overallPlace": rank(data.get("Position")),
                "genderPlace": rank(data.get("Gender Pos")),
                "categoryPlace": rank(data.get("Cat Pos")),
                "original": data, "originalCells": cells,
            })
    # Original table text is preserved even when normalization needs review.
    return {"provider": "Total Race Timing", "sourceKey": source["source_race_key"],
            "sourceUrl": source["source_url"], "capturedAt": captured_at,
            "index": source, "headings": headings, "tables": source_tables,
            "rows": records, "parserIssues": errors,
            "comparison": "lxml and stdlib HTMLParser agree on every displayed cell",
            "publication": "staff_only", "identity": "unreviewed"}


class SourceRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        if not re.fullmatch(r"https://totalracetiming\.co\.uk/raceresults/\d+/?", newurl):
            raise ValueError("Redirect leaves the approved public result route")
        return super().redirect_request(request, fp, code, msg, headers, newurl)


def collect(args):
    inventory = json.loads(Path(args.manifest).read_text())["races"]
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    approval = json.loads(Path(args.approval).read_text())
    if approval.get("provider") != "Total Race Timing" or approval.get("scope") != "staff_only" or not approval.get("id"):
        raise ValueError("A source-specific private-import approval is required")
    robots_text = urllib.request.urlopen(ORIGIN + "/robots.txt", timeout=25).read().decode()
    (output / "robots.txt").write_text(robots_text)
    robots = urllib.robotparser.RobotFileParser()
    robots.parse(robots_text.splitlines())
    today = dt.datetime.now(dt.timezone.utc).date().isoformat()
    if args.source_key:
        inventory = [r for r in inventory if r["source_race_key"] == args.source_key]
    rate_lock = threading.Lock()
    stopped = threading.Event()
    next_request = [0.0]
    def capture_one(source):
        if stopped.is_set():
            return
        key, url = source["source_race_key"], source["source_url"]
        receipt = output / (key + ".capture.json")
        if source["date"] > today:
            print(json.dumps({"sourceKey": key, "status": "future_listing_skipped"}), flush=True)
            return
        if receipt.exists() and not args.refresh:
            print(json.dumps({"sourceKey": key, "status": "already_captured"}), flush=True)
            return
        if not re.fullmatch(r"https://totalracetiming\.co\.uk/raceresults/\d+", url) or not robots.can_fetch(AGENT, url):
            raise ValueError("Public URL is outside the approved crawl scope")
        try:
            with rate_lock:
                delay = next_request[0] - time.monotonic()
                if delay > 0:
                    time.sleep(delay)
                if stopped.is_set():
                    return
                next_request[0] = time.monotonic() + max(1.5, robots.crawl_delay(AGENT) or 0)
            request = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "text/html"})
            with urllib.request.build_opener(SourceRedirects()).open(request, timeout=30) as response:
                body = response.read(25_000_001)
                if len(body) > 25_000_000:
                    raise ValueError("Source page exceeds 25 MB")
                if "html" not in response.headers.get("Content-Type", ""):
                    raise ValueError("Expected HTML results page")
            captured_at = dt.datetime.now(dt.timezone.utc).isoformat()
            (output / (key + ".html")).write_bytes(body)
            capture = parse_capture(body, source, captured_at)
            capture["approvalId"] = approval["id"]
            capture["htmlSha256"] = hashlib.sha256(body).hexdigest()
            temporary = receipt.with_suffix('.tmp')
            temporary.write_text(json.dumps(capture, ensure_ascii=False))
            temporary.replace(receipt)
            (output / (key + '.error.json')).unlink(missing_ok=True)
            print(json.dumps({"sourceKey": key, "status": "captured", "rows": len(capture["rows"]), "tables": len(capture["tables"]), "parserIssues": capture["parserIssues"]}), flush=True)
        except urllib.error.HTTPError as exc:
            if exc.code in (401, 403, 429):
                stopped.set()
                raise RuntimeError("Provider denied or limited access; collection stopped") from exc
            (output / (key + ".error.json")).write_text(json.dumps({"sourceKey": key, "http": exc.code}))
            print(json.dumps({"sourceKey": key, "status": "failed", "http": exc.code}), flush=True)
        except Exception as exc:
            (output / (key + ".error.json")).write_text(json.dumps({"sourceKey": key, "error": str(exc)}))
            print(json.dumps({"sourceKey": key, "status": "failed", "error": str(exc)}), flush=True)
    with ThreadPoolExecutor(max_workers=args.workers) as workers:
        list(workers.map(capture_one, inventory))
    (output / 'collection-complete.json').write_text(json.dumps({'finishedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'sourcePagesConsidered': len(inventory)}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--approval", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--source-key")
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--workers", type=int, choices=range(1,5), default=1)
    collect(parser.parse_args())
