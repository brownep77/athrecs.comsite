"""Seed an explicitly authorized, compared DUV annual inventory. Starts paused.

Run the migration on a review branch first. No network source requests, athlete
writes or job activation occur here. Keep connection/source files outside Git.
"""
import argparse,datetime as dt,gzip,hashlib,importlib.util,json,uuid
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('common',ROOT/'scripts/create-private-archive-profiles.py');common=importlib.util.module_from_spec(s);s.loader.exec_module(common)
JOB='duv-2026-20261010';PROVIDER='DUV Ultra Marathon Statistics'
if __name__=='__main__':
 p=argparse.ArgumentParser()
 for k in ('connection','source-directory','approval'):p.add_argument('--'+k,type=Path,required=True)
 p.add_argument('--confirm-branch',required=True);p.add_argument('--review',action='store_true');a=p.parse_args()
 cfg,q=common.connection(a.connection,a.confirm_branch);approval=json.loads(a.approval.read_text())
 if cfg['projectId']!=approval['projectId']:raise ValueError('Wrong project')
 if (cfg['branchId']==approval['branchId'])==a.review:raise ValueError('Wrong review/production target')
 inventory=json.loads((a.source_directory/'compared-inventory.json').read_text())
 if len({x['sourceUrl'] for x in inventory})!=len(inventory):raise ValueError('Duplicate inventory')
 run_id=str(uuid.uuid5(uuid.NAMESPACE_URL,JOB));rows=sum(int(x['index']['Finishers']) for x in inventory)
 config={'approvedAt':approval['approvedAt'],'instruction':approval['instruction'],'inventoryHash':common.sha(inventory),'sourceIntervalSeconds':21,'sourceDocuments':[]}
 for i in range(1,8):
  f=a.source_directory/('index-2026.html' if i==1 else f'index-2026-page-{i}.html');raw=f.read_bytes()
  config['sourceDocuments'].append({'url':'https://statistik.d-u-v.org/geteventlist.php?year=2026'+('' if i==1 else f'&page={i}'),'htmlSha256':hashlib.sha256(raw).hexdigest(),'sourceHtmlGzipHex':gzip.compress(raw,mtime=0).hex()})
 q([("INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,scope,evidence) VALUES($1,$2,$3,'owner_private_import','staff_only',$4::jsonb) ON CONFLICT DO NOTHING",[approval['id'],PROVIDER,approval['approvedBy'],json.dumps(approval)]),
  ("INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory,status) VALUES($1,$2,$3,$4::jsonb,'processing') ON CONFLICT DO NOTHING",[run_id,approval['id'],PROVIDER,json.dumps(inventory,ensure_ascii=False)]),
  ("INSERT INTO result_archive_import_jobs(id,provider,year,approval_id,run_id,status,inventory_count,expected_source_rows,expires_at,configuration) VALUES($1,$2,2026,$3,$4,'paused',$5,$6,'2026-10-17T23:59:59Z',$7::jsonb) ON CONFLICT DO NOTHING",[JOB,PROVIDER,approval['id'],run_id,len(inventory),rows,json.dumps(config)])])
 for start in range(0,len(inventory),2000):
  batch=[dict(v,ordinal=start+n+1,sourceKey='duv-'+v['sourceUrl'].split('event=')[1]) for n,v in enumerate(inventory[start:start+2000])]
  q([("INSERT INTO result_archive_import_queue(job_id,source_key,source_url,inventory,ordinal) SELECT $1,p->>'sourceKey',p->>'sourceUrl',p,(p->>'ordinal')::int FROM jsonb_array_elements($2::jsonb) p ON CONFLICT DO NOTHING",[JOB,json.dumps(batch,ensure_ascii=False)])])
 # Reuse exact source snapshots already acquired this session. No repeated fetch.
 for event in ('136563','136562','136564','132032','120902'):
  f=a.source_directory/f'event-{event}.html'
  if not f.exists():continue
  raw=f.read_bytes();headers=(a.source_directory/f'event-{event}.headers').read_text()
  import email.utils,re
  dates=re.findall(r'^date:\s*(.+)$',headers,re.I|re.M)
  captured=email.utils.parsedate_to_datetime(dates[-1].strip()).isoformat() if dates else dt.datetime.fromtimestamp(f.stat().st_mtime,dt.timezone.utc).isoformat()
  q([("UPDATE result_archive_import_queue SET source_html_gzip=decode($3,'hex'),html_sha256=$4,captured_at=$5 WHERE job_id=$1 AND source_key=$2 AND source_html_gzip IS NULL",[JOB,'duv-'+event,gzip.compress(raw,mtime=0).hex(),hashlib.sha256(raw).hexdigest(),captured])])
 print(json.dumps({'branchId':cfg['branchId'],'jobId':JOB,'status':'paused','events':len(inventory),'listedResults':rows}))
