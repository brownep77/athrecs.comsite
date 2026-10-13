"""Supervised TLM source-profile publication, using existing privacy and history paths.

The caller supplies private captures, connection files and an output directory.
Names suggest duplicates; they never authorize an existing-identity merge.
Owner publication authority is recorded without claiming a provider licence.
"""
import argparse, collections, csv, datetime as dt, hashlib, importlib.util, io, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / file)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module); return module
wmm = load('tlm_wmm', 'apply-wmm-profiles.py')
base, prep = wmm.base, wmm.prep
BATCH = 'tlm-public-continuation0635-20261013'
IMPORT = '20261013-continuation0635'
PROVIDER = 'The Last Mile Racing'
APPROVAL = 'owner-register-inventory-' + IMPORT + '-b8ed86141fe709b3f320'
PROJECT, PROD = wmm.PROJECT, wmm.PROD
# This batch has exact 2015-2016 dates. Check those canonical performances too.
wmm.RES = wmm.RES.replace("'2025-01-01' AND '2026-12-31'", "'2015-01-01' AND '2016-12-31'")
wmm.FP = "WITH directory AS ("+wmm.ATH+"), accounts AS ("+wmm.ACCOUNTS+"), performances AS ("+wmm.RES+") SELECT md5((SELECT coalesce(string_agg(md5(to_jsonb(d)::text),'' order by id),'') FROM directory d)||(SELECT coalesce(string_agg(md5(to_jsonb(u)::text),'' order by athlete_number),'') FROM accounts u)||(SELECT coalesce(string_agg(md5(to_jsonb(r)::text),'' order by id),'') FROM performances r)) fingerprint"

def dump(path, value):
    temp=path.with_suffix('.writing'); temp.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))); temp.replace(path)
def digest(value): return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def mark_seconds(value):
    if not isinstance(value,str) or not re.fullmatch(r'\d+(?::[0-5]\d){0,2}(?:\.\d+)?',value): raise ValueError('Invalid timed mark')
    result=0.0
    for part in value.split(':'): result=result*60+float(part)
    return result

class CheckedDirectory(wmm.LiveDirectory):
    def refresh(self):
        current=self.query([(wmm.FP,[0])],True)[0][0]['fingerprint']
        if current==self.fingerprint: return
        super().refresh()

def group_flags(rows):
    flags=[]
    for r in rows:
        fields=dict(zip(r['originalHeaders'],r['originalCells']))
        if not str(fields.get('First','')).strip() or not str(fields.get('Last','')).strip(): flags.append('missing_source_name_components')
        if len(prep.norm(fields.get('First','')))<2 or len(prep.norm(fields.get('Last','')))<2: flags.append('initial_or_incomplete_name')
        if re.search(r'\b(unknown|anonymous|unnamed|no name|test|runner|participant)\b',r['name'],re.I): flags.append('placeholder_name')
        if not isinstance(r.get('ageAtRace'),int) or not 18<=r['ageAtRace']<=100: flags.append('age_unknown_or_junior_at_source')
        if re.search(r'surviv|cancer|disab|wheelchair|para\b',r.get('category',''),re.I): flags.append('sensitive_source_category_review')
        if r['status']!='FIN': flags.append('non_finish_review')
        if r['gender'] not in ('M','F'): flags.append('unspecified_source_gender')
    if len(rows)>1:
        clubs={prep.norm(r.get('teamOriginal')) for r in rows}
        if len(clubs)!=1 or not next(iter(clubs)) or next(iter(clubs)) in prep.finder.EMPTY_CLUBS: flags.append('repeated_name_without_consistent_club')
        if len({r['gender'] for r in rows})!=1: flags.append('conflicting_source_gender')
        if len({r['date'] for r in rows})!=len(rows): flags.append('multiple_performances_same_date')
        # Transient consistency bounds only; no birthday is stored or displayed.
        bounds=[(dt.date.fromisoformat(r['date']).toordinal()-(r['ageAtRace']+1)*366,dt.date.fromisoformat(r['date']).toordinal()-r['ageAtRace']*365) for r in rows if isinstance(r.get('ageAtRace'),int)]
        if bounds and max(lo for lo,hi in bounds)>min(hi for lo,hi in bounds): flags.append('inconsistent_reported_ages')
    return sorted(set(flags))

def source_rows(folder, query):
    pages=json.loads((folder/'tlm-reviewed.private.json').read_text())['pages']
    rows=[r for page in pages for r in page['rows']]
    if len(rows)!=41691 or len({r['sourceKey'] for r in rows})!=41691: raise ValueError('Unexpected source scope or duplicate key')
    inputs=json.loads((folder/'capture-inputs.private.json').read_text())
    live=query([("SELECT id,source_key,payload_hash,html_sha256,row_count,source_check FROM result_archive_source_captures WHERE approval_id=$1",[APPROVAL])],True)[0]
    live_by={x['source_key']:x for x in live}; evidence={}; flattened={}
    for capture in inputs:
        receipt=live_by.get(capture['key'])
        if not receipt or receipt['payload_hash']!=capture['hash'] or receipt['html_sha256']!=capture['raw_hash'] or int(receipt['row_count'])!=capture['row_count']: raise ValueError('Source capture differs from production')
        if capture['row_count'] and receipt['source_check']!='compared': raise ValueError('Source capture not compared')
        for r in capture['payload']['rows']:
            if r['sourceKey'] in flattened: raise ValueError('Duplicate source observation')
            flattened[r['sourceKey']]=r; evidence[r['sourceKey']]=receipt
    pages_by={str(p['index']['eid']):p for p in pages}
    checked_files={}
    for r in rows:
        if r!=flattened.get(r['sourceKey']): raise ValueError('Normalized source row differs from retained capture')
        page=pages_by[str(r['rowLocator']['eventId'])]; raw=folder/page['csvCapture']['raw_file']
        if raw not in checked_files:
            if hashlib.sha256(raw.read_bytes()).hexdigest()!=page['csvCapture']['sha256']: raise ValueError('Original CSV checksum mismatch')
            checked_files[raw]=list(csv.reader(io.StringIO(raw.read_bytes().decode('utf-8-sig'))))
        if checked_files[raw][r['rowLocator']['csvLine']-1]!=r['originalCells']: raise ValueError('Original source cells differ')
        fields=dict(zip(r['originalHeaders'],r['originalCells']))
        if ' '.join((fields['First'].strip()+' '+fields['Last'].strip()).split())!=' '.join(r['name'].split()): raise ValueError('Source name differs')
        if abs(mark_seconds(r['finishTime'])-r['fractionalFinishSeconds'])>1e-6: raise ValueError('Finish precision mismatch')
        for mark,seconds in [('chipTime','chipSeconds'),('gunTime','gunSeconds')]:
            if r[mark] is not None and abs(mark_seconds(r[mark])-r[seconds])>1e-6: raise ValueError('Timing precision mismatch')
    return rows,evidence,pages_by

def profile(rows,evidence,pages):
    rows=sorted(rows,key=lambda r:(r['date'],r['sourceKey']),reverse=True); first=rows[0]
    ident='source-'+digest(sorted(r['sourceKey'] for r in rows))[:24]
    slug=re.sub(r'[^a-z0-9]+','-',prep.norm(first['name'])).strip('-')[:90]+'-tlm-'+ident[7:]
    names=sorted({r['name'] for r in rows}); fields=dict(zip(first['originalHeaders'],first['originalCells']))
    performances=[]
    for r in rows:
        receipt=evidence[r['sourceKey']]; index=pages[str(r['rowLocator']['eventId'])]['index']
        timing={'basis':'unknown' if r['timeBasis']=='unspecified' else r['timeBasis']}
        if r['chipTime']: timing['chip']=r['chipTime']
        if r['gunTime']: timing['gun']=r['gunTime']
        performances.append({'year':int(r['date'][:4]),'date':r['date'],'sourceDate':r['date'],'ageGroup':r['category'] or '',
          'discipline':r['distanceCode'],'performance':r['finishTime'],'timing':timing,'wind':'','place':str(r['overallPosition'] or ''),
          'places':{'overall':r['overallPosition'],'gender':r['genderPosition'],'category':r['categoryPosition']},
          'venue':index.get('city') or '', 'meeting':r['eventName'],'sourceUrls':[r['sourceUrl']],'sourceKeys':[r['sourceKey']],
          'labels':['Identity unconfirmed'],'providerName':PROVIDER,'verificationStatus':'unverified','notes':'',
          'archiveReference':{'captureId':int(receipt['id']),'sourceKey':receipt['source_key'],'sourceRow':r['sourceKey'],
            'bib':r['bib'],'sourceSha256':r['sourceSha256'],'sourcePayloadHash':receipt['payload_hash'],'identityVerified':False}})
    details={'aliases':names,'athlete_verified':False,'identity_review_status':'provisional_source_profile','currentClubAssociationConfirmed':False,
      'archiveCreation':{'batchId':BATCH,'sourceImportBatch':IMPORT,'candidateId':ident,'approvedBy':'Paul Browne',
        'approvedAt':'2026-10-13T09:45:12Z','instruction':'Show these publicly recorded results alongside the athlete; do not require a blanket provider agreement.',
        'basis':'Single source participant observation' if len(rows)==1 else 'Repeated source name, consistent source club, gender and reported ages across distinct dates',
        'profileIdentityVerified':False,'sourceRowsCompared':True,'resultCount':len(rows),'providerLicenceClaimed':False}}
    return {'externalId':ident,'slug':slug,'displayName':first['name'],'givenName':fields['First'].strip(),'familyName':fields['Last'].strip(),
      'gender':first['gender'],'nation':'','sourceUrl':first['sourceUrl'],'capturedAt':max(r['sourceCheckedAt'] for r in rows),
      'years':sorted({int(r['date'][:4]) for r in rows}),'performances':performances,'details':details}

def prepare(args):
    args.output.mkdir(parents=True,exist_ok=True)
    cfg,query=base.connection(args.connection,args.confirm_branch)
    if cfg['projectId']!=PROJECT: raise ValueError('Wrong project')
    rows,evidence,pages=source_rows(args.source,query)
    groups=collections.defaultdict(list)
    for r in rows: groups[prep.norm(r['name'])].append(r)
    source_index=collections.defaultdict(set)
    for name,rs in groups.items(): prep.add(source_index,name,{r['name'] for r in rs})
    allowed=frozenset(source_index)
    print(json.dumps({'phase':'directory_screen','sourceRows':len(rows),'nameGroups':len(groups)}),flush=True)
    directory=wmm.LiveDirectory(query,allowed)
    eligible=[]; held=[]
    for name,rs in groups.items():
        flags=group_flags(rs); candidates=prep.matching(directory.index,{r['name'] for r in rs})
        variants=prep.matching(source_index,{r['name'] for r in rs},name)
        if candidates: flags.append('possible_existing_athlete_or_account')
        if variants: flags.append('possible_source_name_variant')
        if flags: held.append({'name':rs[0]['name'],'sourceKeys':[r['sourceKey'] for r in rs],'reasons':sorted(set(flags)),'candidates':sorted(candidates),'sourceVariants':sorted(variants)})
        else: eligible.append(profile(rs,evidence,pages))
    summary={'batchId':BATCH,'sourceRows':len(rows),'sourceNameGroups':len(groups),'eligibleProfiles':len(eligible),
      'eligibleResultRecords':sum(len(p['performances']) for p in eligible),'heldNameGroups':len(held),
      'heldResultRecords':sum(len(h['sourceKeys']) for h in held),'holdReasons':dict(collections.Counter(reason for h in held for reason in h['reasons'])),
      'snapshotAt':dt.datetime.now(dt.timezone.utc).isoformat(),'directoryMaxId':directory.maxid,'directoryFingerprint':directory.fingerprint}
    plan={'summary':summary,'profiles':eligible,'held':held,'sourceReceipts':list({int(r['id']):r for r in evidence.values()}.values())}
    plan['planHash']=digest(plan);dump(args.output/'plan.private.json',plan);dump(args.output/'summary.json',summary)
    print(json.dumps(summary),flush=True)

INSERT=wmm.INSERT.replace('Owner requested WMM athlete profiles and source results with duplicate checks; retained source year only; unclaimed provisional identity; existing profiles unchanged.',
 'Owner requested public TLM race results alongside athletes. Exact source fields retained; identity unconfirmed; existing profiles, accounts and privacy unchanged; provider licence not claimed.')
VERIFY=wmm.VERIFY

def apply(args):
    cfg,query=base.connection(args.connection,args.confirm_branch,timeout=180)
    if cfg['projectId']!=PROJECT or (args.action=='publish')!=(cfg['branchId']==PROD): raise ValueError('Wrong publication target')
    plan=json.loads((args.output/'plan.private.json').read_text());expected=plan.pop('planHash')
    if digest(plan)!=expected or plan['summary']['batchId']!=BATCH: raise ValueError('Plan hash mismatch')
    validation=json.loads((args.output/'independent-plan-validation.json').read_text())
    if validation['planHash']!=expected or validation['sourceRowsComparedToOriginalCSV']!=41691: raise ValueError('Source comparison manifest does not match')
    if args.action=='publish':
        rehearsal=json.loads((args.output/'rehearse-receipts.private.json').read_text())
        if rehearsal['planHash']!=expected or rehearsal['branchId']==PROD or not rehearsal['receipts']: raise ValueError('Matching isolated rehearsal is required')
    profiles=plan['profiles'][:args.limit] if args.limit else plan['profiles']
    allowed=frozenset(k for p in profiles for n in p['details']['aliases'] for k in prep.name_keys(n))
    # All eligible keys had zero directory matches in the immutable preparation
    # snapshot. Reuse that negative result only while its full fingerprint holds;
    # refresh reloads the entire directory if existing inputs changed.
    directory=CheckedDirectory.__new__(CheckedDirectory)
    directory.query=query;directory.allowed_keys=allowed
    directory.index=collections.defaultdict(set);directory.entities={};directory.result_index=collections.defaultdict(set)
    directory.maxid=plan['summary']['directoryMaxId'];directory.fingerprint=plan['summary']['directoryFingerprint']
    known={r['external_id'] for r in query([('SELECT external_id FROM athlete_source_histories WHERE provider=$1',[PROVIDER])],True)[0]}
    receipts=[];held=[]
    for start in range(0,len(profiles),args.chunk):
        original=[p for p in profiles[start:start+args.chunk] if p['externalId'] not in known]
        if not original: continue
        directory.refresh();batch=[]
        for p in original:
            candidates=prep.matching(directory.index,p['details']['aliases'])
            if candidates: held.append({'externalId':p['externalId'],'sourceKeys':[r['sourceKeys'][0] for r in p['performances']],'reasons':['live_directory_conflict'],'candidates':sorted(candidates)});continue
            batch.append(p)
        if not batch: continue
        data=json.dumps(batch,ensure_ascii=False,separators=(',',':'))
        capture_ids={r['archiveReference']['captureId'] for p in batch for r in p['performances']}
        evidence=[r for r in plan['sourceReceipts'] if int(r['id']) in capture_ids]
        queries=[("SET LOCAL lock_timeout='5s'",[]),("SET LOCAL statement_timeout='55s'",[]),
          ('LOCK TABLE athletes,"user",athlete_private_profiles,athlete_account_links,results,editions,events IN SHARE ROW EXCLUSIVE MODE',[]),
          ('CREATE TEMP TABLE tlm_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),
          ('INSERT INTO tlm_guard SELECT fingerprint=$2 FROM ('+wmm.FP+') f',[0,directory.fingerprint]),
          ("INSERT INTO tlm_guard SELECT count(*)=jsonb_array_length($1::jsonb) FROM jsonb_array_elements($1::jsonb) e JOIN result_archive_source_captures c ON c.id=(e->>'id')::bigint JOIN result_archive_capture_approvals a ON a.id=c.approval_id WHERE c.payload_hash=e->>'payload_hash' AND c.html_sha256=e->>'html_sha256' AND c.row_count=(e->>'row_count')::int AND c.source_check='compared' AND a.id=$2 AND a.revoked_at IS NULL",[json.dumps(evidence),APPROVAL]),
          (INSERT,[data,PROVIDER,BATCH,None]),
          ('INSERT INTO tlm_guard SELECT count=jsonb_array_length($1::jsonb) FROM ('+VERIFY+') v',[data,PROVIDER,BATCH]),
          (VERIFY,[data,PROVIDER,BATCH]),
          (wmm.FP,[0]),
          ('SELECT max(id) maxid FROM athletes',[])]
        result=query(queries);receipt=result[-5][0]
        if receipt['profiles']!=len(batch) or receipt['histories']!=len(batch) or receipt['audits']!=len(batch): raise ValueError('Publication receipt mismatch')
        receipts.append(receipt);known.update(p['externalId'] for p in batch)
        dump(args.output/(args.action+'-receipts.private.json'),{'branchId':cfg['branchId'],'planHash':expected,'receipts':receipts,'liveHolds':held})
        # The guarded transaction returns its final directory state while the
        # directory lock is held. Only our exact inserts changed the index.
        by_slug={p['slug']:p for p in batch}
        for created in receipt['created']:
            p=by_slug[created['slug']]
            wmm.register(directory.index,directory.entities,{'id':created['id'],'slug':p['slug'],
              'display_name':p['displayName'],'given_name':p['givenName'],'family_name':p['familyName'],
              'race_entry_name':'','gender':p['gender'],'name_details':{'aliases':p['details']['aliases']}},allowed)
        directory.fingerprint=result[-2][0]['fingerprint'];directory.maxid=int(result[-1][0]['maxid'])
        print(json.dumps({'phase':args.action,'processed':min(start+args.chunk,len(profiles)),'profilesPublishedThisRun':sum(r['profiles'] for r in receipts),'liveHeld':len(held)}),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','rehearse','publish'])
    parser.add_argument('--connection',type=pathlib.Path,required=True);parser.add_argument('--confirm-branch',required=True)
    parser.add_argument('--source',type=pathlib.Path);parser.add_argument('--output',type=pathlib.Path,required=True)
    parser.add_argument('--limit',type=int);parser.add_argument('--chunk',type=int,default=1000)
    args=parser.parse_args()
    if args.action=='prepare': prepare(args)
    else: apply(args)
