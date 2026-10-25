"""Synthetic regression cases for individually corroborated held observations."""
import importlib.util,pathlib,unittest
s=importlib.util.spec_from_file_location('deep',pathlib.Path(__file__).with_name('deep-dive-brentwood-results.py'));d=importlib.util.module_from_spec(s);s.loader.exec_module(d)
class EvidenceGuards(unittest.TestCase):
    def setUp(self):
        self.fact={'name':'Ada Runner','time':'01:30:00','timeBasis':'unknown','date':'2014-03-23','club':'Synthetic AC','source_file':'synthetic','source_url':'https://example.test/result','source_sha256':'test','checkedAt':'2026-10-25'}
        self.row={'key':'synthetic:1','year':2014,'name':'Ada Runner','chip_time':'01:30:00','gun_time':'01:30:08','bib':'123','gender':'F','overall_position':'10','club':'Synthetic AC','hold':'Headerless source; column meanings require a headed companion'}
    def test_generic_time_cannot_label_other_unheaded_fields(self):
        replacements,_=d.reconcile([self.fact],[self.row],[]);x=replacements[self.row['key']]
        self.assertEqual(x['recorded_time'],'01:30:00');self.assertEqual(x['original'],self.row)
        for k in ['chip_time','gun_time','bib','gender','overall_position']:self.assertEqual(x[k],'')
    def test_time_mismatch_stays_held(self):
        self.assertFalse(d.reconcile([{**self.fact,'time':'01:29:00'}],[self.row],[])[0])
    def test_ambiguous_source_rows_stay_held(self):
        self.assertFalse(d.reconcile([self.fact],[self.row,{**self.row,'key':'synthetic:2'}],[])[0])
    def test_conflicting_club_stays_held(self):
        self.assertFalse(d.reconcile([{**self.fact,'club':'Different AC'}],[self.row],[])[0])
    def test_conflicting_edition_date_stays_held(self):
        self.assertFalse(d.reconcile([self.fact],[{**self.row,'hold':'Identity hold','date':'2014-03-24'}],[])[0])
    def test_chip_label_must_agree_with_primary_chip_field(self):
        self.assertFalse(d.reconcile([{**self.fact,'time':'01:30:08','timeBasis':'chip'}],[{**self.row,'hold':'Identity hold'}],[])[0])
if __name__=='__main__':unittest.main()
