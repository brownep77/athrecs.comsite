"""Synthetic source parsing checks. No network, participants or database writes."""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('capture', Path(__file__).with_name('collect-private-trt.py'))
capture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(capture)
source = {'source_race_key': '1', 'source_url': 'https://totalracetiming.co.uk/raceresults/1'}
body = '''<h2>Synthetic race</h2><h3 id="sr1">5k</h3><p>Start time: 01/10/2026 10:00</p>
<table><thead><tr><th>Position</th><th>Forename</th><th>Surname</th><th>Gender<br>Pos</th>
<th>Cat<br>Pos</th><th>Tag</th><th>Time</th></tr></thead><tbody><tr><td>1</td><td>María</td>
<td>Sample</td><td>1</td><td>1</td><td>11</td><td>00:20:01.7</td></tr></tbody></table>'''.encode()
parsed = capture.parse_capture(body, source, '2026-10-09T22:00:00Z')
row = parsed['rows'][0]
assert row['name'] == 'María Sample'
assert row['finishSeconds'] == 1201.7
assert row['chipSeconds'] is None and row['gunSeconds'] is None
assert parsed['tables'][0]['headers'][3] == 'Gender Pos'
assert row['original']['Time'] == '00:20:01.7'
assert row['date'] == '2026-10-01'
assert parsed['publication'] == 'staff_only'
assert parsed['identity'] == 'unreviewed'
print('Private TRT parsing: UTF-8, column headings, precision and private scope passed.')
