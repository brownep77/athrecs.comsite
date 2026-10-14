"""Review source-key-bound place variants in complete held exact-name groups.

Original source cells are immutable. Municipality comparison is private evidence,
not a residence assertion or verified identity, and never merges existing people.
"""
import argparse, importlib.util, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('tlm_place_prior',ROOT/'continue-tlm-distinct-profiles.py')
distinct=importlib.util.module_from_spec(spec);spec.loader.exec_module(distinct)
prior,t=distinct.prior,distinct.t
BATCH='tlm-public-continuation0635-places-20261014'
PREVIOUS_BATCH='tlm-public-continuation0635-same-name-20261014'
CT_SOURCE='https://portal.ct.gov/-/media/DMV/CTDOTOSOWTownBoroughVillageListingpdf.pdf'
MUNICIPALITIES=[
    ('CT',{'FRANKLIN','NORTH FRANKLIN'},CT_SOURCE),
    ('CT',{'KILLINGLY','DAYVILLE','DANIELSON'},CT_SOURCE),
    ('CT',{'VERNON','VERNON ROCKVILLE','ROCKVILLE'},CT_SOURCE),
    ('CT',{'GRISWOLD','JEWETT CITY'},CT_SOURCE),
    ('CT',{'POMFRET','POMFRET CENTER'},CT_SOURCE),
    ('CT',{'NEWTOWN','SANDY HOOK'},CT_SOURCE),
    ('MA',{'NORTH ATTLEBORO','NORTH ATTLEBOROUGH'},'https://www.northattleborough.gov/'),
    ('MA',{'STURBRIDGE','FISKDALE'},'https://www.sturbridge.gov/170/About'),
    ('RI',{'SOUTH KINGSTOWN','WAKEFIELD','PEACE DALE'},'https://www.southkingstownri.gov/960/Action-Plan-July-1-2024--June-30-2027'),
]

def expand_direction(city):
    first,*rest=city.split()
    word={'N':'NORTH','S':'SOUTH','E':'EAST','W':'WEST'}.get(first.rstrip('.'))
    return ' '.join([word,*rest]) if word and rest else city

def place_evidence(rows,decision):
    places=sorted({(prior.location(r.get('residenceCityOriginal')),prior.location(r.get('residenceRegionOriginal'))) for r in rows})
    if len(places)!=2 or len({p[1] for p in places})!=1 or not all(distinct.valid_location(r) for r in rows):return None
    if decision.get('decision')!='supported_provisional_grouping' or decision.get('reviewedPlaces')!=[list(p) for p in places]:return None
    left,right=[p[0] for p in places];region=places[0][1];kind=decision.get('kind');reference=None
    if kind=='directional_abbreviation':
        if expand_direction(left)!=expand_direction(right):return None
    elif kind=='reviewed_one_edit_spelling':
        if not distinct.aliases.one_edit(left,right) or decision.get('spellingReviewed') is not True:return None
    elif kind=='official_municipality':
        reference=next((url for state,cities,url in MUNICIPALITIES if state==region and {left,right}<=cities),None)
        if reference is None or decision.get('officialSource')!=reference:return None
    else:return None
    return {'method':kind,'recordedPlaces':[list(p) for p in places],
            'officialSource':reference,'witnessSourceKeys':sorted(r['sourceKey'] for r in rows)}

def corroboration_flags(rows,decision):
    # Replace only the literal city-string comparison with a reviewed relation.
    # Name components, exact ages, gender, dates, clubs and all source guards stay.
    flags=set(distinct.profile_flags(rows))-{'source_city_missing_or_conflicting'}
    if len(rows)<2 or not place_evidence(rows,decision):flags.add('unsupported_place_relation')
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
            source=[rows[k] for k in keys];flags=corroboration_flags(source,decision)
            witness=place_evidence(source,decision)
            if not flags:proposals.append(([source],list(keys),[witness],1))
        reviewed.append({'sourceKeys':list(keys),'sourceNameGroups':1,'reasons':flags,'placeCorroborationEvidence':witness})
    return proposals,reviewed

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','rehearse','publish'])
    parser.add_argument('--connection',type=pathlib.Path,required=True);parser.add_argument('--confirm-branch',required=True)
    parser.add_argument('--output',type=pathlib.Path,required=True);args=parser.parse_args()
    distinct.BATCH=BATCH;distinct.review_components=review_components
    if args.action=='prepare':
        distinct.prepare(args,previous_batch=PREVIOUS_BATCH,expected_profiles=17666,expected_results=19068,expected_held=22623,
            review_basis='Same recorded name components, gender, compatible source ages and distinct dates; explicitly reviewed place spelling, abbreviation or official municipality relation; no conflicting clubs. Identity remains provisional.',
            evidence_field='placeCorroborationEvidence')
    else:
        plan=json.loads((args.output/'plan.private.json').read_text())
        if not 0<len(plan['profiles'])<=500:raise ValueError('Bounded review requires 1–500 profiles')
        args.limit=None;args.chunk=len(plan['profiles']);t.BATCH=BATCH
        t.publication_candidates=distinct.component_candidate_checker(plan['profiles'],t.publication_candidates)
        t.apply(args)
