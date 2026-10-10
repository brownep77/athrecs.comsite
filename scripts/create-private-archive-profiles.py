"""Supervised creation of provisional private profiles from compared TRT captures.

Snapshot -> prepare -> apply. Never publishes, claims, overwrites an athlete, or
inserts canonical results. Use a copied production branch to validate first.
Credentials, plans, snapshots and receipts must remain outside source control.
"""
import argparse
import concurrent.futures
import datetime as dt
import hashlib
import importlib.util
import json
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('finder', ROOT/'scripts/find-archive-athlete-candidates.py')
finder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(finder)

QUERIES = {
 'athletes': """SELECT a.id,a.slug,a.display_name,a.given_name,a.family_name,a.gender,a.club_id,a.second_club_id,a.source_club_name,a.source_second_club_name,a.race_entry_name,a.parent_athlete_id,a.profile_type,a.profile_visibility,a.source_url,a.athrecs_id,
 (select min(number) from athlete_identifiers ai where ai.athlete_id=a.id) as athlete_number,
 jsonb_build_object('aliases',a.profile_details->'aliases','nameAliases',a.profile_details->'nameAliases','previous_names',a.profile_details->'previous_names','research_name_variants',a.profile_details->'research_name_variants','canonicalName',a.profile_details->'canonicalName','sourceName',a.profile_details->'sourceName','requestedName',a.profile_details->'requestedName') as name_details
 FROM athletes a ORDER BY a.id""",
 'clubs': 'SELECT id,name,source_names FROM clubs ORDER BY id',
 'athlete_clubs': 'SELECT athlete_id,club_id,source_name FROM athlete_clubs ORDER BY athlete_id,club_id',
 'accounts': '''SELECT i.number as athlete_number,u.name,p.full_name,p.display_name,p.previous_names,p.club_or_team,(select jsonb_agg(l.athlete_id) from athlete_account_links l where l.user_id=u.id and l.status='active') as linked_athlete_ids FROM "user" u LEFT JOIN athlete_private_profiles p on p.user_id=u.id LEFT JOIN athlete_identifiers i on i.user_id=u.id ORDER BY i.number''',
 'resolved-numbers': 'SELECT athlete_id,athlete_number FROM athlete_resolved_ids ORDER BY athlete_id',
 'archive_receipts': """SELECT id,source_key,row_count,html_sha256,payload_hash,run_id,approval_id FROM result_archive_source_captures WHERE source_check='compared' AND provider='Total Race Timing' AND payload->>'publication'='staff_only' ORDER BY source_key""",
 'existing-locators': """SELECT DISTINCT r.athlete_id,r.bib,u.source_url FROM results r CROSS JOIN LATERAL (SELECT r.source_url UNION SELECT s.source_url FROM result_source_references s WHERE s.result_id=r.id) u WHERE u.source_url LIKE 'https://totalracetiming.co.uk/raceresults/%' AND nullif(r.bib,'') IS NOT NULL ORDER BY r.athlete_id,u.source_url,r.bib""",
}

def dump(path, value):
 path.write_text(json.dumps(value, ensure_ascii=False, separators=(',',':')))

def sha(value):
 return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def connection(path, branch):
 cfg=json.loads(path.read_text())
 if cfg['branchId']!=branch:raise ValueError('Explicit target branch differs from connection')
 uri=cfg['databaseUrl'];host=urllib.parse.urlsplit(uri).hostname
 if not host or not host.endswith('.neon.tech'):raise ValueError('Expected Neon connection')
 def query(statements, readonly=False):
  qs=[{'query':q,'params':p} if isinstance(q,str) else q for q,p in statements]
  req=urllib.request.Request('https://'+host.replace('-pooler','')+'/sql',data=json.dumps({'queries':qs}).encode(),headers={
   'Neon-Connection-String':uri,'Content-Type':'application/json',
   'Neon-Batch-Isolation-Level':'RepeatableRead' if readonly else 'ReadCommitted',
   'Neon-Batch-Read-Only':'true' if readonly else 'false'})
  try:
   with urllib.request.urlopen(req,timeout=60) as resp:result=json.loads(resp.read())
  except urllib.error.HTTPError as exc:
   # Do not echo SQL params, private rows or connection strings.
   try:details=json.loads(exc.read());message=details.get('message','');code=details.get('code','')
   except Exception:message='Database request rejected';code=''
   raise RuntimeError(f'HTTP {exc.code} SQLSTATE {code}: {message[:250]}') from None
  if len(result.get('results',[]))!=len(qs):raise ValueError('Unexpected transaction response')
  return [r['rows'] for r in result['results']]
 return cfg,query

def fingerprint_sql():
 # Exclude only profiles made by this approved batch. Everything used for
 # duplicate screening is locked and hashed again immediately before inserts.
 parts=[]
 for table,key,where in [
  ('athletes','id',"WHERE profile_details #>> '{archiveCreation,batchId}' IS DISTINCT FROM $1"),
  ('clubs','id',''),('athlete_clubs','athlete_id,club_id',''),
  ('"user"','id',''),('athlete_private_profiles','user_id',''),
  ('athlete_account_links','athlete_id,user_id',''),('results','id',''),
  ('result_source_references','result_id,source_url','')]:
  parts.append(f"(select coalesce(md5(string_agg(md5(row_to_json(t)::text),'' order by {key})),md5('')) from {table} t {where})")
 return 'SELECT md5('+" || ".join(parts)+') AS fingerprint'

def snapshot(args):
 cfg,query=connection(args.connection,args.confirm_branch)
 approval=json.loads(args.approval.read_text());args.output.mkdir(parents=True,exist_ok=True)
 if cfg['projectId']!=approval['projectId']:raise ValueError('Wrong project')
 data=query([(q,[]) for q in QUERIES.values()]+[(fingerprint_sql(),[approval['batchId']])],True)
 for name,rows in zip(QUERIES,data):dump(args.output/(name+'.json'),rows)
 info={'snapshotAt':dt.datetime.now(dt.timezone.utc).isoformat(),'projectId':cfg['projectId'],'branchId':cfg['branchId'],'fingerprint':data[-1][0]['fingerprint'],'counts':{k:len(v) for k,v in zip(QUERIES,data)}}
 dump(args.output/'snapshot.json',info);print(json.dumps(info),flush=True)

def extra_flags(group, rows, groups, surname_deletions, locators):
 flags=[];name=group['normalizedName'];first,last=name.split()[0],name.split()[-1]
 for v in finder.variants(last):
  for other in surname_deletions.get(v,[]):
   ot=other['normalizedName'].split()
   if other['id']!=group['id'] and finder.edit_one(last,ot[-1]) and finder.compatible_first(first,ot[0]):
    flags.append('possible_archive_surname_variant');break
 # Multiple pages on the same date could be different runners with one name.
 days=defaultdict(set);lo=-999999;hi=999999
 for capture,row in rows:
  date=row.get('date') or capture['index']['date'];days[date].add(capture['sourceKey'])
  url=capture['sourceUrl'];bib=str(row.get('bib') or '')
  if bib and (url,bib) in locators:flags.append('source_bib_already_linked_to_profile')
  cat=row.get('category') or ''
  if finder.youth_category(cat,row['distanceLabel']) or re.search(r'(?:junior|[MF]J\b|[MF]U(?:0?\d|1\d)\b)',cat,re.I):flags.append('youth_source_category')
  # Explicit numeric age bands only. Intervals are transient consistency
  # checks, never stored as a derived DOB or exact age. Allow a full year
  # for events using season/year-end classifications.
  match=re.fullmatch(r'[MF]\s*(\d{2})[-/](\d{2})(?:/M\+?)?',cat)
  if match:
   low,high=map(int,match.groups())
   if high<low:flags.append('invalid_source_age_band')
   else:
    day=dt.date.fromisoformat(date).toordinal()
    lo=max(lo,day-int((high+2)*366));hi=min(hi,day-int(max(0,low-1)*365))
  if not row['original'].get('Forename') or not row['original'].get('Surname'):flags.append('missing_source_name_components')
 if any(len(v)>1 for v in days.values()):flags.append('different_races_same_day')
 if lo>hi:flags.append('inconsistent_explicit_age_bands')
 return sorted(set(flags))

def prepare(args):
 approval=json.loads(args.approval.read_text());screen=finder.screen(args.snapshot,args.captures)
 dump(args.output/'candidates.json',screen)
 selected={g['normalizedName']:g for g in screen['groups'] if g['priority']}
 rows=defaultdict(list);receipts=json.loads((args.snapshot/'archive_receipts.json').read_text());receipt_by={r['source_key']:r for r in receipts}
 for receipt in receipts:
  capture=json.loads((args.captures/(receipt['source_key']+'.capture.json')).read_text())
  for row in capture['rows']:
   key=finder.name_key(row.get('name'))
   if key in selected:rows[key].append((capture,row))
 surname_deletions=defaultdict(list)
 for g in screen['groups']:
  tokens=g['normalizedName'].split()
  if len(tokens)>1:
   for v in finder.variants(tokens[-1]):surname_deletions[v].append(g)
 locators={(r['source_url'].split('#')[0].rstrip('/'),str(r['bib'])) for r in json.loads((args.snapshot/'existing-locators.json').read_text())}
 held=[];eligible=[]
 for key,g in selected.items():
  flags=extra_flags(g,rows[key],screen['groups'],surname_deletions,locators)
  if flags:held.append({'candidateId':g['id'],'name':g['name'],'flags':flags})
  else:eligible.append(g)
 used={c['sourceKey'] for g in eligible for c,r in rows[g['normalizedName']]}
 def validate(key):
  receipt=receipt_by[key]
  p=subprocess.run(['node',str(ROOT/'scripts/prepare-private-result-capture.mjs'),str(args.captures/(key+'.capture.json')),receipt['run_id'],receipt['approval_id']],capture_output=True,text=True,check=True,cwd=ROOT)
  check=json.loads(p.stdout)
  if check['action']!='insert':raise ValueError('Strict source comparison failed: '+key)
  return {'sourceKey':key,'rows':check['rows'],'strictComparison':'passed','receipt':receipt}
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:checks=list(pool.map(validate,sorted(used)))
 profiles=[]
 for g in eligible:
  pairs=sorted(rows[g['normalizedName']],key=lambda p:((p[1].get('date') or p[0]['index']['date']),p[0]['sourceKey'],p[1]['sourceRow']),reverse=True)
  capture,row=pairs[0];performances=[]
  for c,r in pairs:
   date=r.get('date') or c['index']['date'];o=r['original'];source=c['sourceUrl']+'#'+r['tableKey']
   rawtime=o.get('Chip Time') or o.get('Gun Time') or o.get('Time') or o.get('Total Time') or ''
   performance=rawtime if r['status']=='finished' else r['status'].upper()
   performances.append({'year':int(date[:4]),'date':date,'sourceDate':date,'ageGroup':'' if r.get('category') in (None,'None') else r['category'],
    'discipline':r['distanceLabel'],'performance':performance,'wind':'','place':o.get('Position') or '',
    'venue':c['index'].get('location') or '', 'meeting':c['index']['name'],'sourceUrls':[source],
    'labels':['Private archive','Identity unreviewed'], 'providerName':'Total Race Timing','verificationStatus':'unverified',
    'notes':f"Provisional source grouping; identity not confirmed. Bib {r.get('bib') or 'not supplied'}; source row {r['sourceRow']}. Club recorded for this race: {r.get('club') or 'not supplied'}.",
    'archiveReference':{'captureId':receipt_by[c['sourceKey']]['id'],'sourceKey':c['sourceKey'],'tableKey':r['tableKey'],'sourceRow':r['sourceRow'],'bib':r.get('bib'),'htmlSha256':c['htmlSha256'],'status':r['status'],'original':o}})
  creation={'batchId':approval['batchId'],'candidateId':g['id'],'approvedBy':approval['approvedBy'],'approvedAt':approval['approvedAt'],
    'instruction':approval['instruction'],'basis':'Repeated source name and one recorded club across different dates; conservative duplicate screening; identity unreviewed.',
    'profileIdentityVerified':False,'sourceRowsCompared':True,'resultCount':len(performances),'sourceKeys':sorted({c['sourceKey'] for c,r in pairs})}
  profiles.append({'candidateId':g['id'],'slug':g['normalizedName'].replace(' ','-')+'-'+g['id'].lower(),
   'displayName':g['name'],'givenName':row['original']['Forename'],'familyName':row['original']['Surname'],
   'gender':g['genders'][0] if len(g['genders'])==1 else 'U','sourceClubName':next((r.get('club') for c,r in pairs if r.get('club')),''),
   'sourceUrl':capture['sourceUrl']+'#'+row['tableKey'],'capturedAt':max(c['capturedAt'] for c,r in pairs),
   'years':sorted({p['year'] for p in performances}), 'performances':performances,
   'details':{'archiveCreation':creation,'aliases':g['nameVariants'],'athlete_verified':False,'identity_review_status':'provisional_source_profile','currentClubAssociationConfirmed':False}})
 plan={'approval':approval,'snapshot':json.loads((args.snapshot/'snapshot.json').read_text()),'strictChecks':checks,'held':held,'profiles':profiles,
  'summary':{'priorityCandidates':len(selected),'eligibleProfiles':len(profiles),'heldPriorityCandidates':len(held),'sourceHistoryRows':sum(len(p['performances']) for p in profiles),'strictPagesChecked':len(checks),'holdReasons':dict(Counter(f for h in held for f in h['flags']))}}
 plan['planHash']=sha(plan);dump(args.output/'plan.json',plan);print(json.dumps(plan['summary']),flush=True)

INSERT_SQL="""WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb)),
created AS (
 INSERT INTO athletes(slug,display_name,given_name,family_name,gender,source_club_name,city,county,country,bio,source_url,profile_type,profile_visibility,profile_roles,profile_details,profile_source_checked_at)
 SELECT p->>'slug',p->>'displayName',p->>'givenName',p->>'familyName',p->>'gender',p->>'sourceClubName',NULL,'','','',p->>'sourceUrl','Athlete','private','',p->'details',now() FROM incoming
 ON CONFLICT(slug) DO NOTHING RETURNING id,slug,profile_details
), histories AS (
 INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
 SELECT a.id,'Total Race Timing','athrecs-archive:'||(p->>'candidateId'),p->>'sourceUrl',(p->>'capturedAt')::timestamptz,false,ARRAY[]::int[],ARRAY(SELECT jsonb_array_elements_text(p->'years')::int),p->'performances',NULL
 FROM created a JOIN incoming ON a.slug=p->>'slug' RETURNING athlete_id
), audit AS (
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'create_private_archive_profile','athlete',id::text,profile_details->'archiveCreation','Owner requested missing profiles; private and unclaimed; source histories unverified.' FROM created RETURNING id
) SELECT (SELECT count(*) FROM created)::int AS profiles,(SELECT count(*) FROM histories)::int AS histories,(SELECT count(*) FROM audit)::int AS audits"""

VERIFY_SQL="""WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb))
SELECT a.id,a.slug,a.display_name,i.athlete_number,jsonb_array_length(h.performances) AS result_count
FROM incoming JOIN athletes a ON a.slug=p->>'slug'
JOIN athlete_resolved_ids i ON i.athlete_id=a.id
JOIN athlete_source_histories h ON h.athlete_id=a.id AND h.provider='Total Race Timing' AND h.external_id='athrecs-archive:'||(p->>'candidateId')
WHERE a.profile_visibility='private' AND a.profile_type='Athlete' AND a.profile_details=p->'details' AND a.display_name=p->>'displayName'
AND a.given_name=p->>'givenName' AND a.family_name=p->>'familyName' AND a.gender=p->>'gender'
AND a.date_of_birth IS NULL AND a.club_id IS NULL AND a.parent_athlete_id IS NULL
AND h.performances=p->'performances' AND h.published_at IS NULL AND h.complete=false
AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
ORDER BY a.id"""

def apply(args):
 plan=json.loads(args.plan.read_text());expected=plan.pop('planHash')
 if sha(plan)!=expected:raise ValueError('Plan changed since preparation')
 approval=plan['approval'];cfg,query=connection(args.connection,args.confirm_branch)
 if cfg['projectId']!=approval['projectId']:raise ValueError('Project differs from approval')
 if not args.review and cfg['branchId']!=approval['branchId']:raise ValueError('Production branch differs from approval')
 if args.review and cfg['branchId']==approval['branchId']:raise ValueError('Review cannot use production')
 profiles=plan['profiles'][:args.limit] if args.limit else plan['profiles'];receipts=[]
 for start in range(0,len(profiles),100):
  batch=profiles[start:start+100];payload=json.dumps(batch,ensure_ascii=False)
  statements=[('SET LOCAL lock_timeout=\'5s\'',[]),('SET LOCAL statement_timeout=\'45s\'',[]),
   ('LOCK TABLE athletes,clubs,athlete_clubs,"user",athlete_private_profiles,athlete_account_links,results,result_source_references,athlete_source_histories,result_archive_source_captures,result_archive_capture_approvals IN SHARE ROW EXCLUSIVE MODE',[]),
   ('CREATE TEMP TABLE archive_profile_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),
   ('INSERT INTO archive_profile_guard SELECT fingerprint=$2 FROM ('+fingerprint_sql()+') f',[approval['batchId'],plan['snapshot']['fingerprint']])]
  # Confirm original evidence snapshots and their approvals still exist.
  capture_ids={p['archiveReference']['captureId'] for b in batch for p in b['performances']}
  evidence=[c['receipt'] for c in plan['strictChecks'] if c['receipt']['id'] in capture_ids]
  statements.append(("INSERT INTO archive_profile_guard SELECT count(*)=jsonb_array_length($1::jsonb) FROM jsonb_array_elements($1::jsonb) e JOIN result_archive_source_captures c ON c.id=(e->>'id')::bigint JOIN result_archive_capture_approvals a ON a.id=c.approval_id WHERE c.html_sha256=e->>'html_sha256' AND c.payload_hash=e->>'payload_hash' AND c.row_count=(e->>'row_count')::int AND c.source_check='compared' AND c.payload->>'publication'='staff_only' AND a.scope='staff_only' AND a.revoked_at IS NULL",[json.dumps(evidence)]))
  statements.extend([(INSERT_SQL,[payload]),('INSERT INTO archive_profile_guard SELECT count(*)=jsonb_array_length($1::jsonb) FROM ('+VERIFY_SQL+') v',[payload]),(VERIFY_SQL,[payload])])
  result=query(statements)
  if len(result[-1])!=len(batch):raise ValueError('Incomplete transaction receipt')
  receipts.extend(result[-1]);dump(args.receipts,{'batchId':approval['batchId'],'branchId':cfg['branchId'],'planHash':expected,'profiles':receipts})
  print(json.dumps({'branchId':cfg['branchId'],'processed':len(receipts),'insertedThisBatch':result[-3][0]['profiles']}),flush=True)

if __name__=='__main__':
 parser=argparse.ArgumentParser();sub=parser.add_subparsers(dest='action',required=True)
 s=sub.add_parser('snapshot')
 for flag in ['connection','approval','output']:s.add_argument('--'+flag,type=Path,required=True)
 s.add_argument('--confirm-branch',required=True)
 p=sub.add_parser('prepare')
 for flag in ['snapshot','captures','approval','output']:p.add_argument('--'+flag,type=Path,required=True)
 a=sub.add_parser('apply')
 for flag in ['connection','plan','receipts']:a.add_argument('--'+flag,type=Path,required=True)
 a.add_argument('--confirm-branch',required=True);a.add_argument('--review',action='store_true');a.add_argument('--limit',type=int)
 args=parser.parse_args();globals()[args.action](args)
