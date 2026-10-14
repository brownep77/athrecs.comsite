"""Review complete held exact-name groups with explicit source-row partitions.

The source age/location distinctions support provisional observations, not a
verified identity. Place aliases must be reviewed before accepting a distinction.
Original locations remain private evidence and are never copied to biographies.
"""
import argparse, importlib.util, itertools, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('tlm_distinct_prior', ROOT/'continue-tlm-distinct-profiles.py')
distinct = importlib.util.module_from_spec(spec); spec.loader.exec_module(distinct)
t, prior = distinct.t, distinct.prior
PREVIOUS_BATCH = distinct.BATCH
BATCH = 'tlm-public-continuation0635-same-name-20261014'

def place_key(row):
    city = prior.location(row.get('residenceCityOriginal'))
    region = prior.location(row.get('residenceRegionOriginal'))
    # These reviewed equivalences prevent false distinctions. This is not a
    # general place resolver: every decision still requires private place review.
    if region == 'CT':
        city = {'THE PARK CITY':'BRIDGEPORT', 'PARK CITY':'BRIDGEPORT',
                'ONECO':'STERLING', 'W HARTFORD':'WEST HARTFORD'}.get(city,city)
    return city,region

def separated_pair(left,right):
    witness = distinct.separated_pair(left,right)
    if witness and witness['method']=='distinct_recorded_ages_and_locations':
        if any(place_key(a)==place_key(b) for a,b in itertools.product(left,right)): return None
    return witness

def review_components(rows,held,decisions):
    groups = {tuple(sorted(h['sourceKeys'])):h for h in held}
    proposals=[]; reviewed=[]; seen=set()
    for decision in decisions:
        keys=tuple(sorted(decision['sourceKeys'])); flags=[]; witnesses=[]; partitions=[]
        group=groups.get(keys)
        if keys in seen or len(keys)!=len(set(keys)): flags.append('duplicate_review_component')
        seen.add(keys)
        if not group: flags.append('complete_held_group_required')
        elif set(group['reasons'])-distinct.SPLIT_HOLDS or group.get('sourceVariants'):
            flags.append('other_identity_or_source_holds')
        partition_keys=decision.get('partitions',[])
        flat=[k for p in partition_keys for k in p]
        if len(partition_keys)<2 or any(not p for p in partition_keys) or sorted(flat)!=list(keys):
            flags.append('complete_disjoint_partition_required')
        if decision.get('decision')!='supported_separate_provisional_profiles' or decision.get('placesReviewedDistinct') is not True:
            flags.append('explicit_source_and_place_review_required')
        if not flags:
            partitions=[[rows[k] for k in partition] for partition in partition_keys]
            if len({t.prep.norm(r['name']) for rs in partitions for r in rs})!=1:
                flags.append('exact_name_group_required')
            if any(distinct.profile_flags(rs) for rs in partitions): flags.append('within_profile_corroboration_failed')
            witnesses=[separated_pair(a,b) for a,b in itertools.combinations(partitions,2)]
            if not all(witnesses): flags.append('component_not_fully_distinguished')
        reviewed.append({'sourceKeys':list(keys),'sourceNameGroups':1,'reasons':sorted(set(flags)),'separationEvidence':witnesses})
        if not flags: proposals.append((partitions,list(keys),witnesses,1))
    if len(seen)!=len(decisions): raise ValueError('Duplicate source-key review decision')
    return proposals,reviewed

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','rehearse','publish'])
    parser.add_argument('--connection',type=pathlib.Path,required=True);parser.add_argument('--confirm-branch',required=True)
    parser.add_argument('--output',type=pathlib.Path,required=True)
    args=parser.parse_args()
    distinct.BATCH=BATCH; distinct.review_components=review_components
    if args.action=='prepare':
        distinct.prepare(args,previous_batch=PREVIOUS_BATCH,expected_profiles=17612,expected_results=19011,expected_held=22680)
    else:
        plan=json.loads((args.output/'plan.private.json').read_text())
        if not 0<len(plan['profiles'])<=500: raise ValueError('Bounded review requires 1–500 profiles')
        args.limit=None;args.chunk=len(plan['profiles']);t.BATCH=BATCH
        t.publication_candidates=distinct.component_candidate_checker(plan['profiles'],t.publication_candidates)
        t.apply(args)
