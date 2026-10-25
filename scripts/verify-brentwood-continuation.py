"""Synthetic regressions for bounded names and independent provider comparison."""
import importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
v=load('continuation_fixtures','verify-brentwood-profiles.py');c=load('continuation','continue-brentwood-results.py');p=c.p
class Tests(unittest.TestCase):
    def snapshot(self,names,clubs,genders=None):
        snap=v.snapshot()
        for i,(name,club) in enumerate(zip(names,clubs),3):
            a={'id':i,'names':[name],'display_name':name,'profile_visibility':'public','profile_details':{},'gender':(genders or ['M']*len(names))[i-3],'source_club_name':club}
            snap['entities'][str(i)]=a
            for k in p.prep.name_keys(name):snap['index'].setdefault(k,[]).append('athrecs:'+str(i))
        return snap
    def plan(self,row,snapshot,variants=True):return p.plan({'rows':[row],'held':[],'checks':[]},snapshot,[row],resolve_partial_clubs=True,allow_name_variants=variants)
    def test_unique_variant_requires_specific_club(self):
        row=v.row(name='Robert Example',gender='M',club='Harbour Harriers');snap=self.snapshot(['Rob Example'],['Harbour Harriers'])
        result=self.plan(row,snap);self.assertEqual(result['existingHistories'][0]['athleteId'],3)
        row['club']='';self.assertFalse(self.plan(row,snap)['existingHistories'])
    def test_variants_are_opt_in(self):
        row=v.row(name='Robert Example',gender='M',club='Harbour Harriers');snap=self.snapshot(['Rob Example'],['Harbour Harriers'])
        self.assertFalse(self.plan(row,snap,False)['existingHistories'])
    def test_missing_or_conflicting_gender_cannot_link_variant(self):
        row=v.row(name='Alex Example',gender='',club='Harbour Harriers');snap=self.snapshot(['Alexandra Example'],['Harbour Harriers'],['F'])
        self.assertFalse(self.plan(row,snap)['existingHistories']);row['gender']='M';self.assertFalse(self.plan(row,snap)['existingHistories'])
    def test_two_long_names_are_not_nicknames(self):
        self.assertFalse(c.same_name_or_variant('Christina Example','Christine Example'))
        self.assertFalse(c.same_name_or_variant('Robert John Example','Rob James Example'))
    def test_two_corroborated_candidates_stay_held(self):
        row=v.row(name='Robert Example',gender='M',club='Harbour Harriers');snap=self.snapshot(['Rob Example','Bob Example'],['Harbour Harriers']*2)
        self.assertFalse(self.plan(row,snap)['existingHistories'])
    def test_accounts_and_private_profiles_are_held(self):
        row=v.row(name='Robert Example',gender='M',club='Harbour Harriers');snap=self.snapshot(['Rob Example'],['Harbour Harriers'])
        snap['entities']['3']['active_accounts']=1;self.assertFalse(self.plan(row,snap)['existingHistories'])
        snap['entities']['3']['active_accounts']=0;snap['entities']['3']['profile_visibility']='private';self.assertFalse(self.plan(row,snap)['existingHistories'])
    def test_typo_is_not_an_allowed_variant(self):
        self.assertFalse(c.same_name_or_variant('Robert Example','Rob Exampel'))
        self.assertTrue(c.same_name_or_variant('William Example','Will Example'))
    def test_existing_edition_is_reused_not_inserted(self):
        row=v.row(name='Robert Example',gender='M',club='Harbour Harriers');snap=self.snapshot(['Rob Example'],['Harbour Harriers'])
        snap['histories']=[{'athlete_id':3,'provider':'Synthetic','external_id':'fixture','performances':[p.performance(row)]}]
        result=self.plan(row,snap);self.assertFalse(result['existingHistories']);self.assertEqual(len(result['reused']),1)
if __name__=='__main__':unittest.main()
