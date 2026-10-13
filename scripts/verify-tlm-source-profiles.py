"""Synthetic checks for conservative profile grouping and exact source timing."""
import copy, importlib.util, pathlib
ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('tlm',ROOT/'publish-tlm-source-profiles.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
def row(**changes):
    r={'originalHeaders':['First','Last'],'originalCells':['Una','Dissimilar'],'name':'Una Dissimilar',
       'ageAtRace':34,'category':'F30-39','status':'FIN','gender':'F','date':'2016-04-02','teamOriginal':'Example AC'}
    r.update(changes);return r
assert p.group_flags([row()])==[]
assert p.group_flags([row(),row(date='2015-04-02',ageAtRace=33)])==[]
assert 'repeated_name_without_consistent_club' in p.group_flags([row(teamOriginal=''),row(date='2015-04-02',ageAtRace=33,teamOriginal='')])
assert 'conflicting_source_gender' in p.group_flags([row(),row(date='2015-04-02',ageAtRace=33,gender='M')])
assert 'multiple_performances_same_date' in p.group_flags([row(),row()])
assert 'inconsistent_reported_ages' in p.group_flags([row(),row(date='2015-04-02',ageAtRace=60)])
assert 'age_unknown_or_junior_at_source' in p.group_flags([row(ageAtRace=12)])
assert 'sensitive_source_category_review' in p.group_flags([row(category='Survivor')])
assert 'initial_or_incomplete_name' in p.group_flags([row(originalCells=['U','Dissimilar'])])
assert p.mark_seconds('1:02:03.45')==3723.45
for bad in ['DNF','1:62:03','18:aa','00:10:-1']:
    try:p.mark_seconds(bad)
    except ValueError:pass
    else:raise AssertionError(bad)
assert p.digest({'a':1,'b':2})==p.digest({'b':2,'a':1})
assert p.digest({'a':1})!=p.digest({'a':2})
print('PASS: name grouping, conflicting ages/genders, same-day races, junior/unknown ages, sensitive categories, missing names, precise times and immutable plan hashes')
