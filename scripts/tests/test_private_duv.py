"""Synthetic regression cases; no athlete records or credentials."""
import importlib.util
from pathlib import Path
import unittest

SCRIPTS=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('duv',SCRIPTS/'prepare-private-duv-capture.py')
duv=importlib.util.module_from_spec(s);s.loader.exec_module(duv)

def fixture(order=None,performance='45.123 km',runner='900001',count=1):
    headings=duv.HEADERS
    values=['1',performance,"Example, Alice",'Example AC','GBR','1980','F','1','W45','1','7.521','50.123 km']
    cells=[f'<td>{v}</td>' for v in values]
    cells[2]=f'<td><a href="getresultperson.php?runner={runner}">{values[2]}</a></td>'
    order=order or list(range(len(headings)))
    raw='<table>'+''.join(f'<tr><td><b>{k}:</b></td><td>{v}</td></tr>' for k,v in [
      ('Date','04.10.2026'),('Event','Synthetic race (GBR)'),('Distance','6h road race'),('Finishers',f'{count} (0 M, {count} F)')])+'</table>'
    raw+='<table id="Resultlist"><thead><tr>'+''.join('<th>'+headings[i]+'</th>' for i in order)+'</tr></thead><tbody><tr>'+''.join(cells[i] for i in order)+'</tr></tbody></table>'
    idx='<table><thead><tr><th>Date</th><th>Event</th><th>Distance</th><th>Finishers</th></tr></thead><tbody><tr><td>04.10.2026</td><td><a href="getresultevent.php?event=900001">Synthetic race (GBR)</a></td><td>6h</td><td>1</td></tr></tbody></table>'
    return raw.encode(),idx.encode()

def parse(raw,idx):return duv.parse(raw,idx,'https://statistik.d-u-v.org/getresultevent.php?event=900001','2026-10-10T08:00:00Z')

class CaptureTests(unittest.TestCase):
    def test_precision_and_separate_distance_measurement(self):
        c=parse(*fixture());r=c['rows'][0]
        self.assertEqual(r['performance']['achievedDistanceMetres'],'45123.000')
        self.assertEqual(r['performance']['eventDurationSeconds'],'21600')
        self.assertIsNone(r['performance']['finishTimeSeconds'])
        self.assertEqual(r['sourceAthleteId'],'900001')
        self.assertEqual(r['original']['Performance'],'45.123 km')
        self.assertFalse(c['audit']['identityVerified'])
    def test_reordered_columns_mapped_by_heading(self):
        a=parse(*fixture());b=parse(*fixture(list(reversed(range(12)))))
        self.assertEqual(a['rows'],b['rows'])
    def test_incomplete_source_page_held(self):
        with self.assertRaisesRegex(ValueError,'Incomplete page'):parse(*fixture(count=2))
    def test_unknown_heading_held(self):
        raw,idx=fixture()
        with self.assertRaisesRegex(ValueError,'headings'):parse(raw.replace(b'Performance</th>',b'Elapsed</th>'),idx)
    def test_time_not_accepted_as_distance(self):
        with self.assertRaisesRegex(ValueError,'kilometre'):parse(*fixture(performance='06:00:00'))
    def test_unobserved_or_mismatched_index_url_held(self):
        raw,idx=fixture()
        with self.assertRaisesRegex(ValueError,'uniquely present'):parse(raw,idx.replace(b'event=900001',b'event=900002'))
    def test_duplicate_runner_held(self):
        raw,idx=fixture(count=2)
        import re
        row=re.search(b'<tbody>(.*?)</tbody>',raw).group(1)
        raw=raw.replace(b'</tbody>',row+b'</tbody>')
        idx=idx.replace(b'<td>1</td>',b'<td>2</td>')
        with self.assertRaisesRegex(ValueError,'Repeated runner'):parse(raw,idx)
    def test_no_guessed_source_runner_id(self):
        with self.assertRaisesRegex(ValueError,'identifier'):parse(*fixture(runner='unknown'))

if __name__=='__main__':unittest.main()
