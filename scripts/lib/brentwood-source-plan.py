"""Heading-led source comparison and conservative, reversible profile planning."""
import collections, datetime, hashlib, importlib.util, json, pathlib, re
from lxml import html
ROOT=pathlib.Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('bp',ROOT/'prepare-wmm-profiles.py');prep=importlib.util.module_from_spec(s);s.loader.exec_module(prep)
BATCH='brentwood-archive-20261025'
def norm(x):return prep.norm(x)
def text(e):return ' '.join(e.text_content().split())
def seconds(v):
    m=re.fullmatch(r'(\d+):([0-5]\d):([0-5]\d)',str(v or ''))
    return sum(int(v)*f for v,f in zip(m.groups(),[3600,60,1])) if m else None
def clock(v):
    if not v:return ''
    v=str(v).strip()
    if re.fullmatch(r'\d+:\d\d\.\d\d',v):v=v.replace('.',':')
    m=re.fullmatch(r'(\d+):([0-5]?\d):([0-5]?\d)',v)
    if m:v=':'.join(f'{int(x):02}' for x in m.groups())
    n=seconds(v)
    return f'{n//3600:02}:{n//60%60:02}:{n%60:02}' if n is not None else v
def integer(v):
    return int(str(v)) if re.fullmatch(r'[1-9]\d*',str(v)) else None
def gender(v):return {'m':'M','male':'M','f':'F','female':'F'}.get(str(v or '').lower(),'')
def heading(h):return re.sub(r'[^a-z0-9]','',h.casefold())
def headed_table(path):
    d=html.fromstring(path.read_bytes())
    for table in d.xpath('//table'):
        trs=[tr for tr in table.xpath('.//tr') if tr.xpath('ancestor::table[1]')[0] is table];headers=None
        for tr in trs:
            vals=[text(e) for e in tr.xpath('./th|./td')]
            keys=[heading(v) for v in vals]
            if 'time' in keys and ('name' in keys or 'surname' in keys):headers=keys;continue
            if headers and len(headers)==len(vals) and vals and vals[0].strip().isdigit():yield dict(zip(headers,vals))
def pre_table(path):
    d=html.fromstring(path.read_bytes());lines=d.xpath('//pre')[0].text_content().splitlines()
    head=next(i for i,l in enumerate(lines) if 'Chiptime' in l and 'Guntime' in l)
    spans=[m.span() for m in re.finditer(r'=+',lines[head+1])]
    cols=[(heading(lines[head][a:b].strip()),a,b) for a,b in spans]
    for line in lines[head+2:]:
        row={key:line[a:b].strip() for key,a,b in cols if key}
        if row.get('pos','').isdigit():yield row
def date_in(path):
    d=html.fromstring(path.read_bytes());t=text(d)
    m=re.search(r'\b(\d{1,2})(?:st|nd|rd|th)?\s+(March)\s+(20\d\d)',t)
    return f'{m[3]}-03-{int(m[1]):02}' if m else ''
def pdf_2013(path):
    import pdfplumber
    labels=['Gun Pos','Gun Time','No','Name','M/F','Cat','Club','Chip Pos','Chip Time']
    with pdfplumber.open(path) as pdf:
        for number,page in enumerate(pdf.pages,1):
            words=page.extract_words();head=[w for w in words if 34<w['top']<38]
            groups=[];cursor=0
            for label in labels:
                parts=label.split();ws=head[cursor:cursor+len(parts)]
                if [w['text'] for w in ws]!=parts:raise ValueError('PDF heading differs')
                groups.append((label,ws[0]['x0'],ws[-1]['x1']));cursor+=len(parts)
            bounds=[0]
            for i in range(1,len(groups)):
                # Name and club are wide, left-aligned textual columns.
                bounds.append(groups[i][1]-5 if groups[i-1][0] in ('Name','Club') else (groups[i-1][2]+groups[i][1])/2)
            bounds.append(page.width)
            lines=collections.defaultdict(list)
            for w in words:
                if 42<w['top']<800:lines[round(w['top'],1)].append(w)
            for ws in lines.values():
                r={label:' '.join(w['text'] for w in ws if bounds[i] <= (w['x0']+w['x1'])/2 < bounds[i+1]) for i,label in enumerate(labels)}
                if not r['Gun Pos'].isdigit():continue
                r['page']=number;yield r
def normalize(archive,extra_dir):
    old=[json.loads(l) for l in (archive/'all_results.jsonl').read_text().splitlines()]
    sources=json.loads((archive/'sources.json').read_text());byfile=collections.defaultdict(list)
    for r in old:byfile[r['source_file']].append(r)
    mapped=[];held=[];comparisons=[]
    for source_file,expected in byfile.items():
        y=expected[0]['year'];path=archive/source_file;url=expected[0]['source_url'];date='';rows=[];provider='Brentwood Half Marathon / Brentwood à Becket Rotary'
        if y in (2011,2012,2014):
            held.extend({**r,'hold':'Headerless source; column meanings require a headed companion','key':f'{y}:{source_file}:{i+1}'} for i,r in enumerate(expected));continue
        if y==2010:
            path=extra_dir/'jand_2010.html';url='https://web.archive.org/web/20100325191524id_/http://jand.co.uk:80/Results2010/Brentwood_Half.htm'
        if y<=2006:
            date=date_in(path)
            for x in headed_table(path):
                name=x.get('name') or ' '.join([x.get('forename',''),x.get('surname','')]);time=x['time']
                if y==2003:
                    m=re.fullmatch(r'(\d+)\.(\d\d)',time)
                    if not m:raise ValueError('Unexpected 2003 minutes.seconds')
                    n=int(m[1])*60+int(m[2]);time=f'{n//3600:02}:{n//60%60:02}:{n%60:02}'
                r={'name':name,'bib':x.get('raceno',x.get('num',x.get('no',''))),'recorded_time':clock(time),'gender':'','club':'','category':''}
                if y in (2003,2004,2006):
                    r['gender_position']=x.get('pos',x.get('posn',x.get('place',x.get('position',''))));r['gender']=expected[0]['gender']
                    if y==2003:r['overall_position']=x.get('oall','')
                else:r['overall_position']=x['position']
                r['status']='Provisional' if y==2006 else '';r['raw_headed']=x;rows.append(r)
        elif y<=2010:
            date=date_in(path);provider='JAND Results'
            for x in pre_table(path):rows.append({'name':x['name'],'bib':x['no'],'overall_position':x['pos'],'chip_time':clock(x['chiptime']),'gun_time':clock(x['guntime']),'club':x.get('team',''),'gender':'','category':'','status':'','raw_headed':x})
        elif y==2013:
            provider='FR Systems';path=extra_dir/'frsystems_2013.pdf'
            for x in pdf_2013(path):rows.append({'name':x['Name'],'bib':x['No'],'overall_position':x['Gun Pos'],'chip_time':clock(x['Chip Time']),'gun_time':clock(x['Gun Time']),'club':x['Club'],'gender':gender(x['M/F']),'category':x['Cat'],'status':'','raw_headed':x})
        elif y<=2024:
            import pandas as pd
            frame=pd.read_csv(path,dtype=str).fillna('') if path.suffix=='.csv' else pd.read_excel(path,dtype=str).fillna('')
            frame.columns=[heading(str(c)) for c in frame.columns]
            if not {'bib'}.issubset(frame.columns):raise ValueError('Missing source headings')
            for x in frame.to_dict('records'):
                if not str(x.get('bib','')).strip():continue
                rows.append({'name':x.get('name') or ' '.join([x.get('forename',''),x.get('surname','')]),'bib':x['bib'],'overall_position':x.get('overallposition',x.get('gunpos','')),'chip_time':clock(x['chiptime']),'gun_time':clock(x['guntime']),'club':x.get('teamclub',x.get('club','')),'gender':gender(x.get('gender',x.get('mf',''))),'category':x.get('category',x.get('cat','')),'category_position':x.get('categoryposition',''),'gender_position':x.get('genderposition',''),'status':x.get('status',''),'raw_headed':x})
        else:
            provider='FR Systems / MYLAPS Sporthive'
            for e in expected:
                x=e['raw'];date=x['date'][:10]
                rows.append({'name':x['name'],'bib':x['bib'],'overall_position':str(x['overallPosition']),'chip_time':clock(x['chipTimeOfParticipant']),'gun_time':clock(x['gunTimeOfParticipant']),'club':x.get('teamName',''),'gender':gender(x.get('gender')),'category':x.get('raceCategory',''),'category_position':str(x.get('categoryPosition','')),'gender_position':str(x.get('genderPosition','')),'status':'DQ' if x.get('dsq') else 'DNS' if x.get('dns') else 'Finished','raw_headed':x})
        if len(rows)<len(expected):raise ValueError(f'{y} source count mismatch {len(rows)} {len(expected)}')
        expected_by={(str(r['bib']),str(r.get('overall_position',r.get('gender_position','')))):r for r in expected}
        expected_bibs=collections.Counter(str(r['bib']) for r in expected)
        expected_by_bib={str(r['bib']):r for r in expected if expected_bibs[str(r['bib'])]==1}
        if len(expected_by)!=len(expected):
            # Original duplicated bib/place combinations must remain separate observations.
            expected_by=None
        # Independent re-extraction must agree with prior research on every core field.
        for i,r in enumerate(rows):
            e=expected_by.get((str(r['bib']),str(r.get('overall_position',r.get('gender_position',''))))) if expected_by is not None else expected[i]
            if e is None:e=expected_by_bib.get(str(r['bib']))
            if e is None:
                if y not in (2008,2010,2013):raise ValueError('Unexpected extra source row')
                e={};r['newlyRecovered']=True
            for field in ['name','bib','overall_position','gender_position','chip_time','gun_time','recorded_time']:
                if field not in r or field not in e:continue
                a,b=r[field],e[field]
                if field.endswith('time'):a,b=clock(a),clock(b)
                if norm(a)!=norm(b):r.setdefault('comparisonDifferences',[]).append({'field':field,'headedSource':a,'priorExtraction':b})
            mapped.append({**r,'year':y,'date':date,'source_file':source_file,'source_url':url,'provider':provider,'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'key':f'{y}:{source_file}:{i+1}','original':e})
        comparisons.append({'year':y,'file':source_file,'rows':len(rows),'sourceUrl':url,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'method':'Independently mapped by observed column headings / named JSON keys; core fields compared with retained research'})
    return mapped,held,comparisons

def extra_results(folder):
    rows=[]
    urls={'witham_2026.html':'https://www.withamrc.org.uk/club-news/results-22-3-26/','beagles_2026.html':'https://www.beagles.org.uk/march-2026/','bakers_2026.html':'https://www.bakerlabels.co.uk/brentwood-half-marathon-2026/'}
    def add(file,name,time,place='',club='',gender_='',gender_place=''):
        rows.append({'year':2026,'date':'2026-03-22','name':name,'bib':'','recorded_time':clock(time),'overall_position':str(place),'gender':gender_,'gender_position':str(gender_place),'club':club,'category':'','status':'Finished','source_url':urls[file],'source_file':file,'provider':{'witham_2026.html':'Witham Running Club','beagles_2026.html':'Brentwood Beagles AC','bakers_2026.html':'Bakers / event organising partner'}[file],'source_sha256':hashlib.sha256((folder/file).read_bytes()).hexdigest(),'key':f'2026:{file}:{name}','secondary':True})
    d=html.fromstring((folder/'witham_2026.html').read_bytes());table=next(t for t in d.xpath('//table') if 'Richard Green' in text(t));trs=table.xpath('.//tr');headers=[heading(text(e)) for e in trs[0].xpath('./td|./th')]
    for tr in trs[1:]:
        x=dict(zip(headers,[text(e) for e in tr.xpath('./td|./th')]));add('witham_2026.html',x['name'],x['time'],x['pos'],'Witham Running Club')
    d=html.fromstring((folder/'beagles_2026.html').read_bytes());h=next(e for e in d.xpath('//h2') if text(e)=='Brentwood Half Marathon');block=[]
    for e in h.itersiblings():
        if e.tag=='h2':break
        block.append(e)
    for e in block:
        for li in e.xpath('.//li'):
            m=re.fullmatch(r'(.+?) \((\d+:\d\d[.:]\d\d)\), (\d+)(?:st|nd|rd|th)',text(li))
            if not m:raise ValueError('Unrecognized Beagles result')
            add('beagles_2026.html',m[1],m[2],m[3],'Brentwood Beagles AC')
    prose=' '.join(text(e) for e in block if e.tag=='p')
    for name,place in [('Max Sanderson','4'),('Jamie Williams',''),('Andy Leonard','')]:
        m=re.search(re.escape(name)+r' \((\d+:\d\d[.:]\d\d)\)',prose)
        if not m:raise ValueError('Missing Beagles named result')
        add('beagles_2026.html',name,m[1],place,'Brentwood Beagles AC')
    # Explicit narrative results inspected in the organising partner's report.
    d=html.fromstring((folder/'bakers_2026.html').read_bytes());prose=text(d)
    for name,time,g,place,gp in [('Adam Hickey','1:04:59','M','','1'),('Oluwatosin Emmanuel Adedeji','1:06:41','M','','2'),('Thomas Beedell','1:10:22','M','','3'),('Lauren Reed','1:15:58','F','','1'),('Francesca Stocco','1:21:57','F','','2'),('Rebecca O’Kill','1:24:15','F','','3'),('Bobby Dailly','1:15:42','','12','')]:
        if name not in prose or time not in prose:raise ValueError('Narrative result missing')
        add('bakers_2026.html',name,time,place,'',g,gp)
    return rows

def club_key(value):
    words=[w for w in norm(value).split() if w not in {'running','runner','runners','road','athletic','athletics','ac','rc','club','the','and','a','c','r'}]
    key=' '.join(words)
    return '' if key in {'','unattached','unaffiliated','none','n a','no','0','not affiliated'} else key
def athlete_clubs(a,histories):
    values=[a.get('source_club_name'),a.get('source_second_club_name'),*(a.get('primary_clubs') or [])]
    for c in a.get('clubs') or []:values.extend([c.get('name'),c.get('sourceName')])
    def walk(v):
        if isinstance(v,dict):
            for k,x in v.items():
                if k in {'club','clubName','teamName','club_name','clubname','Team / Club','Club'} and isinstance(x,str):values.append(x)
                elif isinstance(x,(dict,list)):walk(x)
        elif isinstance(v,list):
            for x in v:walk(x)
    for h in histories:walk(h['performances'])
    return {club_key(v) for v in values if club_key(v)}
def performance(r):
    timing={'basis':'chip' if r.get('chip_time') else 'gun' if r.get('gun_time') else 'unknown'}
    if r.get('chip_time'):timing['chip']=r['chip_time']
    if r.get('gun_time'):timing['gun']=r['gun_time']
    labels=['Athlete identity provisional']
    if r.get('secondary'):labels.append('Club / organiser report')
    if not r.get('date'):labels.append('Exact race date not established')
    if r.get('status')=='Provisional':labels.append('Provisional source result')
    p={'year':r['year'],'date':r.get('date',''),'sourceDate':r.get('date') or str(r['year']),'yearLabel':str(r['year']),'ageGroup':r.get('category',''),'discipline':'Half Marathon','performance':r.get('chip_time') or r.get('gun_time') or r['recorded_time'],'timing':timing,'wind':'','place':r.get('overall_position',''),'places':{'overall':integer(r.get('overall_position')),'gender':integer(r.get('gender_position')),'category':integer(r.get('category_position'))},'bib':r.get('bib',''),'venue':'Brentwood, Essex','meeting':'Brentwood Half Marathon','eventSlug':'brentwood-half-marathon','country':'United Kingdom','sourceUrls':[r['source_url']],'sourceKeys':[r['key']],'labels':labels,'providerName':r['provider'],'verificationStatus':'unverified','notes':'Source row compared by labelled fields. Identity and account ownership are separate; identity is not independently verified. Historical club is retained as evidence, not asserted as current membership.','archiveReference':{'batchId':BATCH,'original':r,'sourceCompared':True,'identityVerified':False}}
    return p
def plan(data,snapshot,archive_rows):
    rows=data['rows'];held=list(data['held']);reasons=collections.Counter();groups=collections.defaultdict(list)
    all_names=collections.defaultdict(list)
    for r in [*archive_rows,*rows]:all_names[norm(r['name']).replace(' ','')].append(r)
    # Source-wide typo/nickname screening prevents two near-name provisional profiles.
    source_index=collections.defaultdict(set)
    for key,rs in all_names.items():prep.add(source_index,key,[r['name'] for r in rs])
    duplicate_bibs=collections.Counter((r['year'],r.get('bib')) for r in rows if r.get('bib'))
    for r in rows:
        why=[];ts=norm(r['name']).split()
        if len(ts)<2 or any(len(t)==1 for t in (ts[:1]+ts[-1:])) or any(w in ts for w in ['unknown','details','chip','runner','number']):why.append('Unidentified or incomplete name')
        if r.get('status','').upper() not in {'','FINISHED','PROVISIONAL'}:why.append('Non-finish / unresolved status')
        if not seconds(r.get('chip_time') or r.get('gun_time') or r.get('recorded_time')):why.append('No exact finish time')
        if r.get('chip_time') and r.get('gun_time') and seconds(r['chip_time']) and seconds(r['gun_time']) and seconds(r['chip_time'])>seconds(r['gun_time']):why.append('Chip time exceeds gun time')
        if r.get('bib') and duplicate_bibs[r['year'],r['bib']]>1:why.append('Conflicting repeated bib in edition')
        diffs=r.get('comparisonDifferences',[])
        if any(d['field'] in ('chip_time','gun_time','recorded_time','bib') for d in diffs):why.append('Conflicting source performance')
        if any(d['field']=='name' for d in diffs):why.append('Source name differs between versions')
        if any(d['field']=='overall_position' for d in diffs):
            r=dict(r);r['overall_position']='';r['positionQualification']='Overall place omitted because source versions disagree'
        if r.get('newlyRecovered') and r['year']!=2008:why.append('Additional row absent from organiser export; needs reconciliation')
        if why:held.append({**r,'hold':'; '.join(why)});reasons.update(why)
        else:groups[norm(r['name']).replace(' ','')].append(r)
    byhist=collections.defaultdict(list)
    for h in snapshot['histories']:byhist[str(h['athlete_id'])].append(h)
    byresult=collections.defaultdict(list)
    for r in snapshot['results']:byresult[str(r['athlete_id'])].append(r)
    profiles=[];links=[];reused=[];paul=[]
    for key,rs in groups.items():
        years=collections.Counter(r['year'] for r in rs)
        if max(years.values())>1:
            held.extend({**r,'hold':'Multiple same-name performances in one edition'} for r in rs);continue
        candidates=set().union(*(set(snapshot['index'].get(k,[])) for r in rs for k in prep.name_keys(r['name'])))
        if key in {norm('Paul Browne').replace(' ',''),norm('Paul Wagner').replace(' ','')}:
            for r in rs:
                if (r['year'],r['bib']) in {(2007,'2002'),(2008,'964')}:paul.append(r)
                else:held.append({**r,'hold':'Paul name candidate without confirmed participation match'})
            continue
        nearby=prep.matching(source_index,[r['name'] for r in rs],own=key)
        if candidates:
            for r in rs:
                matches=[]
                for ident in candidates:
                    if not ident.startswith('athrecs:'):continue
                    aid=ident.split(':')[1];a=snapshot['entities'][aid]
                    if a.get('parent_athlete_id') or a.get('profile_visibility')!='public' or int(a.get('active_accounts',0)):continue
                    if key not in {norm(n).replace(' ','') for n in a['names'] if n}:continue
                    if r.get('gender') and gender(a.get('gender')) and r['gender']!=gender(a['gender']):continue
                    c=club_key(r.get('club'))
                    if c and c in athlete_clubs(a,byhist[aid]):matches.append(aid)
                if len(matches)!=1:
                    held.append({**r,'hold':'Existing name/alias candidate lacks unique corroborating identity evidence','candidates':sorted(candidates)});continue
                aid=matches[0];existing=[]
                for h in byhist[aid]:
                    for p in h['performances']:
                        if ('brentwood' in norm(p.get('meeting')) or p.get('eventSlug')=='brentwood-half-marathon') and p.get('year')==r['year']:existing.append({'kind':'history','provider':h['provider'],'externalId':h['external_id'],'performance':p})
                for e in byresult[aid]:
                    if e['event_slug']=='brentwood-half-marathon' and str(e['event_date']).startswith(str(r['year'])):existing.append({'kind':'result','row':e})
                if existing:
                    target=seconds(r.get('chip_time') or r.get('gun_time') or r.get('recorded_time'))
                    if all((seconds(e['performance'].get('performance')) if e['kind']=='history' else e['row'].get('finish_time_seconds'))==target for e in existing):reused.append({'athleteId':int(aid),'row':r,'existing':existing})
                    else:held.append({**r,'hold':'Existing Brentwood result needs conflict review','athleteId':int(aid)})
                else:links.append({'athleteId':int(aid),'row':r,'identityEvidence':{'basis':'Exact full name or stored alias, specific source-reported club, compatible supplied gender, unique candidate','clubKey':club_key(r.get('club')),'candidateIds':sorted(candidates)}})
            continue
        if nearby:
            held.extend({**r,'hold':'Potential source name/nickname/spelling duplicate','otherSourceNames':sorted(nearby)} for r in rs);continue
        genders={r.get('gender') for r in rs if r.get('gender')}
        if len(genders)>1:
            held.extend({**r,'hold':'Conflicting source genders'} for r in rs);continue
        # One public source-located performance may create an unclaimed profile.
        # Cross-edition consolidation additionally requires a specific shared club.
        if len(rs)>1:
            clubs={club_key(r.get('club')) for r in rs if club_key(r.get('club'))}
            if len(clubs)!=1:
                held.extend({**r,'hold':'Repeated name across years lacks a single corroborating club'} for r in rs);continue
            eligible=[r for r in rs if club_key(r.get('club'))]
            held.extend({**r,'hold':'Name-only cross-edition link held'} for r in rs if not club_key(r.get('club')))
            rs=eligible
        if not rs:continue
        name=rs[-1]['name'].title() if rs[-1]['name'].isupper() else rs[-1]['name'];external='brentwood:'+hashlib.sha256(key.encode()).hexdigest()[:24]
        slug=re.sub('[^a-z0-9]+','-',norm(name)).strip('-')[:90]+'-brentwood-'+external.split(':')[1][:12]
        profiles.append({'externalId':external,'slug':slug,'displayName':name,'givenName':name.split()[0],'familyName':' '.join(name.split()[1:]),'gender':next(iter(genders),'U'),'sourceUrl':rs[0]['source_url'],'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'years':sorted({r['year'] for r in rs}),'performances':[performance(r) for r in rs],'rows':[r['key'] for r in rs],'details':{'aliases':sorted({r['name'] for r in rs}),'athlete_verified':False,'identity_review_status':'provisional_source_profile','currentClubAssociationConfirmed':False,'archiveCreation':{'batchId':BATCH,'sourceRowsCompared':True,'identityVerified':False,'sourceKeys':[r['key'] for r in rs],'identityBasis':'Single source-located result; or exact name and matching specific historical club across distinct editions'}}})
    grouped_links=collections.defaultdict(list)
    for x in links:grouped_links[x['athleteId']].append(x)
    histories=[{'athleteId':aid,'externalId':'brentwood:existing:'+str(aid),'sourceUrl':xs[0]['row']['source_url'],'years':sorted({x['row']['year'] for x in xs}),'performances':[performance(x['row']) for x in xs],'identityEvidence':[x['identityEvidence'] for x in xs],'expectedName':snapshot['entities'][str(aid)]['display_name'],'expectedDetails':snapshot['entities'][str(aid)]['profile_details']} for aid,xs in grouped_links.items()]
    return {'batch':BATCH,'profiles':profiles,'existingHistories':histories,'reused':reused,'paulCorrections':paul,'held':held,'sourceChecks':data['checks'],'summary':{'newProfiles':len(profiles),'newProfileResults':sum(len(p['performances']) for p in profiles),'existingProfilesEnriched':len(histories),'existingProfileResults':len(links),'existingResultsReused':len(reused),'paulCorrections':len(paul),'heldRows':len(held),'heldReasons':dict(collections.Counter(h['hold'] for h in held))}}
