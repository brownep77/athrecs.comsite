"""Review the club-only TLM hold queue using private, corroborating source fields.

Same-name records are never attached to an existing person. Matching source
city/state and compatible reported ages can support a provisional new grouping;
these fields remain private and never establish a birth date or nationality.
"""
import argparse, calendar, collections, csv, datetime as dt, hashlib, importlib.util, io, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('tlm_followup', ROOT/'publish-tlm-source-profiles.py')
t = importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
ORIGINAL_BATCH = t.BATCH
BATCH = 'tlm-public-continuation0635-followup-20261013'
CLUB_HOLD = 'repeated_name_without_consistent_club'

def location(value):
    # Do not fuzzy-match locations, infer a country, or repair source spelling.
    return ' '.join(str(value or '').strip().upper().split())

def years_before(date, years):
    year = date.year-years
    return date.replace(year=year, day=min(date.day, calendar.monthrange(year,date.month)[1]))

def corroboration_flags(rows):
    flags = [f for f in t.group_flags(rows) if f != CLUB_HOLD]
    if len(rows)<2: flags.append('requires_multiple_source_observations')
    names = {tuple(t.prep.norm(dict(zip(r['originalHeaders'],r['originalCells'])).get(k,'')) for k in ('First','Last')) for r in rows}
    if len(names)!=1: flags.append('source_name_components_differ')
    cities = {location(r.get('residenceCityOriginal')) for r in rows}
    regions = {location(r.get('residenceRegionOriginal')) for r in rows}
    if len(cities)!=1 or len(next(iter(cities),''))<3 or next(iter(cities),'') in {'UNKNOWN','NONE','N/A','NA'}:
        flags.append('source_city_missing_or_conflicting')
    if len(regions)!=1 or not re.fullmatch('[A-Z]{2}',next(iter(regions),'')):
        flags.append('source_region_missing_or_conflicting')
    clubs = {t.prep.norm(r.get('teamOriginal')) for r in rows}
    clubs -= t.prep.finder.EMPTY_CLUBS | {''}
    if len(clubs)>1: flags.append('source_clubs_conflict')
    # Transient compatibility intervals only; never persisted as inferred DOB.
    bounds=[]
    for r in rows:
        if isinstance(r.get('ageAtRace'),int) and 18<=r['ageAtRace']<=100:
            day=dt.date.fromisoformat(r['date']);age=r['ageAtRace']
            bounds.append((years_before(day,age+1)+dt.timedelta(days=1),years_before(day,age)))
    if bounds and max(lo for lo,hi in bounds)>min(hi for lo,hi in bounds):
        flags.append('exact_reported_age_intervals_conflict')
    return sorted(set(flags))

def recover_and_compare(folder,query):
    captures=json.loads((folder/'captures.private.json').read_text())
    live=query([('SELECT id,source_key,payload_hash,html_sha256,row_count,source_check FROM result_archive_source_captures WHERE approval_id=$1',[t.APPROVAL])],True)[0]
    byid={int(c['id']):c for c in live};rows={};evidence={};pages={};csvfiles={}
    for cap in captures:
        original=byid.get(int(cap['id']))
        if not original or any(original[k]!=cap[k] for k in ('source_key','payload_hash','html_sha256','row_count','source_check')):
            raise ValueError('Capture no longer matches original production evidence')
        if cap['row_count'] and cap['source_check']!='compared': raise ValueError('Uncompared source capture')
        payload=cap['payload']
        if 'index' in payload: pages[str(payload['index']['eid'])]={'index':payload['index']}
        for r in payload['rows']:
            key=r['sourceKey']
            if key in rows: raise ValueError('Duplicate source key')
            if cap['html_sha256']!=r['sourceSha256']: raise ValueError('Row provenance differs from original CSV')
            sha=r['sourceSha256']
            if sha not in csvfiles:
                raw=(folder/'raw'/(sha+'.csv')).read_bytes()
                if hashlib.sha256(raw).hexdigest()!=sha: raise ValueError('Original CSV checksum mismatch')
                csvfiles[sha]=list(csv.reader(io.StringIO(raw.decode('utf-8-sig'))))
            if csvfiles[sha][r['rowLocator']['csvLine']-1]!=r['originalCells']: raise ValueError('Original cells differ')
            f=dict(zip(r['originalHeaders'],r['originalCells']))
            if ' '.join((f['First'].strip()+' '+f['Last'].strip()).split())!=' '.join(r['name'].split()):
                raise ValueError('Source name differs')
            if abs(t.mark_seconds(r['finishTime'])-r['fractionalFinishSeconds'])>1e-6: raise ValueError('Finish precision differs')
            for mark,seconds in [('chipTime','chipSeconds'),('gunTime','gunSeconds')]:
                if r[mark] is not None and abs(t.mark_seconds(r[mark])-r[seconds])>1e-6: raise ValueError('Timing precision differs')
            rows[key]=r;evidence[key]=original
    if len(rows)!=41691: raise ValueError('Unexpected source batch size')
    return rows,evidence,pages

def prepare(args):
    cfg,query=t.base.connection(args.connection,args.confirm_branch,timeout=180)
    if cfg['projectId']!=t.PROJECT or cfg['branchId']!=t.PROD: raise ValueError('Screen the current production directory')
    rows,evidence,pages=recover_and_compare(args.output,query)
    previous=json.loads((args.output/'previous-review.private.json').read_text())
    live=query([("SELECT after_value FROM network_audit_log WHERE id=$1 AND action='source_batch.publication_review' AND entity_id=$2",[previous['id'],ORIGINAL_BATCH])],True)[0]
    if len(live)!=1 or live[0]['after_value']!=previous['after_value']: raise ValueError('Original private review differs')
    histories=query([("SELECT a.id,a.slug,a.display_name,a.profile_visibility,h.performances FROM athletes a JOIN athlete_source_histories h ON h.athlete_id=a.id WHERE a.profile_details#>>'{archiveCreation,batchId}'=$1 AND h.provider=$2",[ORIGINAL_BATCH,t.PROVIDER])],True)[0]
    published=set()
    for history in histories:
        source=[rows[r['archiveReference']['sourceRow']] for r in history['performances']]
        expected=t.profile(source,evidence,pages)
        if history['performances']!=expected['performances'] or history['display_name']!=expected['displayName']:
            raise ValueError('Previously published profile differs from original source fields')
        for r in source:
            if r['sourceKey'] in published: raise ValueError('Previously published source key appears more than once')
            published.add(r['sourceKey'])
    if len(histories)!=16424 or len(published)!=16427: raise ValueError('Prior batch scope changed; review required')
    proposed=[];held=[]
    original_held=previous['after_value']['held']
    for h in original_held:
        if h['reasons']!=[CLUB_HOLD]: continue
        source=[rows[k] for k in h['sourceKeys']]
        if any(r['sourceKey'] in published for r in source): raise ValueError('Held source row already public')
        flags=corroboration_flags(source)
        if flags: held.append({'sourceKeys':h['sourceKeys'],'reasons':flags});continue
        p=t.profile(source,evidence,pages)
        creation=p['details']['archiveCreation'];creation.update({'batchId':BATCH,'approvedAt':dt.datetime.now(dt.timezone.utc).isoformat(),
          'instruction':'Check the published batch and continue with evidence-backed results next to athletes.',
          'basis':'Same source name components, gender and city/state, compatible reported ages on distinct dates; no conflicting recorded clubs; current directory screening',
          'previousReviewAuditId':previous['id'],'previousHoldReasons':h['reasons']})
        proposed.append(p)
    allowed=frozenset(k for p in proposed for n in p['details']['aliases'] for k in t.prep.name_keys(n))
    print(json.dumps({'phase':'directory_screen','candidateProfiles':len(proposed),'candidateResults':sum(len(p['performances']) for p in proposed)}),flush=True)
    directory=t.wmm.LiveDirectory(query,allowed);eligible=[]
    for p in proposed:
        candidates=t.publication_candidates(directory,p)
        if candidates: held.append({'sourceKeys':[r['sourceKeys'][0] for r in p['performances']],'reasons':['current_directory_or_result_conflict'],'candidates':sorted(candidates)})
        else: eligible.append(p)
    summary={'batchId':BATCH,'sourceRows':len(rows),'eligibleProfiles':len(eligible),'eligibleResultRecords':sum(len(p['performances']) for p in eligible),
      'reviewedHeldGroups':sum(h['reasons']==[CLUB_HOLD] for h in original_held),'reviewedHeldRows':sum(len(h['sourceKeys']) for h in original_held if h['reasons']==[CLUB_HOLD]),
      'remainingReviewedGroups':len(held),'remainingReviewedRows':sum(len(h['sourceKeys']) for h in held),'priorProfilesCompared':len(histories),'priorResultsCompared':len(published),
      'snapshotAt':dt.datetime.now(dt.timezone.utc).isoformat(),'directoryMaxId':directory.maxid,'directoryFingerprint':directory.fingerprint}
    plan={'summary':summary,'profiles':eligible,'held':held,'sourceReceipts':list({int(r['id']):r for r in evidence.values()}.values())}
    plan['planHash']=t.digest(plan);t.dump(args.output/'plan.private.json',plan);t.dump(args.output/'summary.json',summary)
    print(json.dumps(summary),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','rehearse','publish'])
    parser.add_argument('--connection',type=pathlib.Path,required=True);parser.add_argument('--confirm-branch',required=True)
    parser.add_argument('--output',type=pathlib.Path,required=True);parser.add_argument('--limit',type=int);parser.add_argument('--chunk',type=int,default=500)
    args=parser.parse_args()
    if args.action=='prepare': prepare(args)
    else:
        t.BATCH=BATCH
        t.apply(args)
