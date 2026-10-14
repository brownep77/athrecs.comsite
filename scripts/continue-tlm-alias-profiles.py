"""Continue the retained TLM queue using corroborated source-name variants.

Only new provisional profiles are created. Nicknames and edit distance are
candidate evidence, never permission to merge an existing athlete or account.
Spelling variants additionally require a private, source-key-bound decision.
"""
import argparse, collections, datetime as dt, importlib.util, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('tlm_prior_followup', ROOT/'continue-tlm-source-profiles.py')
prior = importlib.util.module_from_spec(spec); spec.loader.exec_module(prior)
t = prior.t
BATCH = 'tlm-public-continuation0635-aliases-20261014'
VARIANT = 'possible_source_name_variant'
ALLOWED_HOLDS = {VARIANT, prior.CLUB_HOLD}

def one_edit(a, b):
    if a == b: return True
    if min(len(a),len(b)) < 5 or abs(len(a)-len(b)) > 1: return False
    if len(a) == len(b):
        differences = [i for i in range(len(a)) if a[i] != b[i]]
        return len(differences) == 1 or (len(differences) == 2 and differences[1] == differences[0]+1
            and a[differences[0]:differences[1]+1] == b[differences[0]:differences[1]+1][::-1])
    if len(a) > len(b): a,b = b,a
    return any(b[:i]+b[i+1:] == a for i in range(len(b)))

def name_mode(rows):
    parts = []
    for row in rows:
        fields = dict(zip(row['originalHeaders'],row['originalCells']))
        parts.append((t.prep.norm(fields.get('First','')).split(),t.prep.norm(fields.get('Last','')).replace(' ','')))
    if not all(first and last for first,last in parts): return None
    firsts = {min(t.prep.finder.NICK.get(first[0],{first[0]})) for first,last in parts}
    middle = {''.join(first[1:]) for first,last in parts if len(first)>1}
    lasts = {last for first,last in parts}
    if len(firsts) == len(lasts) == 1 and len(middle) <= 1: return 'recorded_nickname_or_spacing_variant'
    compact = {(''.join(first),last) for first,last in parts}
    if len(compact) != 2: return None
    (af,al),(bf,bl) = sorted(compact)
    if (af == bf and one_edit(al,bl)) or (al == bl and one_edit(af,bf)):
        return 'reviewed_source_spelling_variant'
    return None

def corroboration_flags(rows):
    # Replace only the exact-name-component requirement. All source, age,
    # gender, location, club and distinct-date checks remain in force.
    flags = set(prior.corroboration_flags(rows)) - {'source_name_components_differ'}
    if not name_mode(rows): flags.add('unsupported_source_name_difference')
    if any(r.get(k) is not None and r[k] <= 0 for r in rows for k in ('overallPosition','genderPosition','categoryPosition')):
        flags.add('invalid_source_placing')
    return sorted(flags)

def components(groups):
    seen = set()
    for name,held in sorted(groups.items()):
        if name in seen or VARIANT not in held['reasons']: continue
        component = set(); stack = [name]
        while stack:
            item = stack.pop()
            if item in component: continue
            component.add(item)
            if item in groups: stack.extend(groups[item].get('sourceVariants',[]))
        seen |= component
        yield component

def prepare(args):
    cfg,query = t.base.connection(args.connection,args.confirm_branch,timeout=180)
    if cfg['projectId'] != t.PROJECT or cfg['branchId'] != t.PROD: raise ValueError('Screen production before rehearsal')
    rows,evidence,pages = prior.recover_and_compare(args.output,query)
    previous = json.loads((args.output/'prior-followup.private.json').read_text())
    live = query([("SELECT after_value FROM network_audit_log WHERE id=$1 AND action='source_batch.publication_followup' AND entity_id=$2",[previous['id'],prior.BATCH])],True)[0]
    if len(live) != 1 or live[0]['after_value'] != previous['after_value']: raise ValueError('Previous review changed')
    existing = query([("SELECT a.id,a.profile_visibility,h.published_at,jsonb_path_query_array(h.performances,'$[*].archiveReference.sourceRow') source_keys FROM athletes a JOIN athlete_source_histories h ON h.athlete_id=a.id WHERE a.profile_details#>>'{archiveCreation,sourceImportBatch}'=$1 AND h.provider=$2",[t.IMPORT,t.PROVIDER])],True)[0]
    public_keys = [key for profile in existing for key in profile['source_keys']]
    if len(existing) != 17467 or len(public_keys) != 18761 or len(set(public_keys)) != len(public_keys): raise ValueError('Published scope changed')
    held = previous['after_value']['remainingHeld']
    held_keys = [key for h in held for key in h['sourceKeys']]
    if len(set(held_keys)) != 22930 or set(held_keys)&set(public_keys) or set(held_keys)|set(public_keys) != set(rows): raise ValueError('Source partition changed')
    groups = {t.prep.norm(rows[h['sourceKeys'][0]]['name']):h for h in held}
    decisions = json.loads((args.output/'spelling-review.private.json').read_text())
    approved = {tuple(sorted(d['sourceKeys'])) for d in decisions if d['decision']=='supported_provisional_grouping'}
    proposed = []; reviewed = []; eligible_components = 0
    for component in components(groups):
        keys = [key for name in sorted(component) if name in groups for key in groups[name]['sourceKeys']]
        flags = []
        if not component.issubset(groups): flags.append('component_not_fully_held')
        elif any(set(groups[n]['reasons'])-ALLOWED_HOLDS for n in component): flags.append('other_identity_or_source_holds')
        else:
            eligible_components += 1
            source = [rows[key] for key in keys]
            flags = corroboration_flags(source)
            mode = name_mode(source)
            if mode == 'reviewed_source_spelling_variant' and tuple(sorted(keys)) not in approved:
                flags.append('spelling_variant_requires_explicit_source_review')
        reviewed.append({'sourceKeys':keys,'sourceNameGroups':len(component),'reasons':sorted(flags)})
        if flags: continue
        profile = t.profile(source,evidence,pages)
        profile['details']['archiveCreation'].update({
            'batchId':BATCH,'approvedAt':dt.datetime.now(dt.timezone.utc).isoformat(),
            'instruction':'Continue publishing supported public sporting results beside the athlete.',
            'basis':'Source-name variants supported by exact recorded city/state, gender and compatible reported ages on distinct dates; current directory screened; identity remains provisional',
            'nameReviewMode':mode,'previousReviewAuditId':previous['id'],
            'originalSourceNameGroups':len(component), 'previousHoldReasons':sorted({f for n in component for f in groups[n]['reasons']})})
        proposed.append(profile)
    allowed = frozenset(k for p in proposed for name in p['details']['aliases'] for k in t.prep.name_keys(name))
    print(json.dumps({'phase':'directory_screen','candidateProfiles':len(proposed),'candidateResults':sum(len(p['performances']) for p in proposed)}),flush=True)
    directory = t.wmm.LiveDirectory(query,allowed)
    eligible = []; conflicts = []
    for profile in proposed:
        candidates = t.publication_candidates(directory,profile)
        if candidates: conflicts.append({'sourceKeys':[r['sourceKeys'][0] for r in profile['performances']],'reasons':['current_directory_or_result_conflict'],'candidates':sorted(candidates)})
        else: eligible.append(profile)
    summary = {'batchId':BATCH,'sourceRows':len(rows),'eligibleProfiles':len(eligible),
        'eligibleResultRecords':sum(len(p['performances']) for p in eligible),
        'sourceVariantComponentsReviewed':len(reviewed),'componentsWithOnlyNameOrClubHolds':eligible_components,
        'sourceNameGroupsReleased':sum(p['details']['archiveCreation']['originalSourceNameGroups'] for p in eligible),
        'currentDirectoryConflicts':len(conflicts),'priorPublicProfiles':len(existing),'priorPublicResults':len(public_keys),
        'snapshotAt':dt.datetime.now(dt.timezone.utc).isoformat(),'directoryMaxId':directory.maxid,'directoryFingerprint':directory.fingerprint}
    plan = {'summary':summary,'profiles':eligible,'held':conflicts,
            'sourceReceipts':list({int(r['id']):r for r in evidence.values()}.values())}
    plan['planHash'] = t.digest(plan)
    t.dump(args.output/'plan.private.json',plan);t.dump(args.output/'summary.json',summary)
    t.dump(args.output/'alias-decisions.private.json',reviewed)
    print(json.dumps(summary),flush=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','rehearse','publish'])
    parser.add_argument('--connection',type=pathlib.Path,required=True);parser.add_argument('--confirm-branch',required=True)
    parser.add_argument('--output',type=pathlib.Path,required=True);parser.add_argument('--limit',type=int);parser.add_argument('--chunk',type=int,default=500)
    args = parser.parse_args()
    if args.action == 'prepare': prepare(args)
    else:
        t.BATCH = BATCH
        t.apply(args)
