"""Read-only, revision-checked DUV recovery inputs; private output stays outside Git."""
import argparse, concurrent.futures, importlib.util, json, pathlib, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('private_db',ROOT/'scripts/create-private-archive-profiles.py')
db=importlib.util.module_from_spec(spec);spec.loader.exec_module(db)
p=argparse.ArgumentParser()
p.add_argument('--connection',type=pathlib.Path,required=True);p.add_argument('--branch',required=True);p.add_argument('--output',type=pathlib.Path,required=True)
a=p.parse_args();_,query=db.connection(a.connection,a.branch);a.output.mkdir(parents=True,exist_ok=True)
def read(sql,params=[]):return query([(sql,params)],True)[0]
def save(name,data):db.dump(a.output/(name+'.json'),data)
baseline=read('SELECT (SELECT version::text FROM result_archive_identity_clock WHERE singleton) revision,count(*)::int athletes,max(id)::int max_id FROM athletes')[0]
ath="""SELECT id,display_name,given_name,family_name,gender,race_entry_name,parent_athlete_id,source_url,extract(year from date_of_birth)::int AS birth_year,
jsonb_strip_nulls(jsonb_build_object('aliases',profile_details->'aliases','nameAliases',profile_details->'nameAliases','previous_names',profile_details->'previous_names','research_name_variants',profile_details->'research_name_variants','canonicalName',profile_details->'canonicalName','sourceName',profile_details->'sourceName','requestedName',profile_details->'requestedName','duvSourceObservation',jsonb_build_object('birthYear',profile_details#>'{duvSourceObservation,birthYear}'),'sourceIdentities',profile_details->'sourceIdentities')) AS profile_details
FROM athletes WHERE id>$1 AND id<=$2 ORDER BY id"""
def page(start):
 rows=read(ath,[start,start+12000]);save('athletes-'+str(start),rows);return len(rows)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 total=sum(pool.map(page,range(0,baseline['max_id'],12000)))
assert total==baseline['athletes'],'Directory count changed'
save('accounts',read('SELECT u.name,p.full_name,p.display_name,p.previous_names FROM "user" u LEFT JOIN athlete_private_profiles p ON p.user_id=u.id'))
save('histories',read("SELECT athlete_id,provider,external_id,source_url FROM athlete_source_histories WHERE provider ILIKE '%duv%' OR source_url LIKE '%statistik.d-u-v.org/getresultperson%'"))
save('job',read("SELECT id,approval_id,run_id,status,expires_at,configuration-'sourceDocuments' AS configuration FROM result_archive_import_jobs WHERE id='duv-2026-20261010'"))
matches=read("""SELECT m.* FROM result_archive_import_matches m JOIN result_archive_import_queue q USING(job_id,source_key) JOIN result_archive_source_captures c ON c.id=q.capture_id
WHERE m.job_id='duv-2026-20261010' AND m.status='held' AND m.reasons='["performance_requires_review"]'::jsonb
AND c.payload->'rows'->(m.source_row-1)->>'performanceDisplay' ~ '^[1-9][0-9]*d [0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]+)? h$' ORDER BY q.ordinal,m.source_row""")
save('matches',matches)
def capture(key):
 cap=read("""SELECT q.inventory,q.capture_id,c.payload_hash,c.html_sha256,c.captured_at,c.source_key,c.source_url,c.row_count,c.payload FROM result_archive_import_queue q JOIN result_archive_source_captures c ON c.id=q.capture_id WHERE q.job_id='duv-2026-20261010' AND q.source_key=$1""",[key])[0]
 docs=read("SELECT source_url,status,html_sha256,captured_at,encode(source_html_gzip,'hex') AS gzip_hex FROM result_archive_import_documents WHERE job_id='duv-2026-20261010' AND source_key=$1 ORDER BY source_url",[key])
 save('capture-'+key,{'capture':cap,'documents':docs});return len(docs)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:documents=sum(pool.map(capture,sorted(set(m['source_key'] for m in matches))))
end=read('SELECT version::text FROM result_archive_identity_clock WHERE singleton')[0]['version']
assert end==baseline['revision'],'Identity changed during snapshot; discard and repeat'
baseline.update(branchId=a.branch,candidates=len(matches),documents=documents)
save('manifest',baseline);print(json.dumps(baseline))
