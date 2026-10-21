"""Rehearse and publish a supervised Trackie entity graph.

Private inputs/receipts stay outside git. Names only nominate existing athletes
for review; this importer never merges them or changes an account or claim.
The public history retains exact marks. Canonical rows link competitions and
are excluded from the duplicate profile display and verified achievements.
"""
import argparse, collections, datetime as dt, hashlib, importlib.util, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('trackie_wmm', ROOT/'apply-wmm-profiles.py')
w = importlib.util.module_from_spec(spec); spec.loader.exec_module(w)
BATCH = 'trackie-public-20261021'
PROVIDER = 'Trackie'
INSTRUCTION = 'can the athletes profiles from these results be added to athrecs.com though. and clubs and meetings and events'

def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2))

def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def slug(value):
    return re.sub(r'[^a-z0-9]+', '-', w.prep.norm(value)).strip('-')

def display_name(value):
    if ',' in value:
        family, given = value.split(',', 1)
        return ' '.join((given+' '+family).split())
    return ' '.join(value.split())

def km(label):
    m = re.search(r'(\d+(?:\.\d+)?)\s*(Mile|Meter|Kilometer|[kK](?:m)?)\b', label)
    if not m: return 0
    return float(m[1]) * (1.609344 if m[2]=='Mile' else .001 if m[2]=='Meter' else 1)

def prepare(args):
    global BATCH, INSTRUCTION
    directory = json.loads((args.work/'directory.json').read_text())
    clubs = json.loads((args.work/'clubs.json').read_text())
    config = json.loads(args.config.read_text())
    supplemental_path = args.work/'supplementary-review.private.json'
    supplemental = json.loads(supplemental_path.read_text()) if supplemental_path.exists() else {'sources':[], 'rows':[]}
    for source in supplemental['sources']:
        if hashlib.sha256(pathlib.Path(source['path']).read_bytes()).hexdigest()!=source['sha256']:
            raise ValueError('Supplementary source changed')
    reviewed_rows = {(r['sourceKey'],r['sourceRow']):r for r in supplemental['rows']}
    if len(reviewed_rows)!=len(supplemental['rows']):raise ValueError('Duplicate supplementary review row')
    BATCH = config.get('batchId', BATCH)
    INSTRUCTION = config.get('instruction', INSTRUCTION)
    if not re.fullmatch(r'trackie-public-[a-z0-9-]+', BATCH):
        raise ValueError('Invalid Trackie batch identifier')
    club_plan, club_by_alias, held_clubs = [], {}, []
    for org in config['clubs']:
        keys = {w.prep.norm(x) for x in [org['name'], *org['aliases']]}
        matches = [c for c in clubs if keys.intersection(w.prep.norm(x) for x in [c['name'], *re.split(r'[|;]', c.get('source_names') or '')])]
        if len(matches)>1:
            held_clubs.append({'name':org['name'],'reason':'multiple existing clubs','ids':[c['id'] for c in matches]});continue
        c = {**org, 'existingId': matches[0]['id'] if matches else None,
             'slug':matches[0]['slug'] if matches else slug(org['name'])+'-trackie',
             'country':org.get('country',''), 'city':org.get('city',''), 'website':org.get('website','')}
        club_plan.append(c)
        for alias in org['aliases']: club_by_alias[alias]=c
    if len({c['slug'] for c in club_plan})!=len(club_plan):
        raise ValueError('Duplicate canonical clubs; consolidate configuration aliases')
    meetings, groups, holds, captures = [], collections.defaultdict(list), [], []
    for path in sorted(args.captures.glob('*.capture.json')):
        cap=json.loads(path.read_text()); p=cap['payload']; key=p['sourceKey']
        if not p['rows'] or cap['state']!='compared': continue
        if p['schemaVersion'] not in (4,5,6,7,8) or cap['issues']: raise ValueError('Unreviewed parser version')
        if hashlib.sha256(pathlib.Path(cap['sourcePath']).read_bytes()).hexdigest()!=cap['sourceSha256']: raise ValueError('Original PDF changed')
        m={**config['meetings'][key], 'key':key, 'date':p['index']['date'], 'sourceUrl':p['sourceUrl'], 'attachmentUrl':p['attachmentUrl'], 'competitions':[]}
        for heading, rs in __import__('itertools').groupby(sorted(p['rows'],key=lambda r:r['tableKey']),lambda r:r['tableKey']):
            rs=list(rs)
            fmt='time' if any(r['finishSeconds'] is not None for r in rs) else 'mark' if any(re.search(r'\dm$',r['performance']) for r in rs) else 'points' if 'Pentathlon' in heading else 'other'
            m['competitions'].append({'name':heading,'code':'trackie-'+key+'-'+digest(heading)[:12], 'km':km(heading), 'format':fmt})
        meetings.append(m)
        captures.append({'key':key,'sha256':cap['sourceSha256'],'payloadHash':digest(p)})
        for r in p['rows']:
            if not r['independentTextCompared']: raise ValueError('Uncompared row')
            name=display_name(r['name']); reasons=[]
            review=reviewed_rows.get((key,r['sourceRow']),{})
            if review:
                if (review['name'],review['performance'],review['date'],review['gender']) != (name,r['performance'],r['date'],r['gender']):
                    raise ValueError('Supplementary review differs from source row')
                if review.get('nationality') and not re.fullmatch(r'[A-Z]{3}',review['nationality']):raise ValueError('Invalid source nationality')
                reasons.extend(review.get('holdReasons',[]))
            if len(name.split())<2 or re.search(r'[%#]|\b[TF]\d{2}\b',name): reasons.append('source name needs review')
            if re.search(r'\ufffd|Ã.|Â.',name): reasons.append('source name encoding needs review')
            source_age=re.fullmatch(r'[MWF]?(\d+)',r['original'].get('Age') or '')
            age_band=re.fullmatch(r'(\d+)-(\d+)',r['category'])
            if source_age and age_band and not int(age_band[1])-1 <= int(source_age[1]) <= int(age_band[2])+1:
                reasons.append('explicit source age conflicts with category')
            if key=='10363' and r['performance']=='2:22.58': reasons.append('implausible one-mile source mark')
            if r['original'].get('Annotation')=='Ran 1 km': reasons.append('source distance differs from event heading')
            if key=='10364' and '95-99' in r['tableKey']: reasons.append('source age conflicts with other entries')
            if reasons:
                holds.append({'sourceKey':key,'sourceRow':r['sourceRow'],'name':name,'reasons':reasons});continue
            groups[w.prep.norm(name)].append({'row':r,'meeting':m,'capture':cap,'name':name,'review':review})
    profiles=[]
    # A similar source name is a review candidate, not evidence of two identities.
    within=collections.defaultdict(set)
    for n,rs in groups.items(): w.prep.add(within,n,[rs[0]['name']])
    for n,rs in groups.items():
        aliases=sorted({x['name'] for x in rs}|{x['row']['name'] for x in rs})
        matches=w.prep.matching(directory['index'],[rs[0]['name']])
        nearby=w.prep.matching(within,[rs[0]['name']],n)
        reasons=[]
        nations={x['review']['nationality'] for x in rs if x['review'].get('nationality')}
        if len(nations)>1:reasons.append('conflicting explicitly sourced nationalities')
        if matches: reasons.append('existing athlete/account identity candidate')
        if nearby: reasons.append('similar source athlete names')
        genders={x['row']['gender'] for x in rs}
        if len(genders)!=1 or '' in genders: reasons.append('unspecified or inconsistent gender')
        orgs={club_by_alias[r['row']['club']]['slug'] if r['row']['club'] in club_by_alias else w.prep.norm(r['row']['club']) for r in rs}
        if len(orgs)>1: reasons.append('different source clubs require identity review')
        ages=[int(match[1]) for x in rs if (match:=re.fullmatch(r'[MWF]?(\d+)', x['row']['original'].get('Age') or ''))]
        if ages and max(ages)-min(ages)>1: reasons.append('inconsistent explicit source ages')
        event_rows=[(x['meeting']['key'],x['row']['tableKey']) for x in rs]
        if len(event_rows)!=len(set(event_rows)): reasons.append('multiple rows in same competition')
        if reasons:
            holds.append({'name':rs[0]['name'],'reasons':reasons,'candidates':[directory['entities'].get(x,{'identifier':x}) for x in sorted(matches)],'nearby':sorted(nearby),'rows':len(rs),'locators':[[x['meeting']['key'],x['row']['sourceRow']] for x in rs]});continue
        first=rs[0]; ident='source-'+digest(sorted([x['meeting']['key']+':'+x['row']['sourceRow'] for x in rs]))[:24]
        name=first['name']; source_name=first['row']['name']; family,given=(source_name.split(',',1) if ',' in source_name else (name.rsplit(' ',1)[-1],name.rsplit(' ',1)[0])); club=club_by_alias.get(first['row']['club']); performances=[]
        for x in sorted(rs,key=lambda x:(x['row']['date'],x['row']['tableKey'])):
            r,m,cap=x['row'],x['meeting'],x['capture']
            labels=['Identity unconfirmed']
            if m['surface']=='Cross Country':labels.append('Cross Country')
            if m['surface']=='Road':labels.append('Road')
            discipline=r['distanceLabel']+' Cross Country' if m['surface']=='Cross Country' else r['distanceLabel']+' Road' if m['surface']=='Road' else r['distanceLabel'].replace(' Meter','m') if r['distanceLabel'] else re.sub(r'^(?:Throws Pentathlon: #\d+ |Event \d+ )?(?:Boys|Girls|Women|Men)\s+(?:\d+(?:-\d+|\+)?|U\d+)\s+','',r['tableKey'])
            labels.append('Event: '+r['tableKey'])
            perf={'year':2026,'date':r['date'],'sourceDate':r['date'],'ageGroup':r['category'],'discipline':discipline,'performance':r['performance'], 'timing':{'basis':'unknown'},'wind':r['original'].get('Wind',''),'place':r['sourcePlace'],'places':{'overall':None,'gender':None,'category':None},'venue':m['venue'],'meeting':m['name'],'eventSlug':m['slug'],'country':m['country'],'providerName':PROVIDER,'sourceUrls':[m['sourceUrl'],m['attachmentUrl']],'sourceKeys':['trackie:'+m['key']+':'+r['sourceRow']], 'labels':labels,'verificationStatus':'unverified','notes':m.get('qualification',''), 'archiveReference':{'sourceKey':m['key'],'sourceRow':r['sourceRow'],'sourceSha256':cap['sourceSha256'],'sourcePayloadHash':digest(cap['payload']),'original':r['original'],'identityVerified':False}, 'competitionName':r['tableKey'],'finishSeconds':r['finishSeconds'],'sourceClub':r['club'],'sourceStatus':r['status'],'bib':r['bib']}
            performances.append(perf)
        profiles.append({'externalId':ident,'slug':slug(name)[:85]+'-trackie-'+ident[7:],'displayName':name,'givenName':given.strip(),'familyName':family.strip(),'gender':'F' if first['row']['gender']=='Female' else 'M','nation':'','sourceUrl':first['meeting']['sourceUrl'],'capturedAt':first['capture']['capturedAt'],'years':[2026],'clubSlug':club['slug'] if club else None,'sourceClub':first['row']['club'],'details':{'aliases':aliases,'athlete_verified':False,'identity_review_status':'provisional_source_profile','currentClubAssociationConfirmed':False,'archiveCreation':{'batchId':BATCH,'approvedBy':'Paul Browne','approvedAt':'2026-10-21','instruction':INSTRUCTION,'profileIdentityVerified':False,'sourceRowsCompared':True,'resultCount':len(performances),'providerLicenceClaimed':False}},'performances':performances})
        if nations:
            profiles[-1]['nation']=next(iter(nations))
            evidence=[x['review'] for x in rs if x['review'].get('nationality')]
            profiles[-1]['details']['archiveCreation']['nationalityEvidence']=evidence
            profiles[-1]['details']['sourceNationalityObservation']={'value':profiles[-1]['nation'],'provider':evidence[0]['provider'],'sourceUrl':evidence[0]['sourceUrl']}
    plan={'batchId':BATCH,'instruction':INSTRUCTION,'directoryFingerprint':directory['fingerprint'],'clubs':club_plan,'heldClubs':held_clubs,'meetings':meetings,'profiles':profiles,'held':holds,'captures':captures}
    if supplemental['sources']:plan['supplementarySources']=supplemental['sources']
    plan['summary']={'profiles':len(profiles),'results':sum(len(p['performances']) for p in profiles),'meetings':len(meetings),'newMeetings':sum(not m.get('existingId') for m in meetings),'competitions':sum(len(m['competitions']) for m in meetings),'newClubs':sum(not c['existingId'] for c in club_plan),'linkedClubs':sum(bool(c['existingId']) for c in club_plan),'heldRows':sum(h.get('rows',1) for h in holds),'heldGroups':len(holds),'unresolvedClubLabels':sorted({x['row']['club'] for rs in groups.values() for x in rs if x['row']['club'] not in club_by_alias and not re.match(r'^(?:Unattached|UNA)',x['row']['club'],re.I)})}
    dump(args.work/'plan.private.json',plan); print(json.dumps(plan['summary']))

def apply(args):
    global BATCH, INSTRUCTION
    plan=json.loads((args.work/'plan.private.json').read_text()); fingerprint=digest(plan)
    BATCH=plan['batchId']; INSTRUCTION=plan['instruction']
    if not re.fullmatch(r'trackie-public-[a-z0-9-]+', BATCH):raise ValueError('Invalid Trackie batch identifier')
    cfg,q=w.base.connection(args.connection,args.confirm_branch,180)
    if cfg['projectId']!=w.PROJECT:raise ValueError('Wrong project')
    if args.publish:
        review=json.loads((args.work/'review-receipt.private.json').read_text())
        if cfg['branchId']!=w.PROD or review['planHash']!=fingerprint or not review['verified']:raise ValueError('Production requires verified unchanged rehearsal')
    elif cfg['branchId']==w.PROD:raise ValueError('Rehearsal cannot write production')
    # Idempotent exact-batch replay is read-only; never overwrite later edits.
    existing=q([("SELECT count(*)::int n FROM athletes WHERE slug=ANY($1::text[])",[[p['slug'] for p in plan['profiles']]])],True)[0][0]['n']
    if existing:raise ValueError('Batch already exists; inspect readback instead of overwriting')
    payload=json.dumps(plan,ensure_ascii=False,separators=(',',':'))
    statements=[("SET LOCAL lock_timeout='8s'",[]),("SET LOCAL statement_timeout='150s'",[]),('LOCK TABLE athletes,"user",athlete_private_profiles,athlete_account_links,results,editions,events,clubs,athlete_clubs IN SHARE ROW EXCLUSIVE MODE',[]),('CREATE TEMP TABLE trackie_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),('INSERT INTO trackie_guard SELECT fingerprint=$2 FROM ('+w.FP+') f',[0,plan['directoryFingerprint']]),('CREATE TEMP TABLE trackie_plan(p jsonb) ON COMMIT DROP',[]),('INSERT INTO trackie_plan VALUES($1::jsonb)',[payload])]
    statements += [(sql,[]) for sql in GRAPH_SQL]
    # Reuse the audited, privacy-aware source-profile publication path.
    sql=w.INSERT.replace('Owner requested WMM athlete profiles and source results with duplicate checks; retained source year only; unclaimed provisional identity; existing profiles unchanged.','Owner requested Trackie athletes, clubs, meetings and events; exact source marks retained; identities provisional; existing profiles unchanged.')
    statements.append((sql,[json.dumps(plan['profiles'],ensure_ascii=False),PROVIDER,BATCH,None]))
    statements += [(sql.replace("'trackie-public-20261021'", "'"+BATCH+"'"),[]) for sql in RESULT_SQL]
    statements.append(("INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,after_value,note) VALUES('paul@athrecs.com','trackie.graph_published','import_batch',$1,$2::jsonb,$3)",[BATCH,json.dumps({'planHash':fingerprint,'summary':plan['summary'],'instruction':INSTRUCTION,'held':plan['held'],'heldClubs':plan['heldClubs'],'providerLicenceClaimed':False}),INSTRUCTION]))
    statements.append((VERIFY,[BATCH,[p['slug'] for p in plan['profiles']]]))
    result=q(statements); counts=result[-1][0]
    expected={'profiles':plan['summary']['profiles'],'histories':plan['summary']['profiles'],'results':plan['summary']['results']}
    if any(int(counts[k])!=v for k,v in expected.items()):raise ValueError('Readback mismatch: '+json.dumps(counts))
    examples=q([("SELECT a.id,a.slug,a.display_name FROM athletes a WHERE a.slug=ANY($1::text[]) ORDER BY a.id LIMIT 8",[[p['slug'] for p in plan['profiles']]])],True)[0]
    receipt={'branchId':cfg['branchId'],'planHash':fingerprint,'verified':True,'counts':counts,'examples':examples}
    dump(args.work/('production-receipt.private.json' if args.publish else 'review-receipt.private.json'),receipt);print(json.dumps(receipt))

GRAPH_SQL = [
"""INSERT INTO trackie_guard SELECT NOT EXISTS(SELECT 1 FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'captures') c WHERE NOT EXISTS(SELECT 1 FROM result_archive_source_captures s WHERE s.provider='Trackie' AND s.source_key=c->>'key' AND s.html_sha256=c->>'sha256' AND s.payload_hash=c->>'payloadHash' AND s.source_check='compared'))""",
"""INSERT INTO clubs(slug,name,city,county,country,sports,website,summary,source_names,source_url,checked_at,location_precision)
SELECT c->>'slug',c->>'name',c->>'city','',c->>'country','Athletics,Running',nullif(c->>'website',''),'Club or team represented in the Trackie results archive. Result affiliations are historical, not confirmation of current membership.',(SELECT string_agg(value,'; ') FROM jsonb_array_elements_text(c->'aliases')),c->>'sourceUrl',current_date,'unverified'
FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'clubs') c WHERE c->>'existingId' IS NULL ON CONFLICT(slug) DO NOTHING""",
"""INSERT INTO trackie_guard SELECT NOT EXISTS(SELECT 1 FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'clubs') c WHERE NOT EXISTS(SELECT 1 FROM clubs x WHERE x.slug=c->>'slug' AND (c->>'existingId' IS NULL OR x.id=(c->>'existingId')::int)))""",
"""INSERT INTO events(slug,name,sport,country,county,city,area,surface,summary,description,organiser,website,source_url)
SELECT m->>'slug',m->>'name',m->>'sport',m->>'country',m->>'region',m->>'city',m->>'venue',m->>'surface',m->>'name'||' — results from '||(m->>'date'), 'Recorded meeting and individual events. Results credited to Trackie. '||coalesce(m->>'qualification',''),'',m->>'sourceUrl',m->>'sourceUrl'
FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'meetings') m WHERE m->>'existingId' IS NULL ON CONFLICT(slug) DO NOTHING""",
"""INSERT INTO trackie_guard SELECT NOT EXISTS(SELECT 1 FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'meetings') m WHERE NOT EXISTS(SELECT 1 FROM events e WHERE e.slug=m->>'slug' AND e.country=m->>'country' AND (m->>'existingId' IS NULL OR e.id=(m->>'existingId')::int)))""",
"""INSERT INTO editions(event_id,event_date,distance_code,distance_km,status,source_url,results_official_url,notes)
SELECT e.id,(m->>'date')::date,c->>'name',(c->>'km')::float,'Finished',m->>'sourceUrl',m->>'sourceUrl','Source placing applies to this exact event/category heading. '||coalesce(m->>'qualification','')
FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'meetings') m CROSS JOIN LATERAL jsonb_array_elements(m->'competitions') c JOIN events e ON e.slug=m->>'slug' ON CONFLICT(event_id,event_date,distance_code) DO NOTHING""",
"""INSERT INTO event_distances(event_id,distance_code) SELECT e.id,c->>'name' FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'meetings') m CROSS JOIN LATERAL jsonb_array_elements(m->'competitions') c JOIN events e ON e.slug=m->>'slug' ON CONFLICT DO NOTHING""",
"""INSERT INTO network_event_editions(event_id,edition_name,start_date,end_date,status,migration_state,legacy_edition_count)
SELECT e.id,m->>'name',(m->>'date')::date,(m->>'date')::date,'Finished','active',jsonb_array_length(m->'competitions') FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'meetings') m JOIN events e ON e.slug=m->>'slug' ON CONFLICT(event_id,start_date) DO NOTHING""",
"""INSERT INTO competitions(network_edition_id,legacy_edition_id,discipline_id,competition_code,name,distance_code,result_format,status,migration_state)
SELECT n.id,d.id,(m->>'disciplineId')::int,c->>'code',c->>'name',c->>'name',c->>'format','Finished','active' FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'meetings') m CROSS JOIN LATERAL jsonb_array_elements(m->'competitions') c JOIN events e ON e.slug=m->>'slug' JOIN network_event_editions n ON n.event_id=e.id AND n.start_date=(m->>'date')::date JOIN editions d ON d.event_id=e.id AND d.event_date=n.start_date AND d.distance_code=c->>'name' ON CONFLICT DO NOTHING""",
"""INSERT INTO event_publications(event_id,brand_id,public_slug,public_path,publication_status,is_canonical,canonical_url,published_at)
SELECT e.id,b.id,e.slug,'/races/'||e.slug,'legacy_live',true,'https://www.athrecs.com/races/'||e.slug,now() FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'meetings') m JOIN events e ON e.slug=m->>'slug' CROSS JOIN brands b WHERE b.code='athrecs' ON CONFLICT(event_id,brand_id) DO NOTHING""",
]

RESULT_SQL = [
"""UPDATE athletes a SET club_id=c.id,source_club_name=x->>'sourceClub' FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x JOIN clubs c ON c.slug=x->>'clubSlug' WHERE a.slug=x->>'slug' AND a.profile_details #>> '{archiveCreation,batchId}'='trackie-public-20261021'""",
"""INSERT INTO athlete_clubs(athlete_id,club_id,relationship,source_name) SELECT a.id,a.club_id,'primary',a.source_club_name FROM athletes a WHERE a.slug IN (SELECT x->>'slug' FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x) AND a.profile_details #>> '{archiveCreation,batchId}'='trackie-public-20261021' AND a.club_id IS NOT NULL ON CONFLICT DO NOTHING""",
"""INSERT INTO results(edition_id,athlete_id,status,finish_time_seconds,overall_place,category,bib,result_source,source_url,result_visibility,result_details)
SELECT d.id,a.id,CASE WHEN h->>'performance' ~ '^([0-9]+:)*[0-9]+([.][0-9]+)?m?$' THEN 'finished' ELSE h->>'performance' END,NULL,NULL,nullif(h->>'ageGroup',''),nullif(h->>'bib',''),'Trackie',h->'sourceUrls'->>0,'public',jsonb_build_object('verificationStatus','unverified','profileExcluded',true,'reportedPerformance',h->>'performance','reportedPlace',h->>'place','sourceClub',h->>'sourceClub','qualification',h->>'notes','archiveReference',h->'archiveReference','batchId','trackie-public-20261021','profileDisplay','athlete_source_histories')
FROM trackie_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x CROSS JOIN LATERAL jsonb_array_elements(x->'performances') h JOIN athletes a ON a.slug=x->>'slug' JOIN events e ON e.slug=h->>'eventSlug' JOIN editions d ON d.event_id=e.id AND d.event_date=(h->>'date')::date AND d.distance_code=h->>'competitionName' ON CONFLICT(edition_id,athlete_id) DO NOTHING""",
"""INSERT INTO trackie_guard SELECT (SELECT count(*) FROM jsonb_array_elements(p->'profiles') x JOIN athletes a ON a.slug=x->>'slug' JOIN results r ON r.athlete_id=a.id WHERE r.result_details->>'batchId'=p->>'batchId')=(p->'summary'->>'results')::int AND (SELECT count(*) FROM jsonb_array_elements(p->'profiles') x JOIN athletes a ON a.slug=x->>'slug' WHERE a.profile_details #>> '{archiveCreation,batchId}'=p->>'batchId')=(p->'summary'->>'profiles')::int FROM trackie_plan""",
]
VERIFY = """SELECT (SELECT count(*)::int FROM athletes WHERE slug=ANY($2::text[]) AND profile_details #>> '{archiveCreation,batchId}'=$1 AND profile_visibility='public' AND date_of_birth IS NULL AND country='' AND county='' AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=athletes.id)) profiles,(SELECT count(*)::int FROM athlete_source_histories h JOIN athletes a ON a.id=h.athlete_id WHERE a.slug=ANY($2::text[]) AND a.profile_details #>> '{archiveCreation,batchId}'=$1 AND h.provider='Trackie' AND h.published_at IS NOT NULL) histories,(SELECT count(*)::int FROM athletes a JOIN results ON results.athlete_id=a.id WHERE a.slug=ANY($2::text[]) AND result_details->>'batchId'=$1 AND result_visibility='public' AND result_details->>'verificationStatus'='unverified' AND finish_time_seconds IS NULL) results"""

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('mode',choices=['prepare','apply']);p.add_argument('--work',type=pathlib.Path,required=True);p.add_argument('--captures',type=pathlib.Path);p.add_argument('--config',type=pathlib.Path);p.add_argument('--connection',type=pathlib.Path);p.add_argument('--confirm-branch');p.add_argument('--publish',action='store_true')
    args=p.parse_args();prepare(args) if args.mode=='prepare' else apply(args)
