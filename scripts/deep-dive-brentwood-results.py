"""Reconcile individually reviewed club facts with retained Brentwood holds.

Fact extracts and directory snapshots are private inputs, never repository data.
Headerless sheets are not globally remapped: only individually corroborated
rows can receive the explicitly reported fields. Identity review remains separate.
"""
import argparse,collections,importlib.util,json,pathlib,zipfile
ROOT=pathlib.Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('deep_continuation',ROOT/'continue-brentwood-results.py');c=importlib.util.module_from_spec(s);s.loader.exec_module(c)
BATCH='brentwood-deepdive-20261025';PREFIX='brentwood:deepdive-20261025:'
def reconcile(facts,held,published):
    replacements={};checks=[];published_rows=[x['performance']['archiveReference']['original'] for x in published]
    for fact in facts:
        year=int(fact['date'][:4]);time=c.p.clock(fact['time'])
        candidates=[x for x in held if x['year']==year and c.same_name_or_variant(x['name'],fact['name'])]
        matches=[x for x in candidates if time in {c.p.clock(x.get(k)) for k in ['chip_time','gun_time','recorded_time']}]
        check={'fact':fact,'matchingHeldKeys':[x['key'] for x in matches]};checks.append(check)
        if len(matches)!=1:
            old=[x for x in published_rows if x['year']==year and c.same_name_or_variant(x['name'],fact['name']) and time in {c.p.clock(x.get(k)) for k in ['chip_time','gun_time','recorded_time']}]
            check['outcome']='Previously published observation corroborated' if old else 'No unique agreeing held observation'
            check['publishedKeys']=[x['key'] for x in old];continue
        old=matches[0]
        if old.get('club') and c.p.club_key(old['club']) and c.p.club_key(old['club'])!=c.p.club_key(fact['club']):check['outcome']='Conflicting reported club retained';continue
        if fact['timeBasis']=='chip' and 'Headerless' not in old['hold'] and time!=c.p.clock(old.get('chip_time')):check['outcome']='Labelled chip time disagrees';continue
        evidence={'basis':'Individually inspected club result agrees on edition, full name or bounded name variant, and exact time','checkedAt':fact['checkedAt'],'sourceUrl':fact['source_url'],'sourceSha256':fact['source_sha256'],'sourceRow':fact,'previousHold':old['hold']}
        if 'Headerless' in old['hold']:
            new={'key':old['key'],'name':old['name'],'year':year,'date':fact['date'],'bib':'','club':fact['club'],'gender':fact.get('gender',''),'category':'','overall_position':'','gender_position':'','category_position':'','recorded_time':time if fact['timeBasis']=='unknown' else '','chip_time':time if fact['timeBasis']=='chip' else '','gun_time':'','status':'Finished','source_file':fact['source_file'],'source_url':fact['source_url'],'source_sha256':fact['source_sha256'],'provider':fact['club'],'raw_headed':fact,'original':old,'secondary':True,'resolutionEvidence':evidence}
        else:
            new={**old,'club':fact['club'],'clubCorroboration':evidence}
            if old.get('date') and old['date']!=fact['date']:check['outcome']='Edition date disagreement retained';continue
            new['date']=fact['date']
        if old['key'] in replacements:raise ValueError('Two replacement facts need explicit comparison')
        replacements[old['key']]=new;check['outcome']='Individually corroborated; separate identity review required'
    return replacements,checks
def run(args):
    with zipfile.ZipFile(args.audit) as z:
        held=[json.loads(l) for l in z.read('held_for_review.jsonl').splitlines()];published=[json.loads(l) for l in z.read('published_results.jsonl').splitlines()]
    facts=json.loads(args.facts.read_text());snapshot=json.loads(args.snapshot.read_text());raw=[json.loads(l) for l in (args.archive/'all_results.jsonl').read_text().splitlines()]
    replacements,checks=reconcile(facts,held,published)
    data={'rows':list(replacements.values()),'held':[x for x in held if x['key'] not in replacements],'checks':checks};c.p.BATCH=BATCH
    result=c.p.plan(data,snapshot,raw,resolve_partial_clubs=True,allow_name_variants=True)
    byhist=collections.defaultdict(list)
    for h in snapshot['histories']:byhist[str(h['athlete_id'])].append(h)
    accepted=[]
    for h in result['existingHistories']:
        aid=str(h['athleteId']);a=snapshot['entities'][aid];perfs=[];evidence=[]
        for perf,ev in zip(h['performances'],h['identityEvidence']):
            row=perf['archiveReference']['original'];why=c.r.history_conflict(row,byhist[aid])
            if why:result['held'].append({**row,'hold':why,'athleteId':int(aid)})
            else:perfs.append(perf);evidence.append(ev)
        if not perfs:continue
        h.update(performances=perfs,identityEvidence=evidence,years=sorted({x['year'] for x in perfs}),externalId=PREFIX+'existing:'+aid,expectedGender=a.get('gender'),expectedDob=a.get('date_of_birth'),expectedSourceClub=a.get('source_club_name'),expectedSourceSecondClub=a.get('source_second_club_name'),expectedClubId=a.get('club_id'),expectedSecondClubId=a.get('second_club_id'));accepted.append(h)
    result['existingHistories']=accepted;result['enrichments']=[]
    keys=[p['archiveReference']['original']['key'] for h in result['profiles']+accepted for p in h['performances']]+[x['key'] for x in result['held']]+[x['row']['key'] for x in result['reused']]
    if len(keys)!=len(set(keys)) or set(keys)!={x['key'] for x in held}:raise ValueError('Observation accounting differs')
    result['summary'].update(newProfiles=len(result['profiles']),newProfileResults=sum(len(x['performances']) for x in result['profiles']),existingProfilesEnriched=len(accepted),existingProfileResults=sum(len(x['performances']) for x in accepted),heldRows=len(result['held']),heldReasons=dict(collections.Counter(x['hold'] for x in result['held'])),reviewedFacts=len(facts),corroboratedHeldRows=len(replacements),headerlessRowsResolved=sum('resolutionEvidence' in x and x.get('secondary',False) for x in replacements.values()))
    c.r.imp.dump(args.out,result);c.r.imp.dump(args.compared,data);print(json.dumps(result['summary']),flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['audit','facts','snapshot','archive','out','compared']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    run(ap.parse_args())
