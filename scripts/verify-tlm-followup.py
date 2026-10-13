"""Adversarial synthetic evidence cases for the held TLM continuation."""
import collections,importlib.util,pathlib,types
ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('followup',ROOT/'continue-tlm-source-profiles.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(**changes):
    r={'originalHeaders':['First','Last'],'originalCells':['Una','Fictional'],'name':'Una Fictional',
       'ageAtRace':34,'category':'F30-39','status':'FIN','gender':'F','date':'2016-04-02','teamOriginal':'',
       'residenceCityOriginal':'Example City','residenceRegionOriginal':'CT'}
    r.update(changes);return r
pair=[row(),row(date='2015-04-02',ageAtRace=33)]
assert m.corroboration_flags(pair)==[]
for change,flag in [
    ({'residenceCityOriginal':''},'source_city_missing_or_conflicting'),
    ({'residenceCityOriginal':'Another City'},'source_city_missing_or_conflicting'),
    ({'residenceRegionOriginal':'MA'},'source_region_missing_or_conflicting'),
    ({'originalCells':['Unah','Fictional']},'source_name_components_differ'),
    ({'ageAtRace':17},'age_unknown_or_junior_at_source'),
    ({'ageAtRace':None},'age_unknown_or_junior_at_source'),
    ({'gender':'M'},'conflicting_source_gender'),
    ({'category':'Survivor'},'sensitive_source_category_review'),
    ({'date':'2016-04-02'},'multiple_performances_same_date')]:
    assert flag in m.corroboration_flags([pair[0],dict(pair[1],**change)]),flag
assert 'exact_reported_age_intervals_conflict' in m.corroboration_flags([row(date='2016-01-01',ageAtRace=34),row(date='2016-12-31',ageAtRace=33)])
assert 'source_clubs_conflict' in m.corroboration_flags([dict(pair[0],teamOriginal='First AC'),dict(pair[1],teamOriginal='Second AC')])
assert 'requires_multiple_source_observations' in m.corroboration_flags([row()])
directory=types.SimpleNamespace(index=collections.defaultdict(set),result_index=collections.defaultdict(set))
performance={'meeting':'Fictional Race','year':2016,'archiveReference':{'bib':'0012'}}
profile={'details':{'aliases':['Una Fictional']},'performances':[performance]}
directory.result_index[('fictional race',2016,'12')].add('athrecs:123')
assert m.t.publication_candidates(directory,profile)=={'athrecs:123'},'A canonical event/year/bib match must hold publication even under another name'
performance['year']=2015
assert not m.t.publication_candidates(directory,profile),'A different edition year is not a result collision'
print('PASS: corroborating observations; conflicting/missing locations, names, ages, genders, clubs, sensitive categories, same-day races and singleton holds')
