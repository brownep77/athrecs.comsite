"""Exercise rollback/fingerprint protection on an explicitly selected review branch."""
import argparse
import copy
import importlib.util
import json
from pathlib import Path

s=importlib.util.spec_from_file_location('profiles',Path(__file__).with_name('create-private-archive-profiles.py'))
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
p=argparse.ArgumentParser()
p.add_argument('--connection',type=Path,required=True);p.add_argument('--confirm-branch',required=True);p.add_argument('--plan',type=Path,required=True)
a=p.parse_args();plan=json.loads(a.plan.read_text());approval=plan['approval']
if a.confirm_branch==approval['branchId']:raise ValueError('Transaction tests cannot run on production')
cfg,query=m.connection(a.connection,a.confirm_branch)
if cfg['projectId']!=approval['projectId']:raise ValueError('Wrong review project')
fixture=copy.deepcopy(plan['profiles'][0]);fixture['slug']='synthetic-archive-transaction-check';fixture['candidateId']='SYNTHETIC-ROLLBACK'
fixture['details']['archiveCreation']['batchId']='synthetic-rollback-test';fixture['details']['archiveCreation']['candidateId']=fixture['candidateId']
fixture['performances']=fixture['performances'][:1]
payload=json.dumps([fixture])
baseline=query([('SELECT count(*)::int AS n FROM athletes',[])],True)[0][0]['n']
for label,guard,params in [
 ('atomic profile/history/audit rollback','INSERT INTO archive_profile_guard VALUES(false)',[]),
 ('directory changed after screening','INSERT INTO archive_profile_guard SELECT fingerprint=$2 FROM ('+m.fingerprint_sql()+') f',[approval['batchId'],plan['snapshot']['fingerprint']]),
]:
 try:
  query([('CREATE TEMP TABLE archive_profile_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[]),(m.INSERT_SQL,[payload]),(guard,params)])
  raise AssertionError('Expected safety guard to abort')
 except RuntimeError as error:
  assert '23514' in str(error),str(error)
 after=query([('SELECT count(*)::int AS n FROM athletes',[]),("SELECT count(*)::int AS n FROM athletes WHERE slug=$1",[fixture['slug']]),("SELECT count(*)::int AS n FROM athlete_source_histories WHERE external_id=$1",['athrecs-archive:'+fixture['candidateId']]),("SELECT count(*)::int AS n FROM network_audit_log WHERE after_value->>'candidateId'=$1",[fixture['candidateId']])],True)
 assert after[0][0]['n']==baseline
 assert all(result[0]['n']==0 for result in after[1:])
 print(label+': passed')
