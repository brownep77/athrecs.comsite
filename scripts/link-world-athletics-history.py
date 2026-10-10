"""Supervised cross-provider links and lossless WA history enrichment.

Use captured public profile/annual JSON, an explicit mapping manifest and a
private connection file. Prepare never writes. Apply requires a reviewed plan,
an explicit branch and owner authorization. No name-only or destructive merges.
Private plans, captures, receipts and connection files must stay outside Git.
"""
import argparse
import copy
import datetime as dt
import hashlib
import importlib.util
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('archive_connection', ROOT/'create-private-archive-profiles.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
PROJECT = 'lively-resonance-04577945'
PRODUCTION = 'br-flat-unit-aydbwlfk'
PROVIDER = 'World Athletics'

def normalized(value):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFKD', value.lower()).encode('ascii','ignore').decode())

def race_matches(source_name, official_name, aliases):
    # The manifest supplies reviewed event names, not inferred city matches.
    official_event = official_name.split(',')[0]
    allowed = [source_name, *aliases.get(source_name, [])]
    return normalized(official_event) in {normalized(x) for x in allowed}

def identity_matches(athlete, basic, source_rows, annual_rows, aliases):
    failures = []
    wa_name = basic['givenName']+' '+basic['familyName']
    incoming = normalized(athlete['display_name'])
    wa_tokens = (basic['givenName']+' '+basic['familyName']).split()
    source_tokens = athlete['display_name'].split()
    name_agrees = incoming == normalized(wa_name) or (
        len(source_tokens)>=2 and len(wa_tokens)>=2 and
        normalized(source_tokens[0])==normalized(wa_tokens[0]) and
        normalized(source_tokens[-1])==normalized(wa_tokens[-1]))
    if not name_agrees: failures.append('Name/alias needs manual identity evidence')
    if athlete['gender'] != ('M' if basic['male'] else 'F'): failures.append('Gender conflict')
    if not athlete.get('nation') or athlete['nation'] != basic['countryCode']: failures.append('Missing or conflicting source nationality')
    dob = dt.datetime.strptime(basic['birthDate'], '%d %b %Y').date()
    if athlete.get('date_of_birth') and athlete['date_of_birth']!=dob.isoformat(): failures.append('Date-of-birth conflict')
    overlaps = []
    conflicts = []
    for index,source in enumerate(source_rows):
        if source.get('profileExcluded'): continue
        matching = [r for r in annual_rows if r['discipline']=='Marathon'
            and int(r['date'][:4])==source['year']
            and race_matches(source['meeting'],r['meeting'],aliases)]
        exact = [r for r in matching if r['performance']==source['performance'] and r.get('round')=='F']
        if len(exact)==1:
            row=exact[0]
            band=re.fullmatch(r'(\d+)-(\d+)',source.get('ageGroup',''))
            if band:
                date=dt.date.fromisoformat(row['date']);age=date.year-dob.year-((date.month,date.day)<(dob.month,dob.day))
                if not int(band[1])<=age<=int(band[2]):
                    failures.append('Source age category conflicts with official birth date')
                    continue
            overlaps.append({'sourceIndex':index,'sourceResultIds':source.get('archiveReference',{}).get('sourceResultIds',[]),
                'date':row['date'],'meeting':row['meeting'],'mark':row['performance'],'waLocator':row['sourceLocator']})
        elif matching:
            conflicts.append({'sourceIndex':index,'sourceMark':source['performance'],
                'officialMarks':[r['performance'] for r in matching],'reason':'Performance mismatch or ambiguous edition'})
    if not overlaps: failures.append('No unique exact shared race/year/distance/mark')
    if conflicts: failures.append('Conflicting shared performance requires review')
    return {'eligible':not failures,'failures':failures,'overlaps':overlaps,'conflicts':conflicts,'sourceName':wa_name,'dob':dob.isoformat()}

def discipline_label(value):
    if value=='2 Miles':return '2 Miles Track'
    m=re.fullmatch(r'(\d+(?:\.\d+)?) Kilometres Road',value)
    if m:return m[1]+' km'
    m=re.fullmatch(r'(\d+(?:\.\d+)?) Miles Road',value)
    if m:return m[1]+' miles'
    return value

def parse_year(wa_id,year,payload,source_url):
    if payload.get('errors'):raise ValueError('Source returned GraphQL errors')
    data=payload['data']['getSingleCompetitorResultsDiscipline']
    if data['parameters']['resultsByYear']!=year:raise ValueError('Unexpected source year')
    rows=[]
    for gi,group in enumerate(data['resultsByEvent']):
        for ri,original in enumerate(group['results']):
            date=dt.datetime.strptime(original['date'],'%d %b %Y').date().isoformat()
            if int(date[:4])!=year:raise ValueError('Source row outside requested year')
            race=original.get('race') or ''
            labels=[]
            if race:labels.append('Round '+race)
            if group.get('indoor'):labels.append('Indoor')
            if original.get('notLegal'):labels.append('Not legal for record purposes')
            if original.get('remark'):labels.append(original['remark'])
            locator=f'WA {wa_id}; year {year}; event {original.get("eventId") or group["discipline"]}; competition {original.get("competitionId") or original["competition"]}; round {race}; group {gi}; row {ri}'
            discipline=discipline_label(group['discipline'])
            if discipline=='Road Race':
                metres=re.search(r'Non-standard distance: ([\d,]+)m',original['competition'])
                if metres:discipline=f'{int(metres[1].replace(",",""))/1000:g} km'
            rows.append({'year':year,'date':date,'sourceDate':original['date'],'ageGroup':'',
                'discipline':discipline,'performance':original['mark'],
                'wind':original.get('wind') or '', 'place':(original.get('place') or '').rstrip('.'),
                'venue':original['venue'],'country':original.get('country') or '',
                'meeting':original['competition']+((' · Round '+race) if race and race!='F' else ''),
                'sourceUrls':[source_url],'providerName':PROVIDER,'labels':labels,
                'verificationStatus':'source_verified','round':race,'sourceLocator':locator,
                'notes':locator+'. Position is the source discipline/round placing, not a combined-sex overall placing. Original mark and source annotations retained.',
                'sourceEvidence':{'athleteId':wa_id,'year':year,'group':{k:v for k,v in group.items() if k!='results'},'row':original}})
    return rows

def sha(value):return base.sha(value)

def state_queries(aid):
    return [
      ('SELECT to_jsonb(a) AS value FROM athletes a WHERE id=$1',[aid]),
      ('SELECT to_jsonb(h) AS value FROM athlete_source_histories h WHERE athlete_id=$1 ORDER BY provider,external_id',[aid]),
      ("SELECT count(*)::int AS n FROM athlete_account_links WHERE athlete_id=$1 AND status='active'",[aid]),
      ('SELECT count(*)::int AS n FROM results WHERE athlete_id=$1',[aid])]

def prepare(args,query):
    manifest=json.loads(args.manifest.read_text());out={'version':1,'projectId':PROJECT,'preparedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'profiles':[],'held':[]}
    # One repeatable-read snapshot, rather than many HTTP round trips or a
    # quadratic join of the entire imported directory to itself.
    snapshots_sql=[];profiles={}
    for target in manifest['targets']:
        aid=target['athleteId'];wa_id=target['worldAthleticsId'];url=target['sourceUrl']
        profile=json.loads((args.captures/f'{wa_id}.json').read_text())['props']['pageProps']['competitor'];profiles[wa_id]=profile
        identifiers=[str(wa_id),str(profile['basicData']['iaafId'])]
        snapshots_sql.extend(state_queries(aid))
        snapshots_sql.append(("SELECT provider,external_id,athlete_id FROM athlete_source_identities WHERE provider='worldathletics' AND external_id=ANY($1::text[])",[identifiers]))
        official_name=normalized(profile['basicData']['givenName']+' '+profile['basicData']['familyName'])
        snapshots_sql.append(("SELECT id,display_name,slug FROM athletes WHERE id<>$1 AND (lower(regexp_replace(display_name,'[^a-zA-Z0-9]','','g')) IN ($2,(SELECT lower(regexp_replace(display_name,'[^a-zA-Z0-9]','','g')) FROM athletes WHERE id=$1)) OR source_url=$3)",[aid,official_name,url]))
    database_snapshot=query(snapshots_sql,True)
    for target_index,target in enumerate(manifest['targets']):
        aid=target['athleteId'];wa_id=target['worldAthleticsId'];url=target['sourceUrl']
        if not re.fullmatch(r'https://(?:www\.)?worldathletics\.org/athletes/[^?#]+-'+str(wa_id),url):raise ValueError('Unexpected official profile URL')
        profile=profiles[wa_id]
        if profile['_id']!=wa_id:raise ValueError('Wrong official identity')
        before=database_snapshot[target_index*6:target_index*6+4];athlete=before[0][0]['value'];histories=[x['value'] for x in before[1]]
        if before[2][0]['n'] or before[3][0]['n'] or athlete['profile_visibility']!='public':
            out['held'].append({'athleteId':aid,'reason':'Account-controlled, canonical results present, or non-public profile'});continue
        wmm=[h for h in histories if h['provider']=='Abbott World Marathon Majors']
        if len(wmm)!=1:raise ValueError('Expected one original source history')
        years=list(map(int,profile['resultsByYear']['activeYears']));rows=[];snapshots={}
        for year in years:
            payload=json.loads((args.captures/f'{wa_id}-{year}.json').read_text());snapshots[str(year)]=payload
            rows.extend(parse_year(wa_id,year,payload,url))
        held=[];accepted=[];seen={}
        for row in rows:
            original=row['sourceEvidence']['row'];reason=None
            if row['date']>dt.date.today().isoformat():reason='Future-dated result'
            if re.search(r'intermediate|split',original.get('remark') or '',re.I) or original.get('remark')=='ST' or row['round']=='I':reason='Intermediate split, not a separate race'
            if original.get('remark')=='EXH':reason='Exhibition performance; requires separate non-record presentation review'
            for rule in target.get('holdRules',[]):
                if row['discipline']==rule['discipline'] and row['date']<rule['before']:reason=rule['reason']
            key=(row['date'],original.get('competitionId') or original['competition'],row['discipline'],row['round'])
            if key in seen:
                if seen[key]['performance']==row['performance'] and seen[key]['place']==row['place']:continue
                reason='Conflicting source rows for same race/round'
                previous=seen[key]
                if previous in accepted:accepted.remove(previous);held.append({'reason':reason,'row':previous})
            seen[key]=row
            if reason:held.append({'reason':reason,'row':row})
            else:accepted.append(row)
        match=identity_matches(athlete,profile['basicData'],wmm[0]['performances'],accepted,manifest['raceAliases'])
        identifiers=[str(wa_id),str(profile['basicData']['iaafId'])]
        mappings=database_snapshot[target_index*6+4]
        if any(x['athlete_id']!=aid for x in mappings):match['failures'].append('Official identity already belongs to another AthRecs profile');match['eligible']=False
        namekeys=sorted({normalized(athlete['display_name']),normalized(match['sourceName'])})
        other_names=database_snapshot[target_index*6+5]
        if other_names:match['failures'].append('Other directory profiles need identity review');match['eligible']=False
        if not match['eligible']:
            out['held'].append({'athleteId':aid,'name':athlete['display_name'],'match':match,'otherProfiles':other_names});continue
        modified=copy.deepcopy(wmm[0])
        for overlap in match['overlaps']:
            r=modified['performances'][overlap['sourceIndex']];r['profileExcluded']=True
            r['supersededBy']={'provider':PROVIDER,'externalId':str(wa_id),'sourceLocator':overlap['waLocator'],'reason':'Exact shared performance; displayed once with complete official date and round placing'}
        details=copy.deepcopy(athlete['profile_details'])
        details['aliases']=list(dict.fromkeys([*details.get('aliases',[]),match['sourceName']]))
        details['identity_review_status']='source_identity_matched'
        details['crossSourceIdentity']={'provider':'worldathletics','externalId':str(wa_id),'legacyExternalId':identifiers[1],
            'sourceUrl':url,'checkedAt':out['preparedAt'],'basis':'Reviewed name variant, official sex/nationality/date of birth and exact shared race/year/distance/mark; not an account ownership verification',
            'overlaps':match['overlaps'],'conflicts':match['conflicts']}
        item={'athleteId':aid,'name':athlete['display_name'],'slug':athlete['slug'],'worldAthleticsId':wa_id,'identifiers':identifiers,
            'sourceUrl':url,'before':{'athlete':athlete,'histories':histories},'dob':match['dob'],'details':details,
            'wmm':modified,'history':{'provider':PROVIDER,'externalId':str(wa_id),'sourceUrl':url,'capturedAt':out['preparedAt'],
                'complete':False,'yearsExpected':years,'yearsCaptured':years,'performances':accepted},
            'heldRows':held,'identity':match,'sourceSnapshot':{'basicData':profile['basicData'],'annual':snapshots},'nameKeys':namekeys}
        item['requestId']='wa-link:'+str(wa_id)+':'+sha(item)[:24];out['profiles'].append(item)
    args.output.write_text(json.dumps(out,ensure_ascii=False,indent=2))
    print(json.dumps({'prepared':len(out['profiles']),'held':out['held'],'profiles':[{'id':x['athleteId'],'name':x['name'],'rows':len(x['history']['performances']),'heldRows':len(x['heldRows']),'overlaps':len(x['identity']['overlaps'])} for x in out['profiles']]}))

def apply_one(query,item,actor):
    aid=item['athleteId'];request=item['requestId']
    # Same identity serializes; all preconditions are checked again inside the
    # transaction. A failed unique mapping or stale snapshot rolls everything back.
    done="EXISTS(SELECT 1 FROM network_audit_log WHERE action='athlete.cross_source_linked' AND entity_id=$1)"
    gate='NOT '+done
    guard=f"""SELECT 1 / CASE WHEN {done} OR (
      EXISTS(SELECT 1 FROM athletes a WHERE id=$2 AND to_jsonb(a)=$3::jsonb AND profile_visibility='public')
      AND (SELECT coalesce(jsonb_agg(to_jsonb(h) ORDER BY provider,external_id),'[]'::jsonb) FROM athlete_source_histories h WHERE athlete_id=$2)=$4::jsonb
      AND NOT EXISTS(SELECT 1 FROM athlete_account_links WHERE athlete_id=$2 AND status='active')
      AND NOT EXISTS(SELECT 1 FROM results WHERE athlete_id=$2)
      AND NOT EXISTS(SELECT 1 FROM athletes WHERE id<>$2 AND (lower(regexp_replace(display_name,'[^a-zA-Z0-9]','','g'))=ANY($5::text[]) OR source_url=$6))
      AND NOT EXISTS(SELECT 1 FROM athlete_source_identities WHERE provider='worldathletics' AND external_id=ANY($7::text[]) AND athlete_id<>$2)
    ) THEN 1 ELSE 0 END AS guard"""
    statements=[('SELECT pg_advisory_xact_lock(hashtext($1))',['athrecs-wa-link:'+str(item['worldAthleticsId'])]),
        ('SELECT id FROM athletes WHERE id=$1 FOR UPDATE',[aid]),
        ('SELECT athlete_id FROM athlete_source_histories WHERE athlete_id=$1 FOR UPDATE',[aid]),
        (guard,[request,aid,json.dumps(item['before']['athlete']),json.dumps(item['before']['histories']),item['nameKeys'],item['sourceUrl'],item['identifiers']]),
        (f"INSERT INTO athlete_source_identities(provider,external_id,athlete_id,source_url) SELECT 'worldathletics',unnest($3::text[]),$2,$4 WHERE {gate} ON CONFLICT(provider,external_id) DO NOTHING",[request,aid,item['identifiers'],item['sourceUrl']]),
        (f"UPDATE athletes SET date_of_birth=coalesce(date_of_birth,$3::date),profile_details=$4::jsonb WHERE id=$2 AND {gate}",[request,aid,item['dob'],json.dumps(item['details'])])]
    h=item['history']
    statements.append((f"""INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
      SELECT $2,$3,$4,$5,$6::timestamptz,false,$7::int[],$7::int[],$8::jsonb,now() WHERE {gate}""",[request,aid,PROVIDER,h['externalId'],h['sourceUrl'],h['capturedAt'],h['yearsCaptured'],json.dumps(h['performances'])]))
    statements.append((f"UPDATE athlete_source_histories SET performances=$3::jsonb WHERE athlete_id=$2 AND provider='Abbott World Marathon Majors' AND external_id=$4 AND {gate}",[request,aid,json.dumps(item['wmm']['performances']),item['wmm']['external_id']]))
    statements.append((f"""INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,after_value,note)
      SELECT $2,'athlete.history_admin_published','athlete_source_history',$3,$4::jsonb,$5 WHERE {gate}""",[request,actor,PROVIDER+':'+h['externalId'],json.dumps({'athleteId':aid,'requestId':request,'sourceCompared':True,'identityBasis':item['identity']}),'Owner requested cross-source matching and missing races. Official annual source rows retained, decimals/rounds/nonfinishes preserved; matched source copies displayed once.']))
    statements.append((f"""INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,before_value,after_value,note)
      SELECT $2,'athlete.cross_source_linked','athlete',$1,$3::jsonb,$4::jsonb,$5 WHERE {gate} RETURNING id""",[request,actor,json.dumps(item['before']),json.dumps(item),'Owner-authorized source link and history enrichment; original records and full source snapshot retained for recovery. Not an account claim or blanket verification of unrelated profiles.']))
    results=query(statements)
    return {'athleteId':aid,'status':'applied' if results[-1] else 'already_applied','rows':len(h['performances']),'suppressedDuplicates':len(item['identity']['overlaps'])}

def main():
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','apply']);p.add_argument('--connection',type=Path,required=True);p.add_argument('--confirm-branch',required=True)
    p.add_argument('--captures',type=Path);p.add_argument('--manifest',type=Path);p.add_argument('--output',type=Path,required=True);p.add_argument('--plan',type=Path)
    p.add_argument('--owner-authorized',action='store_true');p.add_argument('--actor-email');p.add_argument('--publish',action='store_true')
    a=p.parse_args();cfg,query=base.connection(a.connection,a.confirm_branch)
    if cfg['projectId']!=PROJECT:raise ValueError('Wrong project')
    if a.mode=='prepare':prepare(a,query);return
    if not a.owner_authorized or not a.actor_email:raise ValueError('Explicit owner authorization and audit actor required')
    if a.confirm_branch==PRODUCTION and not a.publish:raise ValueError('Production requires explicit --publish')
    plan=json.loads(a.plan.read_text())
    if plan['projectId']!=PROJECT:raise ValueError('Wrong plan project')
    receipts=[]
    for item in plan['profiles']:
        if not item['identity']['eligible']:raise ValueError('Unresolved identity')
        body={k:v for k,v in item.items() if k!='requestId'}
        if item['requestId']!='wa-link:'+str(item['worldAthleticsId'])+':'+sha(body)[:24]:raise ValueError('Prepared plan integrity mismatch')
        receipts.append(apply_one(query,item,a.actor_email));a.output.write_text(json.dumps(receipts,indent=2));print(json.dumps(receipts[-1]),flush=True)

if __name__=='__main__':main()
