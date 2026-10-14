"""Review held TLM name collisions without combining different source runners.

Release only entire reviewed components. Separate observations need independent
source distinctions; repeated observations within each profile still need the
earlier corroboration checks. No existing identity is attached or overwritten.
"""
import argparse, collections, datetime as dt, importlib.util, itertools, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('tlm_alias_prior', ROOT/'continue-tlm-alias-profiles.py')
aliases = importlib.util.module_from_spec(spec); spec.loader.exec_module(aliases)
prior, t = aliases.prior, aliases.t
BATCH = 'tlm-public-continuation0635-distinct-20261014'
SPLIT_HOLDS = {'inconsistent_reported_ages', 'multiple_performances_same_date', prior.CLUB_HOLD}

def profile_flags(rows):
    flags = prior.corroboration_flags(rows) if len(rows)>1 else t.group_flags(rows)
    if any(r.get(k) is not None and r[k]<=0 for r in rows for k in ('overallPosition','genderPosition','categoryPosition')):
        flags = list(flags)+['invalid_source_placing']
    return sorted(set(flags))

def valid_location(row):
    city = prior.location(row.get('residenceCityOriginal'))
    region = prior.location(row.get('residenceRegionOriginal'))
    return (len(city)>=3 and any(c.isalpha() for c in city)
        and city not in {'UNKNOWN','NONE','N/A','NA','*NO TOWN GIVEN*'}
        and bool(re.fullmatch('[A-Z]{2}',region)) and region not in {'XX','NA'})

def age_bounds(row):
    # Compatibility intervals are transient; no birth date is stored or returned.
    day = dt.date.fromisoformat(row['date']); age = row['ageAtRace']
    return prior.years_before(day,age+1)+dt.timedelta(days=1), prior.years_before(day,age)

def separated_pair(left,right,allow_location=True):
    if not left or not right or profile_flags(left) or profile_flags(right): return None
    for a,b in itertools.product(left,right):
        x,y = a['rowLocator'],b['rowLocator']
        same_programme = (a['date']==b['date'] and x['eventId']==y['eventId']
            and x['programmeLabel']==y['programmeLabel'] and a['sourceSha256']==b['sourceSha256'])
        separate_entries = (a['sourceKey']!=b['sourceKey'] and x['csvLine']!=y['csvLine']
            and a['bib'] and b['bib'] and a['bib']!=b['bib']
            and a.get('overallPosition') and b.get('overallPosition')
            and a['overallPosition']!=b['overallPosition'])
        if same_programme and separate_entries and (abs(a['ageAtRace']-b['ageAtRace'])>=5 or a['gender']!=b['gender']):
            return {'method':'separate_same_programme_entries','witnessSourceKeys':[a['sourceKey'],b['sourceKey']]}
    if not allow_location or not all(valid_location(r) for r in left+right): return None
    for a,b in itertools.product(left,right):
        al,ah = age_bounds(a); bl,bh = age_bounds(b)
        if max((al-bh).days,(bl-ah).days)<5*366: return None
        if (prior.location(a['residenceCityOriginal']),prior.location(a['residenceRegionOriginal'])) == (
            prior.location(b['residenceCityOriginal']),prior.location(b['residenceRegionOriginal'])): return None
    return {'method':'distinct_recorded_ages_and_locations',
        'witnessSourceKeys':sorted(r['sourceKey'] for r in left+right)}

def review_components(rows,held,decisions):
    groups = {t.prep.norm(rows[h['sourceKeys'][0]]['name']):h for h in held}
    approvals = {tuple(sorted(d['sourceKeys'])) for d in decisions if d['decision']=='supported_separate_provisional_profiles'}
    proposals=[]; reviewed=[]
    for component in aliases.components(groups):
        keys = [k for n in sorted(component) if n in groups for k in groups[n]['sourceKeys']]
        flags=[]; partitions=[]; witnesses=[]
        if not component.issubset(groups): flags.append('component_not_fully_held')
        elif any(set(groups[n]['reasons'])-aliases.ALLOWED_HOLDS for n in component): flags.append('other_identity_or_source_holds')
        else:
            partitions = [[rows[k] for k in groups[n]['sourceKeys']] for n in sorted(component)]
            if any(profile_flags(rs) for rs in partitions): flags.append('within_profile_corroboration_failed')
            else:
                witnesses = [separated_pair(a,b) for a,b in itertools.combinations(partitions,2)]
                if len(partitions)<2 or not all(witnesses): flags.append('component_not_fully_distinguished')
        if not flags and tuple(sorted(keys)) not in approvals: flags.append('explicit_source_review_required')
        reviewed.append({'sourceKeys':keys,'sourceNameGroups':len(component),'reasons':flags,'separationEvidence':witnesses})
        if not flags: proposals.append((partitions,keys,witnesses,len(component)))
    for name,h in sorted(groups.items()):
        if len(h['sourceKeys'])!=2 or not set(h['reasons']).issubset(SPLIT_HOLDS) or 'multiple_performances_same_date' not in h['reasons']: continue
        partitions = [[rows[k]] for k in h['sourceKeys']]
        witness = separated_pair(*partitions,allow_location=False)
        flags=[] if witness else ['same_name_entries_not_sufficiently_distinguished']
        if not flags and tuple(sorted(h['sourceKeys'])) not in approvals: flags.append('explicit_source_review_required')
        reviewed.append({'sourceKeys':h['sourceKeys'],'sourceNameGroups':1,'reasons':flags,'separationEvidence':[witness]})
        if not flags: proposals.append((partitions,h['sourceKeys'],[witness],1))
    return proposals,reviewed

def prepare(args):
    cfg,query = t.base.connection(args.connection,args.confirm_branch,timeout=180)
    if cfg['projectId']!=t.PROJECT or cfg['branchId']!=t.PROD: raise ValueError('Screen production before rehearsal')
    rows,evidence,pages = prior.recover_and_compare(args.output,query)
    previous = json.loads((args.output/'previous-review.private.json').read_text())
    live = query([("SELECT after_value FROM network_audit_log WHERE id=$1 AND action='source_batch.publication_followup' AND entity_id=$2",[previous['id'],aliases.BATCH])],True)[0]
    if len(live)!=1 or live[0]['after_value']!=previous['after_value']: raise ValueError('Previous review changed')
    existing = query([("SELECT a.id,jsonb_path_query_array(h.performances,'$[*].archiveReference.sourceRow') source_keys FROM athletes a JOIN athlete_source_histories h ON h.athlete_id=a.id WHERE a.profile_details#>>'{archiveCreation,sourceImportBatch}'=$1 AND h.provider=$2",[t.IMPORT,t.PROVIDER])],True)[0]
    public_keys = [k for p in existing for k in p['source_keys']]
    held = previous['after_value']['remainingHeld']; held_keys = [k for h in held for k in h['sourceKeys']]
    if len(existing)!=17538 or len(public_keys)!=18930 or len(set(public_keys))!=18930: raise ValueError('Published scope changed')
    if len(held_keys)!=22761 or len(set(held_keys))!=22761 or set(held_keys)&set(public_keys) or set(held_keys)|set(public_keys)!=set(rows): raise ValueError('Source partition changed')
    decisions = json.loads((args.output/'distinct-review.private.json').read_text())
    components,reviewed = review_components(rows,held,decisions)
    proposed=[]
    for partitions,keys,witnesses,name_groups in components:
        for source in partitions:
            p=t.profile(source,evidence,pages)
            p['details']['archiveCreation'].update({'batchId':BATCH,'approvedAt':dt.datetime.now(dt.timezone.utc).isoformat(),
                'instruction':'Continue supported public sporting results next to the athlete.',
                'basis':'Privately reviewed separate source observations; same-programme entries with additional distinctions, or widely separated reported ages and different recorded locations. Identity remains provisional.',
                'previousReviewAuditId':previous['id'],'reviewedComponentSourceKeys':sorted(keys),
                'separationEvidence':witnesses,'originalSourceNameGroups':name_groups})
            proposed.append(p)
    allowed=frozenset(k for p in proposed for n in p['details']['aliases'] for k in t.prep.name_keys(n))
    print(json.dumps({'phase':'directory_screen','candidateProfiles':len(proposed),'candidateResults':sum(len(p['performances']) for p in proposed)}),flush=True)
    directory=t.wmm.LiveDirectory(query,allowed)
    blocked={}; conflicts=[]
    for p in proposed:
        candidates=t.publication_candidates(directory,p)
        if candidates:
            key=tuple(p['details']['archiveCreation']['reviewedComponentSourceKeys']);blocked[key]=True
            conflicts.append({'sourceKeys':list(key),'reasons':['current_directory_or_result_conflict'],'candidates':sorted(candidates)})
    eligible=[p for p in proposed if tuple(p['details']['archiveCreation']['reviewedComponentSourceKeys']) not in blocked]
    released={r['sourceKeys'][0] for p in eligible for r in p['performances']}
    summary={'batchId':BATCH,'sourceRows':len(rows),'eligibleProfiles':len(eligible),
        'eligibleResultRecords':len(released),'componentsReviewed':len(reviewed),
        'acceptedComponents':len({tuple(p['details']['archiveCreation']['reviewedComponentSourceKeys']) for p in eligible}),
        'sourceNameGroupsReleased':sum(set(h['sourceKeys']).issubset(released) for h in held),
        'currentDirectoryConflicts':len(conflicts),'priorPublicProfiles':len(existing),'priorPublicResults':len(public_keys),
        'snapshotAt':dt.datetime.now(dt.timezone.utc).isoformat(),'directoryMaxId':directory.maxid,'directoryFingerprint':directory.fingerprint}
    plan={'summary':summary,'profiles':eligible,'held':conflicts,'sourceReceipts':list({int(r['id']):r for r in evidence.values()}.values())}
    plan['planHash']=t.digest(plan)
    t.dump(args.output/'plan.private.json',plan);t.dump(args.output/'summary.json',summary)
    t.dump(args.output/'distinct-decisions.private.json',reviewed)
    print(json.dumps(summary),flush=True)

def component_candidate_checker(profiles,lookup):
    by_component=collections.defaultdict(list)
    for p in profiles: by_component[tuple(p['details']['archiveCreation']['reviewedComponentSourceKeys'])].append(p)
    def candidates(directory,profile):
        matches=set()
        for sibling in by_component[tuple(profile['details']['archiveCreation']['reviewedComponentSourceKeys'])]:
            matches.update(lookup(directory,sibling))
        return matches
    return candidates

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','rehearse','publish'])
    parser.add_argument('--connection',type=pathlib.Path,required=True);parser.add_argument('--confirm-branch',required=True)
    parser.add_argument('--output',type=pathlib.Path,required=True)
    args=parser.parse_args()
    if args.action=='prepare': prepare(args)
    else:
        plan=json.loads((args.output/'plan.private.json').read_text())
        # Keep each source-separated component in one atomic transaction. A new
        # sibling profile must not cause half its component to be held on replay.
        if not 0<len(plan['profiles'])<=500: raise ValueError('Bounded review requires 1–500 profiles')
        args.limit=None;args.chunk=len(plan['profiles']);t.BATCH=BATCH
        t.publication_candidates=component_candidate_checker(plan['profiles'],t.publication_candidates)
        t.apply(args)
