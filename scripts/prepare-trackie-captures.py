"""Prepare staff-only Trackie PDF observations; never create athletes or results.

Input: a supervised inventory.json with downloaded public result attachments.
Output stays outside the repository. Columns are located from PDF headings,
not fixed positions. Every retained row is compared with a second PDF engine.
Unsupported layouts and ambiguous rows remain held for review.
"""
import argparse
import datetime as dt
import hashlib
import json
import logging
import re
import unicodedata
from pathlib import Path

import fitz
import pdfplumber


def clean(text):
    return " ".join(unicodedata.normalize("NFKC", text).split())


def seconds(value):
    if not re.fullmatch(r"\d+(?::\d{2}){0,2}(?:\.\d+)?", value):
        return None
    total = 0
    for part in value.split(":"):
        total = total * 60 + float(part)
    return total


def lines(words):
    grouped = []
    for word in sorted(words, key=lambda w: (w["top"], w["x0"])):
        if not grouped or abs(word["top"] - grouped[-1][0]["top"]) > 2:
            grouped.append([])
        grouped[-1].append(word)
    return [sorted(line, key=lambda w: w["x0"]) for line in grouped]


def parse_pdf(path, item):
    rows, issues = [], []
    section = ""
    headings = None
    independent = fitz.open(path)
    with pdfplumber.open(path) as doc:
        # Two-column Hy-Tek reports flow down the left column, then the right.
        # Detect that layout from repeated Name headings, retaining a source x
        # coordinate so rows at the same height remain distinct observations.
        first_words = doc.pages[0].extract_words(x_tolerance=1, y_tolerance=2)
        name_x = sorted({round(w["x0"], 2) for w in first_words if w["text"] == "Name"})
        column_shift = name_x[1] - name_x[0] if len(name_x) == 2 and name_x[0] < doc.pages[0].width / 2 < name_x[1] else None
        for page_no, page in enumerate(doc.pages, 1):
            words = page.extract_words(x_tolerance=1, y_tolerance=2)
            raw_other = independent[page_no - 1].get_text("words")
            regions = [(0, page.width, 0)] if column_shift is None else [(0, page.width/2, 0), (page.width/2, page.width, column_shift)]
            reading_lines = []
            for left, right, offset in regions:
                region_words = [{**w, "x0":w["x0"]-offset, "x1":w["x1"]-offset} for w in words if left <= w["x0"] < right]
                other = [(w[0]-offset,w[1],w[2]-offset,*w[3:]) for w in raw_other if left <= w[0] < right]
                reading_lines.extend((line,other,offset) for line in lines(region_words))
            for line, other_words, column_offset in reading_lines:
                text = " ".join(w["text"] for w in line)
                # A centred report title may spill into the second column.
                # Its year/date fragment is not an athlete's placing and name.
                if re.fullmatch(r'20\d{2}\s+-\s+20\d{2}-\d{2}-\d{2}', text):
                    continue
                heading_text = re.sub(r"^\.+", "", text).strip()
                if re.match(r"^(?:(?:Event \d+|Throws Pentathlon: #\d+)\s+)?(?:Boys|Girls|Men|Women|Mixed)\b", heading_text):
                    section = heading_text
                    headings = None
                if text.startswith("#") and re.search(r"\b(?:Women|Men)", text):
                    section = text
                    headings = None
                if text == "Team Scores" or ("RNK" in text and "TOTAL TIME" in text):
                    headings = None
                    continue
                names = [w["text"] for w in line]
                # A different round or relay table must not reuse the preceding
                # individual-finals columns. Only supported tables are mapped.
                if ("Name" in names and "Team" in names and "Finals" not in names) or ("Team" in names and "Relay" in names):
                    headings = None
                    continue
                if "Name" in names and "Team" in names and "Finals" in names:
                    headings = {w["text"]: w for w in line}
                    continue
                if "ATHLETE" in names and "TEAM" in names and "TIME" in names:
                    headings = {w["text"]: w for w in line}
                    continue
                if not headings:
                    continue
                name_key = "Name" if "Name" in headings else "ATHLETE"
                name_head = headings[name_key]
                prefix = [w for w in line if w["x1"] < name_head["x0"] + 1]
                if not prefix or not re.fullmatch(r"\d+|--+|DNS|DNF|DQ", prefix[0]["text"]):
                    continue
                if not section:
                    issues.append(f"page {page_no}: result row without event heading")
                    continue
                values, used = {}, set()
                # Numeric Hy-Tek columns are right aligned to their headings.
                # Resolve these first so a seed time never becomes a final time.
                if name_key == "Name":
                    for key in ("Age", "Year", "Seed", "Prelims", "Finals", "Wind", "H#", "Points"):
                        if key not in headings:
                            continue
                        cells = [(i, w) for i, w in enumerate(line)
                                 if abs(w["x1"] - headings[key]["x1"]) < 2
                                 or (key == "Finals" and re.fullmatch(r'[JX]?(?:\d+:)*\d+(?:\.\d+)?m?[R#]', w['text'])
                                     and w['x0'] < headings[key]['x1'] < w['x1'] <= headings[key]['x1'] + 8)
                                 or (key == "Points" and re.fullmatch(r"\d+(?:\.\d+)?", w["text"])
                                     and headings[key]["x0"] - 2 <= (w["x0"] + w["x1"]) / 2 <= headings[key]["x1"] + 2)]
                        values[key] = " ".join(w["text"] for _, w in cells)
                        used.update(i for i, _ in cells)
                    team_start = headings["Team"]["x0"] - 2
                    age_head = headings.get("Age", headings.get("Year"))
                    name_end = age_head["x0"] - 1 if age_head else team_start
                    name_words = [w["text"] for w in line
                                  if name_head["x0"] - 1 <= w["x0"] < name_end]
                    values["Name"] = " ".join(name_words)
                    team_end = min(w["x0"] for key, w in headings.items()
                                   if w["x0"] > headings["Team"]["x0"] and key in ("Seed", "Prelims", "Finals"))
                    values["Team"] = " ".join(w["text"] for i, w in enumerate(line)
                                                if i not in used and team_start <= w["x0"] < team_end)
                    annotations = [w["text"] for i, w in enumerate(line)
                                   if i not in used and w["x0"] >= team_end]
                    if annotations:
                        values["Annotation"] = " ".join(annotations)
                    performance = values.get("Finals", "")
                else:
                    yr = headings["YR"]
                    values["ATHLETE"] = " ".join(w["text"] for w in line
                                                 if name_head["x0"] - 1 <= w["x0"] < yr["x0"] - 1)
                    values["YR"] = " ".join(w["text"] for w in line
                                            if yr["x0"] - 1 <= w["x0"] < headings["TEAM"]["x0"] - 1)
                    # TFRRS report's final TIME is the rightmost TIME heading.
                    time_head = headings["TIME"]
                    times = [w for w in line if abs(w["x1"] - time_head["x1"]) < 3]
                    values["TIME"] = " ".join(w["text"] for w in times)
                    timing_cells = [w for w in line if w["x0"] > headings["TEAM"]["x1"]
                                    and re.fullmatch(r"\d+:\d{2}(?:\.\d+)?", w["text"])]
                    team_end = min((w["x0"] for w in timing_cells), default=time_head["x0"])
                    values["TEAM"] = " ".join(w["text"] for w in line
                                              if headings["TEAM"]["x0"] - 1 <= w["x0"] < team_end)
                    performance = values["TIME"]
                name = values[name_key]
                bib_match = re.match(r"#\s*(\d+)\s+(.+)", name)
                bib = bib_match[1] if bib_match else ""
                if bib_match:
                    name = bib_match[2]
                if not name or not performance:
                    issues.append(f"page {page_no}: unmapped result: {text}")
                    continue
                # Compare the complete row text using a separate PDF parser.
                top, bottom = min(w["top"] for w in line), max(w["bottom"] for w in line)
                other = sorted([w for w in other_words if top - 4 <= w[1] <= bottom - 2], key=lambda w:w[0])
                comparison = clean(" ".join(w[4] for w in other)) == clean(text)
                if not comparison:
                    issues.append(f"page {page_no}: independent text comparison differs: {text}")
                distance = re.search(r"(\d+(?:\.\d+)?\s*(?:Mile|Meter|Kilometer|[kK](?:m)?))\b", section)
                distance_label = distance[1] if distance else ""
                timed = bool(distance and re.search(r"Run|Dash|Sprint|Hurdles|Walk|[kK]\b", section))
                status = performance if performance in ("DNS", "DNF", "DQ") else "finished" if timed and seconds(performance) is not None else "unknown"
                category = re.search(r"(?:Boys|Girls|Men|Women)\s+(\d+-\d+|\d+\+|U\d+|\d+(?=\s+\d+\s))(?=\s)", section)
                if not category:
                    category = re.search(r"\b(U\d+)\b", section)
                values.update({"Source Place": prefix[0]["text"], "Event": section,
                               "PDF Page": str(page_no), "Source row": text,
                               "Source URL": item["files"][0]["url"]})
                explicit_gender = re.fullmatch(r"([MWF])\d+", values.get("Age", ""))
                row = dict(name=name, bib=bib, club=values.get("Team", values.get("TEAM", "")),
                           gender="Female" if re.search(r"Girls|Women",section) else "Male" if re.search(r"Boys|Men",section) else ("Male" if explicit_gender[1]=="M" else "Female") if explicit_gender else "",
                           category=category[1] if category else "", distanceLabel=distance_label,
                           date=item["date"], status=status, performance=performance,
                           finishSeconds=seconds(performance) if timed else None,
                           chipSeconds=None, gunSeconds=None, overallPlace=None, genderPlace=None, categoryPlace=None,
                           sourcePlace=prefix[0]["text"], placingScope=section,
                           sourceRow=f"page:{page_no}/x:{round(column_offset,2)}/y:{round(top,2)}", tableKey=section,
                           original=values, independentTextCompared=comparison,
                           identity="unreviewed", publication="staff_only")
                rows.append(row)
    independent.close()
    if not rows:
        issues.append("Unsupported PDF table layout; original attachment retained")
    return rows, issues


def main():
    logging.getLogger("pdfminer").setLevel(logging.ERROR)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    inventory = json.loads((args.directory / "inventory.json").read_text())
    summary = []
    for item in inventory:
        single_day = bool(re.fullmatch(r"[A-Za-z]{3} \d{1,2}", item["dateLabel"]))
        item["date"] = dt.datetime.strptime("2026 " + item["dateLabel"], "%Y %b %d").date().isoformat() if single_day else None
        attachments = item.get("files", [])
        if not attachments or attachments[0]["format"] != "pdf":
            summary.append(dict(key=item["key"], name=item["name"], rows=0,
                                state="external-redirect" if item.get("externalRedirect") else "unavailable-or-unsupported",
                                url=item.get("externalRedirect", item["url"])))
            continue
        path = Path(attachments[0]["path"])
        with fitz.open(path) as source_doc:
            title_text = source_doc[0].get_text()
        # Hy-Tek titles use ISO, month/day/year and day/month/year ranges.
        # Any differing endpoints require event-date review, including reversed
        # ranges left in a report template. Do not guess the numeric date order.
        report_range = re.search(r"\b(\d{1,4}[-/]\d{1,2}[-/]\d{2,4})\s+(?:to|-)\s+(\d{1,4}[-/]\d{1,2}[-/]\d{2,4})\b", title_text)
        single_day = single_day and not (report_range and report_range[1] != report_range[2])
        rows, issues = parse_pdf(path, item) if single_day else ([], ["Multi-day meeting requires event-specific dates before publication"])
        held_rows = [r for r in rows if not r['independentTextCompared']]
        comparison_issues = [issue for issue in issues if 'independent text comparison differs:' in issue]
        rows = [r for r in rows if r['independentTextCompared']]
        issues = [issue for issue in issues if issue not in comparison_issues]
        if not rows and not issues:
            issues.append('No independently compared result rows')
        payload = dict(schemaVersion=8, provider="Trackie", sourceKey=item["key"], sourceUrl=item["url"],
                       sourceMimeType="application/pdf", attachmentUrl=attachments[0]["url"],
                       index=dict(name=item["name"], date=item["date"], dateLabel=item["dateLabel"], location=item["location"]),
                       publication="staff_only", identity="unreviewed", rows=rows,
                       heldRows=held_rows, heldRowIssues=comparison_issues,
                       qualifications=["Source observations only; no athlete identity or account ownership verified.",
                                       "Placing is scoped to the original event heading; nationality is not inferred."])
        capture = dict(payload=payload, rows=len(rows), sourcePath=str(path),
                       sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                       capturedAt=dt.datetime.fromtimestamp(path.stat().st_mtime,dt.timezone.utc).isoformat(),
                       state="held" if issues else "compared", issues=issues)
        payload["coverage"] = "Individual rows in supported tables; original PDF retains team summaries and all other source content."
        (args.directory / (item["key"] + ".capture.json")).write_text(json.dumps(capture, ensure_ascii=False))
        summary.append(dict(key=item["key"], name=item["name"], rows=len(rows), state=capture["state"],issues=len(issues)))
    (args.directory / "summary.json").write_text(json.dumps(summary,indent=2))
    print(json.dumps(summary,indent=2))


if __name__ == "__main__":
    main()
