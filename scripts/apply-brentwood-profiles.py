"""Publish a source-compared Brentwood plan with rehearsal, identity and replay guards.

Owner-authorized public source profiles are unclaimed, identity-unverified. An
existing profile is enriched only by an explicit reviewed match in the plan;
the athlete record, account links and publication preferences remain unchanged.
"""
import argparse, datetime, gzip, hashlib, importlib.util, json, pathlib, uuid
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
imp=load('brentwood_import','brentwood-profile-import.py');base=imp.base
BATCH=imp.BATCH;PROVIDER=imp.PROVIDER;APPROVAL=BATCH+'-owner';RUN=str(uuid.uuid5(uuid.NAMESPACE_URL,'https://www.brentwoodhalf.org/results#'+BATCH))
INSERT=imp.wmm.INSERT.replace('Owner requested WMM athlete profiles and source results with duplicate checks; retained source year only; unclaimed provisional identity; existing profiles unchanged.','Owner requested Brentwood results, new athlete profiles and duplicate reconciliation. Source rows compared; unclaimed provisional identity; dates retained only where established. Existing profiles unchanged.')
LINK="""WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb)), inserted AS(
INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
SELECT a.id,$2,p->>'externalId',p->>'sourceUrl',now(),false,ARRAY[]::int[],ARRAY(SELECT jsonb_array_elements_text(p->'years')::int),p->'performances',now()
FROM incoming JOIN athletes a ON a.id=(p->>'athleteId')::int
WHERE a.display_name=p->>'expectedName' AND a.profile_details=p->'expectedDetails'
AND a.profile_visibility='public' AND a.parent_athlete_id IS NULL
AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id AND l.status='active')
AND NOT EXISTS(SELECT 1 FROM athlete_profile_history_choices c WHERE c.athlete_id=a.id AND c.excluded)
AND NOT EXISTS(SELECT 1 FROM athlete_source_histories h CROSS JOIN LATERAL jsonb_array_elements(h.performances) old
WHERE h.athlete_id=a.id AND (old->>'meeting' ILIKE '%brentwood%' OR old->>'eventSlug'='brentwood-half-marathon')
AND EXISTS(SELECT 1 FROM jsonb_array_elements(p->'performances') new WHERE new->>'year'=old->>'year'))
ON CONFLICT(provider,external_id) DO NOTHING RETURNING athlete_id,external_id), audits AS(
INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,after_value,note)
SELECT 'paul@athrecs.com','athlete.history_admin_published','athlete_source_history',$2||':'||i.external_id,
jsonb_build_object('athleteId',i.athlete_id,'batchId',$3::text,'identityEvidence',p->'identityEvidence','captureId',$4::bigint),
'Owner-authorized Brentwood addition: reviewed name or bounded first-name variant and specific historical club; explicit matching evidence retained; no profile identity or ownership upgrade.'
FROM inserted i JOIN incoming ON i.external_id=p->>'externalId' RETURNING id)
SELECT (SELECT count(*) FROM inserted)::int histories,(SELECT count(*) FROM audits)::int audits"""
def save(path,obj):imp.dump(path,obj)
def setup(q,plan,compared):
    evidence={'instruction':'can you go and look for the missing please and then add profiles and merge any duplicates and add any new athletes','requestedBy':'Paul Browne','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'publicProfilesAuthorizedByOwner':True,'providerPermissionClaimed':False,'scope':'Brentwood Half Marathon, Essex; recovered historical and current-edition results described by the retained source checks','planHash':imp.digest(plan)}
    q([("INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,scope,evidence) VALUES($1,$2,'Paul Browne','owner_private_import','staff_only',$3::jsonb) ON CONFLICT(id) DO NOTHING",[APPROVAL,PROVIDER,json.dumps(evidence)]),("INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory,status) VALUES($1::uuid,$2,$3,$4::jsonb,'processing') ON CONFLICT(id) DO NOTHING",[RUN,APPROVAL,PROVIDER,json.dumps(plan['sourceChecks'])])])
    raw=json.dumps(compared,ensure_ascii=False,separators=(',',':')).encode();payload={'format':'brentwood-heading-comparison-v1','publication':'staff_only','sourceChecks':plan['sourceChecks'],'summary':plan['summary'],'planHash':imp.digest(plan),'heldRows':len(plan['held']),'compressedContentType':'application/json','claim':'Compared named fields; headerless/conflicting source rows and ambiguous identities are held, not verified.'}
    ph=hashlib.sha256(raw).hexdigest()
    existing=q([('SELECT id FROM result_archive_source_captures WHERE provider=$1 AND source_key=$2 AND payload_hash=$3',[PROVIDER,BATCH,ph])],True)[0]
    if existing:return existing[0]['id']
    sql="""INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
VALUES($1::uuid,$2,$3,$4,'https://www.brentwoodhalf.org/results',$5,$5,decode($6,'hex'),$7::jsonb,$8,'compared',$9::jsonb,now())
ON CONFLICT(provider,source_key,payload_hash) DO UPDATE SET last_seen_at=now(),payload=excluded.payload,audit=excluded.audit RETURNING id"""
    return q([(sql,[RUN,APPROVAL,PROVIDER,BATCH,ph,gzip.compress(raw).hex(),json.dumps(payload),len(compared['rows'])+len(compared['held']),json.dumps(evidence)])])[0][0]['id']
def apply(args):
    cfg,q=base.connection(args.connection,args.branch,timeout=180)
    if cfg['projectId']!=imp.PROJECT:raise ValueError('Unexpected project')
    if args.publish!=(args.branch==imp.PROD):raise ValueError('Production requires explicit --publish; rehearsal must use a nonproduction branch')
    plan=json.loads(args.plan.read_text());snapshot=json.loads(args.snapshot.read_text());compared=json.loads(args.compared.read_text());plan_hash=imp.digest(plan)
    if args.publish:
        receipt=json.loads(args.rehearsal.read_text())
        if not receipt.get('validated') or receipt['planHash']!=plan_hash:raise ValueError('Production plan differs from validated rehearsal')
    prefix_fp=q([(imp.NAME_FP,[snapshot['maxid']])],True)[0][0]['fingerprint']
    if snapshot.get('nameFingerprint') and prefix_fp!=snapshot['nameFingerprint']:raise ValueError('Name/alias directory changed since final screening')
    def refresh():
        previous,new,latest=q([(imp.NAME_FP,[snapshot['maxid']]),(imp.wmm.ATH.replace('($1::bigint=0 OR a.id<=$1)',"a.id>$1 AND a.profile_details #>> '{archiveCreation,batchId}' IS DISTINCT FROM '"+BATCH+"'"),[snapshot['maxid']]),(imp.NAME_FP,[0])],True)
        if previous[0]['fingerprint']!=prefix_fp:raise ValueError('An existing identity changed during publication; repeat screening')
        index={}
        import collections
        index=collections.defaultdict(set)
        for a in new:
            names=[a['display_name'],a.get('race_entry_name'),' '.join([a.get('given_name') or '',a.get('family_name') or ''])]
            for v in (a.get('name_details') or {}).values():names.extend(imp.prep.finder.names_from(v))
            imp.prep.add(index,str(a['id']),names)
        return latest[0]['fingerprint'],index
    fp,fresh=refresh()
    cap=setup(q,plan,compared)
    receipt={'batch':BATCH,'branch':args.branch,'planHash':plan_hash,'captureId':cap,'createdProfiles':0,'createdHistories':0,'newProfileResults':0,'existingProfileResults':0,'skippedExisting':0,'examples':[],'linkedAthleteIds':[],'heldDuringApply':[]}
    known={r['external_id'] for r in q([('SELECT external_id FROM athlete_source_histories WHERE provider=$1',[PROVIDER])],True)[0]}
    for i in range(0,len(plan['profiles']),1500):
        batch=[p for p in plan['profiles'][i:i+1500] if p['externalId'] not in known]
        if not batch:continue
        fp,fresh=refresh()
        collisions=[p for p in batch if imp.prep.matching(fresh,p['details']['aliases']) or imp.prep.matching(snapshot['index'],p['details']['aliases'])]
        receipt['heldDuringApply'] +=[{'externalId':p['externalId'],'reason':'New name/alias candidate since screening'} for p in collisions]
        batch=[p for p in batch if p not in collisions]
        if not batch:continue
        body=json.dumps(batch,ensure_ascii=False,separators=(',',':'))
        account_guard="INSERT INTO brentwood_guard SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY to_jsonb(a)::text),'[]'::jsonb)=(SELECT coalesce(jsonb_agg(p ORDER BY p::text),'[]'::jsonb) FROM jsonb_array_elements($1::jsonb) p) FROM ("+imp.wmm.ACCOUNTS+") a"
        # Neon HTTP returns bigint as text and empty text[] as [""]. Compare
        # canonical JSON values, without weakening any nonempty alias check.
        accounts=[{**a,'athlete_number':int(a['athlete_number']) if a.get('athlete_number') is not None else None,'previous_names':[n for n in a['previous_names'] if n] if a.get('previous_names') is not None else None} for a in snapshot['accounts']]
        queries=[("SET LOCAL lock_timeout='10s'",[]),("SET LOCAL statement_timeout='110s'",[]),('LOCK TABLE athletes,"user",athlete_private_profiles,athlete_account_links IN SHARE ROW EXCLUSIVE MODE',[]),('CREATE TEMP TABLE brentwood_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),('INSERT INTO brentwood_guard SELECT fingerprint=$2 FROM ('+imp.NAME_FP+') f',[0,fp]),(account_guard,[json.dumps(accounts)]),(INSERT,[body,PROVIDER,BATCH,cap]),('INSERT INTO brentwood_guard SELECT count=jsonb_array_length($4::jsonb) FROM ('+imp.wmm.VERIFY+') v',[body,PROVIDER,BATCH,body])]
        result=q(queries)[-2][0]
        if result['profiles']!=len(batch) or result['histories']!=len(batch):raise ValueError('Unexpected creation count')
        receipt['createdProfiles']+=result['profiles'];receipt['createdHistories']+=result['histories'];receipt['newProfileResults']+=sum(len(p['performances']) for p in batch)
        if len(receipt['examples'])<8:receipt['examples']+=result['created'][:8-len(receipt['examples'])]
        save(args.receipt,receipt);print(json.dumps({k:v for k,v in receipt.items() if k in {'createdProfiles','newProfileResults'}}),flush=True)
    for i in range(0,len(plan['existingHistories']),100):
        batch=[p for p in plan['existingHistories'][i:i+100] if p['externalId'] not in known]
        if not batch:continue
        body=json.dumps(batch,ensure_ascii=False,separators=(',',':'))
        result=q([('LOCK TABLE athletes,athlete_source_histories,athlete_account_links,athlete_profile_history_choices IN SHARE ROW EXCLUSIVE MODE',[]),(LINK,[body,PROVIDER,BATCH,cap])])[-1][0]
        actual=q([('SELECT athlete_id,external_id,jsonb_array_length(performances) n FROM athlete_source_histories WHERE provider=$1 AND external_id=ANY($2::text[])',[PROVIDER,[p['externalId'] for p in batch]])],True)[0]
        receipt['createdHistories']+=result['histories'];receipt['existingProfileResults']+=sum(r['n'] for r in actual);receipt['linkedAthleteIds'] +=[r['athlete_id'] for r in actual]
        made={r['external_id'] for r in actual};receipt['heldDuringApply'] +=[{'athleteId':p['athleteId'],'externalId':p['externalId'],'reason':'Live identity, privacy or duplicate-history guard rejected addition'} for p in batch if p['externalId'] not in made];save(args.receipt,receipt)
    counts=q([("SELECT count(*)::int profiles FROM athletes WHERE profile_details#>>'{archiveCreation,batchId}'=$1",[BATCH]),("SELECT count(*)::int histories,coalesce(sum(jsonb_array_length(performances)),0)::int results FROM athlete_source_histories WHERE provider=$1",[PROVIDER])],True)
    receipt['totals']={'profiles':counts[0][0]['profiles'],**counts[1][0]};receipt['validated']=True
    q([("UPDATE result_archive_capture_runs SET status='completed',summary=$2::jsonb,updated_at=now() WHERE id=$1::uuid",[RUN,json.dumps({'plan':plan['summary'],'receipt':receipt})])]);save(args.receipt,receipt);print(json.dumps(receipt['totals']),flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser()
    for k in ['connection','plan','snapshot','compared','receipt']:p.add_argument('--'+k,type=pathlib.Path,required=True)
    p.add_argument('--branch',required=True);p.add_argument('--publish',action='store_true');p.add_argument('--rehearsal',type=pathlib.Path)
    apply(p.parse_args())
