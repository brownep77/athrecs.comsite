"""Reconcile retained Brentwood observations using headed companion sources.

The private input archive and directory snapshot are never committed. This pass
only reconsiders previously held keys, preserving their original observations.
"""
import argparse, collections, datetime, hashlib, importlib.util, json, pathlib, zipfile
from lxml import html
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
p=load('resolution_source_plan','lib/brentwood-source-plan.py')
imp=load('resolution_import','brentwood-profile-import.py')
BATCH='brentwood-resolution-20261025'
ORIGINAL_BATCH=imp.BATCH
ORIGINAL_CLUB_KEY=p.club_key
def club_key(value):
    # Whitespace differences do not change a club identity. No approximate
    # matching or abbreviation expansion is applied here.
    return ORIGINAL_CLUB_KEY(value).replace(' ','')
p.club_key=club_key
p.BATCH=BATCH
URLS={
 'half_results_male.php.html':'https://web.archive.org/web/20111107231142id_/http://www.brentwoodhalf.org:80/Results/half_results_male.php',
 'half_results_female.php.html':'https://web.archive.org/web/20111107231114id_/http://www.brentwoodhalf.org:80/Results/half_results_female.php',
 'saffron_2011.html':'https://www.saffronstriders.org.uk/oldresults/rslt11/013.htm',
 'eerr_2012.html':'https://www.eerr.org.uk/results-historic?page=161',
}
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def year2011(folder,old):
    bybib={str(r['bib']):r for r in old if r['year']==2011}
    if len(bybib)!=2020:raise ValueError('Unexpected 2011 archive coverage')
    date_text=p.text(html.fromstring((folder/'saffron_2011.html').read_bytes()))
    if '20 March 2011' not in date_text or 'Fiona Tideswell' not in date_text or '01:28:25' not in date_text:raise ValueError('2011 date corroboration missing')
    rows=[];seen=set();checks=[]
    for name,g in [('half_results_male.php.html','M'),('half_results_female.php.html','F')]:
        path=folder/name;doc=html.fromstring(path.read_bytes())
        table=next(t for t in doc.xpath('//table') if 'Surname' in t.text_content() and 'Chiptime' in t.text_content())
        trs=table.xpath('.//tr');head=[p.heading(p.text(c)) for c in trs[0].xpath('./th|./td')]
        required={'position','surname','forename','age','no','chiptime','guntime','teamclub'}
        if set(head)!=required:raise ValueError('2011 headings changed')
        count=0
        for tr in trs[1:]:
            values=[p.text(c) for c in tr.xpath('./td|./th')]
            if len(values)!=len(head):raise ValueError('2011 row width changed')
            x=dict(zip(head,values));bib=x['no'];o=bybib.get(bib)
            if not o or bib in seen:raise ValueError('Unexpected or repeated 2011 bib')
            seen.add(bib);count+=1
            r={'name':x['forename']+' '+x['surname'],'bib':bib,'year':2011,'date':'2011-03-20','chip_time':p.clock(x['chiptime']),'gun_time':p.clock(x['guntime']),
               'overall_position':x['position'],'gender':g,'club':x['teamclub'],'category':'','age':x['age'],'status':'Finished' if x['position'].isdigit() else x['position'],
               'source_file':name,'source_url':URLS[name],'provider':'Brentwood Half Marathon / Brentwood à Becket Rotary','source_sha256':sha(path),'raw_headed':x,'key':o['key'],
               'original':{**o,'age':x['age'],'gender':g},'resolutionEvidence':{'basis':'Archived organiser table with explicit headings; matched retained row by unique bib and name','dateSource':URLS['saffron_2011.html'],'originalHold':o['hold']}}
            for field in ['name','chip_time','gun_time','overall_position']:
                a,b=r[field],o.get(field,'')
                if field.endswith('time'):a,b=p.clock(a),p.clock(b)
                if p.norm(a)!=p.norm(b):r.setdefault('comparisonDifferences',[]).append({'field':field,'headedSource':a,'priorExtraction':b})
            rows.append(r)
        checks.append({'year':2011,'file':name,'rows':count,'sourceUrl':URLS[name],'sha256':sha(path),'method':'Mapped observed table headings, compared each retained row by unique bib and name; source time disagreements remain held'})
    if seen!=set(bybib):raise ValueError('Missing 2011 companion rows')
    return rows,checks
def corroborated2012(folder,old):
    path=folder/'eerr_2012.html';doc=html.fromstring(path.read_bytes())
    table=next(t for t in doc.xpath('//table') if 'Runner Chip Time' in t.text_content())
    trs=table.xpath('.//tr');head=[p.heading(p.text(c)) for c in trs[0].xpath('./th|./td')]
    if not {'title','runnerchiptime','runnername','runnerposition','distance'}.issubset(head):raise ValueError('Club headings changed')
    prior={p.norm(r['name']):r for r in old if r['year']==2012};rows=[];conflicts=[]
    for tr in trs[1:]:
        x=dict(zip(head,[p.text(c) for c in tr.xpath('./th|./td')]))
        if x.get('title')!='Brentwood Half Marathon (25/03/2012)' or x.get('distance')!='HM':continue
        o=prior.get(p.norm(x['runnername']))
        if not o:continue
        time=p.clock(x['runnerchiptime'])
        if time!=p.clock(o['chip_time']):
            conflicts.append({'key':o['key'],'name':o['name'],'sourceUrl':URLS['eerr_2012.html'],'reportedChipTime':time,'retainedTime':o['chip_time'],'decision':'Keep held; sources disagree'});continue
        rows.append({'name':x['runnername'],'bib':'','year':2012,'date':'2012-03-25','chip_time':time,'gun_time':'','overall_position':'','gender':'','club':'East End Road Runners','category':'','status':'Finished',
          'source_file':path.name,'source_url':URLS[path.name],'provider':'East End Road Runners','source_sha256':sha(path),'raw_headed':x,'key':o['key'],'original':o,'secondary':True,
          'resolutionEvidence':{'basis':'Named club result with labelled chip time agrees exactly with retained organiser observation','positionQualification':'Omitted because source versions disagree','originalHold':o['hold']}})
    return rows,[{'year':2012,'file':path.name,'rows':len(rows),'sourceUrl':URLS[path.name],'sha256':sha(path),'method':'Only individually corroborated names and labelled chip times reconsidered; no unheaded bib, age, gun time or placing copied','conflicts':conflicts}]
def age_window(r):
    age=r.get('age') or (r.get('original') or {}).get('age')
    if str(age).isdigit() and r.get('year'):
        y=int(r['year'])-int(age);return y-1,y
    return None
def history_conflict(row,histories):
    rg=p.gender(row.get('gender')) or p.gender((row.get('original') or {}).get('gender'));rw=age_window(row)
    for h in histories:
        for perf in h.get('performances') or []:
            original=(perf.get('archiveReference') or {}).get('original') or {}
            if not isinstance(original,dict):continue
            og=p.gender(original.get('gender')) or p.gender((original.get('original') or {}).get('gender'))
            if rg and og and rg!=og:return 'Source gender conflicts with existing historical evidence'
            ow=age_window(original)
            if rw and ow and max(rw[0],ow[0])>min(rw[1],ow[1]):return 'Source age conflicts with existing historical evidence'
    return ''
def prepare(args):
    with zipfile.ZipFile(args.audit) as z:old=[json.loads(line) for line in z.read('held_for_review.jsonl').splitlines()]
    for r in old:
        if not r.get('key'):r['key']='retained-unmatched:'+hashlib.sha256(json.dumps(r,sort_keys=True).encode()).hexdigest()[:24]
    snapshot=json.loads(args.snapshot.read_text());raw=[json.loads(line) for line in (args.archive/'all_results.jsonl').read_text().splitlines()]
    resolved,checks=year2011(args.sources,old);more,check=corroborated2012(args.sources,old);resolved+=more;checks+=check
    replacement={r['key']:r for r in resolved}
    structural={'Headerless source; column meanings require a headed companion','Present in organiser 2013 export but absent from the headed PDF version','Source age observation conflicts with existing birth year','Unheaded source gender observation conflicts with profile gender'}
    reconsider=[];unresolved=[]
    for r in old:
        if r['key'] in replacement:reconsider.append(replacement[r['key']])
        elif r['hold'] in structural:unresolved.append(r)
        else:reconsider.append({**r,'previousHold':r['hold']})
    data={'rows':reconsider,'held':unresolved,'checks':checks}
    result=p.plan(data,snapshot,raw,resolve_partial_clubs=True)
    byhist=collections.defaultdict(list)
    for h in snapshot['histories']:byhist[str(h['athlete_id'])].append(h)
    accepted=[]
    for h in result['existingHistories']:
        aid=str(h['athleteId']);a=snapshot['entities'][aid];perfs=[];evidence=[]
        for perf,ev in zip(h['performances'],h['identityEvidence']):
            row=perf['archiveReference']['original'];why=history_conflict(row,byhist[aid])
            if why:result['held'].append({**row,'hold':why,'athleteId':int(aid)})
            else:perfs.append(perf);evidence.append(ev)
        if not perfs:continue
        h.update(performances=perfs,identityEvidence=evidence,years=sorted({x['year'] for x in perfs}),externalId=f'brentwood:resolution:20261025:existing:{aid}',expectedGender=a.get('gender'),expectedDob=a.get('date_of_birth'),expectedSourceClub=a.get('source_club_name'),expectedSourceSecondClub=a.get('source_second_club_name'),expectedClubId=a.get('club_id'),expectedSecondClubId=a.get('second_club_id'))
        accepted.append(h)
    result['existingHistories']=accepted
    # No source key can be published twice, including across separate profiles.
    keys=[k for h in result['profiles']+result['existingHistories'] for perf in h['performances'] for k in perf['sourceKeys']]
    if len(keys)!=len(set(keys)):raise ValueError('Duplicate planned source keys')
    original_keys={r['key'] for r in old};held_keys=[r['key'] for r in result['held']];reused_keys=[r['row']['key'] for r in result['reused']]
    if set(keys)&set(held_keys) or set(keys)&set(reused_keys):raise ValueError('Publication/hold overlap')
    if original_keys!=set(keys+held_keys+reused_keys+[r['key'] for r in result['paulCorrections']]):raise ValueError('Observation accounting differs')
    result['summary'].update(newProfiles=len(result['profiles']),newProfileResults=sum(len(x['performances']) for x in result['profiles']),existingProfilesEnriched=len(accepted),existingProfileResults=sum(len(x['performances']) for x in accepted),heldRows=len(result['held']),heldReasons=dict(collections.Counter(x['hold'] for x in result['held'])))
    result['summary']['reconsideredRows']=len(reconsider)
    imp.dump(args.out,result);imp.dump(args.compared,data)
    print(json.dumps(result['summary']),flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['audit','snapshot','archive','sources','out','compared']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    prepare(ap.parse_args())
