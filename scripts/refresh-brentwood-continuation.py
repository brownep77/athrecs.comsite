"""Re-screen a fixed continuation proposal against the current live directory.

Only previously proposed additions may survive. A new target, new ambiguity or
lost evidence becomes a hold; this refresh cannot expand publication scope.
"""
import argparse,collections,concurrent.futures,datetime,importlib.util,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
c=load('refresh_continuation','continue-brentwood-results.py');a=load('refresh_continuation_apply','apply-brentwood-resolution.py');a.configure(c.BATCH)
def run(args):
    cfg,q=a.a.base.connection(args.connection,args.branch,timeout=180)
    if cfg['projectId']!=a.a.imp.PROJECT or args.branch!=a.a.imp.PROD:raise ValueError('Unexpected production target')
    old=json.loads(args.plan.read_text());rows=[perf['archiveReference']['original'] for h in old['profiles']+old['existingHistories'] for perf in h['performances']]
    allowed={k for row in rows for k in c.p.prep.name_keys(row['name'])}
    for e in old['enrichments']:
        for key in c.p.prep.name_keys(e['expectedName']):allowed.add(key)
    maximum=q([('SELECT max(id) maxid FROM athletes',[])],True)[0][0]['maxid'];before=q([(a.a.imp.NAME_FP,[maximum])],True)[0][0]['fingerprint']
    sql=a.a.imp.wmm.ATH.replace('ORDER BY a.id','AND a.id>$2 AND a.id % 4=$3 ORDER BY a.id LIMIT 20000')
    def part(number):
        last=0;index=collections.defaultdict(set);entities={};count=0
        while True:
            records=q([(sql,[maximum,last,number])],True)[0]
            if not records:break
            for row in records:
                names=[row['display_name'],row.get('race_entry_name'),' '.join([row.get('given_name') or '',row.get('family_name') or ''])]
                for v in (row.get('name_details') or {}).values():names.extend(a.a.imp.prep.finder.names_from(v))
                if a.a.imp.prep.add(index,'athrecs:'+str(row['id']),names,allowed):entities[str(row['id'])]={**row,'names':names}
            last=max(int(x['id']) for x in records);count+=len(records)
        print(json.dumps({'partition':number,'scanned':count,'candidates':len(entities)}),flush=True);return count,index,entities
    index=collections.defaultdict(set);entities={};scanned=0
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for count,ix,es in pool.map(part,range(4)):
            scanned+=count;entities.update(es)
            for key,values in ix.items():index[key].update(values)
    accounts=q([(a.a.imp.base.QUERIES['accounts'],[])],True)[0]
    for i,row in enumerate(accounts):a.a.imp.prep.add(index,'account:'+str(row.get('athlete_number') or i),[row.get('name'),row.get('full_name'),row.get('display_name'),*a.a.imp.prep.finder.names_from(row.get('previous_names'))],allowed)
    ids=[int(x) for x in entities]
    details=q([("SELECT a.id,a.gender,a.date_of_birth,a.profile_visibility,a.parent_athlete_id,a.source_club_name,a.source_second_club_name,a.club_id,a.second_club_id,a.source_url,a.profile_details,(SELECT jsonb_agg(jsonb_build_object('name',c.name,'sourceName',ac.source_name)) FROM athlete_clubs ac JOIN clubs c ON c.id=ac.club_id WHERE ac.athlete_id=a.id) clubs,(SELECT jsonb_agg(c.name) FROM clubs c WHERE c.id IN(a.club_id,a.second_club_id)) primary_clubs,(SELECT count(*) FROM athlete_account_links l WHERE l.athlete_id=a.id AND l.status='active') active_accounts FROM athletes a WHERE a.id=ANY($1::int[])",[ids])],True)[0]
    for row in details:entities[str(row['id'])].update(row)
    histories=q([('SELECT athlete_id,provider,external_id,source_url,published_at,performances FROM athlete_source_histories WHERE athlete_id=ANY($1::int[])',[ids])],True)[0]
    results=q([('SELECT r.*,d.event_date,e.name event_name,e.slug event_slug FROM results r JOIN editions d ON d.id=r.edition_id JOIN events e ON e.id=d.event_id WHERE r.athlete_id=ANY($1::int[])',[ids])],True)[0]
    if q([(a.a.imp.NAME_FP,[maximum])],True)[0][0]['fingerprint']!=before:raise ValueError('Directory changed during refresh')
    snap={'batch':c.BATCH,'nameFingerprint':before,'maxid':maximum,'scanned':scanned,'index':{k:sorted(v) for k,v in index.items()},'entities':entities,'accounts':accounts,'histories':histories,'results':results,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    raw=[json.loads(l) for l in (args.archive/'all_results.jsonl').read_text().splitlines()];official,_=c.source_2026(args.sources);c.p.BATCH=c.BATCH
    fresh=c.p.plan({'rows':rows,'held':[],'checks':old['sourceChecks']},snap,raw+official,resolve_partial_clubs=True,allow_name_variants=True)
    original_new={h['externalId'] for h in old['profiles']};original_targets={perf['archiveReference']['original']['key']:h['athleteId'] for h in old['existingHistories'] for perf in h['performances']}
    kept=[];extra_holds=list(fresh['held']);byhist=collections.defaultdict(list)
    for h in histories:byhist[str(h['athlete_id'])].append(h)
    for h in fresh['profiles']:
        if h['externalId'] in original_new:kept.append(h)
        else:extra_holds +=[{**perf['archiveReference']['original'],'hold':'Fresh directory no longer supports original existing-profile match'} for perf in h['performances']]
    accepted=[]
    for h in fresh['existingHistories']:
        aid=str(h['athleteId']);athlete=entities[aid];perfs=[];evidence=[]
        for perf,ev in zip(h['performances'],h['identityEvidence']):
            row=perf['archiveReference']['original'];why=c.r.history_conflict(row,byhist[aid])
            if original_targets.get(row['key'])!=h['athleteId']:why='Fresh directory suggests a different target; requires separate identity review'
            if why:extra_holds.append({**row,'hold':why,'athleteId':int(aid)})
            else:perfs.append(perf);evidence.append(ev)
        if not perfs:continue
        h.update(performances=perfs,identityEvidence=evidence,years=sorted({x['year'] for x in perfs}),externalId=c.PREFIX+'existing:'+aid,expectedGender=athlete.get('gender'),expectedDob=athlete.get('date_of_birth'),expectedSourceClub=athlete.get('source_club_name'),expectedSourceSecondClub=athlete.get('source_second_club_name'),expectedClubId=athlete.get('club_id'),expectedSecondClubId=athlete.get('second_club_id'))
        accepted.append(h)
    for h in kept+accepted:
        for perf in h['performances']:
            row=perf['archiveReference']['original']
            if row.get('primarySourceKey'):perf['sourceKeys'].append(row['primarySourceKey'])
    for e in old['enrichments']:
        aid=str(e['athleteId']);athlete=entities.get(aid);hs=[h for h in byhist[aid] if h['provider']==a.a.PROVIDER and h['external_id']==e['externalId']]
        if not athlete or len(hs)!=1 or hs[0]['performances']!=e['oldPerformances'] or not hs[0]['published_at'] or athlete.get('profile_visibility')!='public' or athlete.get('parent_athlete_id') or int(athlete.get('active_accounts',0)):raise ValueError('Existing result enrichment needs renewed review')
        e['expectedDetails']=athlete['profile_details'];e['expectedName']=athlete['display_name']
    old.update(profiles=kept,existingHistories=accepted,held=old['held']+extra_holds,reused=old['reused']+fresh['reused'])
    old['summary'].update(newProfiles=len(kept),newProfileResults=sum(len(h['performances']) for h in kept),existingProfilesEnriched=len(accepted),existingProfileResults=sum(len(h['performances']) for h in accepted),heldRows=len(old['held']),heldReasons=dict(collections.Counter(x['hold'] for x in old['held'])),refreshAdditionalHolds=len(extra_holds),freshDirectoryScanned=scanned)
    c.r.imp.dump(args.out,old);c.r.imp.dump(args.snapshot,snap);c.r.imp.dump(args.compared,{'rows':[perf['archiveReference']['original'] for h in kept+accepted for perf in h['performances']],'held':old['held'],'checks':old['sourceChecks']})
    a.fingerprint(argparse.Namespace(connection=args.connection,branch=args.branch,snapshot=args.snapshot,plan=args.out))
    print(json.dumps(old['summary']),flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['connection','plan','archive','sources','out','snapshot','compared']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    ap.add_argument('--branch',required=True);run(ap.parse_args())
