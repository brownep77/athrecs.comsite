"""Synthetic negative checks for the supervised held-observation publisher."""
import copy
import importlib.util
import pathlib
import unittest

path = pathlib.Path(__file__).with_name('resolve-trackie-observations.py')
spec = importlib.util.spec_from_file_location('review', path)
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)


def fixture():
    row = {'sourceRow': 'page:1/x:0/y:120', 'performance': '12.34',
           'sourcePlace': '2', 'original': {'Name': 'Synthetic Example', 'Finals': '12.34'},
           'date': '2026-04-01', 'tableKey': 'Women 100 Meter Dash', 'club': 'Example Club',
           'bib': '7', 'status': 'finished', 'finishSeconds': 12.34}
    perf = {'sourceKeys': ['trackie:synthetic:page:1/x:0/y:120'], 'performance': row['performance'],
            'place': row['sourcePlace'], 'date': row['date'], 'competitionName': row['tableKey'],
            'sourceClub': row['club'], 'bib': row['bib'], 'sourceStatus': row['status'],
            'finishSeconds': row['finishSeconds'], 'verificationStatus': 'unverified',
            'archiveReference': {'sourceKey': 'synthetic', 'sourceRow': row['sourceRow'],
                                 'original': row['original'], 'identityVerified': False}}
    profile = {'athleteId': 1, 'before': {'provider': 'Trackie', 'published_at': '2026-10-21',
               'athlete_id': 1, 'performances': [{'performance': '13.01', 'notes': 'Existing original'}]},
               'additions': [perf], 'identityEvidence': {'sourceRowsCompared': True},
               'sourceRows': [{'sourceKey': 'synthetic', 'row': row}]}
    profile['after'] = copy.deepcopy(profile['before']['performances'] + profile['additions'])
    return {'batchId': 'trackie-review-20261022-batch5', 'profiles': [profile],
            'originalHolds': [{'sourceKey': 'synthetic', 'sourceRow': row['sourceRow']}],
            'summary': {'newResults': 1, 'updatedProfiles': 1}}


class ReviewTests(unittest.TestCase):
    def test_original_precision_survives(self):
        review.validate(fixture())

    def test_rejects_changed_old_performance(self):
        plan = fixture()
        plan['profiles'][0]['after'][0]['performance'] = '12.99'
        with self.assertRaises(ValueError): review.validate(plan)

    def test_rejects_tampered_new_source_fields(self):
        for field, value in [('performance', '12.35'), ('place', '1'), ('date', '2026-04-02'),
                             ('sourceClub', 'Other Club'), ('finishSeconds', 12), ('bib', '8')]:
            with self.subTest(field=field):
                plan = fixture()
                plan['profiles'][0]['additions'][0][field] = value
                plan['profiles'][0]['after'] = copy.deepcopy(plan['profiles'][0]['before']['performances'] + plan['profiles'][0]['additions'])
                with self.assertRaises(ValueError): review.validate(plan)

    def test_rejects_verification_upgrade(self):
        plan = fixture()
        plan['profiles'][0]['additions'][0]['verificationStatus'] = 'source_verified'
        plan['profiles'][0]['after'] = copy.deepcopy(plan['profiles'][0]['before']['performances'] + plan['profiles'][0]['additions'])
        with self.assertRaises(ValueError): review.validate(plan)

    def test_rejects_nonheld_observation(self):
        plan = fixture()
        plan['originalHolds'] = []
        with self.assertRaises(ValueError): review.validate(plan)

    def test_rejects_duplicate_target(self):
        plan = fixture()
        plan['profiles'].append(copy.deepcopy(plan['profiles'][0]))
        with self.assertRaises(ValueError): review.validate(plan)


if __name__ == '__main__':
    unittest.main()
