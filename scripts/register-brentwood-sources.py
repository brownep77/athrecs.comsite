"""Register inspected sources as manual-only; never enable a collector."""
import argparse,importlib.util,json,pathlib
s=importlib.util.spec_from_file_location('imp',pathlib.Path(__file__).with_name('brentwood-profile-import.py'));imp=importlib.util.module_from_spec(s);s.loader.exec_module(imp)
p=argparse.ArgumentParser();p.add_argument('--connection',type=pathlib.Path,required=True);p.add_argument('--branch',required=True);p.add_argument('--sources',type=pathlib.Path,required=True);p.add_argument('--receipt',type=pathlib.Path,required=True);p.add_argument('--publish',action='store_true');args=p.parse_args()
cfg,q=imp.base.connection(args.connection,args.branch)
if cfg['projectId']!=imp.PROJECT or args.publish!=(args.branch==imp.PROD):raise ValueError('Wrong target')
rows=json.loads(args.sources.read_text());sql="""WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb))
INSERT INTO managed_fixture_sources(source_id,source_name,start_url,canonical_start_url,source_type,requested_enabled,enabled,source_section,region_scope,country_focus,coverage_scope,coverage_start_year,coverage_end_year,surface_scope,timing_scope,chip_timed_status,allowed_domains,profile,follow_history_links,max_pages,rate_limit_seconds,rights_status,notes,review_status,duplicate_status,imported_by,reviewed_by,reviewed_at,review_note)
SELECT p->>'source_id',p->>'source_name',p->>'start_url',p->>'start_url','directory',false,false,p->>'source_section',p->>'region_scope',p->>'country_focus',p->>'coverage_scope',(p->>'coverage_start_year')::int,(p->>'coverage_end_year')::int,p->>'surface_scope',p->>'timing_scope',p->>'chip_timed_status',p->>'allowed_domains','generic',false,1,2.0,p->>'rights_status',p->>'notes','manual_only','new','paul@athrecs.com','paul@athrecs.com',now(),'Owner-requested Brentwood research; capability inspected, automated collection remains disabled.'
FROM incoming WHERE NOT EXISTS(SELECT 1 FROM managed_fixture_sources s WHERE s.source_id=p->>'source_id' OR s.canonical_start_url=p->>'start_url')
ON CONFLICT DO NOTHING RETURNING source_id,enabled,review_status"""
created=q([(sql,[json.dumps(rows)])])[0];stored=q([('SELECT source_id,enabled,review_status FROM managed_fixture_sources WHERE source_id=ANY($1::text[])',[[r['source_id'] for r in rows]])],True)[0]
if len(stored)!=len(rows) or any(r['enabled'] for r in stored):raise ValueError('Source registration check failed')
imp.dump(args.receipt,{'branch':args.branch,'created':created,'stored':stored});print(json.dumps({'created':len(created),'manualSources':len(stored),'collectorsEnabled':0}))
