"""Replace qualified 2026 club results with compared primary timing fields.

Exact prior histories, ownership and visibility are transactional guards.
Replays compare the complete final history; no athlete facts are overwritten.
"""
import argparse,json,pathlib,importlib.util
ROOT=pathlib.Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('continuation_apply',ROOT/'apply-brentwood-resolution.py');a=importlib.util.module_from_spec(s);s.loader.exec_module(a)
BATCH='brentwood-continuation-20261025'
def run(args):
    a.configure(BATCH);cfg,q=a.a.base.connection(args.connection,args.branch,timeout=180)
    if cfg['projectId']!=a.a.imp.PROJECT or args.publish!=(args.branch==a.a.imp.PROD):raise ValueError('Wrong publication target')
    plan=json.loads(args.plan.read_text());rows=plan['enrichments'];ph=a.a.imp.digest(plan)
    if args.publish:
        old=json.loads(args.rehearsal.read_text())
        if not old.get('validated') or old['planHash']!=ph:raise ValueError('Enrichment plan differs from rehearsal')
    body=json.dumps(rows,ensure_ascii=False)
    match="""FROM incoming JOIN athlete_source_histories h ON h.provider=$2 AND h.external_id=p->>'externalId' AND h.athlete_id=(p->>'athleteId')::bigint
 JOIN athletes a ON a.id=h.athlete_id
 WHERE a.display_name=p->>'expectedName' AND a.profile_details=p->'expectedDetails'
 AND a.profile_visibility='public' AND a.parent_athlete_id IS NULL AND h.published_at IS NOT NULL
 AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id AND l.status='active')
 AND NOT EXISTS(SELECT 1 FROM athlete_profile_history_choices c WHERE c.athlete_id=a.id AND c.excluded)
 AND (h.performances=p->'oldPerformances' OR h.performances=p->'newPerformances')"""
    guard="WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb)) INSERT INTO brentwood_enrichment_guard SELECT count(*)=jsonb_array_length($1::jsonb) "+match
    update="""WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb)), changed AS (
 UPDATE athlete_source_histories h SET performances=p->'newPerformances'
 FROM incoming WHERE h.provider=$2 AND h.external_id=p->>'externalId' AND h.athlete_id=(p->>'athleteId')::bigint AND h.performances=p->'oldPerformances'
 RETURNING h.athlete_id,h.external_id,p), audits AS (
 INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,before_value,after_value,note)
 SELECT 'paul@athrecs.com','athlete.history_admin_enriched','athlete_source_history',$2||':'||external_id,
 jsonb_build_object('athleteId',athlete_id,'performances',p->'oldPerformances'),
 jsonb_build_object('athleteId',athlete_id,'performances',p->'newPerformances','batchId',$3::text),
 'Owner-authorized Brentwood continuation: club result matched to unique primary row by name/known variant, edition and exact time; original evidence retained; identity and ownership unchanged.'
 FROM changed RETURNING id)
 SELECT (SELECT count(*) FROM changed)::int histories,(SELECT count(*) FROM audits)::int audits"""
    result=q([("SET LOCAL lock_timeout='10s'",[]),('LOCK TABLE athletes,athlete_source_histories,athlete_account_links,athlete_profile_history_choices IN SHARE ROW EXCLUSIVE MODE',[]),('CREATE TEMP TABLE brentwood_enrichment_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),(guard,[body,a.a.PROVIDER]),(update,[body,a.a.PROVIDER,BATCH])])[-1][0]
    actual=q([('SELECT athlete_id,external_id,performances,published_at FROM athlete_source_histories WHERE provider=$1 AND external_id=ANY($2::text[])',[a.a.PROVIDER,[x['externalId'] for x in rows]])],True)[0]
    ix={x['external_id']:x for x in actual}
    if len(ix)!=len(rows) or any(ix[x['externalId']]['performances']!=x['newPerformances'] or not ix[x['externalId']]['published_at'] for x in rows):raise ValueError('Stored enrichment differs')
    receipt={'batch':BATCH,'branch':args.branch,'planHash':ph,'updatedHistories':result['histories'],'audits':result['audits'],'comparedHistories':len(rows),'comparedResults':sum(len(x['rows']) for x in rows),'validated':True}
    a.a.save(args.receipt,receipt);print(json.dumps(receipt),flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['connection','plan','receipt']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    ap.add_argument('--rehearsal',type=pathlib.Path);ap.add_argument('--branch',required=True);ap.add_argument('--publish',action='store_true');run(ap.parse_args())
