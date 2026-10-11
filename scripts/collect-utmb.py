"""Capture public UTMB runner pages and World Series fixtures; resumable, no login.

Private captures go outside Git. Stop on access/rate limits; never request hidden
index scores. The ranking is a moving directory, not a verified unique-person count.
"""
import argparse, concurrent.futures, datetime as dt, gzip, hashlib, json, pathlib, re, time
import urllib.request, urllib.parse, urllib.error

SOURCE='https://utmb.world/utmb-index/runner-search'
def save(path,value):
    tmp=path.with_suffix('.writing')
    with gzip.open(tmp,'wt',encoding='utf-8') as f:json.dump(value,f,ensure_ascii=False,separators=(',',':'))
    tmp.replace(path)
def capture(url,path):
    if path.exists():
        with gzip.open(path,'rt',encoding='utf-8') as f:return json.load(f)
    request=urllib.request.Request(url,headers={'x-tenant-id':'worldseries','User-Agent':'AthRecs-source-research/1.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request,timeout=45) as resp:raw=resp.read().decode('utf-8')
            break
        except urllib.error.HTTPError as exc:
            if exc.code not in (502,503,504) or attempt==2:raise
            time.sleep(3*(attempt+1))
    if url.startswith('https://api.utmb.world/'):
        data=json.loads(raw)
    else:
        match=re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',raw)
        if not match:raise ValueError('Expected public Next data missing: '+url)
        data=json.loads(match.group(1))['props']['pageProps']
    value={'url':url,'capturedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'sha256':hashlib.sha256(raw.encode()).hexdigest(),'raw':raw,'data':data}
    save(path,value);time.sleep(.25)
    return value
def collect(args):
    work=args.work.resolve();work.mkdir(parents=True,exist_ok=True)
    root=capture(SOURCE,work/'directory.json.gz');runner_dir=work/'runners';runner_dir.mkdir(exist_ok=True)
    runners={};pages=[]
    for sex in (() if args.fixtures_only else ('H','F')):
        for offset in range(args.offset,args.offset+args.per_gender,100):
            params={'category':'general','sex':sex,'ageGroup':'','nationality':'','limit':min(100,args.offset+args.per_gender-offset),'offset':offset,'search':''}
            page=capture('https://api.utmb.world/search/runners?'+urllib.parse.urlencode(params),work/f'ranking-{sex}-{offset}.json.gz')
            data=page['data']
            if data.get('offset')!=offset or not isinstance(data.get('runners'),list):raise ValueError('Unexpected pagination')
            pages.append({'sex':sex,'offset':offset,'received':len(data['runners']),'expected':data['nbHits']})
            for row in data['runners']:runners[str(row['id'])]=row
    def runner(row):
        value=capture('https://utmb.world/en/runner/'+row['uri'],runner_dir/(str(row['id'])+'.json.gz'))
        return {'id':row['id'],'results':len(value['data']['results']['results'])}
    done=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
        for item in ex.map(runner,runners.values()):
            done.append(item)
            if len(done)%25==0:print(json.dumps({'profilesCaptured':len(done),'resultRows':sum(x['results'] for x in done)}),flush=True)
    fixtures=[];fixture_dir=work/'fixtures';fixture_dir.mkdir(exist_ok=True)
    upcoming=[e for e in root['data']['eventsTopBar'] if e.get('dateEnd','')>=args.from_date and e.get('url','').endswith('.utmb.world')]
    def event(e):
        value=capture(e['url'],fixture_dir/(e['tenant']+'.json.gz'))
        return {'tenant':e['tenant'],'url':e['url'],'dateBegin':e['dateBegin'],'dateEnd':e['dateEnd']}
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
        fixtures=list(ex.map(event,upcoming))
    coverage={'completeDirectory':False,'pages':pages,'runners':len(done),'results':sum(x['results'] for x in done),'fixtureEvents':fixtures,'nextOffset':args.offset+args.per_gender,'note':'Initial bounded capture. Full race fields and the entire directory are not yet collected.'}
    (work/'coverage.json').write_text(json.dumps(coverage,indent=2));print(json.dumps(coverage),flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--work',type=pathlib.Path,required=True);p.add_argument('--per-gender',type=int,default=100);p.add_argument('--offset',type=int,default=0);p.add_argument('--from-date',default=dt.date.today().isoformat());p.add_argument('--fixtures-only',action='store_true');collect(p.parse_args())
