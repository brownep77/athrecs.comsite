"""Private identity-screening snapshot. No emails, birth dates or credentials in output."""
import argparse
import datetime as dt
import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('common',ROOT/'scripts/create-private-archive-profiles.py')
common=importlib.util.module_from_spec(s);s.loader.exec_module(common)
s=importlib.util.spec_from_file_location('duv_import',ROOT/'scripts/import-private-duv-event.py')
importer=importlib.util.module_from_spec(s);s.loader.exec_module(importer)

if __name__=='__main__':
    p=argparse.ArgumentParser()
    for k in ('connection','approval','output'):p.add_argument('--'+k,type=Path,required=True)
    p.add_argument('--confirm-branch',required=True);a=p.parse_args()
    cfg,q=common.connection(a.connection,a.confirm_branch);approval=json.loads(a.approval.read_text())
    if cfg['projectId']!=approval['projectId']:raise ValueError('Wrong project')
    queries={k:v for k,v in common.QUERIES.items() if k in ('athletes','accounts')}
    queries['histories']='SELECT athlete_id,provider,external_id,source_url FROM athlete_source_histories ORDER BY athlete_id,provider,external_id'
    queries['duv-references']="SELECT id,regexp_matches(coalesce(profile_details::text,''),'(?:getresultperson[.]php[?]runner=)([0-9]+)','g') AS runner_ids FROM athletes WHERE profile_details::text LIKE '%getresultperson%'"
    queries['fingerprint']=common.fingerprint_sql()
    queries['history-fingerprint']=importer.HISTORY_FINGERPRINT
    queries['baseline']="SELECT (SELECT count(*) FROM athletes) AS athletes,(SELECT count(*) FROM athletes WHERE profile_visibility='public') AS public_profiles,(SELECT count(*) FROM results) AS canonical_results,(SELECT count(*) FROM athlete_account_links) AS account_links,(SELECT count(*) FROM athlete_source_histories) AS histories"
    rows=q([(v,[approval['batchId']] if k in ('fingerprint','history-fingerprint') else []) for k,v in queries.items()],True)
    a.output.mkdir(parents=True,exist_ok=True)
    for k,r in zip(queries,rows):common.dump(a.output/(k+'.json'),r)
    summary={'snapshotAt':dt.datetime.now(dt.timezone.utc).isoformat(),'projectId':cfg['projectId'],
      'branchId':cfg['branchId'],'counts':{k:len(r) for k,r in zip(queries,rows)}}
    common.dump(a.output/'snapshot.json',summary);print(json.dumps(summary))
