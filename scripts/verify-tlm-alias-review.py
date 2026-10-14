"""Synthetic adversarial identity checks; no real participant data or writes."""
import copy, importlib.util, pathlib
spec=importlib.util.spec_from_file_location('aliases',pathlib.Path(__file__).with_name('continue-tlm-alias-profiles.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def row(first='Michael',last='Exampleton',date='2015-05-01',age=30):
    return {'name':first+' '+last,'originalHeaders':['First','Last'],
            'originalCells':[first,last],'date':date,'ageAtRace':age,'gender':'M',
            'residenceCityOriginal':'Example City','residenceRegionOriginal':'CT',
            'teamOriginal':'','category':'M3039','status':'FIN',
            'overallPosition':12,'genderPosition':9,'categoryPosition':4}

a,b=row(),row('Mike',date='2016-05-01',age=31)
assert m.corroboration_flags([a,b])==[]
assert m.name_mode([a,b])=='recorded_nickname_or_spacing_variant'
c,d=row('Alex','Exampleton'),row('Alex','Examplton',date='2016-05-01',age=31)
assert m.name_mode([c,d])=='reviewed_source_spelling_variant'
assert m.corroboration_flags([c,d])==[]
for key,value,flag in [
    ('residenceCityOriginal','Different City','source_city_missing_or_conflicting'),
    ('residenceRegionOriginal','','source_region_missing_or_conflicting'),
    ('gender','F','conflicting_source_gender'),
    ('ageAtRace',12,'age_unknown_or_junior_at_source'),
    ('ageAtRace',50,'exact_reported_age_intervals_conflict'),
    ('date',a['date'],'multiple_performances_same_date'),
    ('category','Cancer survivor','sensitive_source_category_review'),
    ('status','DNF','non_finish_review'),
    ('overallPosition',0,'invalid_source_placing'),
]:
    bad=copy.deepcopy(b);bad[key]=value
    assert flag in m.corroboration_flags([a,bad]),(key,value)
bad=copy.deepcopy(b);bad['originalCells']=['Robert','Exampleton'];bad['name']='Robert Exampleton'
assert 'unsupported_source_name_difference' in m.corroboration_flags([a,bad])
assert m.name_mode([row('Debra','Korman'),row('Debbie','Dorman')]) is None
assert m.name_mode([row('Michael A','Exampleton'),row('Mike B','Exampleton')]) is None
club_a,club_b=copy.deepcopy(a),copy.deepcopy(b)
club_a['teamOriginal']='Example AC';club_b['teamOriginal']='Different AC'
assert 'source_clubs_conflict' in m.corroboration_flags([club_a,club_b])
graph={'alpha':{'reasons':[m.VARIANT],'sourceVariants':['beta']},
       'beta':{'reasons':[m.VARIANT],'sourceVariants':['alpha','gamma']},
       'gamma':{'reasons':[m.VARIANT],'sourceVariants':['beta']}}
assert list(m.components(graph))==[{'alpha','beta','gamma'}]
assert not m.one_edit('Ana','Anna')
assert not m.one_edit('Exampleton','Unrelated')
print('PASS: corroborated aliases accepted; age, location, gender, date, club, source, name and transitive-ambiguity conflicts remain held.')
