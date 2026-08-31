#!/usr/bin/env python3
from pathlib import Path

path = Path("scripts/verify-result-claims.mjs")
text = path.read_text()

before = """  create table events (\n    id serial primary key,\n    slug text not null unique,\n    name text not null\n  );"""
after = """  create table events (\n    id serial primary key,\n    slug text not null unique,\n    name text not null,\n    sport text not null default 'Running'\n  );"""
if after not in text:
    if before not in text:
        raise SystemExit("Result-claim event fixture anchor not found")
    text = text.replace(before, after, 1)

assert_before = 'assert.equal(claimList.rows[0].athlete_name, "Verification Runner");\n'
assert_after = (
    'assert.equal(claimList.rows[0].athlete_name, "Verification Runner");\n'
    'assert.equal(claimList.rows[0].event_sport, "Running");\n'
)
if assert_after not in text:
    if assert_before not in text:
        raise SystemExit("Result-claim assertion anchor not found")
    text = text.replace(assert_before, assert_after, 1)

path.write_text(text)
print("Result-claim sport fixture repaired.")
