"""Synthetic identity-screening regression cases; no network or database writes."""
import importlib.util
from collections import defaultdict
from pathlib import Path
spec=importlib.util.spec_from_file_location('profiles',Path(__file__).with_name('create-private-archive-profiles.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
g={'id':'a','normalizedName':'avery sample'}
def pair(date,category='F40-44',key='1',bib='10'):
 return ({'sourceKey':key,'sourceUrl':'https://example.test/'+key,'index':{'date':date}},
  {'category':category,'distanceLabel':'10k','bib':bib,'original':{'Forename':'Avery','Surname':'Sample'}})
def flags(rows,variants=None,locators=None):return m.extra_flags(g,rows,[],variants or {},locators or set())
assert flags([pair('2025-01-01'),pair('2026-01-01')])==[]
assert 'inconsistent_explicit_age_bands' in flags([pair('2025-01-01','F20-24'),pair('2026-01-01','F60-64')])
assert 'different_races_same_day' in flags([pair('2025-01-01',key='1'),pair('2025-01-01',key='2')])
assert 'source_bib_already_linked_to_profile' in flags([pair('2025-01-01')],locators={('https://example.test/1','10')})
assert 'youth_source_category' in flags([pair('2025-01-01','FJ')])
assert 'invalid_source_age_band' in flags([pair('2025-01-01','F35-29/M')])
variants=defaultdict(list)
for v in m.finder.variants('samples'):variants[v].append({'id':'b','normalizedName':'avery samples'})
assert 'possible_archive_surname_variant' in flags([pair('2025-01-01')],variants)
assert flags([pair('2025-01-01','None')])==[]
print('Private profile screening: source locators, surname variants, junior categories, inconsistent bands and same-date ambiguity passed.')
