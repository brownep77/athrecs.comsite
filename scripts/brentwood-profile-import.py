"""Source-led Brentwood import. Private inputs/receipts live outside the repository.

Headerless sheets are research leads only. Name suggestions never authorize a
merge. New source profiles remain unclaimed, with provisional identity.
"""
import argparse, collections, concurrent.futures, datetime as dt, gzip, hashlib, importlib.util, json, pathlib, re, sys, unicodedata, uuid
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
base=load('brentwood_base','create-private-archive-profiles.py')
prep=load('brentwood_prep','prepare-wmm-profiles.py')
wmm=load('brentwood_wmm','apply-wmm-profiles.py')
BATCH='brentwood-archive-20261025';PROVIDER='Brentwood Half Marathon historical archive'
PROD='br-flat-unit-aydbwlfk';PROJECT='lively-resonance-04577945'
NAME_FP='WITH directory AS ('+wmm.ATH.replace('ORDER BY a.id',"AND a.profile_details #>> '{archiveCreation,batchId}' IS DISTINCT FROM '"+BATCH+"' ORDER BY a.id")+") SELECT md5(coalesce(string_agg(md5(to_jsonb(d)::text),'' ORDER BY id),'')) fingerprint FROM directory d"
def dump(path,obj):
    pathlib.Path(path).write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':')))
def digest(obj):return hashlib.sha256(json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def connect(args):
    cfg,q=base.connection(args.connection,args.branch,timeout=180)
    if cfg['projectId']!=PROJECT:raise ValueError('Wrong project')
    return cfg,q
def snapshot(args):
    _,q=connect(args);rows=[json.loads(l) for l in args.archive.joinpath('all_results.jsonl').read_text().splitlines()]
    if args.extra and args.extra.exists():rows+=json.loads(args.extra.read_text())
    compared=args.out.parent/'compared.json'
    if compared.exists():rows+=json.loads(compared.read_text())['rows']
    allowed=frozenset(k for r in rows for k in prep.name_keys(r['name']))
    index=collections.defaultdict(set);entities={};last=0;scanned=0
    maximum=q([('SELECT max(id) maxid FROM athletes',[])],True)[0][0]['maxid']
    initial_fp=q([(NAME_FP,[maximum])],True)[0][0]['fingerprint']
    parts=args.out.with_suffix('.parts');parts.mkdir(exist_ok=True)
    sql=wmm.ATH.replace('ORDER BY a.id','AND a.id>$2 AND a.id % 4=$3 ORDER BY a.id LIMIT 20000')
    def partition(part):
        last=0;local={};ix=collections.defaultdict(set);count=0
        checkpoint=parts/f'names-{part}.json'
        if checkpoint.exists():
            saved=json.loads(checkpoint.read_text())
            if saved['maximum']!=maximum:raise ValueError('Snapshot maximum changed; use new output path')
            last=saved['last'];local=saved['entities'];count=saved['count'];ix.update({k:set(v) for k,v in saved['index'].items()})
        while True:
            page=q([(sql,[maximum,last,part])],True)[0]
            if not page:break
            for a in page:
                names=[a['display_name'],a.get('race_entry_name'),' '.join([a.get('given_name') or '',a.get('family_name') or ''])]
                for v in (a.get('name_details') or {}).values():names.extend(prep.finder.names_from(v))
                if prep.add(ix,'athrecs:'+str(a['id']),names,allowed):local[str(a['id'])]={**a,'names':names}
            last=max(int(a['id']) for a in page);count+=len(page)
            dump(checkpoint,{'maximum':maximum,'last':last,'count':count,'entities':local,'index':{k:sorted(v) for k,v in ix.items()}})
        print(json.dumps({'partition':part,'scanned':count,'candidates':len(local)}),flush=True)
        return count,local,ix
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for count,local,ix in pool.map(partition,range(4)):
            scanned+=count;entities.update(local)
            for k,v in ix.items():index[k].update(v)
    accounts=q([(base.QUERIES['accounts'],[])],True)[0]
    for i,a in enumerate(accounts):prep.add(index,'account:'+str(a.get('athlete_number') or i),[a.get('name'),a.get('full_name'),a.get('display_name'),*prep.finder.names_from(a.get('previous_names'))],allowed)
    ids=[int(x) for x in entities]
    details=q([("SELECT a.id,a.gender,a.date_of_birth,a.profile_visibility,a.parent_athlete_id,a.source_club_name,a.source_second_club_name,a.club_id,a.second_club_id,a.source_url,a.profile_details,(SELECT jsonb_agg(jsonb_build_object('name',c.name,'sourceName',ac.source_name)) FROM athlete_clubs ac JOIN clubs c ON c.id=ac.club_id WHERE ac.athlete_id=a.id) clubs,(SELECT jsonb_agg(c.name) FROM clubs c WHERE c.id IN(a.club_id,a.second_club_id)) primary_clubs,(SELECT count(*) FROM athlete_account_links l WHERE l.athlete_id=a.id AND l.status='active') active_accounts FROM athletes a WHERE a.id=ANY($1::int[])",[ids])],True)[0]
    dump(parts/'details.json',details)
    for a in details:entities[str(a['id'])].update(a)
    # Only scoped histories are transferred; the full table is over 2 GB.
    histories=[]
    def history_part(i):
        file=parts/f'histories-{i}.json'
        if file.exists():return json.loads(file.read_text())
        hs=q([("SELECT athlete_id,provider,external_id,source_url,published_at,performances FROM athlete_source_histories WHERE athlete_id=ANY($1::int[])",[ids[i:i+1000]])],True)[0];dump(file,hs);return hs
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for hs in pool.map(history_part,range(0,len(ids),1000)):histories+=hs
    results=q([("SELECT r.*,d.event_date,e.name event_name,e.slug event_slug FROM results r JOIN editions d ON d.id=r.edition_id JOIN events e ON e.id=d.event_id WHERE r.athlete_id=ANY($1::int[])",[ids])],True)[0]
    final_fp=q([(NAME_FP,[maximum])],True)[0][0]['fingerprint']
    if final_fp!=initial_fp:raise ValueError('Directory changed during snapshot; repeat with a new snapshot path')
    dump(args.out,{'batch':BATCH,'at':dt.datetime.now(dt.timezone.utc).isoformat(),'nameFingerprint':final_fp,'maxid':maximum,'scanned':scanned,'index':{k:sorted(v) for k,v in index.items()},'entities':entities,'accounts':accounts,'histories':histories,'results':results})
    print(json.dumps({'scanned':scanned,'candidates':len(entities),'histories':len(histories),'results':len(results)}),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('action',choices=['snapshot']);p.add_argument('--connection',type=pathlib.Path,required=True);p.add_argument('--branch',required=True);p.add_argument('--archive',type=pathlib.Path,required=True);p.add_argument('--extra',type=pathlib.Path);p.add_argument('--out',type=pathlib.Path,required=True)
    a=p.parse_args();snapshot(a)
