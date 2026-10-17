"""Synthetic adversarial checks: names suggest candidates; results establish links."""
import copy
import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('linker',Path(__file__).with_name('link-world-athletics-history.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.valid_profile_url('https://worldathletics.org/athletes/example/example-99999',99999)
assert m.valid_profile_url('https://worldathletics.org/athletes/-/99999',99999)
for url in ['https://worldathletics.org/athletes/-/99998','https://example.org/athletes/-/99999','https://worldathletics.org/athletes/-/99999?x=1']:
 assert not m.valid_profile_url(url,99999)
a={'display_name':'Example Runner','gender':'F','nation':'GBR','date_of_birth':None}
b={'givenName':'Example Middle','familyName':'RUNNER','male':False,'countryCode':'GBR','birthDate':'01 JAN 1983'}
w=[{'year':2025,'meeting':'Example Marathon','discipline':'Marathon','performance':'2:31:02','ageGroup':'40-44'}]
r=[{'date':'2025-04-20','meeting':'Sponsor Example Marathon, Test City','discipline':'Marathon','performance':'2:31:02','round':'F','sourceLocator':'fictional row 1'}]
aliases={'Example Marathon':['Sponsor Example Marathon']}
assert m.identity_matches(a,b,w,r,aliases)['eligible']
assert not m.identity_matches(a,b,w,[],aliases)['eligible']
bad=copy.deepcopy(r);bad[0]['performance']='2:31:03'
result=m.identity_matches(a,b,w,bad,aliases)
assert not result['eligible'] and result['conflicts']
bad=copy.deepcopy(r);bad[0]['date']='2024-04-20'
assert not m.identity_matches(a,b,w,bad,aliases)['eligible']
bad=copy.deepcopy(r);bad[0]['discipline']='Half Marathon'
assert not m.identity_matches(a,b,w,bad,aliases)['eligible']
assert not m.identity_matches(a,b,w,r+r,aliases)['eligible']
for field,value in [('gender','M'),('nation','IRL'),('date_of_birth','1984-01-01'),('display_name','Different Runner')]:
 bad=copy.deepcopy(a);bad[field]=value
 assert not m.identity_matches(bad,b,w,r,aliases)['eligible']
bad=copy.deepcopy(w);bad[0]['ageGroup']='50-54'
assert not m.identity_matches(a,b,bad,r,aliases)['eligible']
assert not m.race_matches('Example Marathon','Example City Half Marathon',aliases)
alias_athlete={**a,'display_name':'Example Runner Extra'}
alias_rows=copy.deepcopy(w);alias_rows[0]['archiveReference']={'original':{'bibnumber':'17'}}
alias_evidence={'reviewed':True,'sourceName':'Example Runner Extra','officialName':'Example Middle RUNNER','nation':'GBR','gender':'F','discipline':'Marathon','date':'2025-04-20','performance':'2:31:02','bib':'17','providerName':'Example Timer','sourceUrl':'https://example.org/results','sourceLocator':'row 17','capturedEvidence':{'synthetic':True}}
assert not m.identity_matches(alias_athlete,b,alias_rows,r,aliases)['eligible']
assert m.identity_matches(alias_athlete,b,alias_rows,r,aliases,alias_evidence)['eligible']
for field,value in [('sourceName','Wrong Person'),('officialName','Wrong Person'),('bib','18'),('performance','2:31:03'),('date','2024-04-20'),('nation','IRL'),('capturedEvidence',None)]:
 bad={**alias_evidence,field:value}
 assert not m.identity_matches(alias_athlete,b,alias_rows,r,aliases,bad)['eligible']
bad=copy.deepcopy(r);bad[0]['performance']='2:31:03'
assert not m.identity_matches(alias_athlete,b,alias_rows,bad,aliases,alias_evidence)['eligible']
payload={'data':{'getSingleCompetitorResultsDiscipline':{'parameters':{'resultsByYear':2025},'resultsByEvent':[{'discipline':'5000 Metres','indoor':False,'results':[{'date':'20 APR 2025','competition':'Example Championships','venue':'Test Track (GBR)','country':'GBR','race':'H2','place':'3.','mark':'14:20.87','competitionId':'123','eventId':'456'}]}]}}}
row=m.parse_year(99999,2025,payload,'https://worldathletics.org/athletes/example/example-99999')[0]
assert row['performance']=='14:20.87' and row['place']=='3' and row['round']=='H2'
assert row['sourceEvidence']['row']['place']=='3.' and 'H2' in row['meeting']
assert row['discipline']=='5000 Metres' and m.discipline_label('10 Kilometres Road')=='10 km'
bad=copy.deepcopy(payload);bad['capture']={'athleteId':99998,'year':2025,'sourceUrl':'https://worldathletics.org/athletes/example/example-99999'}
try:m.parse_year(99999,2025,bad,'https://worldathletics.org/athletes/example/example-99999')
except ValueError:pass
else:raise AssertionError('Wrong captured athlete accepted')
payload['data']['getSingleCompetitorResultsDiscipline']['parameters']['resultsByYear']=2024
try:m.parse_year(99999,2025,payload,'https://worldathletics.org/athletes/example/example-99999')
except ValueError:pass
else:raise AssertionError('Wrong year accepted')
print('Cross-source identity, race/date/distance/timing conflicts, ambiguity, precision and round checks passed.')
