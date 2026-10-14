"""Adversarial checks for complete exact-name source partitions."""
import copy, importlib.util, pathlib
ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('review',ROOT/'continue-tlm-same-name-profiles.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def row(key,age,city,date='2015-05-01'):
    return {'name':'Alex Exampleton','originalHeaders':['First','Last'],
        'originalCells':['Alex','Exampleton'],'date':date,'ageAtRace':age,'gender':'M',
        'residenceCityOriginal':city,'residenceRegionOriginal':'CT','teamOriginal':'',
        'category':'MOPEN','status':'FIN','overallPosition':1,'genderPosition':1,
        'categoryPosition':None,'bib':'1','sourceSha256':key,'sourceKey':key,
        'rowLocator':{'eventId':key,'programmeLabel':'5K','csvLine':2}}

a,b,c=row('a',30,'First Town'),row('b',50,'Second Town'),row('c',51,'Second Town','2016-05-01')
rows={r['sourceKey']:r for r in (a,b,c)}
held=[{'sourceKeys':list(rows),'reasons':['inconsistent_reported_ages',m.prior.CLUB_HOLD],'sourceVariants':[]}]
decision={'sourceKeys':list(rows),'partitions':[['a'],['b','c']],
    'decision':'supported_separate_provisional_profiles','placesReviewedDistinct':True}
assert len(m.review_components(rows,held,[decision])[0])==1
for partitions in ([['a'],['b']],[['a'],['b','c','a']],[['a','b','c']], [[],['a','b','c']]):
    bad=copy.deepcopy(decision);bad['partitions']=partitions
    assert not m.review_components(rows,held,[bad])[0]
for key,value in [('placesReviewedDistinct',False),('sourceKeys',['a','b']),('decision','unreviewed')]:
    bad=copy.deepcopy(decision);bad[key]=value
    assert not m.review_components(rows,held,[bad])[0]
for reason in ('possible_existing_athlete_or_account','minor_source_age','conflicting_source_gender'):
    bad=copy.deepcopy(held);bad[0]['reasons'].append(reason)
    assert not m.review_components(rows,bad,[decision])[0]
bad=copy.deepcopy(held);bad[0]['sourceVariants']=['unresolved variant']
assert not m.review_components(rows,bad,[decision])[0]
for field,value in [('ageAtRace',17),('ageAtRace',32),('residenceCityOriginal',''),('overallPosition',0),('status','DNF')]:
    bad=copy.deepcopy(rows);bad['b'][field]=value
    assert not m.review_components(bad,held,[decision])[0]
bad=copy.deepcopy(rows);bad['c']['residenceCityOriginal']='Third Town'
assert not m.review_components(bad,held,[decision])[0]
for left,right in [('THE PARK CITY','Bridgeport'),('Oneco','Sterling'),('W Hartford','West Hartford')]:
    x,y=row('x',30,left),row('y',50,right)
    assert m.separated_pair([x],[y]) is None
try:
    m.review_components(rows,held,[decision,decision])
    raise AssertionError('Duplicate decisions accepted')
except ValueError: pass
print('PASS: whole exact-name partitions required; source holds, weak distinctions, equivalent places and incomplete decisions retained.')
