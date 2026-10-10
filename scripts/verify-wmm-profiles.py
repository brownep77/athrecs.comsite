"""Synthetic WMM identity, duplicate-result and pagination safety checks."""
import collections, importlib.util, pathlib, tempfile
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,path):
    s=importlib.util.spec_from_file_location(name,ROOT/path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
p=load('prep','prepare-wmm-profiles.py');c=load('collect','collect-wmm-rankings.py')

idx=collections.defaultdict(set)
p.add(idx,'existing',['José O’Neill','Robert Smith','Sarah Willams','Chan Wei'])
for candidate in ['Jose Oneill','Bob Smith','Sarah Williams','Wei Chan']:
    assert p.matching(idx,[candidate])=={'existing'},candidate
assert not p.matching(idx,['Una Dissimilar'])
p.add(idx,'source-one',['Una Dissimilar']);assert not p.matching(idx,['Una Dissimilar'],'source-one')
p.add(idx,'source-two',['Una Dissimilar']);assert p.matching(idx,['Una Dissimilar'],'source-one')=={'source-two'}

rank={'gender':'F','fastest_finish_time_secs':10921}
def result(rid='r1',time='3:02:01',seconds=10921,bib='17'):
    return {'_id':rid,'_source':{'result_id':rid,'athlete_id':'a1','edition':8,'gender':'F','result_year':2026,'finish_time':time,'finish_time_secs':seconds,'event_title':'Synthetic Marathon','firstname':'Una','lastname':'Dissimilar','bibnumber':bib,'place':31,'age_group':'45-49'}}
rows,flags,dups=p.normalize_results('a1',rank,[result(),result('r2')])
assert len(rows)==1 and dups==1 and flags==[]
assert rows[0]['date']=='' and rows[0]['year']==2026 and rows[0]['verificationStatus']=='unverified'
assert rows[0]['archiveReference']['sourceResultIds']==['r1','r2']
assert 'same_athlete_race_year_conflicting_results' in p.normalize_results('a1',rank,[result(),result('r2',bib='99')])[1]
assert 'finish_time_conflict' in p.normalize_results('a1',rank,[result(seconds=999)])[1]
assert 'source_identifier_conflict' in p.normalize_results('wrong',rank,[result()])[1]
assert 'ranking_fastest_time_not_in_detailed_results' in p.normalize_results('a1',{'gender':'F','fastest_finish_time_secs':10000},[result()])[1]

# Ranking ties must not disappear at a page edge; numeric rank intervals are disjoint.
called=[]
def fake_request(index,q):
    limits=q['query']['bool']['filter'][-1]['range']['overall_ranking'];lo,hi=limits['gte'],limits['lte'];called.append((lo,hi))
    if lo==1 and hi==2:return {'hits':{'total':{'relation':'eq','value':5001},'hits':[]}}
    count=2501 if lo==1 else 2500
    return {'hits':{'total':{'relation':'eq','value':count},'hits':[{'_id':str(lo)+'-'+str(i)} for i in range(count)]}}
c.request=fake_request;c.results=lambda ids:[]
with tempfile.TemporaryDirectory() as temp:
    assert c.collect_range(pathlib.Path(temp),'F','40-44',1,2)==(5001,0)
assert called==[(1,2),(1,1),(2,2)]
print('PASS: accents, aliases, nicknames, spelling variations, token order, distinct source IDs, result dedupe/conflicts, source ID mismatch, exact-time validation, missing-date preservation and tied-rank pagination.')
