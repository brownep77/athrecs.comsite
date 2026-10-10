"""Synthetic checks for read-only candidate screening and ambiguous identities."""
import contextlib,hashlib,importlib.util,io,json,tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('finder',Path(__file__).with_name('find-archive-athlete-candidates.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.name_key('Dr João O’Neill')=='joao oneill'
assert m.edit_one('mcdonald','macdonald') and not m.edit_one('smith','jones')
assert m.compatible_first('bob','robert')=='possible_nickname'
assert m.compatible_first('stuart','stewart')=='possible_nickname'
assert m.compatible_first('alice','alan') is None
assert m.youth_category('U18','5k') and m.youth_category('F15-17','Race')
assert not m.youth_category('M50','10k')
with tempfile.TemporaryDirectory() as folder:
 p=Path(folder);caps=p/'captures';caps.mkdir()
 def save(name,value):(p/(name+'.json')).write_text(json.dumps(value))
 save('athletes',[{'id':1,'slug':'known','display_name':'Michael Known','given_name':'Michael','family_name':'Known','gender':'M','club_id':1,'second_club_id':None,'source_club_name':None,'source_second_club_name':None,'race_entry_name':None,'athlete_number':'100','name_details':{'aliases':['Mick Known']}}])
 save('clubs',[{'id':1,'name':'Synthetic RC','source_names':'Synthetic Running Club'}]);save('athlete_clubs',[]);save('accounts',[]);save('resolved-numbers',[]);save('snapshot',{'snapshotAt':'2026-10-10T00:00:00Z'})
 receipts=[]
 for index,date in enumerate(['2026-01-01','2026-02-01'],1):
  rows=[]
  for i,(name,gender,category,club) in enumerate([('Mick Known','M','M40','Synthetic RC'),('Mike Known','M','M40','Synthetic RC'),('Tessa Absent','F','F40','Synthetic Running Club'),('Robin Twin','M','M40','Synthetic RC'),('Robin Twin','F','F40','Synthetic RC'),('Young Junior','M','U18','Synthetic RC'),('Solo Unattached','F','F40','Unattached')],1):
   rows.append({'name':name,'club':club,'date':date,'gender':gender,'category':category,'status':'finished','tableKey':'sr1','sourceRow':str(i),'distanceLabel':'10k','bib':str(i),'original':{'Time':'00:50:00'}})
  body=b'synthetic original source';digest=hashlib.sha256(body).hexdigest();(caps/f'{index}.html').write_bytes(body)
  capture={'rows':rows,'sourceUrl':f'https://totalracetiming.co.uk/raceresults/{index}','index':{'date':date,'name':'Synthetic race'}}
  (caps/f'{index}.capture.json').write_text(json.dumps(capture));receipts.append({'source_key':str(index),'html_sha256':digest,'row_count':len(rows)})
 save('archive_receipts',receipts)
 with contextlib.redirect_stdout(io.StringIO()):result=m.screen(p,caps)
 by_name={g['name']:g for g in result['groups']}
 assert by_name['Mick Known']['status']=='existing_name'
 assert by_name['Mike Known']['status']=='possible_existing'
 assert by_name['Tessa Absent']['priority'] and by_name['Tessa Absent']['resultCount']==2
 assert by_name['Robin Twin']['status']=='likely_missing' and not by_name['Robin Twin']['priority']
 assert 'different_recorded_genders' in by_name['Robin Twin']['flags']
 assert 'same_name_multiple_entries_in_one_table' in by_name['Robin Twin']['flags']
 assert not by_name['Young Junior']['priority'] and not by_name['Solo Unattached']['priority']
 assert result['summary']['profilesCreated']==0 and result['summary']['matchesApproved']==0
 assert sum(result['summary']['statusResultCounts'].values())==14
 (caps/'1.html').write_bytes(b'changed')
 try:
  with contextlib.redirect_stdout(io.StringIO()):m.screen(p,caps)
  raise AssertionError('Modified source was accepted')
 except ValueError as e:assert 'differs' in str(e)
print('Aliases, nicknames, source integrity, duplicate entrants, junior categories and no-creation screening passed.')
