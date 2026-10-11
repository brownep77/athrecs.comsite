"""Independently compare every proposed WMM performance to captured source rows.

This does not call the preparer's normalizer. A successful manifest freezes the
exact files checked here; the importer rejects any later plan-file changes.
"""
import argparse, collections, gzip, hashlib, json, pathlib, re

PROVIDER='Abbott World Marathon Majors'
RANKINGS='https://www.worldmarathonmajors.com/rankings/world-rankings'
RESULTS='https://www.worldmarathonmajors.com/rankings/claim-results'

def check(captures,plan,edition,manifest):
    summary=json.loads((plan/'summary.json').read_text())
    assert summary.get('edition',8)==edition
    coverage=json.loads((captures/'coverage.json').read_text())
    assert {(x['gender'],x['ageGroup']) for x in coverage}=={(g,a) for g in ['F','M'] for a in ['40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+']}
    assert all(x['expected']==x['collected'] for x in coverage)
    source_ids=set();public_result_ids=set();counts=collections.Counter();hashes={}
    for path in sorted(captures.glob('*.json.gz')):
        with gzip.open(path,'rt') as f:raw=json.load(f)
        assert raw['edition']==edition
        target=plan/path.name.replace('.json.gz','.plan.json.gz')
        with gzip.open(target,'rt') as f:proposed=json.load(f)
        rankings={x['_id']:x['_source'] for x in raw['rankings']}
        assert len(rankings)==len(raw['rankings']) and not source_ids.intersection(rankings)
        source_ids.update(rankings)
        rows={x['_id']:x['_source'] for x in raw['results']}
        assert len(rows)==len(raw['results'])
        byathlete=collections.defaultdict(set)
        for rid,row in rows.items():
            assert row['result_id']==rid and row['athlete_id'] in rankings
            byathlete[row['athlete_id']].add(rid)
        cleared={p['externalId'] for p in proposed['profiles']};held={h['sourceAthleteId'] for h in proposed['held']}
        assert len(cleared)==len(proposed['profiles']) and len(held)==len(proposed['held'])
        assert not cleared.intersection(held) and cleared.union(held)==set(rankings)
        for p in proposed['profiles']:
            aid=p['externalId'];r=rankings[aid];used=[]
            assert p['gender']==r['gender'] and p['givenName']==r['firstname'] and p['familyName']==r['lastname']
            assert p['nation']==r.get('nationality') and p['sourceUrl']==RANKINGS
            assert p['displayName']==(r['firstname']+' '+r['lastname']).strip()
            assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',p['slug']) and p['slug'].endswith('-wmm-'+aid.lower())
            assert p['details']['archiveCreation']['batchId']==summary['batchId']
            assert p['details']['archiveCreation']['profileIdentityVerified'] is False
            observed=p['details']['worldMarathonMajors']
            assert observed['athleteId']==aid and observed['rankingEdition']==edition and observed['ageGroup']==r['age_group']
            assert observed['genderAgeGroupRank']==r['overall_ranking'] and observed['nationality']==r.get('nationality')
            if r.get('nationality'):
                assert p['details']['sourceNationalityObservation']['value']==r['nationality']
                assert p['details']['sourceNationalityObservation']['provider']==PROVIDER
                assert p['details']['sourceNationalityObservation']['sourceUrl']==RANKINGS
            for v in p['performances']:
                ref=v['archiveReference'];ids=ref['sourceResultIds'];assert ids
                original=rows[ids[0]]
                assert ref['original']==original and ref['sourceAthleteId']==aid and ref['provider']==PROVIDER
                assert original['edition']==edition and original['gender']==p['gender']
                assert v['year']==original['result_year'] and v['year'] in ((2025,) if edition==7 else (2025,2026))
                assert v['yearLabel']==str(v['year']) and v['sourceDate']==str(v['year']) and v['date']==''
                assert v['meeting']==original['event_title'] and v['discipline']=='Marathon'
                assert v['performance']==original['finish_time'] and v['place']==str(original.get('place') or '')
                assert v['ageGroup']==(original.get('age_group') or '') and v['venue']==''
                assert v['providerName']==PROVIDER and v['sourceUrls']==[RESULTS,RANKINGS] and v['verificationStatus']=='unverified'
                parts=list(map(int,v['performance'].split(':')));assert len(parts)==3 and 0<=parts[1]<60 and 0<=parts[2]<60
                assert 3600*parts[0]+60*parts[1]+parts[2]==original['finish_time_secs']>0
                for rid in ids:
                    s=rows[rid];assert s['athlete_id']==aid
                    assert all(s.get(k)==original.get(k) for k in ['event_title','result_year','finish_time','bibnumber','place'])
                used.extend(ids)
            assert len(used)==len(set(used)) and set(used)==byathlete[aid] and not public_result_ids.intersection(used)
            public_result_ids.update(used)
            assert p['years']==sorted({v['year'] for v in p['performances']})
            assert r['fastest_finish_time_secs'] in {rows[rid]['finish_time_secs'] for rid in used}
        counts.update(profiles=len(cleared),held=len(held),performances=sum(len(p['performances']) for p in proposed['profiles']),rawResults=len(rows))
        hashes[target.name]=hashlib.sha256(target.read_bytes()).hexdigest()
    assert len(source_ids)==sum(x['expected'] for x in coverage)==summary['summary']['rankings_screened']
    assert counts['profiles']==summary['summary']['eligible_profiles'] and counts['held']==summary['summary']['held_profiles'] and counts['performances']==summary['summary']['eligible_results']
    assert counts['rawResults']==sum(x['results'] for x in coverage)
    result={'edition':edition,'batchId':summary['batchId'],'sha256':hashes,'counts':dict(counts),'sourceIds':len(source_ids),'publicSourceResultIds':len(public_result_ids)}
    temp=manifest.with_suffix('.writing');temp.write_text(json.dumps(result,indent=2));temp.replace(manifest)
    print(json.dumps({'checked':dict(counts),'sourceIds':len(source_ids),'files':len(hashes)}))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--captures',type=pathlib.Path,required=True);p.add_argument('--plan',type=pathlib.Path,required=True);p.add_argument('--edition',type=int,choices=[7,8],required=True);p.add_argument('--manifest',type=pathlib.Path,required=True);a=p.parse_args();check(a.captures,a.plan,a.edition,a.manifest)
