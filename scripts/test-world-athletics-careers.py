#!/usr/bin/env python3
"""Synthetic failure cases for the source capture boundary. No real athlete exports."""
import copy
import importlib.util
import pathlib
import unittest

spec = importlib.util.spec_from_file_location('collector', pathlib.Path(__file__).with_name('collect-world-athletics-careers.py'))
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)
spec2 = importlib.util.spec_from_file_location('reconciler', pathlib.Path(__file__).with_name('reconcile-world-athletics-careers.py'))
reconciler = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(reconciler)


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

    def test_unc_is_held_even_when_source_not_legal_flag_is_false(self):
        self.raw.update({'remark':'UNC','notLegal':False})
        row = self.build({'2024':self.season})['performances'][0]
        self.assertTrue(row['profileExcluded'])
        self.assertEqual(row['verificationStatus'],'unverified')
        self.assertEqual(row['performance'],'10.037')

    def test_year_only_result_date_is_not_invented(self):
        self.raw['date']='2024'
        with self.assertRaisesRegex(ValueError,'Unrecognised source date'):
            self.build({'2024':self.season})


class ExistingResultTests(unittest.TestCase):
    def setUp(self):
        self.raw = {'date':'10 JUN 2024','mark':'31:56','place':'9.', 'race':'F',
                    'competitionId':'456','eventId':'789','remark':''}
        self.performance = collector.performance('10 Kilometres Road',self.raw,2024,
            'https://worldathletics.org/athletes/test-123','123',1)
        self.candidate = {'target':{'athlete_id':1},'history':{'externalId':'123',
            'performances':[self.performance]},'originalRows':[{'sourceKey':'wa:123:2024:1',
            'discipline':'10 Kilometres Road','row':self.raw}]}
        self.record = {'athlete_id':1,'result_id':2,'event_slug':'synthetic-10k',
            'event_date':'2024-06-10','distance_code':'10K','gender_place':9,'overall_place':None,
            'result_visibility':'public','result_details':{'sourceRow':{
                'sourceAthleteId':'123','url':'https://worldathletics.org/competition/calendar-results/results/456?eventId=789',
                'raw':{'mark':'31:56','place':'9.'}},'profileExcluded':True,
                'verificationStatus':'unverified'}}

    def test_exact_overlap_preserves_restriction_and_links_event(self):
        review=reconciler.reconcile(self.candidate,[self.record])
        self.assertFalse(review['conflicts'])
        self.assertEqual(self.performance['eventSlug'],'synthetic-10k')
        self.assertTrue(self.performance['profileExcluded'])
        self.assertEqual(self.performance['verificationStatus'],'unverified')

    def test_changed_mark_blocks_publication(self):
        self.record['result_details']['sourceRow']['raw']['mark']='31:57'
        self.assertTrue(reconciler.reconcile(self.candidate,[self.record])['conflicts'])
        self.assertNotIn('eventSlug',self.performance)

    def test_fifteen_kilometre_overlap_keeps_one_event_and_restrictions(self):
        self.performance['discipline']='15 Kilometres Road'
        self.candidate['originalRows'][0]['discipline']='15 Kilometres Road'
        self.record.update(distance_code='15K',event_slug='synthetic-15k')
        review=reconciler.reconcile(self.candidate,[self.record])
        self.assertFalse(review['conflicts'])
        self.assertEqual(len(review['links']),1)
        self.assertEqual(self.performance['eventSlug'],'synthetic-15k')
        self.assertTrue(self.performance['profileExcluded'])
        self.assertEqual(self.performance['verificationStatus'],'unverified')

    def test_distance_conflict_blocks_even_when_ids_date_mark_and_place_match(self):
        self.record['distance_code']='15K'
        review=reconciler.reconcile(self.candidate,[self.record])
        self.assertTrue(review['conflicts'])
        self.assertFalse(review['links'])
        self.assertNotIn('eventSlug',self.performance)

    def test_wrong_source_identity_cannot_link(self):
        self.record['result_details']['sourceRow']['sourceAthleteId']='124'
        self.assertFalse(reconciler.reconcile(self.candidate,[self.record])['links'])
        self.assertNotIn('eventSlug',self.performance)

    def test_heat_is_not_merged_into_final(self):
        self.raw['race']='H1'
        self.assertTrue(reconciler.reconcile(self.candidate,[self.record])['conflicts'])

    def test_private_result_remains_excluded(self):
        self.record['result_details'].pop('profileExcluded')
        self.record['result_visibility']='private'
        reconciler.reconcile(self.candidate,[self.record])
        self.assertTrue(self.performance['profileExcluded'])


if __name__ == '__main__':
    unittest.main()
