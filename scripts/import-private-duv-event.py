"""Atomically import one independently compared DUV event and screened profiles.

Requires an explicit branch connection, unchanged private plan and source HTML.
Run on a copied branch, repeat to test idempotency, then on production. Holds do
not create profiles. Published profiles, canonical results and claims are untouched.
"""
import argparse
import gzip
import importlib.util
import json
import uuid
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def module(name,file):
    s=importlib.util.spec_from_file_location(name,ROOT/'scripts'/file)
    m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
common=module('common','create-private-archive-profiles.py')
capture_parser=module('duv','prepare-private-duv-capture.py')

HISTORY_FINGERPRINT="""SELECT md5(coalesce(string_agg(md5(row_to_json(h)::text),'' ORDER BY h.athlete_id,h.provider,h.external_id),'')) AS fingerprint
 FROM athlete_source_histories h JOIN athletes a ON a.id=h.athlete_id
 WHERE a.profile_details #>> '{archiveCreation,batchId}' IS DISTINCT FROM $1"""

INSERT=common.INSERT_SQL.replace("'Total Race Timing'","'DUV Ultra Marathon Statistics'").replace("'athrecs-archive:'||(p->>'candidateId')","'duv:runner-'||(p->>'sourceAthleteId')")
VERIFY=common.VERIFY_SQL.replace("'Total Race Timing'","'DUV Ultra Marathon Statistics'").replace("'athrecs-archive:'||(p->>'candidateId')","'duv:runner-'||(p->>'sourceAthleteId')")


def apply(args):
    cfg,query=common.connection(args.connection,args.confirm_branch)
    plan=json.loads(args.plan.read_text());expected=plan.pop('planHash')
    if common.sha(plan)!=expected:raise ValueError('Plan changed')
    approval=plan['approval'];capture=json.loads(args.capture.read_text());raw=args.html.read_bytes()
    if common.sha(capture)!=plan['captureHash']:raise ValueError('Capture changed')
    compared=capture_parser.parse(raw,args.index.read_bytes(),capture['sourceUrl'],capture['capturedAt'])
    if compared!=capture:raise ValueError('Strict independent comparison differs')
    if cfg['projectId']!=approval['projectId']:raise ValueError('Wrong project')
    if args.review and cfg['branchId']==approval['branchId']:raise ValueError('Review cannot target production')
    if not args.review and cfg['branchId']!=approval['branchId']:raise ValueError('Wrong production branch')
    if approval['scope']!='staff_only' or approval['approvalBasis']!='owner_private_import':raise ValueError('Private owner approval required')
    if capture['publication']!='staff_only' or capture['audit']['sourceCheck']!='compared':raise ValueError('Uncompared/private capture')
    payload=json.dumps(capture,ensure_ascii=False,separators=(',',':'))
    people=json.dumps(plan['profiles'],ensure_ascii=False,separators=(',',':'))
    run_id=str(uuid.uuid5(uuid.NAMESPACE_URL,approval['id']+':'+capture['sourceKey']+':'+plan['captureHash']))
    statements=[("SET LOCAL lock_timeout='5s'",[]),("SET LOCAL statement_timeout='60s'",[]),
      ('LOCK TABLE athletes,clubs,athlete_clubs,"user",athlete_private_profiles,athlete_account_links,results,result_source_references,athlete_source_histories,result_archive_source_captures,result_archive_capture_approvals,result_archive_capture_runs IN SHARE ROW EXCLUSIVE MODE',[]),
      ('CREATE TEMP TABLE duv_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),
      ('INSERT INTO duv_guard SELECT fingerprint=$2 FROM ('+common.fingerprint_sql()+') f',[approval['batchId'],plan['fingerprint']]),
      ('INSERT INTO duv_guard SELECT fingerprint=$2 FROM ('+HISTORY_FINGERPRINT+') f',[approval['batchId'],plan['historyFingerprint']]),
      ("""INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,scope,evidence)
       VALUES($1,$2,$3,'owner_private_import','staff_only',$4::jsonb) ON CONFLICT(id) DO NOTHING""",
       [approval['id'],capture['provider'],approval['approvedBy'],json.dumps(approval)]),
      ("""INSERT INTO duv_guard SELECT count(*)=1 FROM result_archive_capture_approvals WHERE id=$1 AND provider=$2
       AND scope='staff_only' AND approval_basis='owner_private_import' AND evidence=$3::jsonb AND revoked_at IS NULL""",
       [approval['id'],capture['provider'],json.dumps(approval)]),
      ("""INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory,summary,status)
       VALUES($1::uuid,$2,$3,$4::jsonb,$5::jsonb,'completed') ON CONFLICT(id) DO NOTHING""",
       [run_id,approval['id'],capture['provider'],json.dumps([{'sourceKey':capture['sourceKey'],'sourceUrl':capture['sourceUrl']}]),
        json.dumps({'pages':1,'rows':len(capture['rows']),'year':int(capture['index']['date'][:4]),'profilePlanHash':expected,'profileSummary':plan['summary'],'held':plan['held']})]),
      ("""INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
       VALUES($1::uuid,$2,$3,$4,$5,$6,$7,decode($8,'hex'),$9::jsonb,$10,'compared',$11::jsonb,$12::timestamptz)
       ON CONFLICT(provider,source_key,payload_hash) DO NOTHING""",
       [run_id,approval['id'],capture['provider'],capture['sourceKey'],capture['sourceUrl'],plan['captureHash'],capture['htmlSha256'],gzip.compress(raw,mtime=0).hex(),payload,len(capture['rows']),json.dumps(capture['audit']),capture['capturedAt']]),
      ("""INSERT INTO duv_guard SELECT count(*)=1 FROM result_archive_source_captures c
       WHERE provider=$1 AND source_key=$2 AND payload_hash=$3 AND payload=$4::jsonb AND html_sha256=$5 AND source_check='compared'
       AND source_html_gzip=decode($6,'hex') AND row_count=$7 AND approval_id=$8 AND run_id=$9::uuid""",
       [capture['provider'],capture['sourceKey'],plan['captureHash'],payload,capture['htmlSha256'],gzip.compress(raw,mtime=0).hex(),len(capture['rows']),approval['id'],run_id]),
      (INSERT,[people]),
      ('INSERT INTO duv_guard SELECT count(*)=jsonb_array_length($1::jsonb) FROM ('+VERIFY+') v',[people]),
      (VERIFY,[people]),
      ("SELECT id,provider,source_key,row_count,html_sha256,payload_hash FROM result_archive_source_captures WHERE provider=$1 AND source_key=$2 AND payload_hash=$3",[capture['provider'],capture['sourceKey'],plan['captureHash']]),
      ("""INSERT INTO duv_guard SELECT
       (SELECT count(*) FROM results)=$1 AND
       (SELECT count(*) FROM athletes WHERE profile_visibility='public')=$2 AND
       (SELECT count(*) FROM athlete_account_links)=$3 AND
       (SELECT count(*) FROM athletes)=$4 AND
       (SELECT count(*) FROM athlete_source_histories)=$5""",
       [int(plan['baseline']['canonical_results']),int(plan['baseline']['public_profiles']),int(plan['baseline']['account_links']),
        int(plan['baseline']['athletes'])+len(plan['profiles']),int(plan['baseline']['histories'])+len(plan['profiles'])])]
    result=query(statements)
    receipt={'branchId':cfg['branchId'],'runId':run_id,'planHash':expected,'summary':plan['summary'],
        'inserted':result[-5][0],'profiles':result[-3],'capture':result[-2][0],
        'verified':{'privateUnclaimedProfiles':True,'unverifiedUnpublishedHistories':True,'rawHtmlAndAllSourceCellsStored':True,
                    'canonicalResultsUnchanged':True,'publicProfileCountUnchanged':True,'accountLinksUnchanged':True}}
    args.receipt.write_text(json.dumps(receipt,ensure_ascii=False,separators=(',',':')))
    print(json.dumps({k:receipt[k] for k in ('branchId','summary','inserted','capture','verified')}))

if __name__=='__main__':
    p=argparse.ArgumentParser()
    for k in ('connection','plan','capture','html','index','receipt'):p.add_argument('--'+k,type=Path,required=True)
    p.add_argument('--confirm-branch',required=True);p.add_argument('--review',action='store_true')
    apply(p.parse_args())
