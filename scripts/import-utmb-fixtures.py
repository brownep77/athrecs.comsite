"""Expand official UTMB race cards into distinct dated distance fixtures.

Only existing uniquely matched event identities are used. Whole-weekend zero-
distance placeholders can become actual races if unreferenced. Unknown start
times stay unknown. Conflicts and unrecognised fields are held in the receipt.
"""
import argparse, datetime as dt, gzip, hashlib, importlib.util, json, pathlib, re, urllib.parse
ROOT=pathlib.Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('base',ROOT/'create-private-archive-profiles.py');base=importlib.util.module_from_spec(s);s.loader.exec_module(base)
PROD='br-flat-unit-aydbwlfk'
def read(p):
    with gzip.open(p,'rt',encoding='utf-8') as f:return json.load(f)
def date_value(text):
    cleaned=re.sub(r'(\d)(st|nd|rd|th)\b',r'\1',text)
    for fmt in ('%d %B %Y','%B %d, %Y','%Y-%m-%d'):
        try:return dt.datetime.strptime(cleaned,fmt).date().isoformat()
        except ValueError:pass
    raise ValueError('Unrecognised race date: '+text)
def cards(value):
    if isinstance(value,dict):
        if all(k in value for k in ('startDate','startLocation','name','slug','details')):yield value
        else:
            for v in value.values():yield from cards(v)
    elif isinstance(value,list):
        for v in value:yield from cards(v)
def host(url):return urllib.parse.urlsplit(url or '').hostname
def collect(work,today):
    root=read(work/'directory.json.gz');events={e['tenant']:e for e in root['data']['eventsTopBar']};planned=[];held=[]
    for path in sorted((work/'fixtures').glob('*.json.gz')):
        c=read(path);tenant=path.name.split('.')[0];event=events[tenant]
        if hashlib.sha256(c['raw'].encode()).hexdigest()!=c['sha256']:raise ValueError('Fixture source changed')
        data=json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',c['raw']).group(1))['props']['pageProps']
        if data!=c['data']:raise ValueError('Fixture data differs from raw source')
        links=re.findall(r'href="([^"]+)"',c['raw']);seen=set()
        for race in cards(data.get('slices',[])):
            if race['id'] in seen:continue
            seen.add(race['id'])
            try:
                date=date_value(race['startDate'])
                if date<today:continue
                if not event['dateBegin']<=date<=event['dateEnd']:raise ValueError('Race date outside published event weekend')
                stats=[v for values in race['details'].values() if isinstance(values,list) for v in values if isinstance(v,dict)]
                distances=[v for v in stats if v.get('name')=='distance' and v.get('postfix')=='km']
                if len(distances)!=1 or float(distances[0]['value'])<=0:raise ValueError('No explicit kilometre distance')
                km=float(distances[0]['value']);relative='/races/'+race['slug']
                observed=[v for v in links if urllib.parse.urlsplit(v).path.casefold()==relative.casefold()]
                if not observed:raise ValueError('Race link missing from actual page')
                url=urllib.parse.urljoin(c['url'],observed[0]);entry=(race.get('raceLink') or {}).get('slug')
                if not entry or not entry.startswith('https://'):entry=url
                status=race.get('raceStatus',{}).get('status','')
                sold_out=status=='registration_sold_out'
                status={'registration_open':'Open','registration_sold_out':'Closed','registration_closed':'Closed'}.get(status,'TBC')
                planned.append({'tenant':tenant,'event':event,'date':date,'km':km,'code':f'{km:g}K','url':url,'entry':entry,'status':status,
                  'name':race['name'],'startLocation':race['startLocation'],'sourceRaceId':race['id'],'capturedAt':c['capturedAt'],
                  'notes':f"{race['name']}: {km:g} km, starting at {race['startLocation']}."+(' Entry sold out.' if sold_out else '')})
            except (ValueError,KeyError,TypeError) as exc:held.append({'tenant':tenant,'name':race.get('name'),'reason':str(exc)})
    return planned,held
def apply(args):
    cfg,q=base.connection(args.connection,args.confirm_branch)
    if cfg['projectId']!='lively-resonance-04577945' or args.review==(cfg['branchId']==PROD):raise ValueError('Wrong review/production target')
    if not args.review and not args.publish:raise ValueError('Explicit publication flag required')
    plan,held=collect(args.work,args.from_date)
    events=q([("SELECT id,slug,name,website,source_url FROM events WHERE website ILIKE '%utmb.world%' OR source_url ILIKE '%utmb.world%'",[])],True)[0]
    groups={};skipped=[]
    for race in plan:
        matches=[e for e in events if e['slug']=='utmb-world-series-'+race['tenant']]
        if not matches:matches=[e for e in events if host(e['website'])==host(race['event']['url'])]
        if len(matches)!=1:held.append({'tenant':race['tenant'],'name':race['name'],'reason':'event_identity_missing_or_ambiguous','candidates':[e['id'] for e in matches]});continue
        groups.setdefault(matches[0]['id'],[]).append(race)
    added=[];expanded=[];unchanged=[];pending=[]
    all_existing=q([("SELECT d.*,EXISTS(SELECT 1 FROM results r WHERE r.edition_id=d.id) OR EXISTS(SELECT 1 FROM result_archive_datasets ds WHERE ds.edition_id=d.id) referenced FROM editions d WHERE event_id=ANY($1::int[]) AND event_date>=$2::date ORDER BY id",[list(groups),args.from_date])],True)[0]
    statements=[("SET LOCAL lock_timeout='5s'",[]),("SET LOCAL statement_timeout='55s'",[]),('LOCK TABLE editions,results,result_archive_datasets IN SHARE ROW EXCLUSIVE MODE',[]),('CREATE TEMP TABLE utmb_fixture_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[])]
    for event_id,races in groups.items():
        existing=[d for d in all_existing if d['event_id']==event_id]
        event_added=[];event_expanded=[]
        for race in races:
            same=[d for d in existing if d['event_date']==race['date'] and (abs(float(d['distance_km'])-race['km'])<.01 or (d.get('source_url') or '').casefold()==race['url'].casefold())]
            if same:unchanged.append({'eventId':event_id,'editionIds':[d['id'] for d in same],'name':race['name']});continue
            conflict=[d for d in existing if (d.get('source_url') or '').casefold()==race['url'].casefold()]
            if conflict:held.append({'eventId':event_id,'name':race['name'],'reason':'existing_race_date_conflicts','editionIds':[d['id'] for d in conflict]});continue
            placeholder=next((d for d in existing if not d['referenced'] and float(d['distance_km'])==0 and d['event_date']>=race['event']['dateBegin'] and d['event_date']<=race['event']['dateEnd'] and host(d.get('source_url'))==host(race['url']) and urllib.parse.urlsplit(d.get('source_url') or '').path in ('','/')),None)
            if placeholder:
                statements.append(('INSERT INTO utmb_fixture_guard SELECT event_date=$2::date AND distance_km=0 AND source_url=$3 AND NOT EXISTS(SELECT 1 FROM results WHERE edition_id=$1) AND NOT EXISTS(SELECT 1 FROM result_archive_datasets WHERE edition_id=$1) FROM editions WHERE id=$1',[placeholder['id'],placeholder['event_date'],placeholder['source_url']]))
                statements.append(("INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,before_value,after_value,note) VALUES('paul@athrecs.com','fixture.utmb_placeholder_expanded','edition',$1,$2::jsonb,$3::jsonb,'Official individual race card replaces unreferenced whole-weekend placeholder.')",[str(placeholder['id']),json.dumps(placeholder),json.dumps(race)]))
                statements.append(('UPDATE editions SET event_date=$2::date,distance_code=$3,distance_km=$4,status=$5,entry_url=$6,source_url=$7,notes=$8 WHERE id=$1',[placeholder['id'],race['date'],race['code'],race['km'],race['status'],race['entry'],race['url'],race['notes']]))
                event_expanded.append({'id':placeholder['id'],'eventId':event_id,'name':race['name']});existing.remove(placeholder)
            else:
                statements.append(("INSERT INTO editions(event_id,event_date,distance_code,distance_km,status,entry_url,source_url,notes) SELECT $1,$2::date,$3,$4,$5,$6,$7,$8 WHERE NOT EXISTS(SELECT 1 FROM editions WHERE event_id=$1 AND event_date=$2::date AND (distance_code=$3 OR abs(distance_km-$4)<0.01)) ON CONFLICT(event_id,event_date,distance_code) DO NOTHING RETURNING id",[event_id,race['date'],race['code'],race['km'],race['status'],race['entry'],race['url'],race['notes']]))
                event_added.append({'eventId':event_id,'name':race['name'],'date':race['date'],'distance':race['km'],'statement':len(statements)-1})
            existing.append({'id':None,'event_date':race['date'],'distance_km':race['km'],'source_url':race['url'],'referenced':False})
        pending.extend(event_added);expanded.extend(event_expanded)
    if len(statements)>4:
        rows=q(statements)
        for item in pending:
            result=rows[item.pop('statement')]
            if result:added.append({**item,'id':result[0]['id']})
    receipt={'branchId':cfg['branchId'],'raceCards':len(plan),'added':added,'expanded':expanded,'existing':unchanged,'held':held}
    args.receipt.write_text(json.dumps(receipt,indent=2,ensure_ascii=False));print(json.dumps({k:len(v) for k,v in receipt.items() if isinstance(v,list)}),flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser()
    for key in ('work','connection','receipt'):p.add_argument('--'+key,type=pathlib.Path,required=True)
    p.add_argument('--confirm-branch',required=True);p.add_argument('--review',action='store_true');p.add_argument('--publish',action='store_true');p.add_argument('--from-date',default=dt.date.today().isoformat());apply(p.parse_args())
