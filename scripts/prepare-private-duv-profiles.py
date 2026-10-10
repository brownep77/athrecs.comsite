"""Screen one compared DUV capture against an explicit private directory snapshot.

Outputs provisional profiles only when there is no plausible existing identity.
Stable DUV IDs prevent re-creation across events. Any possible name/alias/ID
match is held; connecting existing athletes remains a separate reviewed action.
"""
import argparse
import datetime as dt
import importlib.util
import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlsplit,parse_qs

ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('profiles',ROOT/'scripts/create-private-archive-profiles.py')
profiles=importlib.util.module_from_spec(s);s.loader.exec_module(profiles)
finder=profiles.finder

def runner_id(url):
    try:
        u=urlsplit(url or '')
        if u.hostname=='statistik.d-u-v.org' and u.path=='/getresultperson.php':
            value=parse_qs(u.query).get('runner',[None])[0]
            return value if value and value.isdigit() else None
    except ValueError: pass
    return None

def related(a,b):
    if not a or not b: return False
    aa=a.split();bb=b.split()
    if a.replace(' ','')==b.replace(' ','') or sorted(aa)==sorted(bb): return True
    if len(aa)<2 or len(bb)<2: return False
    # Conservative spelling/initial screen; a possible match prevents creation.
    return bool(finder.compatible_first(aa[0],bb[0]) and finder.edit_one(aa[-1],bb[-1]))

def prepare(directory,capture,approval):
    read=lambda n:json.loads((directory/(n+'.json')).read_text())
    athletes=read('athletes'); accounts=read('accounts'); histories=read('histories')
    names=[]; ids=defaultdict(set)
    for a in athletes:
        aliases=[n for v in a.get('name_details',{}).values() for n in finder.names_from(v)]
        ns=[a['display_name'],a.get('race_entry_name'),' '.join([a.get('given_name') or '',a.get('family_name') or '']),*aliases]
        for n in ns:
            if finder.name_key(n):names.append((str(a['id']),finder.name_key(n)))
        if rid:=runner_id(a.get('source_url')):ids[rid].add(a['id'])
    for i,a in enumerate(accounts):
        for n in [a.get('name'),a.get('full_name'),a.get('display_name'),*finder.names_from(a.get('previous_names'))]:
            if finder.name_key(n):names.append(('account-'+str(i),finder.name_key(n)))
    for h in histories:
        rid=runner_id(h.get('source_url'))
        if not rid and 'duv' in h['provider'].lower():
            m=re.fullmatch(r'(?:duv:runner-)?(\d+)(?::event:\d+)?',h['external_id'])
            if m:rid=m[1]
        if rid:ids[rid].add(h['athlete_id'])
    for r in read('duv-references'):
        for rid in r['runner_ids']:ids[rid].add(r['id'])
    source_names=[finder.name_key(r['name']) for r in capture['rows']]
    eligible=[]; held=[]
    for row,key in zip(capture['rows'],source_names):
        matches=sorted({id for id,n in names if related(key,n)})
        flags=[];rid=row['sourceAthleteId']
        if matches:flags.append('possible_existing_name_or_alias')
        if ids[rid]:flags.append('existing_duv_athlete_reference')
        if sum(related(key,n) for n in source_names)>1:flags.append('possible_name_variant_in_event')
        if len(key.split())<2 or len(finder.name_key(row['givenName']).split()[0])<2:flags.append('incomplete_name')
        if finder.youth_category(row['category'],row['distanceLabel']) or (row['sourceBirthYear'] and int(row['date'][:4])-row['sourceBirthYear']<19):flags.append('possible_youth_profile')
        if flags:
            held.append({'sourceAthleteId':rid,'sourceRow':row['sourceRow'],'name':row['name'],'flags':flags,
                'possibleAthleteIds':matches,'existingDuvAthleteIds':sorted(ids[rid])});continue
        original=row['original']; date=row['date']
        history={'year':int(date[:4]),'date':date,'sourceDate':date,'ageGroup':row['category'],
            'discipline':row['distanceLabel'],'performance':row['performanceDisplay'],'wind':'','place':original['Rank'],
            'venue':capture['index']['location'],'meeting':capture['index']['name'],
            'sourceUrls':[capture['sourceUrl']+'#Resultlist',row['sourceAthleteUrl']],
            'labels':['Private archive','Identity unreviewed'],'providerName':capture['provider'],'verificationStatus':'unverified',
            'notes':'Provisional DUV source profile; identity not independently confirmed. Club, nationality and birth year are source observations; current club/residence and exact birth date are unknown.',
            'performanceMeasurement':row['performance'],'places':row['places'],
            'archiveReference':{'sourceKey':capture['sourceKey'],'tableKey':row['tableKey'],'sourceRow':row['sourceRow'],
                'sourceAthleteId':rid,'htmlSha256':capture['htmlSha256'],'status':row['status'],'original':original,
                'originalLinks':row['originalLinks'],'originalResultUrls':capture['provenance']['originalResultUrls']}}
        details={'archiveCreation':{'batchId':approval['batchId'],'candidateId':'DUV-'+rid,
            'approvedBy':approval['approvedBy'],'approvedAt':approval['approvedAt'],'instruction':approval['instruction'],
            'basis':'Stable DUV runner ID; source row compared; no plausible existing name, alias or DUV ID found. Provisional identity only.',
            'profileIdentityVerified':False,'sourceRowsCompared':True,'resultCount':1,'sourceKeys':[capture['sourceKey']]},
            'aliases':[row['name'],original['Surname, first name']],
            'athlete_verified':False,'identity_review_status':'provisional_source_profile','currentClubAssociationConfirmed':False,
            'sourceIdentities':[{'provider':capture['provider'],'externalId':rid,'sourceUrl':row['sourceAthleteUrl']}],
            'duvSourceObservation':{'birthYear':row['sourceBirthYear'],'nationality':row['sourceNationality'],
                'clubDisplay':row['club'],'clubDisplayTruncated':row['clubDisplayTruncated'],'eventDate':date}}
        eligible.append({'candidateId':'DUV-'+rid,'sourceAthleteId':rid,'slug':key.replace(' ','-')+'-duv-'+rid,
            'displayName':row['name'],'givenName':row['givenName'],'familyName':row['familyName'],'gender':row['gender'],
            'sourceClubName':row['club'],'sourceUrl':row['sourceAthleteUrl'],'capturedAt':capture['capturedAt'],
            'years':[int(date[:4])],'performances':[history],'details':details})
    plan={'approval':approval,'profiles':eligible,'held':held,'sourceKey':capture['sourceKey'],
        'captureHash':profiles.sha(capture),'fingerprint':read('fingerprint')[0]['fingerprint'],
        'historyFingerprint':read('history-fingerprint')[0]['fingerprint'],'baseline':read('baseline')[0],
        'summary':{'sourceRows':len(capture['rows']),'directoryAthletesChecked':len(athletes),'accountsChecked':len(accounts),
            'sourceHistoriesChecked':len(histories),'eligibleProfiles':len(eligible),'heldRows':len(held)}}
    plan['planHash']=profiles.sha(plan)
    return plan

if __name__=='__main__':
    p=argparse.ArgumentParser()
    for k in ('snapshot','capture','approval','output'):p.add_argument('--'+k,type=Path,required=True)
    a=p.parse_args();plan=prepare(a.snapshot,json.loads(a.capture.read_text()),json.loads(a.approval.read_text()))
    a.output.write_text(json.dumps(plan,ensure_ascii=False,separators=(',',':')))
    print(json.dumps(plan['summary']))
