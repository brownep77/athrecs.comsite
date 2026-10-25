"""Synthetic regressions for heading mapping, timing and identity decisions."""
import importlib.util,pathlib,tempfile,unittest
ROOT=pathlib.Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('plan',ROOT/'lib/brentwood-source-plan.py');p=importlib.util.module_from_spec(s);s.loader.exec_module(p)
def row(**changes):
    return {'year':2025,'date':'2025-03-23','name':'Zelda Exampleton','bib':'27','chip_time':'01:45:00','gun_time':'01:45:12','gender':'F','club':'Example Running Club','category':'FSEN','status':'Finished','source_url':'https://example.org/results/2025','source_file':'fixture.json','provider':'Synthetic timing provider','source_sha256':'a'*64,'key':'fixture:27',**changes}
def snapshot():return {'index':{},'entities':{},'histories':[],'results':[],'accounts':[]}
class Tests(unittest.TestCase):
    def test_header_order_is_not_field_order(self):
        with tempfile.TemporaryDirectory() as tmp:
            f=pathlib.Path(tmp)/'table.html';f.write_text('<table><tr><th>Place</th><th>Time</th><th>RaceNo</th><th>Name</th></tr><tr><td>1</td><td>1:45:00</td><td>27</td><td>Zelda Exampleton</td></tr></table>')
            self.assertEqual(list(p.headed_table(f))[0]['name'],'Zelda Exampleton')
    def test_gun_only_and_unknown_date(self):
        r=row(chip_time='',date='');perf=p.performance(r)
        self.assertEqual(perf['performance'],'01:45:12');self.assertEqual(perf['timing'],{'basis':'gun','gun':'01:45:12'});self.assertEqual(perf['date'],'')
    def test_finish_and_identity_are_separate(self):
        r=row();result=p.plan({'rows':[r],'held':[],'checks':[]},snapshot(),[r])
        self.assertEqual(len(result['profiles']),1);self.assertEqual(result['profiles'][0]['performances'][0]['verificationStatus'],'unverified');self.assertFalse(result['profiles'][0]['details']['athlete_verified'])
    def test_dq_and_conflicting_times_are_held(self):
        for r in [row(status='DQ'),row(chip_time='01:45:20')]:
            result=p.plan({'rows':[r],'held':[],'checks':[]},snapshot(),[r]);self.assertFalse(result['profiles']);self.assertEqual(len(result['held']),1)
    def test_repeated_names_need_club_evidence(self):
        rs=[row(club=''),row(year=2024,key='fixture2024:27',club='')]
        result=p.plan({'rows':rs,'held':[],'checks':[]},snapshot(),rs);self.assertFalse(result['profiles']);self.assertEqual(len(result['held']),2)
    def test_supported_repeats_use_one_profile(self):
        rs=[row(),row(year=2024,key='fixture2024:27')];result=p.plan({'rows':rs,'held':[],'checks':[]},snapshot(),rs)
        self.assertEqual(len(result['profiles']),1);self.assertEqual(len(result['profiles'][0]['performances']),2)
    def test_same_name_existing_profile_needs_corroboration(self):
        r=row();snap=snapshot();snap['index']={k:['athrecs:3'] for k in p.prep.name_keys(r['name'])};snap['entities']['3']={'id':3,'names':[r['name']],'profile_visibility':'public','gender':'F','profile_details':{},'display_name':r['name']}
        result=p.plan({'rows':[r],'held':[],'checks':[]},snap,[r]);self.assertFalse(result['profiles']);self.assertFalse(result['existingHistories'])
        snap['entities']['3']['source_club_name']='Example RC';result=p.plan({'rows':[r],'held':[],'checks':[]},snap,[r]);self.assertEqual(len(result['existingHistories']),1)
    def test_claimed_or_private_profiles_remain_untouched(self):
        r=row();snap=snapshot();snap['index']={k:['athrecs:3'] for k in p.prep.name_keys(r['name'])}
        for changes in [{'profile_visibility':'private'},{'active_accounts':1}]:
            snap['entities']['3']={'id':3,'names':[r['name']],'profile_visibility':'public','gender':'F','profile_details':{},'display_name':r['name'],'source_club_name':'Example RC',**changes}
            self.assertFalse(p.plan({'rows':[r],'held':[],'checks':[]},snap,[r])['existingHistories'])
if __name__=='__main__':unittest.main()
