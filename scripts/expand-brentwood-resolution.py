"""Create one provisional source identity for an otherwise unresolved name group.

Only groups with no existing/alias/near-name candidate are eligible. A single
clear appearance seeds the profile; other appearances require club and identity
corroboration. Existing plans and previously published histories stay unchanged.
"""
import argparse,collections,importlib.util,json,pathlib,hashlib,re
from lxml import html
ROOT=pathlib.Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('resolution','%s/resolve-brentwood-held.py'%ROOT);r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
p=r.p
def companions2010(folder,held):
    urls={x['file']:x['url'] for x in json.loads((folder/'companion_fetch.json').read_text()) if x.get('size')}
    parsed={};checks=[]
    for file in ['2010_half_marathon_male.htm.html','2010_half_marathon_female.htm.html']:
        path=folder/file;lines=html.fromstring(path.read_bytes()).xpath('//pre')[0].text_content().splitlines()
        if ' '.join(lines[0].split())!='Pos O/A Pos No Name Sex Age Team ChiptimeGuntime':raise ValueError('2010 heading changed')
        count=0
        for line in lines[1:]:
            if not line.strip():continue
            m=re.fullmatch(r'\s*(?P<gender_position>\d+)\s+(?P<overall_position>\d+)\s+(?P<bib>\d+)\s+(?P<name>.+?)\s+(?P<gender>[MF])\s+(?P<age>\d{1,2})\s+(?P<club>.*?)\s*(?P<chip_time>\d{1,2}:\d\d:\d\d)\s*(?P<gun_time>\d{1,2}:\d\d:\d\d)\s*',line)
            if not m:raise ValueError('2010 labelled row grammar changed')
            x=m.groupdict();x['chip_time']=p.clock(x['chip_time']);x['gun_time']=p.clock(x['gun_time'])
            if x['bib'] in parsed:raise ValueError('Repeated 2010 companion bib')
            parsed[x['bib']]={**x,'source_file':file,'source_url':urls[file],'source_sha256':r.sha(path),'raw_headed':dict(x)};count+=1
        checks.append({'year':2010,'file':file,'rows':count,'sourceUrl':urls[file],'sha256':r.sha(path),'method':'Observed gender position, overall position, bib, name, sex, age, team, chip and gun headings; all rows parsed, then matched by unique bib'})
    resolved={}
    for old in held:
        if old['year']!=2010 or old.get('bib') not in parsed:continue
        x=parsed[old['bib']]
        if any(p.norm(p.clock(old.get(k)))!=p.norm(p.clock(x[k])) for k in ['chip_time','gun_time']):continue
        if p.norm(old['name'])!=p.norm(x['name']):continue
        new={**old,**x,'provider':'Brentwood Half Marathon / Brentwood à Becket Rotary','newlyRecovered':False,'original':{**old.get('original',{}),'age':x['age'],'gender':x['gender']},'resolutionEvidence':{'basis':'Headed organiser table agrees with retained JAND timing row on name, bib, chip and gun time','priorSourceUrl':old['source_url'],'priorSourceSha256':old['source_sha256']}}
        # A consistent second primary source resolves a missing-export-only hold.
        if old['hold']=='Additional row absent from organiser export; needs reconciliation':new['previousHold']=old['hold']
        resolved[old['key']]=new
    return resolved,checks
def select_anchor_group(rows):
    anchor=max(rows,key=lambda x:(not x.get('secondary',False),bool(x.get('date')),bool(x.get('gender')),x['year'],x['key']))
    club=p.club_key(anchor.get('club'))
    return [x for x in rows if p.club_key(x.get('club'))==club] if club else [anchor]
def expand(args):
    base=json.loads(args.plan.read_text());snapshot=json.loads(args.snapshot.read_text())
    raw=[json.loads(l) for l in (args.archive/'all_results.jsonl').read_text().splitlines()]
    replacements,checks=companions2010(args.sources,base['held']);groups=collections.defaultdict(list)
    known_names={p.norm(x['displayName']).replace(' ','') for x in base['profiles']}
    for old in base['held']:
        if old['hold']=='Repeated name across years lacks a single corroborating club':groups[p.norm(old['name']).replace(' ','')].append(replacements.get(old['key'],old))
    chosen=[]
    for name,rows in groups.items():
        if name in known_names:continue
        chosen+=select_anchor_group(rows)
    selected_names={p.norm(x['name']).replace(' ','') for x in chosen}|known_names
    for old in base['held']:
        if old['hold']=='Additional row absent from organiser export; needs reconciliation' and old['key'] in replacements:
            name=p.norm(old['name']).replace(' ','')
            if name not in selected_names:chosen.append(replacements[old['key']]);selected_names.add(name)
    delta=p.plan({'rows':chosen,'held':[],'checks':checks},snapshot,raw)
    if delta['existingHistories'] or delta['paulCorrections'] or delta['reused']:raise ValueError('Anchor-only pass unexpectedly matched existing identities')
    existing_ids={x['externalId'] for x in base['profiles']+base['existingHistories']}
    if any(x['externalId'] in existing_ids for x in delta['profiles']):raise ValueError('Anchor duplicates an earlier planned identity')
    resolved_keys={key for x in delta['profiles'] for perf in x['performances'] for key in perf['sourceKeys']}
    if not resolved_keys.issubset({x['key'] for x in base['held']}):raise ValueError('Resolved key not in held ledger')
    base['profiles']+=delta['profiles'];base['held']=[replacements.get(x['key'],x) for x in base['held'] if x['key'] not in resolved_keys];base['sourceChecks']+=checks
    base['summary'].update(newProfiles=len(base['profiles']),newProfileResults=sum(len(x['performances']) for x in base['profiles']),heldRows=len(base['held']),heldReasons=dict(collections.Counter(x['hold'] for x in base['held'])),anchorProfilesAdded=len(delta['profiles']),anchorResultsAdded=len(resolved_keys))
    allkeys=[key for x in base['profiles']+base['existingHistories'] for perf in x['performances'] for key in perf['sourceKeys']]
    if len(set(allkeys))!=len(allkeys):raise ValueError('Expanded plan repeats source keys')
    if len(allkeys)+len(base['held'])+len(base['reused'])!=30788:raise ValueError('Expanded observation accounting differs')
    r.imp.dump(args.out,base)
    r.imp.dump(args.compared,{'rows':[perf['archiveReference']['original'] for x in base['profiles']+base['existingHistories'] for perf in x['performances']],'held':base['held'],'checks':base['sourceChecks']})
    print(json.dumps(base['summary']),flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['plan','snapshot','archive','sources','out','compared']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    expand(ap.parse_args())
