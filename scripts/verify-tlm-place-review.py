"""Synthetic source-conflict and place-relation checks."""
import copy,importlib.util,pathlib
spec=importlib.util.spec_from_file_location('review',pathlib.Path(__file__).with_name('continue-tlm-place-profiles.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(key,city,year=2015):
    return {'name':'Alex Exampleton','originalHeaders':['First','Last'],'originalCells':['Alex','Exampleton'],
        'date':f'{year}-05-01','ageAtRace':30+year-2015,'gender':'M','category':'MOPEN','status':'FIN',
        'residenceCityOriginal':city,'residenceRegionOriginal':'CT','teamOriginal':'',
        'overallPosition':1,'genderPosition':1,'categoryPosition':None,'sourceKey':key}
def decision(rows,kind,**extra):
    return {'sourceKeys':[r['sourceKey'] for r in rows],'decision':'supported_provisional_grouping','kind':kind,
        'reviewedPlaces':[list(p) for p in sorted({(m.prior.location(r['residenceCityOriginal']),r['residenceRegionOriginal']) for r in rows})],**extra}
for cities,kind,extra in [(['W Hartford','West Hartford'],'directional_abbreviation',{}),
    (['Exampletown','Exampeltown'],'reviewed_one_edit_spelling',{'spellingReviewed':True}),
    (['Pomfret','Pomfret Center'],'official_municipality',{'officialSource':m.CT_SOURCE})]:
    rs=[row('a',cities[0]),row('b',cities[1],2016)];before=copy.deepcopy(rs);d=decision(rs,kind,**extra)
    assert not m.corroboration_flags(rs,d) and rs==before
    h=[{'sourceKeys':['a','b'],'reasons':[m.prior.CLUB_HOLD],'sourceVariants':[]}]
    assert len(m.review_components({r['sourceKey']:r for r in rs},h,[d])[0])==1
    for field,value in [('ageAtRace',17),('ageAtRace',40),('gender','F'),('date','2015-05-01'),('status','DNF'),
                        ('overallPosition',0),('residenceRegionOriginal','MA'),('residenceCityOriginal',''),('name','Unknown Runner')]:
        bad=copy.deepcopy(rs);bad[1][field]=value;assert m.corroboration_flags(bad,d),(field,value)
    bad=copy.deepcopy(rs);bad[1]['originalCells']=['Alec','Exampleton'];assert m.corroboration_flags(bad,d)
    bad=copy.deepcopy(rs);bad[0]['teamOriginal']='First Club';bad[1]['teamOriginal']='Other Club';assert m.corroboration_flags(bad,d)
    for reason in ('possible_existing_athlete_or_account','age_unknown_or_junior_at_source'):
        bad=copy.deepcopy(h);bad[0]['reasons'].append(reason);assert not m.review_components({r['sourceKey']:r for r in rs},bad,[d])[0]
    bad=copy.deepcopy(d);bad['sourceKeys']=['a'];assert not m.review_components({r['sourceKey']:r for r in rs},h,[bad])[0]
    bad=copy.deepcopy(d);bad['reviewedPlaces'][0][0]='OTHER';assert m.corroboration_flags(rs,bad)
    try:m.review_components({r['sourceKey']:r for r in rs},h,[d,d]);raise AssertionError('Duplicate decisions accepted')
    except ValueError:pass
for a,b in [('Hartford','West Hartford'),('Lyme','Old Lyme'),('East Haddam','Haddam'),('Norwich','Newtown')]:
    rs=[row('a',a),row('b',b,2016)]
    assert m.corroboration_flags(rs,decision(rs,'official_municipality',officialSource=m.CT_SOURCE))
rs=[row('a','Exampletown'),row('b','Exampeltown',2016)]
assert m.corroboration_flags(rs,decision(rs,'reviewed_one_edit_spelling'))
rs=[row('a','Pomfret'),row('b','Pomfret Center',2016)]
assert m.corroboration_flags(rs,decision(rs,'official_municipality',officialSource='https://example.org/unreviewed'))
print('PASS: reviewed place relations accepted; original rows immutable; incomplete groups, distinct towns and source conflicts held.')
