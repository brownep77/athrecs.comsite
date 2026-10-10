"""Read-only screening of archived source names against a directory snapshot.

Outputs name groups for staff review, never verified identities or write SQL.
No emails, date of birth, addresses or account credentials are needed.
"""
import argparse
from collections import Counter,defaultdict
from datetime import datetime,timezone
import hashlib,json,re,unicodedata
from pathlib import Path

TITLES={'mr','mrs','ms','miss','mx','dr','sir','dame'}
EMPTY_CLUBS={'','none','unattached','unaffiliated','no club','n a','na','not affiliated','unknown','none specified','independent'}
NICKNAMES=[{'alex','alexander','alexandra'},{'andrew','andy'},{'anthony','antony','tony'},
 {'ben','benjamin'},{'bob','bobby','rob','robert','robbie'},{'charles','charlie'},
 {'chris','christopher','christine','christina'},{'dan','daniel','danny'},{'dave','david'},
 {'ed','eddie','edward','ted'},{'elizabeth','liz','lizzie','beth','betty'},
 {'james','jim','jimmy'},{'jen','jennifer','jenny'},{'joe','joseph','joey'},
 {'jon','john','jonathan'},{'kate','katie','katherine','kathryn','catherine','cathy','kat'},
 {'karl','carl'},{'matt','matthew'},{'mike','michael','mick'},
 {'nick','nicholas','nicolas'},{'pat','patrick','patricia'},
 {'pete','peter'},{'phil','philip','phillip'},{'rich','richard','rick','ricky','dick'},
 {'rob','robert'},{'sam','sammy','samuel','samantha'},{'steve','steven','stephen'},
 {'stuart','stewart'},{'ian','iain'},{'graeme','graham'},{'rachael','rachel'},
 {'sue','susan','suzanne','susie'},{'tom','thomas','tommy'},{'will','william','bill','billy'},
 {'vicky','vicki','victoria'},{'debbie','deborah','debra'}]
NICK=defaultdict(set)
for family in NICKNAMES:
 for member in family:NICK[member].update(family)

def norm(text):
 text=unicodedata.normalize('NFKD',str(text or '')).casefold()
 text=''.join(c for c in text if not unicodedata.combining(c)).replace('’','').replace("'",'').replace('&',' and ')
 return ' '.join(re.sub(r'[^a-z0-9]+',' ',text).split())

def name_key(text):
 tokens=norm(text).split()
 while tokens and tokens[0] in TITLES:tokens.pop(0)
 return ' '.join(tokens)

def names_from(value):
 if isinstance(value,str):
  if '://' not in value and len(value)<160:yield value
 elif isinstance(value,list):
  for v in value:yield from names_from(v)
 elif isinstance(value,dict):
  for key in ('name','displayName','display_name','full_name','alias','value'):
   if key in value:yield from names_from(value[key])

def edit_one(a,b):
 if a==b:return True
 if abs(len(a)-len(b))>1:return False
 if len(a)==len(b):return sum(x!=y for x,y in zip(a,b))==1
 if len(a)>len(b):a,b=b,a
 i=j=0;skipped=False
 while i<len(a) and j<len(b):
  if a[i]==b[j]:i+=1;j+=1
  elif skipped:return False
  else:skipped=True;j+=1
 return True

def variants(word):return {word}|{word[:i]+word[i+1:] for i in range(len(word))}

def compatible_first(a,b):
 if a==b:return 'same_first_name'
 if b in NICK.get(a,()):return 'possible_nickname'
 if a and b and a[0]==b[0] and (len(a)==1 or len(b)==1):return 'initial_and_surname'
 if min(len(a),len(b))>=3 and edit_one(a,b):return 'possible_given_name_spelling'
 return None

def athref(number):return 'ATH-'+str(number).zfill(6)

def youth_category(category,heading):
 text=category+' '+heading
 if re.search(r'(?:^|[^a-z])(?:[mf]?u\s*(?:[5-9]|1\d|20)\b|under\s*(?:[5-9]|1\d|20)\b|junior|children)',text,re.I):return True
 if re.fullmatch(r'(?:JM|JF|JUN)',category,re.I):return True
 band=re.fullmatch(r'[MFV]*\s*(\d{1,2})[-/](\d{1,2})',category,re.I)
 return bool(band and int(band[2])<18)

def screen(snapshot,capture_dir):
 read=lambda name:json.loads((snapshot/(name+'.json')).read_text())
 athletes,clubs,relations,accounts,receipts=[read(n) for n in ('athletes','clubs','athlete_clubs','accounts','archive_receipts')]
 resolved={int(r['athlete_id']):str(r['athlete_number']) for r in read('resolved-numbers')}
 club_map={};club_names={}
 for c in clubs:
  club_names[int(c['id'])]=c['name']
  for label in [c['name'],*re.split(r'[;|\n]',c.get('source_names') or '')]:
   key=norm(label)
   if key and key not in EMPTY_CLUBS:club_map.setdefault(key,set()).add(norm(c['name']))
 def club_key(label):
  key=norm(label)
  if key in EMPTY_CLUBS:return ''
  mapped=club_map.get(key,set())
  return next(iter(mapped)) if len(mapped)==1 else key
 additional=defaultdict(list)
 for r in relations:additional[int(r['athlete_id'])].extend([club_names.get(int(r['club_id']),''),r.get('source_name')])
 entities={};alias_index=defaultdict(set);compact_index=defaultdict(set);token_index=defaultdict(set);surname_index=defaultdict(set);surname_deletions=defaultdict(set)
 def register(number,names,entity_clubs,gender,kind,display):
  if number is None:return
  key=athref(number);entity=entities.setdefault(key,{'reference':key,'name':display,'kind':kind,'names':set(),'clubs':set(),'genders':set()})
  entity['names'].update(name_key(n) for n in names if name_key(n))
  entity['clubs'].update(c for c in map(club_key,entity_clubs) if c)
  if gender in ('M','F'):entity['genders'].add(gender)
 for a in athletes:
  # Name containers use descriptive keys; only these selected fields are read.
  aliases=[n for val in a.get('name_details',{}).values() for n in names_from(val)]
  ns=[a['display_name'],a.get('race_entry_name'),' '.join([a.get('given_name') or '',a.get('family_name') or '']),*aliases]
  cs=[club_names.get(int(a[k]),'') for k in ('club_id','second_club_id') if a.get(k)]
  cs += [a.get('source_club_name'),a.get('source_second_club_name'),*additional[int(a['id'])]]
  register(resolved.get(int(a['id']),a['athlete_number']),ns,cs,a['gender'],'athlete',a['display_name'])
 for a in accounts:
  register(a.get('athlete_number'),[a.get('name'),a.get('full_name'),a.get('display_name'),*names_from(a.get('previous_names'))],[a.get('club_or_team')],None,'account',a.get('display_name') or a.get('name'))
 for key,e in entities.items():
  for n in e['names']:
   tokens=n.split()
   alias_index[n].add(key);compact_index[n.replace(' ','')].add(key)
   if len(tokens)<2:continue
   token_index[' '.join(sorted(tokens))].add(key);surname_index[tokens[-1]].add((key,n))
 for surname in surname_index:
  for v in variants(surname):surname_deletions[v].add(surname)
 groups={};seen=set();source_rows=0
 for receipt in receipts:
  key=receipt['source_key']
  if key in seen:raise ValueError('Multiple capture versions must be selected explicitly')
  seen.add(key);capture=json.loads((capture_dir/(key+'.capture.json')).read_text())
  original=(capture_dir/(key+'.html')).read_bytes()
  if hashlib.sha256(original).hexdigest()!=receipt['html_sha256'] or len(capture['rows'])!=receipt['row_count']:raise ValueError('Local source differs from production receipt')
  for row in capture['rows']:
   source_rows+=1;n=name_key(row.get('name'))
   group_key=n or 'unreadable:'+str(row.get('name') or '')
   g=groups.setdefault(group_key,{'key':group_key,'names':Counter(),'clubs':Counter(),'clubDates':defaultdict(set),'genders':set(),'categories':set(),'dates':set(),'sameTable':Counter(),'sources':set(),'count':0,'finished':0,'examples':[],'youth':False})
   g['names'][row.get('name') or '(no name)']+=1;g['count']+=1;g['finished']+=row['status']=='finished'
   club=club_key(row.get('club'));date=row.get('date') or capture['index']['date']
   if club:g['clubs'][club]+=1;g['clubDates'][club].add(date)
   if row.get('gender') in ('M','F'):g['genders'].add(row['gender'])
   category=row.get('category') or ''
   if category and category!='None':g['categories'].add(category)
   if youth_category(category,row['distanceLabel']):g['youth']=True
   g['dates'].add(date);g['sameTable'][(key,row['tableKey'])]+=1;g['sources'].add(key)
   ex={'source':capture['sourceUrl']+'#'+row['tableKey'],'race':capture['index']['name'],'date':date,'distance':row['distanceLabel'],'bib':row.get('bib'),'sourceRow':row['sourceRow'],'status':row['status'],'time':row['original'].get('Chip Time') or row['original'].get('Gun Time') or row['original'].get('Time') or row['original'].get('Total Time') or '', 'club':row.get('club') or ''}
   g['examples'].append(ex)
 print(json.dumps({'phase':'grouped','sourceRows':source_rows,'nameGroups':len(groups),'directoryEntities':len(entities)}),flush=True)
 candidates=[]
 for key,g in groups.items():
  name=g['names'].most_common(1)[0][0];tokens=key.split();flags=[]
  if len(tokens)<2 or any(c.isdigit() for c in name) or key.startswith('unreadable:') or len(tokens[0])==1:flags.append('incomplete_or_unusual_name')
  if len(g['genders'])>1:flags.append('different_recorded_genders')
  if max(g['sameTable'].values())>1:flags.append('same_name_multiple_entries_in_one_table')
  if g['youth']:flags.append('youth_or_junior_category_recorded')
  if g['finished']==0:flags.append('no_finished_result_in_archive')
  if len(g['clubs'])>1:flags.append('multiple_clubs_across_results')
  exact=alias_index.get(key,set())|compact_index.get(key.replace(' ',''),set())
  matches={m:{'reason':'recorded_name_or_alias','kind':'exact'} for m in exact}
  if len(tokens)>=2:
   for m in token_index.get(' '.join(sorted(tokens)),set()):matches.setdefault(m,{'reason':'same_name_tokens_different_order','kind':'possible'})
   first,last=tokens[0],tokens[-1]
   surnames={last}
   if len(last)>=4:
    for v in variants(last):
     surnames.update(s for s in surname_deletions.get(v,()) if edit_one(last,s))
   for surname in surnames:
    for m,n in surname_index.get(surname,()):
     if m in matches:continue
     a=n.split();reason=compatible_first(first,a[0]);shared=bool(set(g['clubs']) & entities[m]['clubs'])
     if surname==last:
      if reason:matches[m]={'reason':reason,'kind':'possible'}
      elif first[0:1]==a[0][0:1] and shared:matches[m]={'reason':'same_initial_surname_and_club','kind':'possible'}
     elif reason in ('same_first_name','possible_nickname'):
      matches[m]={'reason':'possible_surname_spelling','kind':'possible'}
  match_list=[]
  for m,detail in matches.items():
   e=entities[m];shared=sorted(set(g['clubs']) & e['clubs']);conflict=bool(g['genders'] and e['genders'] and g['genders'].isdisjoint(e['genders']))
   match_list.append({'reference':m,'name':e['name'],'reason':detail['reason'],'matchType':detail['kind'],'sharedClubs':shared,'genderConflict':conflict,'url':'https://athrecs.com/admin/athletes/'+m})
  match_list.sort(key=lambda m:(m['matchType']!='exact',not m['sharedClubs'],m['genderConflict'],m['reference']))
  status='existing_name' if exact else 'possible_existing' if matches else 'likely_missing'
  if exact and all(m['genderConflict'] for m in match_list if m['matchType']=='exact'):flags.append('existing_name_gender_conflict')
  if len(exact)>1:flags.append('multiple_existing_records_with_same_name')
  examples=sorted(g['examples'],key=lambda r:(r['date'],r['race'],r['sourceRow']),reverse=True)
  # Prefer distinct source pages in the initial review, preserving a locator for every example.
  picked=[];used=set()
  for ex in examples:
   if ex['source'] not in used:picked.append(ex);used.add(ex['source'])
   if len(picked)>=3:break
  repeated=max((len(ds) for ds in g['clubDates'].values()),default=0)>=2
  identity_flags=set(flags)-{'multiple_clubs_across_results'}
  priority=status=='likely_missing' and repeated and len(g['clubs'])==1 and len(g['dates'])>=2 and g['finished']>=2 and not identity_flags
  candidates.append({'id':'TRT-'+hashlib.sha256(key.encode()).hexdigest()[:12],'name':name,'normalizedName':key,'nameVariants':list(g['names']),'status':status,'priority':priority,'resultCount':g['count'],'finishedCount':g['finished'],'sourcePageCount':len(g['sources']),'distinctDates':len(g['dates']),'firstDate':min(g['dates']),'latestDate':max(g['dates']),'clubs':dict(g['clubs']),'genders':sorted(g['genders']),'categories':sorted(g['categories']),'flags':flags,'possibleProfiles':match_list,'examples':picked})
 # Do not silently turn variations inside the archive into different confirmed people.
 by_surname=defaultdict(list)
 for g in candidates:
  t=g['normalizedName'].split()
  if len(t)>=2:by_surname[t[-1]].append(g)
 for gs in by_surname.values():
  for i,a in enumerate(gs):
   if a['status']!='likely_missing':continue
   related=[]
   for b in gs:
    if a is b:continue
    af=a['normalizedName'].split()[0];bf=b['normalizedName'].split()[0]
    reason=compatible_first(af,bf)
    shared=bool(set(a['clubs'])&set(b['clubs']))
    if reason and (reason!='initial_and_surname' or shared):related.append({'id':b['id'],'name':b['name'],'reason':reason})
   if related:
    a['flags'].append('possible_name_variation_in_archive');a['relatedSourceNames']=related;a['priority']=False
 candidates.sort(key=lambda g:(not g['priority'],g['status']!='likely_missing',-g['resultCount'],g['name'].casefold()))
 scope=read('archive-scope') if (snapshot/'archive-scope.json').exists() else {}
 summary={'checkedAt':datetime.now(timezone.utc).isoformat(),'directorySnapshotAt':read('snapshot')['snapshotAt'],'athleteRecords':len(athletes),'accountsChecked':len(accounts),'directoryEntities':len(entities),'sourcePages':len(receipts),'sourceRows':source_rows,'sourceNameGroups':len(candidates),'statusCounts':dict(Counter(g['status'] for g in candidates)),'statusResultCounts':dict(Counter({s:sum(g['resultCount'] for g in candidates if g['status']==s) for s in ('likely_missing','possible_existing','existing_name')})),'priorityCandidates':sum(g['priority'] for g in candidates),'heldPagesExcluded':scope.get('heldPages'),'heldRowsExcluded':scope.get('heldRows'),'profilesCreated':0,'profilesPublished':0,'matchesApproved':0,'methodVersion':1}
 return {'summary':summary,'groups':candidates}

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--snapshot',type=Path,required=True);p.add_argument('--captures',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
 output=screen(a.snapshot,a.captures);a.output.write_text(json.dumps(output,ensure_ascii=False,separators=(',',':')))
 print(json.dumps(output['summary']),flush=True)
