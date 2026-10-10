"""Rehearse/apply captured public UTMB histories without name-only merges.

All captures are retained in the private central source archive. Existing stable
UTMB identities may receive missing observations; ambiguous names are held.
No canonical results, PBs, accounts, claims, or existing visibility are changed.
"""
import argparse, collections, datetime as dt, gzip, hashlib, importlib.util, json, pathlib, re, time, uuid
ROOT=pathlib.Path(__file__).resolve().parent
def module(name,file):
    spec=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
base=module('utmb_base','create-private-archive-profiles.py')
wmm=module('utmb_matching','apply-wmm-profiles.py');prep=wmm.prep
PROVIDER='utmb';BATCH='utmb-directory-20261010';APPROVAL=BATCH+'-owner'
RUN=str(uuid.uuid5(uuid.NAMESPACE_URL,BATCH));PROD=wmm.PROD
def directory_pages(query,maxid):
    # Fewer read-only round trips; keep the same complete name/alias scan and
    # before/after fingerprint guards as the established importer.
    last=0
    sql=wmm.ATH.replace('ORDER BY a.id','AND a.id>$2 ORDER BY a.id LIMIT 100000')
    while True:
        rows=query([(sql,[maxid,last])],True)[0]
        if not rows:return
        yield rows
        last=max(int(a['id']) for a in rows)
wmm.directory_pages=directory_pages
def read(path):
    with gzip.open(path,'rt',encoding='utf-8') as f:return json.load(f)
def normalise(c,aid):
    if hashlib.sha256(c['raw'].encode()).hexdigest()!=c['sha256']:raise ValueError('Capture checksum differs')
    raw=json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',c['raw']).group(1))['props']['pageProps']
    if raw!=c['data']:raise ValueError('Capture data differs from original page')
    if not re.search(r'/runner/'+re.escape(aid)+r'\.',c['url']):raise ValueError('Runner ID mismatch')
    if raw['gender'] not in ('H','F'):raise ValueError('Unknown source gender')
    name=raw['fullname'].strip();perfs=[];seen={};held=[]
    for row in raw['results']['results']:
        date=dt.date.fromisoformat(row['dateIso'])
        if date>dt.date.fromisoformat(c['capturedAt'][:10]):
            held.append({'reason':'future_dated_result','original':row});continue
        if date.year!=row['eventYear']:raise ValueError('Race year/date conflict')
        distance=float(row['distance']);rid=str(row['raceYearId'])
        if distance<=0:raise ValueError('Missing measured race distance')
        if rid in seen:
            if seen[rid]!=row:raise ValueError('Conflicting race edition rows')
            continue
        seen[rid]=row
        if row['isDnf']:
            if row['time'] or row['rank'] or row['rankGender']:raise ValueError('DNF has finish fields')
            performance='DNF'
        else:
            performance=row['time'] or ''
            if not re.fullmatch(r'\d{1,3}:[0-5]\d:[0-5]\d',performance):
                held.append({'reason':'unsupported_finish_value','original':row});continue
        for field in ('rank','rankGender'):
            if row[field] is not None and (not isinstance(row[field],int) or row[field]<1):raise ValueError('Invalid source placing')
        race_url='https://utmb.world/utmb-index/races/'+row['uri']
        if '/utmb-index/races/'+row['uri'] not in c['raw']:raise ValueError('Race link not present in source page')
        perfs.append({'year':date.year,'date':date.isoformat(),'sourceDate':row['date'],'ageGroup':'',
          'discipline':f'{distance:g} km','performance':performance,'wind':'','place':str(row['rank'] or ''),
          'venue':'','meeting':row['eventName']+' — '+row['raceName'],'country':row.get('country',''),
          'sourceUrls':[c['url'],race_url],'providerName':'UTMB Index','verificationStatus':'unverified',
          'labels':['Trail running',('DNF' if row['isDnf'] else 'Finished'),'Source-reported result'],
          'notes':f"UTMB runner {aid}; race edition {rid}; overall place {row['rank'] or 'not supplied'}; gender place {row['rankGender'] or 'not supplied'}; ascent {row.get('elevationGain')} m. Race time basis (chip/gun) not specified. Source observation; not independent identity or PB verification.",
          'archiveReference':{'provider':PROVIDER,'sourceAthleteId':aid,'sourceRaceYearId':rid,'original':row}})
    slug=re.sub('[^a-z0-9]+','-',prep.norm(name)).strip('-')[:90]+'-utmb-'+aid
    details={'aliases':[name],'athlete_verified':False,'identity_review_status':'provisional_source_profile',
      'sports':['Running'],'running_disciplines':['trail'],
      'utmb':{'utmb_runner_id':aid,'name':name,'source_url':c['url'],'ageGroup':raw['ageGroup'],'collection_status':'bounded_directory_capture'},
      'archiveCreation':{'batchId':BATCH,'candidateId':aid,'approvedBy':'Paul Browne','sourceRowsCompared':True,'profileIdentityVerified':False}}
    if raw.get('nationalityCode'):details['sourceNationalityObservation']={'value':raw['nationalityCode'],'provider':'UTMB Index','sourceUrl':c['url'],'capturedAt':c['capturedAt']}
    return {'externalId':aid,'slug':slug,'displayName':name,'givenName':'','familyName':'','gender':'M' if raw['gender']=='H' else 'F',
      'nation':raw.get('nationalityCode'),'sourceUrl':c['url'],'capturedAt':c['capturedAt'],'years':sorted({r['year'] for r in perfs}),
      'performances':perfs,'details':details,'heldRows':held}

def existing_merge(old,new):
    """Never overwrite previous source evidence, nor duplicate a same-day result."""
    merged=list(old);added=[];held=[]
    for row in new:
        rid=row['archiveReference']['sourceRaceYearId']
        prior=[p for p in merged if p.get('archiveReference',{}).get('sourceRaceYearId')==rid]
        if prior:
            if prior[0].get('archiveReference',{}).get('original')!=row['archiveReference']['original']:
                held.append({'reason':'source_result_changed','raceYearId':rid,'incoming':row})
            continue
        # Legacy histories lack edition IDs. Avoid overwriting/duplicating them.
        if any(p.get('date')==row['date'] for p in merged):
            held.append({'reason':'legacy_same_day_result_needs_comparison','raceYearId':rid,'incoming':row});continue
        merged.append(row);added.append(row)
    return merged,added,held

def apply(args):
    cfg,query=base.connection(args.connection,args.confirm_branch)
    if cfg['projectId']!=wmm.PROJECT:raise ValueError('Wrong project')
    if args.review==(cfg['branchId']==PROD):raise ValueError('Review/production branch mismatch')
    if not args.review and not args.publish:raise ValueError('Explicit publication flag required')
    captures=[];people=[]
    for path in sorted((args.work/'runners').glob('*.json.gz')):
        c=read(path);p=normalise(c,path.name.split('.')[0]);captures.append(c);people.append(p)
    if not people:raise ValueError('No captured runners')
    allowed=frozenset(k for p in people for k in prep.name_keys(p['displayName']))
    source_index=collections.defaultdict(set)
    for p in people:prep.add(source_index,p['externalId'],[p['displayName']])
    evidence={'requestedBy':'Paul Browne','instruction':'Import UTMB athletes, nationalities, race records, fixtures and central results archive; create profiles; preserve established public-profile preference.',
      'sourceUrl':'https://utmb.world/utmb-index/runner-search','providerPermissionClaimed':False,'completeDirectory':False}
    query([("INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,scope,evidence) VALUES($1,$2,'Paul Browne','owner_private_import','staff_only',$3::jsonb) ON CONFLICT(id) DO NOTHING",[APPROVAL,PROVIDER,json.dumps(evidence)]),
      ("INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory,status) VALUES($1::uuid,$2,$3,$4::jsonb,'processing') ON CONFLICT(id) DO UPDATE SET inventory=excluded.inventory,status='processing',updated_at=now()",[RUN,APPROVAL,PROVIDER,json.dumps([{'sourceKey':'runner-'+p['externalId'],'sourceUrl':p['sourceUrl']} for p in people])])])
    archived=query([('SELECT id,source_key,payload_hash FROM result_archive_source_captures WHERE provider=$1',[PROVIDER])],True)[0]
    archived_ids={(r['source_key'],r['payload_hash']):r['id'] for r in archived}
    for i in range(0,len(people),10):
        statements=[]
        pending=[]
        for c,p in zip(captures[i:i+10],people[i:i+10]):
            archive_rows=[{'name':p['displayName'],'gender':p['gender'],'nationality':p['nation'],'date':r['dateIso'],
              'distanceLabel':r['distance']+' km','status':'DNF' if r['isDnf'] else 'Finished' if r['time'] else 'Unknown',
              'sourceRow':p['externalId']+':'+str(r['raceYearId']),'tableKey':r['eventName']+' — '+r['raceName'],
              'original':{key:('' if value is None else str(value)) for key,value in r.items()},'raw':r} for r in c['data']['results']['results']]
            payload={'format':'utmb-public-runner-v1','publication':'staff_only','name':p['displayName'],'sourceAthleteId':p['externalId'],'nationality':p['nation'],
              'index':{'name':'UTMB runner history — '+p['displayName'],'date':'','location':'Multiple race editions; partial race fields'},
              'rows':archive_rows,'performances':p['performances'],'heldRows':p['heldRows']}
            encoded=json.dumps(payload,ensure_ascii=False,separators=(',',':'));digest=hashlib.sha256(encoded.encode()).hexdigest()
            saved=archived_ids.get(('runner-'+p['externalId'],digest))
            if saved is not None:
                p['sourceCaptureId']=saved
                continue
            pending.append(p)
            statements.append(("""INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
              VALUES($1::uuid,$2,$3,$4,$5,$6,$7,decode($8,'hex'),$9::jsonb,$10,'compared',$11::jsonb,$12::timestamptz)
              ON CONFLICT(provider,source_key,payload_hash) DO UPDATE SET last_seen_at=now() RETURNING id""",
              [RUN,APPROVAL,PROVIDER,'runner-'+p['externalId'],c['url'],digest,c['sha256'],gzip.compress(c['raw'].encode(),mtime=0).hex(),encoded,len(payload['rows']),
               json.dumps({'sourceRowsCompared':True,'identityVerified':False,'wholeRaceField':False,'rawPageRetained':True}),c['capturedAt']]))
        returned=query(statements) if statements else []
        for p,row in zip(pending,returned):p['sourceCaptureId']=row[0]['id']
    print(json.dumps({'phase':'archived','runnerPages':len(people),'sourceRows':sum(len(c['data']['results']['results']) for c in captures)}),flush=True)
    directory=wmm.LiveDirectory(query,allowed);counts=collections.Counter();held=[];examples=[]
    histories=query([("SELECT h.*,a.slug,a.display_name,a.gender,a.nation,a.profile_details,a.profile_visibility FROM athlete_source_histories h JOIN athletes a ON a.id=h.athlete_id WHERE lower(h.provider)=$1",[PROVIDER])],True)[0]
    byid=collections.defaultdict(list)
    for h in histories:byid[h['external_id']].append(h)
    for i in range(0,len(people),25):
        original=people[i:i+25]
        for attempt in range(4):
            directory.refresh();new=[];updates=[];batch_holds=[];batch_counts=collections.Counter()
            for p in original:
                known=byid.get(p['externalId'],[])
                if len(known)>1:batch_holds.append({'sourceAthleteId':p['externalId'],'reason':'multiple_existing_source_identity_links'});continue
                if known:
                    h=known[0]
                    if h['gender'] in ('M','F') and h['gender']!=p['gender']:
                        batch_holds.append({'sourceAthleteId':p['externalId'],'reason':'existing_source_identity_gender_conflict'});continue
                    if prep.norm(h['display_name'])!=prep.norm(p['displayName']) and not prep.matching(directory.index,[p['displayName']])=={'athrecs:'+str(h['athlete_id'])}:
                        batch_holds.append({'sourceAthleteId':p['externalId'],'reason':'existing_source_identity_name_conflict'});continue
                    merged,added,conflicts=existing_merge(h['performances'],p['performances'])
                    batch_holds.extend({'sourceAthleteId':p['externalId'],**conflict} for conflict in conflicts)
                    if added:updates.append((p,h,merged));batch_counts['existingProfilesExpanded']+=1;batch_counts['resultsAdded']+=len(added)
                    else:batch_counts['existingProfilesUnchanged']+=1
                    continue
                matches=prep.matching(directory.index,[p['displayName']]);source_matches=prep.matching(source_index,[p['displayName']],p['externalId'])
                if matches or source_matches:
                    batch_holds.append({'sourceAthleteId':p['externalId'],'name':p['displayName'],'reason':'possible_duplicate_identity',
                      'candidates':sorted(matches),'sourceCandidates':sorted(source_matches),'caseFor':'Name or alias variant matches an existing identity.','caseAgainst':'A name match does not establish identity; no merge or extra profile made.'});continue
                if len(prep.norm(p['displayName']).split())<2 or not p['performances']:
                    batch_holds.append({'sourceAthleteId':p['externalId'],'reason':'incomplete_name_or_no_supported_results'});continue
                new.append(p)
            data=json.dumps(new,ensure_ascii=False,separators=(',',':'))
            insert=wmm.INSERT.replace('Owner requested WMM athlete profiles and source results with duplicate checks; retained source year only; unclaimed provisional identity; existing profiles unchanged.',
             'Owner requested UTMB athlete profiles and source histories; exact source dates and distances retained; identity provisional; canonical performances unchanged.')
            statements=[("SET LOCAL lock_timeout='5s'",[]),("SET LOCAL statement_timeout='55s'",[]),
              ('LOCK TABLE athletes,"user",athlete_private_profiles,athlete_account_links,athlete_source_histories,results,editions,events IN SHARE ROW EXCLUSIVE MODE',[]),
              ("CREATE TEMP TABLE utmb_guard(kind text,ok boolean,CONSTRAINT utmb_directory_guard CHECK(kind<>'directory' OR ok IS TRUE),CONSTRAINT utmb_approval_guard CHECK(kind<>'approval' OR ok IS TRUE),CONSTRAINT utmb_history_guard CHECK(kind<>'history' OR ok IS TRUE)) ON COMMIT DROP",[]),
              ("INSERT INTO utmb_guard SELECT 'directory',fingerprint=$2 FROM ("+wmm.FP+') f',[0,directory.fingerprint]),
              ("INSERT INTO utmb_guard SELECT 'approval',EXISTS(SELECT 1 FROM result_archive_capture_approvals WHERE id=$1 AND revoked_at IS NULL)",[APPROVAL]),
              (insert,[data,PROVIDER,BATCH,0])]
            for p,h,merged in updates:
                statements.extend([
                  ("INSERT INTO utmb_guard SELECT 'history',count(*)=1 AND bool_and(performances=$4::jsonb) FROM athlete_source_histories WHERE athlete_id=$1 AND provider=$2 AND external_id=$3",[h['athlete_id'],h['provider'],p['externalId'],json.dumps(h['performances'])]),
                  ("INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,before_value,after_value,note) VALUES('paul@athrecs.com','athlete.utmb_history_extended','athlete_source_history',$1,$2::jsonb,$3::jsonb,'Missing UTMB source observations appended by stable provider athlete ID; existing publication and evidence retained.')",
                   [PROVIDER+':'+p['externalId'],json.dumps({'performances':h['performances'],'publishedAt':h['published_at']}),json.dumps({'performances':merged,'sourceCaptureId':p['sourceCaptureId']})]),
                  ('UPDATE athlete_source_histories SET performances=$4::jsonb,captured_at=$5::timestamptz,complete=false,years_captured=ARRAY(SELECT DISTINCT (r->>\'year\')::int FROM jsonb_array_elements($4::jsonb) r ORDER BY 1) WHERE athlete_id=$1 AND provider=$2 AND external_id=$3',[h['athlete_id'],h['provider'],p['externalId'],json.dumps(merged),p['capturedAt']])])
            try:returned=query(statements)
            except RuntimeError as exc:
                print(json.dumps({'phase':'retry','attempt':attempt+1,'reason':str(exc)}),flush=True)
                if attempt<3 and any(v in str(exc) for v in ('utmb_directory_guard','lock timeout','40P01','40001')):time.sleep(attempt+1);continue
                raise
            inserted=returned[6][0];counts.update(batch_counts);counts['profilesCreated']+=inserted['profiles'];counts['resultsAdded']+=sum(len(p['performances']) for p in new);held.extend(batch_holds);examples.extend(inserted['created'])
            for p,h,merged in updates:h['performances']=merged
            print(json.dumps({'phase':'applied','processed':min(i+25,len(people)),**counts}),flush=True);break
    summary={'sourceAthletes':len(people),'sourceRowsArchived':sum(len(c['data']['results']['results']) for c in captures),**counts,
      'heldDecisions':len(held),'completeDirectory':False,'canonicalResultsChanged':False,'resultsIndependentlyVerified':False}
    query([("UPDATE result_archive_capture_runs SET status='completed',summary=$2::jsonb,updated_at=now() WHERE id=$1::uuid",[RUN,json.dumps({'scope':'bounded runner captures','counts':summary,'held':held})])])
    receipt={'branchId':cfg['branchId'],'summary':summary,'examples':examples,'held':held};args.receipt.write_text(json.dumps(receipt,ensure_ascii=False,indent=2));print(json.dumps(summary),flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser()
    for key in ('work','connection','receipt'):p.add_argument('--'+key,type=pathlib.Path,required=True)
    p.add_argument('--confirm-branch',required=True);p.add_argument('--review',action='store_true');p.add_argument('--publish',action='store_true');apply(p.parse_args())
