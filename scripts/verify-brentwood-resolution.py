"""Synthetic identity regressions for selective held-result resolution."""
import importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
v=load('resolution_fixtures','verify-brentwood-profiles.py');r=load('resolution_tests','resolve-brentwood-held.py');p=r.p
expander=load('resolution_expander','expand-brentwood-resolution.py')
class Tests(unittest.TestCase):
    def plan(self,rows,snapshot=None):return p.plan({'rows':rows,'held':[],'checks':[]},snapshot or v.snapshot(),rows,resolve_partial_clubs=True)
    def test_partial_club_group_does_not_claim_other_appearances(self):
        rows=[v.row(year=2020+i,key=str(i),club='Example Club' if i<3 else 'Different Club') for i in range(4)]
        result=self.plan(rows);self.assertEqual(len(result['profiles']),1)
        self.assertEqual(result['profiles'][0]['rows'],['0','1','2']);self.assertEqual(len(result['held']),1)
    def test_tied_club_groups_remain_held(self):
        rows=[v.row(year=2020+i,key=str(i),club='Example Club' if i<2 else 'Different Club') for i in range(4)]
        result=self.plan(rows);self.assertFalse(result['profiles']);self.assertEqual(len(result['held']),4)
    def test_duplicate_year_can_resolve_two_distinct_existing_identities(self):
        rows=[v.row(key='one',club='First Club'),v.row(key='two',bib='28',club='Second Club')];snap=v.snapshot()
        snap['index']={k:['athrecs:3','athrecs:4'] for k in p.prep.name_keys(rows[0]['name'])}
        for aid,club in [('3','First Club'),('4','Second Club')]:snap['entities'][aid]={'id':int(aid),'names':[rows[0]['name']],'display_name':rows[0]['name'],'profile_visibility':'public','profile_details':{},'gender':'F','source_club_name':club}
        result=self.plan(rows,snap);self.assertEqual(len(result['existingHistories']),2)
        snap['entities']['4']['source_club_name']='Third Club';rows[1]['club']='First Club'
        result=self.plan(rows,snap);self.assertFalse(result['existingHistories']);self.assertEqual(len(result['held']),2)
    def test_historical_age_and_gender_conflicts_block_links(self):
        h=[{'performances':[{'archiveReference':{'original':{'year':2020,'age':'40','gender':'F'}}}]}]
        self.assertEqual(r.history_conflict(v.row(year=2025,age='45'),h),'')
        self.assertIn('age conflicts',r.history_conflict(v.row(year=2025,age='30'),h))
        self.assertIn('gender conflicts',r.history_conflict(v.row(gender='M'),h))
    def test_compact_club_comparison_is_not_fuzzy(self):
        self.assertEqual(p.club_key('Thriftgreen Trotters'),p.club_key('Thrift Green Trotters'))
        self.assertNotEqual(p.club_key('North Example Club'),p.club_key('South Example Club'))
    def test_anchor_does_not_merge_name_only_appearances(self):
        rows=[v.row(year=2020,key='old',club=''),v.row(year=2025,key='new',club='')]
        chosen=expander.select_anchor_group(rows);result=self.plan(chosen)
        self.assertEqual(len(result['profiles']),1);self.assertEqual(result['profiles'][0]['rows'],['new'])
    def test_anchor_still_holds_existing_name_candidate(self):
        row=v.row(club='');snap=v.snapshot();snap['index']={k:['athrecs:3'] for k in p.prep.name_keys(row['name'])}
        snap['entities']['3']={'id':3,'names':[row['name']],'display_name':row['name'],'profile_visibility':'public','profile_details':{},'gender':'F'}
        result=self.plan(expander.select_anchor_group([row]),snap)
        self.assertFalse(result['profiles']);self.assertFalse(result['existingHistories'])
if __name__=='__main__':unittest.main()
