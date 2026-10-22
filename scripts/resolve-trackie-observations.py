"""Append individually reviewed Trackie holds to public, unclaimed source profiles.

Private plans, source PDFs, comparisons and receipts must remain outside git.
This uses the supervised publisher's copied-branch rehearsal and unchanged-plan
production receipt. It never creates identities, claims, clubs or meetings.
"""
import argparse
import importlib.util
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('trackie', ROOT / 'publish-trackie-profiles.py')
t = importlib.util.module_from_spec(spec)
spec.loader.exec_module(t)


def validate(plan):
    if plan['batchId'] != 'trackie-review-20261022-batch5':
        raise ValueError('Unexpected reviewed batch')
    seen = set()
    if len({p['athleteId'] for p in plan['profiles']}) != len(plan['profiles']):
        raise ValueError('Duplicate target profile')
    held = {(key, row) for h in plan['originalHolds']
            for key, row in (h.get('locators') or [[h['sourceKey'], h['sourceRow']]])}
    for p in plan['profiles']:
        if p['before']['provider'] != 'Trackie' or not p['before']['published_at']:
            raise ValueError('Only existing published Trackie histories are supported')
        if p['before']['athlete_id'] != p['athleteId']:
            raise ValueError('History target differs')
        if p['after'] != p['before']['performances'] + p['additions']:
            raise ValueError('Existing performances must remain byte-equivalent JSON')
        if not p['additions'] or not p['identityEvidence']['sourceRowsCompared']:
            raise ValueError('Missing reviewed source evidence')
        for h in p['additions']:
            key = tuple(h['sourceKeys'])
            if key in seen or h['verificationStatus'] != 'unverified':
                raise ValueError('Duplicate source row or changed verification')
            seen.add(key)
            ref = h['archiveReference']
            if (ref['sourceKey'], ref['sourceRow']) not in held:
                raise ValueError('Observation was not in the original held batch')
            if ref['identityVerified'] is not False:
                raise ValueError('Source-profile matching does not verify ownership')
            if not any(r['sourceKey'] == ref['sourceKey'] and r['row']['sourceRow'] == ref['sourceRow']
                       and r['row']['performance'] == h['performance']
                       and r['row']['sourcePlace'] == h['place']
                       and r['row']['date'] == h['date']
                       and r['row']['tableKey'] == h['competitionName']
                       and r['row']['club'] == h['sourceClub']
                       and r['row']['bib'] == h['bib']
                       and r['row']['status'] == h['sourceStatus']
                       and r['row']['finishSeconds'] == h['finishSeconds']
                       and r['row']['original'] == ref['original'] for r in p['sourceRows']):
                raise ValueError('Performance differs from reviewed original observation')
    if len(seen) != plan['summary']['newResults'] or len(plan['profiles']) != plan['summary']['updatedProfiles']:
        raise ValueError('Plan counts differ')


GUARDS = [
    """INSERT INTO trackie_review_guard SELECT EXISTS(
      SELECT 1 FROM network_audit_log a CROSS JOIN trackie_review_plan
      WHERE a.id=(p->>'originalAuditId')::bigint AND a.action='trackie.graph_published'
      AND a.entity_id='trackie-public-20261021-batch5' AND a.after_value->'held'=p->'originalHolds')""",
    """INSERT INTO trackie_review_guard SELECT NOT EXISTS(
      SELECT 1 FROM network_audit_log WHERE action='trackie.held_resolved' AND entity_id=(SELECT p->>'batchId' FROM trackie_review_plan))""",
    """INSERT INTO trackie_review_guard SELECT count(*)=(SELECT jsonb_array_length(p->'profiles') FROM trackie_review_plan)
      FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x
      JOIN athletes a ON a.id=(x->>'athleteId')::int
      JOIN athlete_source_histories h ON h.athlete_id=a.id AND h.provider='Trackie'
      WHERE to_jsonb(h)=x->'before' AND to_jsonb(a)=x->'athleteBefore'
      AND a.profile_visibility='public' AND h.published_at IS NOT NULL
      AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
      AND NOT EXISTS(SELECT 1 FROM result_claims c WHERE c.athlete_id=a.id)
      AND NOT EXISTS(SELECT 1 FROM athlete_claim_invitations i WHERE i.athlete_id=a.id AND i.revoked_at IS NULL)""",
    """INSERT INTO trackie_review_guard SELECT NOT EXISTS(
      SELECT 1 FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x
      CROSS JOIN LATERAL jsonb_array_elements(x->'sourceRows') r
      WHERE NOT EXISTS(SELECT 1 FROM result_archive_source_captures c
        WHERE c.id=(r->>'captureId')::bigint AND c.provider='Trackie' AND c.source_check='compared'
        AND c.payload_hash=r->>'payloadHash' AND c.html_sha256=r->>'sourceSha256'
        AND c.payload->'rows' @> jsonb_build_array(r->'row')) )""",
    """INSERT INTO trackie_review_guard SELECT NOT EXISTS(
      SELECT 1 FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'supportCaptures') r
      WHERE NOT EXISTS(SELECT 1 FROM result_archive_source_captures c WHERE c.id=(r->>'id')::bigint
      AND c.payload_hash=r->>'payload_hash' AND c.html_sha256=r->>'html_sha256' AND c.source_check='compared'))""",
    """INSERT INTO trackie_review_guard SELECT NOT EXISTS(
      SELECT 1 FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x
      CROSS JOIN LATERAL jsonb_array_elements(x->'additions') h
      JOIN athlete_source_histories old ON old.provider='Trackie'
      CROSS JOIN LATERAL jsonb_array_elements(old.performances) v
      WHERE v->'sourceKeys' ? (h->'sourceKeys'->>0))""",
    """INSERT INTO trackie_review_guard SELECT NOT EXISTS(
      SELECT 1 FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x
      CROSS JOIN LATERAL jsonb_array_elements(x->'additions') h JOIN results r
      ON r.result_details #>> '{archiveReference,sourceKey}'=h #>> '{archiveReference,sourceKey}'
      AND r.result_details #>> '{archiveReference,sourceRow}'=h #>> '{archiveReference,sourceRow}'
      WHERE r.result_source='Trackie')""",
    """INSERT INTO trackie_review_guard SELECT count(*)=(SELECT (p->'summary'->>'newResults')::int FROM trackie_review_plan)
      FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x
      CROSS JOIN LATERAL jsonb_array_elements(x->'additions') h
      JOIN events e ON e.slug=h->>'eventSlug'
      JOIN editions d ON d.event_id=e.id AND d.event_date=(h->>'date')::date AND d.distance_code=h->>'competitionName'
      WHERE NOT EXISTS(SELECT 1 FROM results r WHERE r.athlete_id=(x->>'athleteId')::int AND r.edition_id=d.id)""",
]

UPDATE = """UPDATE athlete_source_histories h SET performances=x->'after'
FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x
WHERE h.athlete_id=(x->>'athleteId')::int AND h.provider='Trackie'"""

INSERT = """INSERT INTO results(edition_id,athlete_id,status,finish_time_seconds,overall_place,category,bib,result_source,source_url,result_visibility,result_details)
SELECT d.id,(x->>'athleteId')::int,CASE WHEN h->>'performance' ~ '^([0-9]+:)*[0-9]+([.][0-9]+)?m?$' THEN 'finished' ELSE h->>'performance' END,
NULL,NULL,nullif(h->>'ageGroup',''),nullif(h->>'bib',''),'Trackie',h->'sourceUrls'->>0,'public',
jsonb_build_object('verificationStatus','unverified','profileExcluded',true,'reportedPerformance',h->>'performance','reportedPlace',h->>'place',
'sourceClub',h->>'sourceClub','qualification',h->>'notes','archiveReference',h->'archiveReference',
'batchId',p->>'batchId','originalBatchId','trackie-public-20261021-batch5','profileDisplay','athlete_source_histories')
FROM trackie_review_plan CROSS JOIN LATERAL jsonb_array_elements(p->'profiles') x
CROSS JOIN LATERAL jsonb_array_elements(x->'additions') h JOIN events e ON e.slug=h->>'eventSlug'
JOIN editions d ON d.event_id=e.id AND d.event_date=(h->>'date')::date AND d.distance_code=h->>'competitionName'"""


def readback(q, plan):
    ids = [p['athleteId'] for p in plan['profiles']]
    histories, results, athletes = q([
        ('SELECT to_jsonb(h) data FROM athlete_source_histories h WHERE athlete_id=ANY($1::int[]) AND provider=\'Trackie\'', [ids]),
        ("SELECT r.athlete_id,r.result_details,d.event_date::text,d.distance_code FROM results r JOIN editions d ON d.id=r.edition_id WHERE r.result_details->>'batchId'=$1", [plan['batchId']]),
        ('SELECT to_jsonb(a) data FROM athletes a WHERE id=ANY($1::int[])', [ids]),
    ], True)
    hs = {r['data']['athlete_id']: r['data'] for r in histories}
    ats = {r['data']['id']: r['data'] for r in athletes}
    for p in plan['profiles']:
        expected = {**p['before'], 'performances': p['after']}
        if hs[p['athleteId']] != expected or ats[p['athleteId']] != p['athleteBefore']:
            raise ValueError('Independent exact history/profile readback differs')
    expected = {(p['athleteId'], h['date'], h['competitionName']): h for p in plan['profiles'] for h in p['additions']}
    if len(results) != len(expected):
        raise ValueError('Canonical result count differs')
    for r in results:
        h = expected.pop((r['athlete_id'], r['event_date'], r['distance_code']))
        detail = r['result_details']
        if (detail['reportedPerformance'], detail['reportedPlace'], detail['archiveReference']) != (h['performance'], h['place'], h['archiveReference']):
            raise ValueError('Canonical result changed source values')
        if detail['verificationStatus'] != 'unverified' or detail['profileExcluded'] is not True:
            raise ValueError('Canonical result eligibility differs')
    if expected:
        raise ValueError('Missing canonical results')
    return {'updatedProfiles': len(histories), 'newResults': len(results), 'exactReadback': True}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--plan', type=pathlib.Path, required=True)
    ap.add_argument('--connection', type=pathlib.Path, required=True)
    ap.add_argument('--confirm-branch', required=True)
    ap.add_argument('--receipt', type=pathlib.Path, required=True)
    ap.add_argument('--review-receipt', type=pathlib.Path)
    ap.add_argument('--publish', action='store_true')
    ap.add_argument('--readback-only', action='store_true')
    args = ap.parse_args()
    plan = json.loads(args.plan.read_text())
    validate(plan)
    plan_hash = t.digest(plan)
    cfg, q = t.w.base.connection(args.connection, args.confirm_branch, 180)
    if cfg['projectId'] != t.w.PROJECT:
        raise ValueError('Wrong project')
    if args.readback_only:
        print(json.dumps(readback(q, plan)))
        return
    if args.publish:
        review = json.loads(args.review_receipt.read_text()) if args.review_receipt else {}
        if cfg['branchId'] != t.w.PROD or review.get('planHash') != plan_hash or not review.get('exactReadback') or review.get('branchId') == t.w.PROD:
            raise ValueError('Production requires an unchanged independently checked rehearsal')
    elif cfg['branchId'] == t.w.PROD:
        raise ValueError('Rehearsal cannot write production')
    statements = [
        ("SET LOCAL lock_timeout='8s'", []), ("SET LOCAL statement_timeout='150s'", []),
        ('LOCK TABLE athletes,"user",athlete_private_profiles,athlete_account_links,athlete_source_histories,results,result_claims,athlete_claim_invitations IN SHARE ROW EXCLUSIVE MODE', []),
        ('CREATE TEMP TABLE trackie_review_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP', []),
        ('INSERT INTO trackie_review_guard SELECT fingerprint=$2 FROM (' + t.w.FP + ') f', [0, plan['directoryFingerprint']]),
        ('CREATE TEMP TABLE trackie_review_plan(p jsonb) ON COMMIT DROP', []),
        ('INSERT INTO trackie_review_plan VALUES($1::jsonb)', [json.dumps(plan, ensure_ascii=False)]),
    ]
    statements += [(sql, []) for sql in GUARDS]
    statements += [(UPDATE, []), (INSERT, [])]
    statements += [(
        "INSERT INTO trackie_review_guard SELECT count(*)=(SELECT (p->'summary'->>'newResults')::int FROM trackie_review_plan) FROM results WHERE result_details->>'batchId'=$1", [plan['batchId']]),
        ("INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,before_value,after_value,note) VALUES('paul@athrecs.com','trackie.held_resolved','import_batch',$1,$2::jsonb,$3::jsonb,$4)",
         [plan['batchId'], json.dumps({'originalAuditId': plan['originalAuditId'], 'profiles': [{'athleteId': p['athleteId'], 'history': p['before']} for p in plan['profiles']]}),
          json.dumps({'planHash': plan_hash, 'plan': plan, 'summary': plan['summary']}), plan['instruction']]),
    ]
    q(statements)
    receipt = {'branchId': cfg['branchId'], 'planHash': plan_hash, **readback(q, plan)}
    args.receipt.write_text(json.dumps(receipt, indent=2))
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
