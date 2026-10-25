"""Refresh only duplicate-screening inputs after a rehearsed plan is fixed.

The plan is not re-matched or weakened. Newly discovered candidates cause live
publication holds. No existing athlete or result data is mutated by this scan.
"""
import argparse,collections,concurrent.futures,datetime,importlib.util,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('apply_resolution',ROOT/'apply-brentwood-resolution.py');a=importlib.util.module_from_spec(s);s.loader.exec_module(a);a.configure()
def run(args):
    cfg,q=a.a.base.connection(args.connection,args.branch,timeout=180)
    if cfg['projectId']!=a.a.imp.PROJECT or args.branch!=a.a.imp.PROD:raise ValueError('Unexpected production target')
    snap=json.loads(args.snapshot.read_text());plan=json.loads(args.plan.read_text());allowed=frozenset(k for p in plan['profiles'] for name in p['details']['aliases'] for k in a.a.imp.prep.name_keys(name))
    maximum=q([('SELECT max(id) maxid FROM athletes',[])],True)[0][0]['maxid'];before=q([(a.a.imp.NAME_FP,[maximum])],True)[0][0]['fingerprint']
    sql=a.a.imp.wmm.ATH.replace('ORDER BY a.id',"AND a.id>$2 AND a.id % 4=$3 AND a.profile_details#>>'{archiveCreation,batchId}' IS DISTINCT FROM '"+a.BATCH+"' ORDER BY a.id LIMIT 20000")
    def part(number):
        last=0;index=collections.defaultdict(set);entities={};count=0
        while True:
            rows=q([(sql,[maximum,last,number])],True)[0]
            if not rows:break
            for row in rows:
                names=[row['display_name'],row.get('race_entry_name'),' '.join([row.get('given_name') or '',row.get('family_name') or ''])]
                for v in (row.get('name_details') or {}).values():names.extend(a.a.imp.prep.finder.names_from(v))
                if a.a.imp.prep.add(index,'athrecs:'+str(row['id']),names,allowed):entities[str(row['id'])]={**row,'names':names}
            last=max(int(x['id']) for x in rows);count+=len(rows)
        print(json.dumps({'partition':number,'scanned':count,'candidateProfiles':len(entities)}),flush=True);return count,index,entities
    index=collections.defaultdict(set);entities={};count=0
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for n,ix,es in pool.map(part,range(4)):
            count+=n;entities.update(es)
            for k,values in ix.items():index[k].update(values)
    accounts,after=q([(a.a.imp.base.QUERIES['accounts'],[]),(a.a.imp.NAME_FP,[maximum])],True)
    if after[0]['fingerprint']!=before:raise ValueError('Directory changed during refreshed scan; repeat before publishing')
    for i,row in enumerate(accounts):a.a.imp.prep.add(index,'account:'+str(row.get('athlete_number') or i),[row.get('name'),row.get('full_name'),row.get('display_name'),*a.a.imp.prep.finder.names_from(row.get('previous_names'))],allowed)
    snap.update(nameFingerprint=before,maxid=maximum,index={k:sorted(v) for k,v in index.items()},accounts=accounts,scanned=count,directoryRefreshAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),directoryRefreshScope='Duplicate screening for the unchanged rehearsed plan; newly found candidates remain holds')
    # Older detailed evidence is retained only for already fixed match audits.
    snap['directoryRefreshCandidates']=entities;a.a.save(args.out,snap)
    collisions=[p['externalId'] for p in plan['profiles'] if a.a.imp.prep.matching(index,p['details']['aliases'])]
    print(json.dumps({'scanned':count,'candidateProfiles':len(entities),'potentialNewProfileHolds':len(collisions)}),flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['connection','snapshot','plan','out']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    ap.add_argument('--branch',required=True);run(ap.parse_args())
