"""Synthetic edge cases for UTMB imports; no production data or network calls."""
import copy, hashlib, importlib.util, json, pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
u=load('utmb_test_import','import-utmb.py');f=load('utmb_test_fixtures','import-utmb-fixtures.py')
def capture(**changes):
    row={'dateIso':'2026-09-01','date':'09.01.2026','eventYear':2026,'raceYearId':123,'distance':'81.20','isDnf':False,'time':'08:35:11',
      'rank':11,'rankGender':3,'eventName':'Synthetic Trail','raceName':'Long race','country':'France','elevationGain':5413,'uri':'123.synthetic.2026'}
    row.update(changes)
    d={'fullname':'Example RUNNER','gender':'F','nationalityCode':'ZA','ageGroup':'35-39','results':{'results':[row]}}
    raw='<a href="/utmb-index/races/123.synthetic.2026"></a><script id="__NEXT_DATA__">'+json.dumps({'props':{'pageProps':d}})+'</script>'
    return {'raw':raw,'sha256':hashlib.sha256(raw.encode()).hexdigest(),'data':d,'url':'https://utmb.world/en/runner/999.example.runner','capturedAt':'2026-10-10T18:00:00Z'}
class Tests(unittest.TestCase):
    def test_identity_and_nationality_remain_source_observations(self):
        p=u.normalise(capture(),'999');r=p['performances'][0]
        self.assertEqual((p['gender'],p['nation']),('F','ZA'))
        self.assertEqual((r['date'],r['performance'],r['place']),('2026-09-01','08:35:11','11'))
        self.assertEqual(r['archiveReference']['original']['rankGender'],3)
        self.assertEqual(r['ageGroup'],'');self.assertEqual(p['givenName'],'')
        self.assertEqual(r['verificationStatus'],'unverified');self.assertNotIn('date_of_birth',p)
    def test_dnf_never_becomes_finish(self):
        p=u.normalise(capture(isDnf=True,time=None,rank=None,rankGender=None),'999')
        self.assertEqual(p['performances'][0]['performance'],'DNF')
        with self.assertRaises(ValueError):u.normalise(capture(isDnf=True),'999')
    def test_tampered_source_rejected(self):
        c=capture();c['data']['nationalityCode']='GB'
        with self.assertRaises(ValueError):u.normalise(c,'999')
    def test_future_result_held(self):
        p=u.normalise(capture(dateIso='2027-01-01',eventYear=2027),'999')
        self.assertEqual(p['performances'],[]);self.assertEqual(len(p['heldRows']),1)
    def test_replay_and_conflict_do_not_duplicate_or_replace(self):
        r=u.normalise(capture(),'999')['performances'][0]
        merged,added,held=u.existing_merge([r],[r]);self.assertEqual((added,held),([],[]))
        changed=copy.deepcopy(r);changed['archiveReference']['original']['time']='09:00:00'
        merged,added,held=u.existing_merge([r],[changed]);self.assertEqual(merged,[r]);self.assertEqual(added,[]);self.assertEqual(len(held),1)
    def test_legacy_same_day_not_replaced(self):
        r=u.normalise(capture(),'999')['performances'][0];legacy={'date':r['date'],'performance':'08:35:10'}
        merged,added,held=u.existing_merge([legacy],[r]);self.assertEqual(merged,[legacy]);self.assertEqual(added,[]);self.assertEqual(len(held),1)
    def test_real_distance_and_explicit_date(self):
        self.assertEqual(f.date_value('23rd January 2027'),'2027-01-23')
        with self.assertRaises(ValueError):f.date_value('January 2027')
if __name__=='__main__':unittest.main()
