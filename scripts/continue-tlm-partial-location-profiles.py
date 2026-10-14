"""Review repeated source observations with corroborated but incomplete places.

At least two separate dated observations must record the same complete place.
Other place fields may be blank, never contradictory. Nothing is filled in or
inferred on source rows or public profiles; identity remains provisional.
"""
import argparse, importlib.util, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('tlm_partial_prior',ROOT/'continue-tlm-distinct-profiles.py')
distinct=importlib.util.module_from_spec(spec);spec.loader.exec_module(distinct)
prior,t=distinct.prior,distinct.t
BATCH='tlm-public-continuation0635-location-gaps-20261014'
PREVIOUS_BATCH='tlm-public-continuation0635-places-20261014'

def location_evidence(rows,decision):
    complete=[r for r in rows if distinct.valid_location(r)]
    places={(prior.location(r.get('residenceCityOriginal')),prior.location(r.get('residenceRegionOriginal'))) for r in complete}
    if len(complete)<2 or len(places)!=1 or len(complete)==len(rows):return None
    if len({r['date'] for r in complete})<2:return None
    city,region=next(iter(places))
    for r in rows:
        a,b=prior.location(r.get('residenceCityOriginal')),prior.location(r.get('residenceRegionOriginal'))
        if (a and a!=city) or (b and b!=region):return None
    witnesses=sorted(r['sourceKey'] for r in complete)
    missing=sorted(r['sourceKey'] for r in rows if r not in complete)
    if decision.get('decision')!='supported_provisional_grouping' or decision.get('kind')!='repeated_location_with_blank_fields':return None
    if decision.get('recordedPlace')!=[city,region] or decision.get('completeLocationSourceKeys')!=witnesses or decision.get('incompleteLocationSourceKeys')!=missing:return None
    return {'method':'repeated_location_with_blank_fields','recordedPlace':[city,region],
        'completeLocationSourceKeys':witnesses,'incompleteLocationSourceKeys':missing,
        'missingFieldsRemainMissing':True,'identityVerified':False}

def corroboration_flags(rows,decision):
    flags=set(distinct.profile_flags(rows))-{'source_city_missing_or_conflicting','source_region_missing_or_conflicting'}
    if not location_evidence(rows,decision):flags.add('insufficient_nonconflicting_location_evidence')
    return sorted(flags)

def review_components(rows,held,decisions):
    groups={tuple(sorted(h['sourceKeys'])):h for h in held};seen=set();proposals=[];reviewed=[]
    for decision in decisions:
        keys=tuple(sorted(decision['sourceKeys']));group=groups.get(keys);flags=[];witness=None
        if keys in seen or len(keys)!=len(set(keys)):raise ValueError('Duplicate source-key decision')
        seen.add(keys)
        if not group:flags.append('complete_held_group_required')
        elif group['reasons']!=[prior.CLUB_HOLD] or group.get('sourceVariants'):flags.append('other_identity_or_source_holds')
        else:
            source=[rows[k] for k in keys];flags=corroboration_flags(source,decision);witness=location_evidence(source,decision)
            if not flags:proposals.append(([source],list(keys),[witness],1))
        reviewed.append({'sourceKeys':list(keys),'sourceNameGroups':1,'reasons':flags,'partialLocationEvidence':witness})
    return proposals,reviewed

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','rehearse','publish'])
    parser.add_argument('--connection',type=pathlib.Path,required=True);parser.add_argument('--confirm-branch',required=True)
    parser.add_argument('--output',type=pathlib.Path,required=True);args=parser.parse_args()
    distinct.BATCH=BATCH;distinct.review_components=review_components
    if args.action=='prepare':
        distinct.prepare(args,previous_batch=PREVIOUS_BATCH,expected_profiles=17705,expected_results=19162,expected_held=22529,
            review_basis='Same recorded name components, gender, compatible source ages and distinct dates; at least two complete matching city/state observations; remaining location fields blank or exactly matching; no conflicting clubs. Missing fields remain missing and identity remains provisional.',
            evidence_field='partialLocationEvidence')
    else:
        plan=json.loads((args.output/'plan.private.json').read_text())
        if not 0<len(plan['profiles'])<=500:raise ValueError('Bounded review requires 1–500 profiles')
        args.limit=None;args.chunk=len(plan['profiles']);t.BATCH=BATCH
        t.publication_candidates=distinct.component_candidate_checker(plan['profiles'],t.publication_candidates)
        t.apply(args)
