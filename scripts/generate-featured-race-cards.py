"""Render exact race-information cards. Pass the featured race JSON on stdin."""
import json
import pathlib
import sys
from datetime import date
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "featured-races"
OUTPUT.mkdir(parents=True, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
INK, TEAL, PALE = "#193742", "#087f8c", "#e5f4f7"

def wrapped(draw, text, font, width):
    lines, current = [], ""
    for word in text.split():
        test = f"{current} {word}".strip()
        if current and draw.textlength(test, font=font) > width:
            lines.append(current)
            current = word
        else:
            current = test
    return lines + ([current] if current else [])

def block(draw, text, x, y, size, width=920, fill=INK, bold=False, gap=12):
    font = ImageFont.truetype(BOLD if bold else FONT, size)
    for line in wrapped(draw, text, font, width):
        draw.text((x, y), line, font=font, fill=fill)
        y += size + gap
    return y

for race in json.load(sys.stdin):
    image = Image.new("RGB", (1080, 1350), "white")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1080, 145), fill=TEAL)
    block(draw, "ATHRECS", 72, 40, 48, fill="white", bold=True)
    block(draw, "ROAD RACE PREVIEW", 72, 192, 27, fill=TEAL, bold=True)
    size = 70
    while len(wrapped(draw, race["name"], ImageFont.truetype(BOLD, size), 920)) > 4:
        size -= 2
    title_end = block(draw, race["name"], 72, 266, size, bold=True, gap=15)
    course_font = ImageFont.truetype(FONT, 29)
    course_line = race["course"].split(". ")[0].rstrip(".") + "."
    max_lines = max(0, (610 - title_end - 25) // 38)
    while max_lines and len(wrapped(draw, course_line, course_font, 920)) > max_lines:
        course_line = course_line.rsplit(" ", 1)[0].rstrip(".,…") + "…"
    if max_lines:
        block(draw, course_line, 72, title_end + 25, 29, fill="#566c74", gap=9)
    display = date.fromisoformat(race["date"]).strftime("%-d %B %Y")
    if race.get("endDate"):
        display = f'{date.fromisoformat(race["date"]).day}–{date.fromisoformat(race["endDate"]).strftime("%-d %B %Y")}'
    block(draw, display, 72, 640, 42, fill=TEAL, bold=True)
    block(draw, f'{race["city"]}, {race["country"]}', 72, 712, 31, gap=8)
    distance = race["distance"]
    if "half marathon" in distance.lower() and "10 km" in distance:
        distance = "Marathon · Half marathon · 10K" if "cork" in race["slug"] else "10K · Half marathon"
    elif "21.0975" in distance:
        distance = "Half marathon · 21.0975 km"
    elif "42.2" in distance:
        distance = "Marathon · 42.2 km"
    else:
        distance = "Marathon · 42.195 km"
    block(draw, distance, 72, 812, 30, bold=True)
    draw.rectangle((0, 900, 1080, 1190), fill=PALE)
    athletes = race["athletes"]
    block(draw, "CONFIRMED ATHLETES" if athletes else "EXPLORE THE RACE", 72, 939, 25, fill=TEAL, bold=True)
    if athletes:
        y = 999
        for athlete in athletes:
            y = block(draw, athlete["name"], 72, y, 34, bold=True, gap=14)
        assert y < 1185, race["slug"]
    else:
        block(draw, "Course, entry options and official race links in the AthRecs preview.", 72, 999, 35, gap=14)
    block(draw, "Read the preview at AthRecs.com", 72, 1223, 32, bold=True)
    checked = date.fromisoformat(race["checkedAt"]).strftime("%-d %B %Y")
    block(draw, f"Information checked {checked}", 72, 1291, 21, fill="#566c74")
    image.quantize(colors=48).save(OUTPUT / f'{race["slug"]}.png', optimize=True)
print(f"Rendered 20 portrait cards in {OUTPUT}")
