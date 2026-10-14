#!/usr/bin/env python3
"""Prepare atomic, fail-closed SQL for reviewed NEW career histories only.

This command does not execute SQL. Test the generated statements on a Neon review
branch, compare the stored rows, then publish the reviewed statements. Existing
histories and claimed/private profiles require a separate, evidence-preserving review.
"""
import argparse
import datetime
import importlib.util
import json
import pathlib
import re


def literal(value):
    return "'" + value.replace("'", "''") + "'"


def json_sql(value):
    return literal(json.dumps(value, ensure_ascii=False, separators=(',', ':'))) + '::jsonb'


def prepare(candidate, biography, new_review=None):
    h = candidate['history']
    is_new = not candidate['target']['athlete_id']
    if is_new:
        assert new_review and new_review['noExistingIdentity'], 'New identities need explicit duplicate review first'
        assert new_review['checkedNames'] and new_review['checkedAt'] and new_review['slug']
    assert h['complete'] and not candidate['errors'], 'Incomplete careers require separate review'
    assert biography.strip(), 'A reviewed original biography is required'
    identity = candidate['identity']
    name = identity['givenName'] + ' ' + identity['familyName']
    if is_new:
        assert name in new_review['checkedNames'], 'Source name must be included in identity screening'
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', new_review['slug']), 'Invalid public slug'
    birth = identity.get('birthDate', '')
    try:
        dob = datetime.datetime.strptime(birth, '%d %b %Y').date().isoformat()
    except ValueError:
        dob = None
    value = {'athleteId': candidate['target']['athlete_id'], 'externalId': h['externalId'],
             'name': name, 'gender': 'M' if identity['male'] else 'F', 'dateOfBirth': dob,
             'biography': biography, 'history': h,
             'evidence': {key: val for key, val in candidate.items() if key != 'history'}}
    if is_new:
        value.update({'newReview': new_review, 'displayName': new_review['displayName'],
                      'givenName': identity['givenName'], 'familyName': new_review['familyName'],
                      'nation': identity.get('countryCode') or '',
                      'slug': new_review['slug']})
        value['profileDetails'] = {
            'aliases': [name], 'athlete_verified': False,
            'identity_review_status': 'provisional_source_profile',
            'sourceSports': ['Athletics'],
            'archiveCreation': {'basis': 'Source ID, full/reordered names, aliases and registered-name screening; reviewed no existing match',
                                'checkedAt': new_review['checkedAt'], 'profileIdentityVerified': False},
            'sourceNationalityObservation': {'value': value['nation'], 'originalValue': value['nation'],
                'provider': 'World Athletics', 'sourceAthleteId': h['externalId'],
                'sourceUrl': h['sourceUrl'], 'checkedAt': h['capturedAt']},
            'worldAthleticsCareer': {'sourceId': h['externalId'], 'sourceUrl': h['sourceUrl'],
                'checkedAt': h['capturedAt'], 'completeListedSeasons': True,
                'yearsExpected': h['yearsExpected'], 'yearsCaptured': h['yearsCaptured'],
                'performanceCount': len(h['performances']),
                'scope': 'Every result listed in the source active seasons, not an assertion of all lifetime competitions'},
        }
    sql = f"""WITH incoming AS (SELECT {json_sql(value)} AS v),
eligible AS MATERIALIZED (
 SELECT a.*, i.v FROM incoming i JOIN athletes a ON a.id=(i.v->>'athleteId')::int
 WHERE a.profile_visibility='public' AND a.parent_athlete_id IS NULL
 AND upper(regexp_replace(a.display_name,'[^[:alnum:]]','','g'))=
     upper(regexp_replace(i.v->>'name','[^[:alnum:]]','','g'))
 AND a.gender=i.v->>'gender'
 AND (a.date_of_birth IS NULL OR i.v->>'dateOfBirth' IS NULL OR a.date_of_birth=(i.v->>'dateOfBirth')::date)
 AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
 AND EXISTS(SELECT 1 FROM athlete_source_identities s WHERE s.athlete_id=a.id
   AND s.provider='worldathletics' AND ltrim(s.external_id,'0')=i.v->>'externalId')
 AND NOT EXISTS(SELECT 1 FROM athlete_source_identities s WHERE s.athlete_id<>a.id
   AND s.provider='worldathletics' AND ltrim(s.external_id,'0')=i.v->>'externalId')
 AND NOT EXISTS(SELECT 1 FROM athlete_source_histories h WHERE h.athlete_id=a.id
   AND lower(replace(h.provider,' ',''))='worldathletics')
), inserted AS (
 INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,
   complete,years_expected,years_captured,performances,published_at)
 SELECT id,'worldathletics',v->>'externalId',v#>>'{{history,sourceUrl}}',
   (v#>>'{{history,capturedAt}}')::timestamptz,true,
   ARRAY(SELECT jsonb_array_elements_text(v#>'{{history,yearsExpected}}')::int),
   ARRAY(SELECT jsonb_array_elements_text(v#>'{{history,yearsCaptured}}')::int),
   v#>'{{history,performances}}',now() FROM eligible
 ON CONFLICT(provider,external_id) DO NOTHING RETURNING athlete_id,external_id
), updated AS (
 UPDATE athletes a SET bio=e.v->>'biography',
   date_of_birth=coalesce(a.date_of_birth,(e.v->>'dateOfBirth')::date),
   profile_details=a.profile_details||jsonb_build_object('worldAthleticsCareer',
     jsonb_build_object('sourceId',e.v->>'externalId','sourceUrl',e.v#>>'{{history,sourceUrl}}',
       'checkedAt',e.v#>>'{{history,capturedAt}}','completeListedSeasons',true,
       'yearsExpected',e.v#>'{{history,yearsExpected}}','yearsCaptured',e.v#>'{{history,yearsCaptured}}',
       'performanceCount',jsonb_array_length(e.v#>'{{history,performances}}'),
       'scope','Every result listed in the source active seasons, not an assertion of all lifetime competitions'))
 FROM eligible e JOIN inserted n ON n.athlete_id=e.id WHERE a.id=e.id
 RETURNING a.id,a.bio,a.slug
), history_audit AS (
 INSERT INTO network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
 SELECT NULL,'athlete.history_admin_published','athlete_source_history',
   'worldathletics:'||(e.v->>'externalId'),NULL,
   jsonb_build_object('athleteId',e.id,'provider','worldathletics','externalId',e.v->>'externalId',
     'complete',true,'performanceCount',jsonb_array_length(e.v#>'{{history,performances}}'),
     'sourceSha256',e.v#>>'{{evidence,sourceSha256}}','checkedAt',e.v#>>'{{history,capturedAt}}'),
   'Owner requested full public World Athletics career histories on 14 October 2026. Exact source identity and every listed season/source row compared; source precision, rounds, relays and qualifications retained.'
 FROM eligible e JOIN updated u ON u.id=e.id RETURNING id
), biography_audit AS (
 INSERT INTO network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
 SELECT NULL,'athlete.biography_admin_published','athlete',e.id::text,
   jsonb_build_object('biography',e.bio,'dateOfBirth',e.date_of_birth,'profileDetails',e.profile_details),
   jsonb_build_object('athleteId',e.id,'biography',u.bio,'sourceUrl',e.v#>>'{{history,sourceUrl}}',
     'checkedAt',e.v#>>'{{history,capturedAt}}'),
   'Original AthRecs biography reviewed against the captured official profile honours, personal bests and season results. Existing source nationality preserved. Only exact source birthdates filled.'
 FROM eligible e JOIN updated u ON u.id=e.id RETURNING id
), queued AS (
 UPDATE world_athletics_career_queue q SET status='published',source_complete=true,
   expected_years=ARRAY(SELECT jsonb_array_elements_text(e.v#>'{{history,yearsExpected}}')::int),
   captured_years=ARRAY(SELECT jsonb_array_elements_text(e.v#>'{{history,yearsCaptured}}')::int),
   performance_count=jsonb_array_length(e.v#>'{{history,performances}}'),
   source_evidence=e.v->'evidence',biography=e.v->>'biography',last_error=NULL,
   checked_at=(e.v#>>'{{history,capturedAt}}')::timestamptz,published_at=now(),updated_at=now(),
   athlete_id=e.id,attempts=q.attempts+1,lease_owner=NULL,lease_expires_at=NULL
 FROM eligible e JOIN updated u ON u.id=e.id WHERE q.external_id=e.v->>'externalId'
 RETURNING q.external_id
)
SELECT (SELECT count(*) FROM inserted) AS histories_added,
 (SELECT count(*) FROM updated) AS biographies_published,
 (SELECT count(*) FROM history_audit) AS history_approvals,
 (SELECT count(*) FROM biography_audit) AS biography_approvals,
 (SELECT count(*) FROM queued) AS queue_completed,
 (SELECT jsonb_agg(jsonb_build_object('athleteId',id,'slug',slug)) FROM updated) AS profiles;
"""
    if not is_new:
        return sql
    # New people and their full public history are created in the same statement.
    # A concurrent source-ID/slug conflict aborts the whole transaction.
    new_eligible = """reviewed_names AS MATERIALIZED (
 SELECT upper(regexp_replace(n,'[^[:alnum:]]','','g')) AS name FROM incoming i
 CROSS JOIN LATERAL jsonb_array_elements_text(i.v#>'{newReview,checkedNames}') n
), created AS (
 INSERT INTO athletes(slug,display_name,given_name,family_name,gender,county,country,
   nation,bio,date_of_birth,source_url,profile_visibility,profile_source_checked_at,profile_details)
 SELECT v->>'slug',v->>'displayName',v->>'givenName',v->>'familyName',v->>'gender','','',
   nullif(v->>'nation',''),v->>'biography',(v->>'dateOfBirth')::date,v#>>'{history,sourceUrl}',
   'public',current_date,v->'profileDetails'
 FROM incoming i WHERE NOT EXISTS(SELECT 1 FROM athlete_source_identities s
   WHERE s.provider='worldathletics' AND ltrim(s.external_id,'0')=v->>'externalId')
 AND NOT EXISTS(SELECT 1 FROM athletes a WHERE a.slug=v->>'slug'
   OR a.source_url LIKE '%-'||(v->>'externalId') OR a.source_url LIKE '%='||(v->>'externalId')
   OR upper(regexp_replace(a.display_name,'[^[:alnum:]]','','g')) IN(SELECT name FROM reviewed_names)
   OR upper(regexp_replace(coalesce(a.race_entry_name,''),'[^[:alnum:]]','','g')) IN(SELECT name FROM reviewed_names)
   OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(a.profile_details->'aliases')='array'
       THEN a.profile_details->'aliases' ELSE '[]'::jsonb END) alias
     WHERE upper(regexp_replace(alias,'[^[:alnum:]]','','g')) IN(SELECT name FROM reviewed_names)))
 RETURNING *
), mapped AS (
 INSERT INTO athlete_source_identities(provider,external_id,athlete_id,source_url)
 SELECT 'worldathletics',v->>'externalId',a.id,v#>>'{history,sourceUrl}' FROM created a CROSS JOIN incoming
 RETURNING athlete_id
), eligible AS MATERIALIZED (
 SELECT a.*,i.v FROM created a JOIN mapped m ON m.athlete_id=a.id CROSS JOIN incoming i
"""
    sql = sql[:sql.index('eligible AS MATERIALIZED (')] + new_eligible + sql[sql.index('), inserted AS ('):]
    start = sql.index('), updated AS (')
    end = sql.index('), history_audit AS (')
    sql = sql[:start] + """), updated AS (
 SELECT e.id,e.bio,e.slug FROM eligible e JOIN inserted n ON n.athlete_id=e.id
""" + sql[end:]
    sql = sql.replace("jsonb_build_object('biography',e.bio,'dateOfBirth',e.date_of_birth,'profileDetails',e.profile_details)", 'NULL')
    return sql


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--careers', type=pathlib.Path, required=True)
    parser.add_argument('--biographies', type=pathlib.Path, required=True)
    parser.add_argument('--output', type=pathlib.Path, required=True)
    parser.add_argument('--new-identity-reviews', type=pathlib.Path)
    args = parser.parse_args()
    bios = json.loads(args.biographies.read_text())
    reviews = json.loads(args.new_identity_reviews.read_text()) if args.new_identity_reviews else {}
    spec = importlib.util.spec_from_file_location('source_verifier', pathlib.Path(__file__).with_name('verify-world-athletics-careers.py'))
    verifier = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(verifier)
    args.output.mkdir(parents=True, exist_ok=True)
    for path in args.careers.glob('*/candidate.json'):
        verifier.verify(path)
        candidate = json.loads(path.read_text())
        external_id = candidate['history']['externalId']
        if external_id not in bios:
            continue  # Collected candidates can remain held while others are reviewed.
        (args.output / f'{external_id}.sql').write_text(prepare(candidate, bios[external_id], reviews.get(external_id)))
