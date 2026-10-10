"""Apply a fully screened WMM plan to an explicitly named Neon branch.

Requires --review for rehearsal or --publish for the owner-authorized production
publication. No existing athlete, result, source history, account or claim is
updated. Replays skip stable WMM athlete IDs. Source observations are archived.
"""
import argparse, collections, gzip, hashlib, importlib.util, json, pathlib, time, uuid
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
base=load('base','create-private-archive-profiles.py');prep=load('prep','prepare-wmm-profiles.py')
BATCH=prep.BATCH;PROVIDER=prep.PROVIDER;APPROVAL=BATCH+'-owner';RUN=str(uuid.uuid5(uuid.NAMESPACE_URL,prep.SOURCE+'/'+BATCH))
PROD='br-flat-unit-aydbwlfk';PROJECT='lively-resonance-04577945'
ATH="""SELECT a.id,a.slug,a.display_name,a.given_name,a.family_name,a.race_entry_name,a.gender,
jsonb_strip_nulls(jsonb_build_object('aliases',a.profile_details->'aliases','nameAliases',a.profile_details->'nameAliases','previous_names',a.profile_details->'previous_names','research_name_variants',a.profile_details->'research_name_variants','canonicalName',a.profile_details->'canonicalName','sourceName',a.profile_details->'sourceName','requestedName',a.profile_details->'requestedName')) name_details
FROM athletes a WHERE a.profile_details #>> '{archiveCreation,batchId}' IS DISTINCT FROM '"""+BATCH+"' AND ($1::bigint=0 OR a.id<=$1) ORDER BY a.id"
ACCOUNTS=base.QUERIES['accounts']
RES="SELECT r.id,r.athlete_id,e.name event_title,extract(year FROM d.event_date)::integer result_year,r.bib bibnumber,r.finish_time_seconds,r.chip_time_seconds,r.gun_time_seconds FROM results r JOIN editions d ON d.id=r.edition_id JOIN events e ON e.id=d.event_id WHERE d.event_date BETWEEN '2025-01-01' AND '2026-12-31' AND nullif(r.bib,'') IS NOT NULL ORDER BY r.id"
FP="WITH directory AS ("+ATH+"), accounts AS ("+ACCOUNTS+"), performances AS ("+RES+") SELECT md5((SELECT coalesce(string_agg(md5(to_jsonb(d)::text),'' order by id),'') FROM directory d)||(SELECT coalesce(string_agg(md5(to_jsonb(u)::text),'' order by athlete_number),'') FROM accounts u)||(SELECT coalesce(string_agg(md5(to_jsonb(r)::text),'' order by id),'') FROM performances r)) fingerprint"

def register(index,entity,a):
    ident='athrecs:'+str(a['id']);entity[ident]={'id':a['id'],'name':a['display_name'],'slug':a['slug']}
    names=[a['display_name'],a.get('race_entry_name'),' '.join([a.get('given_name') or '',a.get('family_name') or ''])]
    for val in (a.get('name_details') or {}).values():names.extend(prep.finder.names_from(val))
    prep.add(index,ident,names)

def save_receipt(path,value):
    temp=path.with_suffix('.writing');temp.write_text(json.dumps(value,ensure_ascii=False,indent=2));temp.replace(path)

class LiveDirectory:
    def __init__(self,query):self.query=query;self.maxid=0;self.fingerprint=None;self.reload()
    def reload(self):
        athletes,accounts,results,fp=self.query([(ATH,[0]),(ACCOUNTS,[]),(RES,[]),(FP,[0])],True)
        self.index=collections.defaultdict(set);self.entities={};self.result_index=collections.defaultdict(set)
        for a in athletes:register(self.index,self.entities,a)
        for i,a in enumerate(accounts):
            ident='account:'+str(a.get('athlete_number') or i);self.entities[ident]={'name':a.get('name')}
            prep.add(self.index,ident,[a.get('name'),a.get('full_name'),a.get('display_name'),*prep.finder.names_from(a.get('previous_names'))])
        for r in results:
            for key in prep.result_keys(r):self.result_index[key].add('athrecs:'+str(r['athlete_id']))
        self.maxid=max((int(a['id']) for a in athletes),default=0);self.fingerprint=fp[0]['fingerprint']
    def refresh(self):
        delta=ATH.replace('($1::bigint=0 OR a.id<=$1)','a.id>$1')
        old,new,fp=self.query([(FP,[self.maxid]),(delta,[self.maxid]),(FP,[0])],True)
        if old[0]['fingerprint']!=self.fingerprint:self.reload();return
        for a in new:register(self.index,self.entities,a)
        self.maxid=max([self.maxid,*[int(a['id']) for a in new]])
        self.fingerprint=fp[0]['fingerprint']

INSERT="""WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb)),
created AS (
 INSERT INTO athletes(slug,display_name,given_name,family_name,gender,city,county,country,nation,bio,source_url,profile_type,profile_visibility,profile_roles,profile_details,profile_source_checked_at)
 SELECT p->>'slug',p->>'displayName',p->>'givenName',p->>'familyName',p->>'gender',NULL,'','',nullif(p->>'nation',''),'',p->>'sourceUrl','Athlete','public','',p->'details',now()
 FROM incoming WHERE NOT EXISTS (SELECT 1 FROM athlete_source_histories h WHERE h.provider=$2 AND h.external_id=p->>'externalId')
 ON CONFLICT(slug) DO NOTHING RETURNING id,slug,profile_details
), histories AS (
 INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
 SELECT a.id,$2,p->>'externalId',p->>'sourceUrl',(p->>'capturedAt')::timestamptz,false,ARRAY[]::integer[],ARRAY(SELECT jsonb_array_elements_text(p->'years')::integer),p->'performances',now()
 FROM created a JOIN incoming ON a.slug=p->>'slug' RETURNING athlete_id,external_id
), audits AS (
 INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,after_value,note)
 SELECT 'paul@athrecs.com','athlete.history_admin_published','athlete_source_history',$2||':'||h.external_id,
 jsonb_build_object('athleteId',h.athlete_id,'batchId',$3::text,'sourceCompared',true,'identityVerified',false,'sourceCaptureId',$4::bigint),
 'Owner requested WMM athlete profiles and source results with duplicate checks; retained source year only; unclaimed provisional identity; existing profiles unchanged.'
 FROM histories h RETURNING id
) SELECT (SELECT count(*) FROM created)::int profiles,(SELECT count(*) FROM histories)::int histories,(SELECT count(*) FROM audits)::int audits,
 (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'slug',slug)),'[]'::jsonb) FROM created) created"""

VERIFY="""WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb))
SELECT count(*)::integer count FROM incoming JOIN athletes a ON a.slug=p->>'slug'
JOIN athlete_source_histories h ON h.athlete_id=a.id AND h.provider=$2 AND h.external_id=p->>'externalId'
WHERE a.profile_details #>> '{archiveCreation,batchId}'=$3 AND a.display_name=p->>'displayName'
AND a.profile_visibility='public' AND a.date_of_birth IS NULL AND a.country='' AND a.county=''
AND h.performances=p->'performances' AND h.published_at IS NOT NULL AND NOT h.complete
AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)"""

def setup(query,files):
    evidence={'requestedBy':'Paul Browne','requestedAt':'2026-10-10T11:02:14Z','instruction':'Add all athletes and source results for both genders and age categories; check for duplicates.',
      'sourceUrl':prep.SOURCE,'period':['2025-10-01','2026-09-30'],'providerPermissionClaimed':False,'publicProfilesAuthorizedByOwner':True}
    inventory=[{'sourceKey':p.name,'sourceUrl':prep.SOURCE} for p in files]
    query([("INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,scope,evidence) VALUES($1,$2,'Paul Browne','owner_private_import','staff_only',$3::jsonb) ON CONFLICT(id) DO NOTHING",[APPROVAL,PROVIDER,json.dumps(evidence)]),
      ("INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory,status) VALUES($1::uuid,$2,$3,$4::jsonb,'processing') ON CONFLICT(id) DO NOTHING",[RUN,APPROVAL,PROVIDER,json.dumps(inventory)])])

def capture(query,path,plan):
    raw=gzip.decompress(path.read_bytes());c=json.loads(raw);digest=hashlib.sha256(raw).hexdigest()
    payload={'format':'wmm-public-json-v1','contentType':'application/json','publication':'staff_only','rows':c['results'],'rankings':c['rankings'],'gender':c['gender'],'ageGroup':c['ageGroup'],'edition':8,
      'review':plan['held']}
    encoded=json.dumps(payload,separators=(',',':'),ensure_ascii=False);ph=hashlib.sha256(encoded.encode()).hexdigest()
    sql="""INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
    VALUES($1::uuid,$2,$3,$4,$5,$6,$7,decode($8,'hex'),$9::jsonb,$10,'compared',$11::jsonb,$12::timestamptz)
    ON CONFLICT(provider,source_key,payload_hash) DO UPDATE SET last_seen_at=now() RETURNING id"""
    audit={'method':'Public JSON source fields independently compared by source athlete ID, result ID, source year, event label and parsed finish time. Uncertain identities and source conflicts held.',
      'eligibleProfiles':len(plan['profiles']),'heldProfiles':len(plan['held']),'claim':'Source observation comparison; not independent identity verification'}
    return query([(sql,[RUN,APPROVAL,PROVIDER,path.name,prep.SOURCE,ph,digest,gzip.compress(raw).hex(),encoded,len(c['results']),json.dumps(audit),c['capturedAt']])])[0][0]['id']

def apply(args):
    cfg,query=base.connection(args.connection,args.confirm_branch)
    if cfg['projectId']!=PROJECT:raise ValueError('Unexpected project')
    if args.review and cfg['branchId']==PROD:raise ValueError('Review may not write production')
    if not args.review and (not args.publish or cfg['branchId']!=PROD):raise ValueError('Production requires explicit --publish and production branch')
    if not args.review and not args.manifest:raise ValueError('Production requires the independently validated plan manifest')
    manifest=json.loads(args.manifest.read_text()) if args.manifest else None
    summary=json.loads((args.plan/'summary.json').read_text())
    if len(summary['coverage'])!=18:raise ValueError('Incomplete source coverage')
    files=sorted(args.captures.glob('*.json.gz'));setup(query,files)
    part,total=map(int,args.partition.split('/'))
    if total<1 or not 0<=part<total:raise ValueError('Invalid partition')
    files=[path for i,path in enumerate(files) if i%total==part]
    directory=LiveDirectory(query);totals=collections.Counter();examples=[];fresh_holds=[]
    already=query([('SELECT external_id FROM athlete_source_histories WHERE provider=$1',[PROVIDER])],True)[0]
    known={r['external_id'] for r in already}
    selected=0
    for path in files:
        planpath=args.plan/path.name.replace('.json.gz','.plan.json.gz')
        if manifest and hashlib.sha256(planpath.read_bytes()).hexdigest()!=manifest['sha256'].get(planpath.name):raise ValueError('Plan changed after independent source comparison')
        with gzip.open(planpath,'rt') as f:plan=json.load(f)
        for profile in plan['profiles']:profile['slug']=prep.profile_slug(profile['displayName'],profile['externalId'])
        if args.limit and selected>=args.limit:break
        capid=capture(query,path,plan);totals['captured_pages']+=1
        selected_profiles=plan['profiles'][:max(0,args.limit-selected)] if args.limit else plan['profiles']
        selected+=len(selected_profiles)
        profiles=[p for p in selected_profiles if p['externalId'] not in known]
        totals['previously_imported']+=len(selected_profiles)-len(profiles)
        for start in range(0,len(profiles),args.batch_size):
            original=profiles[start:start+args.batch_size]
            for attempt in range(6):
                directory.refresh();batch=[];holds=[]
                for p in original:
                    matches=prep.matching(directory.index,p['details']['aliases'])
                    for performance in p['performances']:
                        for key in prep.result_keys(performance['archiveReference']['original']):matches.update(directory.result_index.get(key,()))
                    if matches:holds.append({'sourceAthleteId':p['externalId'],'name':p['displayName'],'reason':'New or changed AthRecs name/alias since global screening','candidates':sorted(matches)[:20]});continue
                    batch.append(p)
                if not batch:fresh_holds.extend(holds);totals['newly_held']+=len(holds);break
                data=json.dumps(batch,ensure_ascii=False,separators=(',',':'))
                queries=[("SET LOCAL lock_timeout='8s'",[]),("SET LOCAL statement_timeout='55s'",[]),
                  ('LOCK TABLE athletes,"user",athlete_private_profiles,athlete_account_links,results,editions,events IN SHARE ROW EXCLUSIVE MODE',[]),
                  ('CREATE TEMP TABLE wmm_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),
                  ('INSERT INTO wmm_guard SELECT fingerprint=$2 FROM ('+FP+') f',[0,directory.fingerprint]),
                  ('INSERT INTO wmm_guard SELECT EXISTS(SELECT 1 FROM result_archive_capture_approvals WHERE id=$1 AND revoked_at IS NULL)',[APPROVAL]),
                  (INSERT,[data,PROVIDER,BATCH,capid]),
                  ('INSERT INTO wmm_guard SELECT count=jsonb_array_length($4::jsonb) FROM ('+VERIFY+') v',[data,PROVIDER,BATCH,data]),
                  (VERIFY,[data,PROVIDER,BATCH])]
                try:r=query(queries)
                except RuntimeError as e:
                    if ('wmm_guard' in str(e) or 'lock timeout' in str(e)) and attempt<5:time.sleep(1);continue
                    raise
                receipt=r[-3][0]
                if receipt['profiles']!=len(batch) or receipt['histories']!=len(batch) or receipt['audits']!=len(batch):raise ValueError('Unexpected replay/concurrency receipt; inspect before continuation')
                known.update(p['externalId'] for p in batch);totals['created']+=len(batch);totals['results']+=sum(len(p['performances']) for p in batch);totals['newly_held']+=len(holds);fresh_holds.extend(holds)
                if len(examples)<12:examples.extend(receipt['created'][:12-len(examples)])
                save_receipt(args.receipt,{'branchId':cfg['branchId'],'batchId':BATCH,'counts':dict(totals),'examples':examples,'newHolds':fresh_holds})
                print(json.dumps({'phase':'committed','branch':cfg['branchId'],**totals}),flush=True)
                break
    final={'branchId':cfg['branchId'],'batchId':BATCH,'counts':dict(totals),'examples':examples,'newHolds':fresh_holds,'reviewLimited':bool(args.limit)}
    save_receipt(args.receipt,final)
    if not args.limit and total==1:
        query([("UPDATE result_archive_capture_runs SET status='completed',summary=$2::jsonb,updated_at=now() WHERE id=$1::uuid",[RUN,json.dumps({'planSummary':summary['summary'],'applied':dict(totals),'heldReviewCount':summary['summary']['held_profiles']+totals['newly_held']})])])
    print(json.dumps(final['counts']),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser()
    for arg in ['connection','captures','plan','receipt']:p.add_argument('--'+arg,type=pathlib.Path,required=True)
    p.add_argument('--manifest',type=pathlib.Path)
    p.add_argument('--confirm-branch',required=True);p.add_argument('--review',action='store_true');p.add_argument('--publish',action='store_true');p.add_argument('--limit',type=int);p.add_argument('--batch-size',type=int,default=1000);p.add_argument('--partition',default='0/1')
    apply(p.parse_args())
