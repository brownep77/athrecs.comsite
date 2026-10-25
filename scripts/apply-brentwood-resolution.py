"""Rehearse/publish a held-result resolution, preserving all earlier histories."""
import argparse, json, pathlib, uuid
import importlib.util
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
a=load('resolution_apply','apply-brentwood-profiles.py')
BATCH='brentwood-resolution-20261025';ORIGINAL_BATCH=a.BATCH;OLD_FP=a.imp.NAME_FP
PREFIX='brentwood:resolution:20261025:'
HISTORY="""coalesce((SELECT jsonb_agg(jsonb_build_object('provider',h.provider,'externalId',h.external_id,'performances',h.performances) ORDER BY h.provider,h.external_id) FROM athlete_source_histories h WHERE h.athlete_id=a.id AND h.external_id NOT LIKE 'brentwood:resolution:20261025:%'),'[]'::jsonb)"""
def configure():
    a.BATCH=a.imp.BATCH=BATCH;a.APPROVAL=BATCH+'-owner';a.RUN=str(uuid.uuid5(uuid.NAMESPACE_URL,'https://www.brentwoodhalf.org/results#'+BATCH))
    a.imp.NAME_FP=OLD_FP.replace(ORIGINAL_BATCH,BATCH)
    guard="""
AND a.gender IS NOT DISTINCT FROM p->>'expectedGender'
AND a.date_of_birth IS NOT DISTINCT FROM nullif(p->>'expectedDob','')::date
AND a.source_club_name IS NOT DISTINCT FROM p->>'expectedSourceClub'
AND a.source_second_club_name IS NOT DISTINCT FROM p->>'expectedSourceSecondClub'
AND a.club_id IS NOT DISTINCT FROM nullif(p->>'expectedClubId','')::bigint
AND a.second_club_id IS NOT DISTINCT FROM nullif(p->>'expectedSecondClubId','')::bigint
AND md5(("""+HISTORY+""")::text)=p->>'expectedHistoryFingerprint'
AND NOT EXISTS(SELECT 1 FROM results r JOIN editions d ON d.id=r.edition_id JOIN events e ON e.id=d.event_id
 WHERE r.athlete_id=a.id AND (e.slug='brentwood-half-marathon' OR e.name ILIKE '%brentwood%half%')
 AND EXISTS(SELECT 1 FROM jsonb_array_elements(p->'performances') new WHERE (new->>'year')::int=extract(year FROM d.event_date)::int))
"""
    a.LINK=a.LINK.replace("AND a.profile_visibility='public'",guard+"AND a.profile_visibility='public'")
def fingerprint(args):
    cfg,q=a.base.connection(args.connection,args.branch,timeout=180)
    if cfg['projectId']!=a.imp.PROJECT or args.branch!=a.imp.PROD:raise ValueError('Fingerprint refresh must use designated production project')
    snap=json.loads(args.snapshot.read_text());plan=json.loads(args.plan.read_text())
    original_sql=a.imp.wmm.ATH.replace('ORDER BY a.id',"AND a.profile_details#>>'{archiveCreation,batchId}'='"+ORIGINAL_BATCH+"' ORDER BY a.id")
    old,original,current=q([(OLD_FP,[snap['maxid']]),(original_sql,[snap['maxid']]),(a.imp.NAME_FP,[snap['maxid']])],True)
    expected=snap.get('originalNameFingerprint',snap['nameFingerprint'])
    if old[0]['fingerprint']!=expected:raise ValueError('Directory changed since snapshot')
    for row in original:
        prior=snap['entities'].get(str(row['id']))
        if not prior or any(row[k]!=prior.get(k) for k in row):raise ValueError('Original batch identity changed since snapshot')
    snap['originalNameFingerprint']=expected;snap['nameFingerprint']=current[0]['fingerprint'];snap['batch']=BATCH
    byid={}
    for history in snap['histories']:
        if history['external_id'].startswith(PREFIX):continue
        byid.setdefault(str(history['athlete_id']),[]).append({'provider':history['provider'],'externalId':history['external_id'],'performances':history['performances']})
    checks=[]
    for h in plan['existingHistories']:
        hs=sorted(byid.get(str(h['athleteId']),[]),key=lambda x:(x['provider'],x['externalId']))
        checks.append({'athleteId':h['athleteId'],'histories':hs})
    fingerprints={}
    for i in range(0,len(checks),100):
        sql="WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb)) SELECT a.id,md5(("+HISTORY+")::text) fingerprint,("+HISTORY+")=p->'histories' unchanged FROM incoming JOIN athletes a ON a.id=(p->>'athleteId')::bigint"
        rs=q([(sql,[json.dumps(checks[i:i+100],ensure_ascii=False)])],True)[0]
        if len(rs)!=len(checks[i:i+100]) or any(not r['unchanged'] for r in rs):raise ValueError('Matching history changed since snapshot')
        fingerprints.update({str(r['id']):r['fingerprint'] for r in rs})
    for h in plan['existingHistories']:h['expectedHistoryFingerprint']=fingerprints[str(h['athleteId'])]
    a.save(args.snapshot,snap);a.save(args.plan,plan)
    print(json.dumps({'directoryChecked':True,'originalProfilesChecked':len(original),'existingEvidenceChecked':len(fingerprints)}),flush=True)
def check_existing_plan(args,require_all=False):
    _,q=a.base.connection(args.connection,args.branch,timeout=180)
    plan=json.loads(args.plan.read_text());planned={x['externalId']:x for x in plan['profiles']+plan['existingHistories']};found={}
    keys=list(planned)
    for i in range(0,len(keys),250):
        rows=q([('SELECT external_id,athlete_id,performances,published_at FROM athlete_source_histories WHERE provider=$1 AND external_id=ANY($2::text[])',[a.PROVIDER,keys[i:i+250]])],True)[0]
        for h in rows:
            expected=planned[h['external_id']]
            if not h['published_at'] or h['performances']!=expected['performances']:raise ValueError('Stable source identity already exists with different content or visibility')
            if expected.get('athleteId') and int(h['athlete_id'])!=expected['athleteId']:raise ValueError('Stable source identity points to a different athlete')
            found[h['external_id']]=int(h['athlete_id'])
    if require_all:
        receipt=json.loads(args.receipt.read_text());held={x['externalId'] for x in receipt['heldDuringApply'] if x.get('externalId')}
        if set(planned)-set(found)-held:raise ValueError('Some planned source identities were neither published nor explicitly held')
        receipt['storedPlanCompared']=True;receipt['storedPlanProfiles']=len(found);receipt['storedPlanResults']=sum(len(planned[k]['performances']) for k in found);a.save(args.receipt,receipt)
    return found
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('action',choices=['fingerprint','apply'])
    for key in ['connection','snapshot','plan']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    for key in ['compared','receipt','rehearsal']:ap.add_argument('--'+key,type=pathlib.Path)
    ap.add_argument('--branch',required=True);ap.add_argument('--publish',action='store_true');args=ap.parse_args();configure()
    if args.action=='fingerprint':fingerprint(args)
    else:
        if not args.compared or not args.receipt:raise ValueError('Apply needs compared data and receipt paths')
        check_existing_plan(args)
        a.apply(args)
        check_existing_plan(args,require_all=True)
