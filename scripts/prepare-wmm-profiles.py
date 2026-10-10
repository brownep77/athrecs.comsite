"""Conservative WMM source-ID profile plan. No database writes.

All categories must finish before preparation. Names only suggest matches;
possible matches are held, never merged. No race dates, residence or DOB inferred.
"""
import argparse, collections, gzip, hashlib, importlib.util, json, pathlib, re, unicodedata

ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('finder',ROOT/'find-archive-athlete-candidates.py')
finder=importlib.util.module_from_spec(spec);spec.loader.exec_module(finder)
PROVIDER='Abbott World Marathon Majors'
SOURCE='https://www.worldmarathonmajors.com/rankings/world-rankings'
RESULT_SOURCE='https://www.worldmarathonmajors.com/rankings/claim-results'
BATCH='wmm-edition8-20261010'

def norm(value):
    value=''.join(c for c in unicodedata.normalize('NFKD',str(value or '')).casefold() if not unicodedata.combining(c))
    value=value.replace("'",'').replace('’','')
    return ' '.join(''.join(c if c.isalnum() else ' ' for c in value).split())

def profile_slug(name,source_id):
    readable=unicodedata.normalize('NFKD',str(name)).encode('ascii','ignore').decode().lower()
    readable=re.sub(r'[^a-z0-9]+','-',readable).strip('-')[:100].rstrip('-') or 'athlete'
    if not re.fullmatch(r'[0-9a-fA-F-]{36}',source_id):raise ValueError('Unexpected WMM source ID format')
    return readable+'-wmm-'+source_id.lower()

def name_keys(value):
    n=norm(value);ts=n.split()
    while ts and ts[0] in finder.TITLES:ts.pop(0)
    n=' '.join(ts)
    if not n:return []
    keys=['exact:'+n.replace(' ',''),'tokens:'+' '.join(sorted(ts))]
    if len(ts)>=2:
        first=min(finder.NICK.get(ts[0],{ts[0]}))
        keys.append('family:'+first+' '+ts[-1])
        # Conservative typo/transposition suggestions, never automatic merges.
        # Shared deletion signatures can over-match; every such case is held.
        if len(ts[-1])>=5:
            keys.extend('family-spelling:'+first+' '+v for v in finder.variants(ts[-1]))
        if len(first)>=5:
            keys.extend('given-spelling:'+v+' '+ts[-1] for v in finder.variants(first))
    return keys

def add(index,identifier,names):
    for n in names:
        for key in name_keys(n):index[key].add(identifier)

def source_names(row,results):
    return sorted({str(x.get('firstname') or '')+' '+str(x.get('lastname') or '') for x in [row,*results]})

def result_keys(s):
    bib=str(s.get('bibnumber') or '').strip()
    if bib.isdigit():bib=str(int(bib))
    if not bib or bib.lower() in {'0','none','nan','n/a','na'}:return []
    return [(norm(title),s.get('result_year'),bib) for title in {s.get('event_title'),s.get('race_title')} if title]

def directory(snapshot):
    index=collections.defaultdict(set);entities={}
    for a in json.loads((snapshot/'athletes.json').read_text()):
        ident='athrecs:'+str(a['id']);entities[ident]={'id':a['id'],'name':a['display_name'],'slug':a['slug'],'gender':a['gender']}
        names=[a['display_name'],a.get('race_entry_name'),' '.join([a.get('given_name') or '',a.get('family_name') or ''])]
        for val in (a.get('name_details') or {}).values():names.extend(finder.names_from(val))
        add(index,ident,names)
    for i,a in enumerate(json.loads((snapshot/'accounts.json').read_text())):
        ident='account:'+str(a.get('athlete_number') or i);entities[ident]={'name':a.get('name') or a.get('display_name'),'kind':'account'}
        add(index,ident,[a.get('name'),a.get('full_name'),a.get('display_name'),*finder.names_from(a.get('previous_names'))])
    return index,entities

def matching(index,names,own=None):
    found=set()
    for n in names:
        for k in name_keys(n):found.update(index.get(k,()))
    found.discard(own)
    return found

def normalize_results(aid,rank,rows):
    unique={};issues=[];duplicate_count=0
    for hit in rows:
        s=hit['_source'];rid=s.get('result_id');name=(str(s.get('firstname') or '')+' '+str(s.get('lastname') or '')).strip()
        if rid!=hit['_id'] or s.get('athlete_id')!=aid or s.get('edition')!=8:issues.append('source_identifier_conflict');continue
        if s.get('gender')!=rank['gender']:issues.append('source_gender_conflict')
        year=s.get('result_year');perf=str(s.get('finish_time') or '')
        parts=perf.split(':')
        if len(parts)!=3 or not all(x.isdigit() for x in parts):issues.append('invalid_finish_time');continue
        h,m,sec=map(int,parts);seconds=h*3600+m*60+sec
        if not (0<=m<60 and 0<=sec<60 and seconds>0 and seconds==s.get('finish_time_secs')):issues.append('finish_time_conflict');continue
        if year not in (2025,2026) or not s.get('event_title'):issues.append('missing_or_unexpected_edition');continue
        key=(norm(s['event_title']),year)
        evidence=(perf,str(s.get('bibnumber') or ''),s.get('place'))
        if key in unique:
            old=unique[key]
            if old['evidence']!=evidence:issues.append('same_athlete_race_year_conflicting_results')
            else:old['sourceResultIds'].append(rid);duplicate_count+=1
            continue
        unique[key]={'evidence':evidence,'sourceResultIds':[rid],'sourceName':name,'source':s}
    if not unique:issues.append('no_detailed_results')
    if unique and rank.get('fastest_finish_time_secs') not in {r['source']['finish_time_secs'] for r in unique.values()}:issues.append('ranking_fastest_time_not_in_detailed_results')
    performances=[]
    for v in unique.values():
        s=v['source'];year=s['result_year'];rid=v['sourceResultIds'][0]
        performances.append({'year':year,'date':'','sourceDate':str(year),'yearLabel':str(year),'ageGroup':s.get('age_group') or '',
          'discipline':'Marathon','performance':s['finish_time'],'wind':'','place':str(s.get('place') or ''),'venue':'','meeting':s['event_title'],
          'sourceUrls':[RESULT_SOURCE,SOURCE],'labels':['World Marathon Majors source result','Exact race date not supplied'],
          'providerName':PROVIDER,'verificationStatus':'unverified',
          'notes':f"WMM result {rid}; athlete {aid}; bib {s.get('bibnumber') or 'not supplied'}. Year and finish time copied from WMM. Exact race date and chip/gun classification are not supplied. Athlete identity is provisional; this is not independently verified personal-best evidence.",
          'archiveReference':{'provider':PROVIDER,'sourceAthleteId':aid,'sourceResultIds':v['sourceResultIds'],'original':s}})
    return performances,sorted(set(issues)),duplicate_count

def prepare(captures,snapshot,out,repair_files=None):
    coverage=json.loads((captures/'coverage.json').read_text())
    if len(coverage)!=18:raise ValueError('Require both genders and every current age group before global duplicate screening')
    out.mkdir(parents=True,exist_ok=True);source_index=collections.defaultdict(set);result_index=collections.defaultdict(set);metadata={};files=sorted(captures.glob('*.json.gz'))
    total_rows=0
    for path in files:
        with gzip.open(path,'rt') as f:c=json.load(f)
        byid=collections.defaultdict(list)
        for h in c['results']:
            s=h['_source'];byid[s['athlete_id']].append(s)
            for k in result_keys(s):result_index[k].add(s['athlete_id'])
        for h in c['rankings']:
            aid=h['_id'];s=h['_source']
            if aid in metadata:raise ValueError('Source athlete repeated across rank ranges')
            names=source_names(s,byid[aid]);metadata[aid]={'name':(str(s.get('firstname') or '')+' '+str(s.get('lastname') or '')).strip(),'gender':s['gender'],'nationality':s.get('nationality'),'names':names}
            add(source_index,aid,names)
        total_rows+=len(c['results'])
    expected=sum(x['expected'] for x in coverage)
    if len(metadata)!=expected:raise ValueError('Full source coverage count mismatch')
    print(json.dumps({'phase':'source_indexed','athletes':len(metadata),'detailedRows':total_rows,'nameKeys':len(source_index)}),flush=True)
    existing,entities=directory(snapshot);existing_result_index=collections.defaultdict(set)
    for r in json.loads((snapshot/'existing-results.json').read_text()):
        for k in result_keys(r):existing_result_index[k].add('athrecs:'+str(r['athlete_id']))
    summary=collections.Counter();reasons=collections.Counter();eligible=[];held=[]
    for path in files:
        if repair_files and path.name not in repair_files:continue
        with gzip.open(path,'rt') as f:c=json.load(f)
        byid=collections.defaultdict(list)
        for h in c['results']:byid[h['_source']['athlete_id']].append(h)
        planned=[];review=[]
        for ordinal,h in enumerate(c['rankings'],1):
            aid=h['_id'];s=h['_source'];meta=metadata[aid];names=meta['names'];matches=matching(existing,names);source_matches=matching(source_index,names,aid)
            perfs,flags,duplicates=normalize_results(aid,s,byid[aid]);summary['duplicate_source_results_removed']+=duplicates
            result_matches=set()
            for r in byid[aid]:
                for k in result_keys(r['_source']):
                    result_matches.update(result_index.get(k,()))
                    matches.update(existing_result_index.get(k,()))
            result_matches.discard(aid)
            if result_matches:flags.append('same_race_year_bib_on_other_source_identity');source_matches.update(result_matches)
            if matches:flags.append('possible_existing_profile_or_account')
            if source_matches:flags.append('possible_duplicate_wmm_source_identity')
            ts=norm(meta['name']).split()
            if len(ts)<2 or len(ts[0])<2 or any(ch.isdigit() for ch in meta['name']):flags.append('incomplete_or_unusual_name')
            summary['rankings_screened']+=1
            if flags:
                review.append({'sourceAthleteId':aid,'name':meta['name'],'gender':s['gender'],'ageGroup':s['age_group'],'sourceFile':path.name,'sourceRow':ordinal,
                 'reasons':sorted(set(flags)),
                 'caseForMatch':'Name, alias, token order or given-name/family-name variant appears in an existing account/profile or another WMM identity.' if matches or source_matches else 'WMM groups these observations under one source athlete ID.',
                 'caseAgainstMatch':'Names alone cannot establish identity. Different source IDs, missing exact race dates or conflicting source values need review. No merge or new profile was made.',
                 'athrecsCandidates':[{'reference':m,**entities[m]} for m in sorted(matches)[:20]],
                 'sourceCandidates':[{'sourceAthleteId':m,**{k:v for k,v in metadata[m].items() if k!='names'}} for m in sorted(source_matches)[:20]],
                 'candidateCounts':{'athrecs':len(matches),'source':len(source_matches)},'resultCount':len(perfs)})
                reasons.update(set(flags));summary['held_profiles']+=1;continue
            slug=profile_slug(meta['name'],aid)
            details={'aliases':names,'athlete_verified':False,'identity_review_status':'provisional_source_profile',
              'archiveCreation':{'batchId':BATCH,'candidateId':aid,'approvedBy':'Paul Browne','approvedAt':'2026-10-10T11:02:14Z',
                'instruction':'Add all World Marathon Majors ranking athletes and results for both genders and age categories; check for duplicates.',
                'basis':'Stable official source athlete ID; full-category source/directory duplicate screening; source rows compared. Identity remains provisional.',
                'sourceRowsCompared':True,'profileIdentityVerified':False},
              'worldMarathonMajors':{'athleteId':aid,'rankingEdition':8,'ageGroup':s['age_group'],'genderAgeGroupRank':s['overall_ranking'],
                'nationalityRank':s.get('country_ranking'),'nationality':s.get('nationality'),'sourceUrl':SOURCE}}
            planned.append({'externalId':aid,'slug':slug,'displayName':meta['name'],'givenName':s['firstname'],'familyName':s['lastname'],'gender':s['gender'],
              'nation':s.get('nationality'),'sourceUrl':SOURCE,'capturedAt':c['capturedAt'],'years':sorted({p['year'] for p in perfs}),'performances':perfs,'details':details,
              'sourceFile':path.name,'sourceRow':ordinal})
            summary['eligible_profiles']+=1;summary['eligible_results']+=len(perfs)
        dest=out/(path.name.replace('.json.gz','.plan.json.gz'))
        temp=dest.with_suffix('.writing')
        with gzip.open(temp,'wt',encoding='utf-8',compresslevel=1) as f:json.dump({'profiles':planned,'held':review},f,ensure_ascii=False,separators=(',',':'))
        temp.replace(dest)
        print(json.dumps({'phase':'planned','file':path.name,'eligible':len(planned),'held':len(review)}),flush=True)
    result={'batchId':BATCH,'sourcePeriod':['2025-10-01','2026-09-30'],'coverage':coverage,'summary':dict(summary),'holdReasons':dict(reasons),'directoryEntities':len(entities)}
    summary_path=out/('repair-summary.json' if repair_files else 'summary.json')
    temp=summary_path.with_suffix('.writing');temp.write_text(json.dumps(result,indent=2));temp.replace(summary_path)
    print(json.dumps(result['summary']),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--captures',type=pathlib.Path,required=True);p.add_argument('--snapshot',type=pathlib.Path,required=True);p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--repair-files',nargs='+');a=p.parse_args();prepare(a.captures,a.snapshot,a.output,a.repair_files)
