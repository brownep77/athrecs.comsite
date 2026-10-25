"""Continue a retained Brentwood audit with primary 2026 and companion evidence.

Inputs and outputs contain private matching evidence and belong outside git.
The headed-source, identity, publication and same-edition checks remain separate.
"""
import argparse,collections,copy,datetime,hashlib,importlib.util,json,pathlib,re,zipfile
from lxml import html
ROOT=pathlib.Path(__file__).resolve().parent
def load(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
r=load('continuation_resolution','resolve-brentwood-held.py');p=r.p
expander=load('continuation_expander','expand-brentwood-resolution.py')
BATCH='brentwood-continuation-20261025';PREFIX='brentwood:continuation-20261025:'
URL2026='https://results.frsys.uk/events/jd7e62f7d5k9webfakgefe74ch836ssp/1'
URL2013='https://web.archive.org/web/20130327032749id_/http://www.brentwoodhalf.org:80/Results/half_results_female.php'
def name_key(name):return p.norm(name).replace(' ','')
def same_name_or_variant(a,b):
    aa=p.norm(a).split();bb=p.norm(b).split()
    return ''.join(aa)==''.join(bb) or (len(aa)==len(bb) and len(aa)>1 and aa[1:]==bb[1:] and frozenset((aa[0],bb[0])) in p.NAME_VARIANT_PAIRS)
def row_time(row):return p.clock(row.get('chip_time') or row.get('gun_time') or row.get('recorded_time'))
def source_2026(folder):
    path=folder/'frsys_2026_results.json';data=json.loads(path.read_text())
    meta=json.loads((folder/'resultVersions.json').read_text())['value']
    event=json.loads((folder/'events.json').read_text())['value']
    if meta.get('restricted') or not meta.get('resultsComplete') or event.get('hideTotals')==1 or event.get('hidedownload')==1:raise ValueError('2026 public coverage changed')
    if event['date']!='22/03/2026' or event['name']!='2026 Brentwood Half':raise ValueError('Wrong event')
    doc=html.fromstring((folder/'frsys_2026.html').read_bytes())
    props=json.loads(next(x for x in doc.xpath('//*[@component-url]') if 'ResultsView' in x.get('component-url')).get('props'))
    if props['raceName'][1]!='Half' or props['raceDistance'][1]!=13.1 or props['raceDistanceType'][1]!='miles':raise ValueError('Wrong distance')
    fields=['_id','name','bib','chipTime','gunTime','overallPosition','gender','genderPosition','category','categoryPosition','team']
    other=json.loads((folder/'frsys_2026_paginated.json').read_text())
    signature=lambda rows:{x['_id']:{k:x.get(k) for k in fields} for x in rows}
    if signature(data['results'])!=signature(other) or len(data['results'])!=len(signature(data['results'])):raise ValueError('Paginated rows disagree')
    out=[]
    for x in data['results']:
        if x['raceDbId']!=props['raceDbId'][1]:raise ValueError('Race mismatch')
        out.append({'name':x['name'],'bib':x['bib'],'year':2026,'date':'2026-03-22','chip_time':p.clock(x['chipTime']),'gun_time':p.clock(x['gunTime']),
          'overall_position':str(x['overallPosition']),'gender':x['gender'],'gender_position':str(x['genderPosition']),'category':x['category'],'category_position':str(x['categoryPosition']),
          'club':x.get('team',''),'status':'Finished','source_file':path.name,'source_url':URL2026,'provider':'FR Systems','source_sha256':r.sha(path),'raw_headed':x,
          'key':'2026:frsystems:'+x['_id'],'resolutionEvidence':{'basis':'Organiser-linked timing provider; public full results and independently paginated rows agree on named fields','checkedAt':'2026-10-25','version':data['version']}})
    return out,{'year':2026,'sourceUrl':URL2026,'rows':len(out),'sha256':r.sha(path),'method':'Public full feed compared with all five public pagination responses; named fields, event, date and distance checked','providerReportsComplete':data['resultsComplete']}
def female2013(folder,held):
    path=folder/'organiser_2013_female.html';doc=html.fromstring(path.read_bytes());table=doc.xpath('//table')[-1];trs=table.xpath('.//tr')
    headings=[p.heading(p.text(x)) for x in trs[0].xpath('./td|./th')]
    if headings!=['gunpos','raceno','firstname','lastname','gender','cat','teamclub','guntime','chippos','chiptime']:raise ValueError('2013 headings changed')
    index=collections.defaultdict(list)
    for tr in trs[1:]:
        cells=[p.text(x) for x in tr.xpath('./td|./th')]
        if len(cells)!=len(headings):raise ValueError('2013 table width changed')
        x=dict(zip(headings,cells));index[x['raceno']].append(x)
    replacements={};conflicts=[]
    for old in held:
        if old['year']!=2013:continue
        matches=[x for x in index.get(old.get('bib'),[]) if name_key(x['firstname']+' '+x['lastname'])==name_key(old['name'])]
        if len(matches)!=1:continue
        x=matches[0]
        if not re.fullmatch(r'\d{1,2}:\d{2}:\d{2}',x['chiptime']) or not re.fullmatch(r'\d{1,2}:\d{2}:\d{2}',x['guntime']):continue
        if any(p.clock(old.get(k))!=p.clock(x[v]) for k,v in [('chip_time','chiptime'),('gun_time','guntime')]):
            conflicts.append({'key':old['key'],'reason':'2013 headed companion timing disagreement'});continue
        new={**old,'name':x['firstname']+' '+x['lastname'],'gender':x['gender'],'category':x['cat'],'club':x['teamclub'],'source_file':path.name,'source_url':URL2013,
          'provider':'Brentwood Half Marathon / Brentwood à Becket Rotary','source_sha256':r.sha(path),'raw_headed':x,'newlyRecovered':False,
          'resolutionEvidence':{'basis':'Headed archived organiser women table confirms name, bib, chip and gun times','priorSourceUrl':old['source_url'],'priorSourceSha256':old.get('source_sha256'),'originalHold':old['hold']}}
        # Do not discard recorded discrepancies with another source version.
        replacements[old['key']]=new
    return replacements,{'year':2013,'sourceUrl':URL2013,'sha256':r.sha(path),'rows':sum(map(len,index.values())),'retainedRowsCompared':len(replacements),'conflicts':conflicts,'method':'Mapped explicit headings; compared unique name/bib and both times, retaining disagreements'}
def club_companions(folder,held):
    replacements={};checks=[]
    for path in sorted(folder.glob('serpentine_race_*.html')):
        doc=html.fromstring(path.read_bytes());tables=doc.xpath('//table')
        if len(tables)!=1:raise ValueError('Club table changed')
        trs=tables[0].xpath('.//tr');head=[p.heading(p.text(c)) for c in trs[0].xpath('./td|./th')]
        if not {'name','time','club','date','series','cat'}.issubset(head):raise ValueError('Club headings changed')
        rows=[];matched=[]
        for tr in trs[1:]:
            x=dict(zip(head,[p.text(c) for c in tr.xpath('./td|./th')]))
            if x['series']!='Brentwood Half Marathon':raise ValueError('Unexpected race row')
            date=datetime.datetime.strptime(x['date'],'%a, %B %d, %Y').date();time=p.clock(x['time']);rows.append(x)
            candidates=[old for old in held if old['year']==date.year and name_key(old['name'])==name_key(x['name']) and time in {p.clock(old.get(k)) for k in ['chip_time','gun_time','recorded_time']}]
            if len(candidates)!=1:continue
            old=candidates[0]
            if old.get('club') and p.club_key(old['club'])!=p.club_key(x['club']):continue
            url='https://www.serpentine.org.uk/results/race/?race='+path.stem.rsplit('_',1)[1]
            ev={'basis':'Club table explicitly supplies name, time, race, date and club; matches retained organiser observation','sourceUrl':url,'sourceSha256':r.sha(path),'sourceRow':x,'placingQualification':'Club table positions omitted; these are not established overall race places'}
            if 'Headerless' in old['hold']:
                new={'name':x['name'],'year':date.year,'date':date.isoformat(),'bib':'','recorded_time':time,'chip_time':'','gun_time':'','overall_position':'','gender':'','category':x['cat'],'club':x['club'],'status':'Finished',
                  'source_file':path.name,'source_url':url,'source_sha256':r.sha(path),'provider':'Serpentine Running and Triathlon Club','raw_headed':x,'key':old['key'],'original':old,'secondary':True,'resolutionEvidence':ev}
            else:new={**old,'club':x['club'],'date':date.isoformat(),'clubCorroboration':ev}
            replacements[old['key']]=new;matched.append(old['key'])
        checks.append({'sourceUrl':'https://www.serpentine.org.uk/results/race/?race='+path.stem.rsplit('_',1)[1],'rows':len(rows),'matchedHeldRows':matched,'sha256':r.sha(path),'method':'Explicit name, time, club and date headings; overall placings not inferred'})
    path=folder/'northbrook_2012.html';doc=html.fromstring(path.read_bytes());heading=doc.xpath('//*[@name="brentwoodhalf"]')[0].getparent()
    section=[]
    for node in heading.itersiblings():
        if node.tag=='hr':break
        section.append(p.text(node))
    narrative=' '.join(section)
    if "Sean O'Connor" not in narrative or '1hr 56min 36secs' not in narrative or '2012 result' not in narrative:raise ValueError('Northbrook narrative changed')
    candidates=[x for x in held if x['year']==2012 and name_key(x['name'])==name_key("Sean O'Connor") and p.clock(x.get('chip_time'))=='01:56:36']
    if len(candidates)==1:
        old=candidates[0];url='https://www.northbrookac.org.uk/archive/results/monthly/2012/results_1203_arch.htm#brentwoodhalf'
        replacements[old['key']]={'name':"Sean O'Connor",'year':2012,'date':'2012-03-25','bib':'','recorded_time':'01:56:36','chip_time':'','gun_time':'','overall_position':'','gender':'','category':'','club':'Northbrook AC','status':'Finished','source_file':path.name,'source_url':url,'source_sha256':r.sha(path),'provider':'Northbrook AC','key':old['key'],'original':old,'secondary':True,
          'resolutionEvidence':{'basis':'Named first-person club race report explicitly states 1hr 56min 36secs, beneath 25 March heading in March 2012 report; agrees with retained organiser observation','timingQualification':'Narrative finish time; chip/gun basis and placing not asserted'}}
        checks.append({'sourceUrl':url,'rows':1,'matchedHeldRows':[old['key']],'sha256':r.sha(path),'method':'Named race report and explicit finish time; no positional column mapping'})
    return replacements,checks
def plan(args):
    p.BATCH=BATCH
    with zipfile.ZipFile(args.audit) as z:
        held=[json.loads(l) for l in z.read('held_for_review.jsonl').splitlines()];published=[json.loads(l) for l in z.read('published_results.jsonl').splitlines()]
    snapshot=json.loads(args.snapshot.read_text());raw=[json.loads(l) for l in (args.archive/'all_results.jsonl').read_text().splitlines()]
    new2026,check2026=source_2026(args.sources);official_by_key={x['key']:x for x in new2026}
    replacements,check2013=female2013(args.sources,held);source_checks=[check2026,check2013]
    club_rows,club_checks=club_companions(args.sources,held);replacements.update(club_rows);source_checks+=club_checks
    replacements2010,checks2010=expander.companions2010(args.prior_sources,held);source_checks+=checks2010
    structural_resolutions=[]
    for key,new in replacements2010.items():
        differences=new.get('comparisonDifferences',[])
        name_diffs=[d for d in differences if d['field']=='name']
        if name_diffs and all(name_key(d['headedSource'])==name_key(new['name']) and p.norm(new['name']).startswith(p.norm(d['priorExtraction'])+' ') for d in name_diffs):
            new['resolvedComparisonDifferences']=name_diffs
            new['comparisonDifferences']=[d for d in differences if d['field']!='name']
            new['resolutionEvidence']['nameResolution']='Full name independently agrees in headed organiser and timing-provider rows; spreadsheet export retains only a prefix'
            structural_resolutions.append({'key':key,'reason':'Full name recovered from agreeing headed primary sources'})
        replacements[key]=new
    for key,club_row in club_rows.items():
        if club_row.get('clubCorroboration') and key in replacements:
            replacements[key]={**replacements[key],'club':club_row['club'],'date':club_row['date'],'clubCorroboration':club_row['clubCorroboration']}
    # Locate each earlier 2026 club observation in the full official field.
    used=set();enrichments=[];bridges=[]
    for oldpub in [x for x in published if x['performance']['year']==2026]:
        old=oldpub['performance']['archiveReference']['original']
        matches=[x for x in new2026 if same_name_or_variant(old['name'],x['name']) and row_time(old)==row_time(x)]
        if len(matches)!=1:continue
        x=matches[0]
        if x['key'] in used:raise ValueError('2026 source row maps twice')
        if name_key(old['name'])!=name_key(x['name']) and (not p.club_key(old.get('club')) or p.club_key(old.get('club'))!=p.club_key(x.get('club'))):continue
        used.add(x['key']);perf=p.performance({**x,'priorClubObservation':old});perf['sourceKeys']=list(dict.fromkeys(oldpub['performance']['sourceKeys']+[x['key']]))
        perf['sourceUrls']=list(dict.fromkeys([x['source_url']]+oldpub['performance']['sourceUrls']))
        enrichments.append({'athleteId':oldpub['athleteId'],'externalId':oldpub['sourceHistoryId'],'oldPerformance':oldpub['performance'],'newPerformance':perf,'officialKey':x['key']})
    for old in [x for x in held if x['year']==2026]:
        matches=[x for x in new2026 if same_name_or_variant(old['name'],x['name']) and row_time(old)==row_time(x)]
        if len(matches)!=1:continue
        x=matches[0]
        if x['key'] in used:raise ValueError('2026 source row maps twice')
        if name_key(old['name'])!=name_key(x['name']) and (not p.club_key(old.get('club')) or p.club_key(old.get('club'))!=p.club_key(x.get('club'))):continue
        used.add(x['key']);replacements[old['key']]={**x,'key':old['key'],'primarySourceKey':x['key'],'priorClubObservation':old,'previousHold':old['hold']}
        bridges.append({'oldKey':old['key'],'primaryKey':x['key'],'oldName':old['name'],'officialName':x['name']})
    remaining2026=[x for x in new2026 if x['key'] not in used]
    structural={'Headerless source; column meanings require a headed companion','Present in organiser 2013 export but absent from the headed PDF version','Source age observation conflicts with existing birth year','Unheaded source gender observation conflicts with profile gender'}
    reconsider=[];unresolved=[]
    # The snapshot must cover every name key before it can authorize a new profile.
    covered={k for x in raw+json.loads(args.extra_names.read_text()) for k in p.prep.name_keys(x['name'])}
    for old in held:
        new=replacements.get(old['key'],old)
        if old['hold'] in structural and old['key'] not in replacements:unresolved.append(old)
        elif not set(p.prep.name_keys(new['name'])).issubset(covered):unresolved.append({**new,'hold':'Recovered full name requires additional directory screening'})
        else:reconsider.append({**new,'previousHold':old['hold']})
    reconsider+=remaining2026
    # Collapse only identical source-located results; conflicting bib/name/time
    # rows are still passed to the normal ambiguity checks.
    exact=collections.defaultdict(list)
    for x in reconsider:exact[(x['year'],name_key(x['name']),x.get('bib'),row_time(x),p.clock(x.get('gun_time')),x.get('gender'))].append(x)
    unique=[];consolidated=[]
    for signature,rows in exact.items():
        if len(rows)>1 and signature[2] and signature[3]:
            chosen=next((x for x in rows if x.get('resolutionEvidence')),rows[0]);chosen={**chosen,'corroboratingObservations':[x for x in rows if x['key']!=chosen['key']]}
            consolidated.extend({'key':x['key'],'canonicalKey':chosen['key'],'reason':'Same edition, exact full name, bib, gender and times'} for x in rows if x['key']!=chosen['key']);unique.append(chosen)
        else:unique+=rows
    data={'rows':unique,'held':unresolved,'checks':source_checks}
    result=p.plan(data,snapshot,raw+new2026,resolve_partial_clubs=True,allow_name_variants=True)
    byhist=collections.defaultdict(list)
    for h in snapshot['histories']:byhist[str(h['athlete_id'])].append(h)
    accepted=[]
    for h in result['existingHistories']:
        aid=str(h['athleteId']);a=snapshot['entities'][aid];performances=[];evidence=[]
        for perf,ev in zip(h['performances'],h['identityEvidence']):
            why=r.history_conflict(perf['archiveReference']['original'],byhist[aid])
            if why:result['held'].append({**perf['archiveReference']['original'],'hold':why,'athleteId':int(aid)})
            else:performances.append(perf);evidence.append(ev)
        if not performances:continue
        h.update(performances=performances,identityEvidence=evidence,years=sorted({x['year'] for x in performances}),externalId=PREFIX+'existing:'+aid,
          expectedGender=a.get('gender'),expectedDob=a.get('date_of_birth'),expectedSourceClub=a.get('source_club_name'),expectedSourceSecondClub=a.get('source_second_club_name'),expectedClubId=a.get('club_id'),expectedSecondClubId=a.get('second_club_id'))
        accepted.append(h)
    result['existingHistories']=accepted
    for h in result['profiles']+accepted:
        for perf in h['performances']:
            row=perf['archiveReference']['original']
            if row.get('primarySourceKey'):perf['sourceKeys'].append(row['primarySourceKey'])
    ids={str(x['athleteId']) for x in enrichments}
    enrichments_by_history=collections.defaultdict(list)
    for e in enrichments:enrichments_by_history[(str(e['athleteId']),e['externalId'])].append(e)
    enrichments_final=[]
    for (aid,external),rows in enrichments_by_history.items():
        hist=next(h for h in byhist[aid] if h['external_id']==external);a=snapshot['entities'][aid]
        if not hist['published_at'] or a.get('profile_visibility')!='public' or a.get('parent_athlete_id') or int(a.get('active_accounts',0)):raise ValueError('Prior result visibility/account changed')
        perfs=copy.deepcopy(hist['performances'])
        for row in rows:
            if perfs.count(row['oldPerformance'])!=1:raise ValueError('Previously published performance changed')
            perfs[perfs.index(row['oldPerformance'])]=row['newPerformance']
        enrichments_final.append({'athleteId':int(aid),'externalId':external,'oldPerformances':hist['performances'],'newPerformances':perfs,'expectedDetails':a['profile_details'],'expectedName':a['display_name'],'rows':rows})
    keys=[perf['archiveReference']['original']['key'] for h in result['profiles']+accepted for perf in h['performances']]
    held_keys=[x['key'] for x in result['held']];reused_keys=[x['row']['key'] for x in result['reused']]
    expected={x['key'] for x in held+remaining2026};actual=keys+held_keys+reused_keys+[x['key'] for x in consolidated]
    if len(actual)!=len(set(actual)) or set(actual)!=expected:raise ValueError('Observation accounting differs')
    sourcekeys=[k for h in result['profiles']+accepted for perf in h['performances'] for k in perf['sourceKeys']]
    oldkeys={k for x in published for k in x['performance']['sourceKeys']}
    if len(sourcekeys)!=len(set(sourcekeys)) or set(sourcekeys)&oldkeys:raise ValueError('Published source key duplication')
    old_held={x['key'] for x in held};published_keys=set(keys);resolved_old=old_held-set(held_keys)
    result.update(enrichments=enrichments_final,sourceBridges=bridges,consolidatedObservations=consolidated,structuralResolutions=structural_resolutions)
    result['summary'].update(newProfiles=len(result['profiles']),newProfileResults=sum(len(x['performances']) for x in result['profiles']),existingProfilesEnriched=len(accepted),existingProfileResults=sum(len(x['performances']) for x in accepted),heldRows=len(result['held']),heldReasons=dict(collections.Counter(x['hold'] for x in result['held'])),previousHeldRows=len(held),previousHeldResolved=len(resolved_old),previousHeldPublished=len(old_held&published_keys),new2026Observations=len(remaining2026),official2026Rows=len(new2026),earlier2026ResultsEnriched=len(enrichments),duplicateObservationsConsolidated=len(consolidated))
    r.imp.dump(args.out,result);r.imp.dump(args.compared,data);print(json.dumps(result['summary']),flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['audit','snapshot','archive','sources','prior-sources','extra-names','out','compared']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    plan(ap.parse_args())
