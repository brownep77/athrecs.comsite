"""Adversarial checks for blank source places without invented field values."""
import copy,importlib.util,pathlib
s=importlib.util.spec_from_file_location('review',pathlib.Path(__file__).with_name('continue-tlm-partial-location-profiles.py'))
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def row(key,date,city='Exampletown',region='CT'):
    return {'name':'Alex Exampleton','originalHeaders':['First','Last'],'originalCells':['Alex','Exampleton'],
        'date':date,'ageAtRace':30,'gender':'M','category':'MOPEN','status':'FIN',
        'residenceCityOriginal':city,'residenceRegionOriginal':region,'teamOriginal':'',
        'overallPosition':1,'genderPosition':1,'categoryPosition':None,'sourceKey':key}
rs=[row('a','2015-03-01'),row('b','2015-04-01'),row('c','2015-05-01','','')]
def decision(rows):
    full=[r for r in rows if m.distinct.valid_location(r)]
    return {'sourceKeys':sorted(r['sourceKey'] for r in rows),'decision':'supported_provisional_grouping','kind':'repeated_location_with_blank_fields',
        'recordedPlace':['EXAMPLETOWN','CT'],'completeLocationSourceKeys':sorted(r['sourceKey'] for r in full),
        'incompleteLocationSourceKeys':sorted(r['sourceKey'] for r in rows if r not in full)}
d=decision(rs);before=copy.deepcopy(rs);assert not m.corroboration_flags(rs,d) and rs==before
h=[{'sourceKeys':['a','b','c'],'reasons':[m.prior.CLUB_HOLD],'sourceVariants':[]}]
assert len(m.review_components({r['sourceKey']:r for r in rs},h,[d])[0])==1
for city,region in [('Exampletown',''),('','CT')]:
    changed=copy.deepcopy(rs);changed[2].update(residenceCityOriginal=city,residenceRegionOriginal=region)
    assert not m.corroboration_flags(changed,decision(changed))
for field,value in [('residenceCityOriginal','Other town'),('residenceCityOriginal','Unknown'),('residenceCityOriginal','N/A'),
                    ('residenceRegionOriginal','MA'),('residenceRegionOriginal','T'),('ageAtRace',17),('ageAtRace',None),
                    ('ageAtRace',40),('gender','F'),('gender','U'),('date','2015-03-01'),('status','DNF'),('overallPosition',0)]:
    bad=copy.deepcopy(rs);bad[2][field]=value;assert m.corroboration_flags(bad,decision(bad)),(field,value)
bad=copy.deepcopy(rs);bad[2]['originalCells']=['Alec','Exampleton'];assert m.corroboration_flags(bad,d)
bad=copy.deepcopy(rs);bad[0]['teamOriginal']='First Club';bad[2]['teamOriginal']='Other Club';assert m.corroboration_flags(bad,d)
bad=copy.deepcopy(rs);bad[1].update(residenceCityOriginal='',residenceRegionOriginal='');assert m.corroboration_flags(bad,decision(bad))
bad=copy.deepcopy(rs);bad[2].update(residenceCityOriginal='Exampletown',residenceRegionOriginal='CT');assert m.corroboration_flags(bad,decision(bad))
for key,value in [('recordedPlace',['OTHER','CT']),('completeLocationSourceKeys',['a']),('incompleteLocationSourceKeys',[]),('sourceKeys',['a','b'])]:
    wrong={**d,key:value};assert not m.review_components({r['sourceKey']:r for r in rs},h,[wrong])[0],key
for extra in ('possible_existing_athlete_or_account','age_unknown_or_junior_at_source'):
    bad=copy.deepcopy(h);bad[0]['reasons'].append(extra);assert not m.review_components({r['sourceKey']:r for r in rs},bad,[d])[0]
bad=copy.deepcopy(h);bad[0]['sourceVariants']=['other name'];assert not m.review_components({r['sourceKey']:r for r in rs},bad,[d])[0]
for decisions in ([d,d],[{**d,'sourceKeys':['a','b','c','c']}]):
    try:m.review_components({r['sourceKey']:r for r in rs},h,decisions);raise AssertionError('Duplicate source keys accepted')
    except ValueError:pass
print('PASS: independently dated matching places support blank fields; missing values stay missing; contradictions, weak support and source conflicts stay held.')
