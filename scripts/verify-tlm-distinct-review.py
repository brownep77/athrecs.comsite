"""Synthetic adversarial checks for separating source observations."""
import copy, importlib.util, pathlib
spec=importlib.util.spec_from_file_location('distinct',pathlib.Path(__file__).with_name('continue-tlm-distinct-profiles.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def row(first='Alex',age=30,bib='1',city='Example City'):
    return {'name':first+' Exampleton','originalHeaders':['First','Last'],
        'originalCells':[first,'Exampleton'],'date':'2015-05-01','ageAtRace':age,'gender':'M',
        'residenceCityOriginal':city,'residenceRegionOriginal':'CT','teamOriginal':'',
        'category':'MOPEN','status':'FIN','overallPosition':int(bib),'genderPosition':int(bib),
        'categoryPosition':None,'bib':bib,'sourceSha256':'synthetic-checksum','sourceKey':'synthetic:'+bib,
        'rowLocator':{'eventId':'synthetic-event','programmeLabel':'5K','csvLine':int(bib)+1}}

a,b=row(),row('Alec',age=50,bib='2')
assert m.separated_pair([a],[b])['method']=='separate_same_programme_entries'
for field,value in [('bib','1'),('sourceSha256','different'),('overallPosition',1),('ageAtRace',31)]:
    bad=copy.deepcopy(b);bad[field]=value
    assert m.separated_pair([a],[bad]) is None,(field,value)
for field,value in [('eventId','different'),('programmeLabel','Half'),('csvLine',2)]:
    bad=copy.deepcopy(b);bad['rowLocator'][field]=value
    assert m.separated_pair([a],[bad]) is None
c=copy.deepcopy(b);c['date']='2016-05-01';c['ageAtRace']=51;c['residenceCityOriginal']='Other City'
assert m.separated_pair([a],[c])['method']=='distinct_recorded_ages_and_locations'
assert m.separated_pair([a],[c],allow_location=False) is None
for field,value in [('residenceCityOriginal',''),('residenceCityOriginal','*no town given*'),
                    ('residenceCityOriginal','123'),('residenceRegionOriginal','XX'),
                    ('residenceCityOriginal','Example City'),('ageAtRace',32),('ageAtRace',17),
                    ('gender',''),('overallPosition',0),('category','Cancer survivor'),('status','DNF')]:
    bad=copy.deepcopy(c);bad[field]=value
    assert m.separated_pair([a],[bad]) is None,(field,value)
mixed=copy.deepcopy(a);mixed['date']='2016-05-01';mixed['ageAtRace']=31;mixed['sourceKey']='synthetic:3'
assert m.separated_pair([a,mixed],[b])
mixed['residenceCityOriginal']='Conflicting City'
assert m.separated_pair([a,mixed],[b]) is None

rows={r['sourceKey']:r for r in [a,b]}
held=[{'sourceKeys':[a['sourceKey']],'reasons':[m.aliases.VARIANT],'sourceVariants':['alec exampleton']},
      {'sourceKeys':[b['sourceKey']],'reasons':[m.aliases.VARIANT],'sourceVariants':['alex exampleton']}]
decision={'sourceKeys':list(rows),'decision':'supported_separate_provisional_profiles'}
assert len(m.review_components(rows,held,[decision])[0])==1
assert not m.review_components(rows,held,[])[0]
assert not m.review_components(rows,held,[{**decision,'sourceKeys':[a['sourceKey']]}])[0]
other=copy.deepcopy(held);other[1]['reasons'].append('possible_existing_athlete_or_account')
assert not m.review_components(rows,other,[decision])[0]
other=copy.deepcopy(held);other[1]['sourceVariants'].append('unresolved third name')
assert not m.review_components(rows,other,[decision])[0]
same=copy.deepcopy(b);same['name']=a['name'];same['originalCells']=a['originalCells']
same_rows={r['sourceKey']:r for r in [a,same]}
same_held=[{'sourceKeys':list(same_rows),'reasons':sorted(m.SPLIT_HOLDS),'sourceVariants':[]}]
assert len(m.review_components(same_rows,same_held,[decision])[0])==1
same_held[0]['reasons'].append('conflicting_source_gender')
assert not m.review_components(same_rows,same_held,[decision])[0]

profiles=[{'externalId':n,'details':{'archiveCreation':{'reviewedComponentSourceKeys':list(rows)}}} for n in ['left','right']]
check=m.component_candidate_checker(profiles,lambda directory,p: {'existing:1'} if p['externalId']=='right' else set())
assert all(check(None,p)=={'existing:1'} for p in profiles),'Live conflict must hold the whole component'
print('PASS: distinct source entries accepted; duplicate entries, weak distinctions, incomplete components and live sibling conflicts held.')
