#!/usr/bin/env python3
"""Synthetic failure cases for the source capture boundary. No real athlete exports."""
import copy
import importlib.util
import pathlib
import unittest

spec = importlib.util.spec_from_file_location('collector', pathlib.Path(__file__).with_name('collect-world-athletics-careers.py'))
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


class CareerEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.source = {'_id': 123, 'resultsByYear': {'activeYears': ['2023','2024']}}
        self.raw = {'date':'10 JUN 2024','mark':'10.037','place':'2.','wind':'+0.0',
                    'competition':'Synthetic fixture','venue':'Synthetic venue','country':'ZZZ',
                    'race':'h1','competitionId':'test-meet','eventId':'test-event',
                    'notLegal':False,'remark':''}
        self.season = {'parameters':{'resultsByYear':2024},'resultsByEvent':[
            {'discipline':'100 Metres','results':[self.raw]}]}

    def build(self, seasons):
        return collector.build_history('123','https://worldathletics.org/athletes/test-123',
                                       self.source,seasons,'2024-12-01T00:00:00Z')[0]

    def test_missing_active_season_never_becomes_complete(self):
        h = self.build({'2024':self.season})
        self.assertFalse(h['complete'])
        self.assertEqual(h['yearsExpected'],[2023,2024])
        self.assertEqual(h['yearsCaptured'],[2024])

    def test_server_ignoring_requested_year_fails(self):
        with self.assertRaisesRegex(ValueError,'ignored requested season'):
            self.build({'2023':self.season})

    def test_another_athlete_cannot_be_imported(self):
        self.source['_id'] = 456
        with self.assertRaisesRegex(ValueError,'Wrong athlete'):
            self.build({'2024':self.season})

    def test_precision_round_and_wind_survive(self):
        row = self.build({'2024':self.season})['performances'][0]
        self.assertEqual(row['performance'],'10.037')
        self.assertEqual(row['wind'],'+0.0')
        self.assertEqual(row['place'],'2')
        self.assertIn('Round: h1',row['labels'])

    def test_distinct_source_events_are_not_collapsed(self):
        second = {**self.raw,'eventId':'different-source-event'}
        self.season['resultsByEvent'][0]['results'].append(second)
        self.assertEqual(len(self.build({'2024':self.season})['performances']),2)

    def test_dnf_and_illegal_mark_remain_qualified(self):
        self.raw.update({'mark':'DNF','notLegal':True,'remark':'Source qualification'})
        row = self.build({'2024':self.season})['performances'][0]
        self.assertEqual(row['performance'],'DNF')
        self.assertIn('Not legal',row['labels'])
        self.assertIn('Source qualification',row['labels'])

    def test_empty_active_season_is_incomplete(self):
        self.source['resultsByYear']['activeYears']=['2024']
        self.season['resultsByEvent']=[]
        self.assertFalse(self.build({'2024':self.season})['complete'])

    def test_year_only_result_date_is_not_invented(self):
        self.raw['date']='2024'
        with self.assertRaisesRegex(ValueError,'Unrecognised source date'):
            self.build({'2024':self.season})


if __name__ == '__main__':
    unittest.main()
