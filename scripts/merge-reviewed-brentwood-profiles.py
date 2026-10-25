"""Reversible, individually reviewed unclaimed source-profile consolidation.

No fuzzy identity decision is made here. A private reviewed manifest supplies
the exact before-state and independent evidence. Claimed profiles, unexpected
references, altered histories and repeated editions stop the transaction.
"""
import argparse,importlib.util,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('merge_import',ROOT/'brentwood-profile-import.py');imp=importlib.util.module_from_spec(s);s.loader.exec_module(imp)
FIELDS='id,display_name,slug,profile_visibility,parent_athlete_id,gender,profile_details,source_club_name,date_of_birth'
def run(args):
    cfg,q=imp.base.connection(args.connection,args.branch,timeout=180)
    if cfg['projectId']!=imp.PROJECT or args.publish!=(args.branch==imp.PROD):raise ValueError('Wrong branch / publication mode')
    m=json.loads(args.manifest.read_text());digest=imp.digest(m);keep=m['canonicalId'];drop=m['duplicateId'];ids=[keep,drop]
    if keep==drop or not m['evidence'] or len(m['matchedEditions'])<2:raise ValueError('Missing reviewed multi-edition evidence')
    if args.publish:
        rehearsal=json.loads(args.rehearsal.read_text())
        if not rehearsal.get('validated') or rehearsal.get('manifestHash')!=digest:raise ValueError('Manifest differs from rehearsal')
    prior=q([("SELECT after_value FROM network_audit_log WHERE action='athlete.reviewed_duplicate_consolidated' AND entity_id=$1",[m['batch']])],True)[0]
    if prior:
        if len(prior)!=1 or prior[0]['after_value']['manifestHash']!=digest:raise ValueError('Conflicting prior merge')
        verify(q,m);imp.dump(args.receipt,{'validated':True,'manifestHash':digest,'replayed':True,'canonicalId':keep,'duplicateId':drop,'branch':args.branch});return
    references=q([("SELECT c.conrelid::regclass::text table_name,att.attname column_name FROM pg_constraint c JOIN pg_attribute att ON att.attrelid=c.conrelid AND att.attnum=ANY(c.conkey) WHERE c.contype='f' AND c.confrelid='athletes'::regclass",[])],True)[0]
    if sorted(references,key=str)!=sorted(m['references'],key=str):raise ValueError('Athlete reference schema changed')
    before={int(x['id']):x for x in m['profiles']}
    if len(before)!=2 or set(before)!=set(ids):raise ValueError('Unexpected profiles')
    if any(x['profile_visibility']!='public' or x['parent_athlete_id'] for x in before.values()):raise ValueError('Visibility or parent conflict')
    expected=m['histories'];editions=[p['year'] for h in expected for p in h['performances']]
    if len(editions)!=len(set(editions)):raise ValueError('Repeated edition across profiles')
    canonical_details=before[keep]['profile_details'].copy()
    canonical_details['aliases']=sorted(set(canonical_details.get('aliases',[])+[x['display_name'] for x in before.values()]))
    review={'batchId':m['batch'],'canonicalId':keep,'duplicateId':drop,'manifestHash':digest,'evidence':m['evidence'],'accountOwnershipVerified':False}
    canonical_details['brentwoodMergeReview']=review
    duplicate_details=before[drop]['profile_details'].copy();duplicate_details['brentwoodMergeReview']=review
    sqls=[("SET LOCAL lock_timeout='10s'",[]),("SET LOCAL statement_timeout='110s'",[]),('SELECT id FROM athletes WHERE id=ANY($1::int[]) ORDER BY id FOR UPDATE',[ids]),('LOCK TABLE athlete_source_histories,athlete_identifiers,slug_redirects IN SHARE ROW EXCLUSIVE MODE',[]),('CREATE TEMP TABLE merge_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP',[])]
    sqls.append(('INSERT INTO merge_guard SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY id),\'[]\'::jsonb)=$2::jsonb FROM (SELECT '+FIELDS+' FROM athletes WHERE id=ANY($1::int[])) a',[ids,json.dumps(sorted(m['profiles'],key=lambda x:x['id']))]))
    sqls.append(("INSERT INTO merge_guard SELECT coalesce(jsonb_agg(jsonb_build_object('athlete_id',athlete_id,'provider',provider,'external_id',external_id,'performances',performances) ORDER BY athlete_id,provider,external_id),'[]'::jsonb)=$2::jsonb FROM athlete_source_histories WHERE athlete_id=ANY($1::int[])",[ids,json.dumps(expected)]))
    sqls.append(("INSERT INTO merge_guard SELECT coalesce(jsonb_agg(jsonb_build_object('number',number::text,'athlete_id',athlete_id,'user_id',user_id) ORDER BY athlete_id),'[]'::jsonb)=$2::jsonb FROM athlete_identifiers WHERE athlete_id=ANY($1::int[])",[ids,json.dumps(m['identifiers'])]))
    for ref in references:
        table=ref['table_name'];column=ref['column_name']
        if not re.fullmatch('[a-z_]+',table) or not re.fullmatch('[a-z_]+',column):raise ValueError('Unexpected SQL identifier')
        if table in {'athlete_source_histories','athlete_identifiers'}:continue
        sqls.append((f'INSERT INTO merge_guard SELECT count(*)=0 FROM {table} WHERE {column}=ANY($1::int[])',[ids]))
    sqls += [
      ("INSERT INTO merge_guard SELECT count(*)=0 FROM slug_redirects WHERE entity_type='athlete' AND old_slug=ANY($1::text[])",[m['redirectSlugs']]),
      ('UPDATE athlete_source_histories SET athlete_id=$1 WHERE athlete_id=$2 RETURNING external_id',[keep,drop]),
      ('UPDATE athletes SET profile_details=$2::jsonb WHERE id=$1',[keep,json.dumps(canonical_details)]),
      ("UPDATE athletes SET profile_visibility='private',parent_athlete_id=$2,profile_details=$3::jsonb WHERE id=$1",[drop,keep,json.dumps(duplicate_details)]),
      ("INSERT INTO slug_redirects(entity_type,entity_id,old_slug,current_slug) SELECT 'athlete',$1,x,$2 FROM unnest($3::text[]) x",[keep,before[keep]['slug'],m['redirectSlugs']]),
      ("INSERT INTO network_audit_log(actor_email,action,entity_type,entity_id,before_value,after_value,note) VALUES('paul@athrecs.com','athlete.reviewed_duplicate_consolidated','athlete',$1,$2::jsonb,$3::jsonb,'Owner requested duplicate resolution. Independently compared personal running log and club reports across three Brentwood editions. Source rows and identifiers retained; duplicate profile retired reversibly. No account ownership or verification upgrade.')",[m['batch'],json.dumps(m),json.dumps({'manifestHash':digest,'canonicalId':keep,'duplicateId':drop,'movedHistories':len([h for h in expected if h['athlete_id']==drop])})])]
    q(sqls);verify(q,m)
    receipt={'validated':True,'manifestHash':digest,'replayed':False,'canonicalId':keep,'duplicateId':drop,'movedHistories':len([h for h in expected if h['athlete_id']==drop]),'branch':args.branch,'originalIdentifierRetained':True,'originalSourceRowsUnchanged':True,'redirects':m['redirectSlugs']}
    imp.dump(args.receipt,receipt);print(json.dumps(receipt))
def verify(q,m):
    keep=m['canonicalId'];drop=m['duplicateId']
    rows=q([('SELECT athlete_id,provider,external_id,performances FROM athlete_source_histories WHERE athlete_id=ANY($1::int[]) ORDER BY athlete_id,provider,external_id',[[keep,drop]]),('SELECT id,profile_visibility,parent_athlete_id FROM athletes WHERE id=ANY($1::int[]) ORDER BY id',[[keep,drop]]),("SELECT old_slug,current_slug,entity_id FROM slug_redirects WHERE entity_type='athlete' AND old_slug=ANY($1::text[]) ORDER BY old_slug",[m['redirectSlugs']])],True)
    expected=sorted([{**h,'athlete_id':keep} for h in m['histories']],key=lambda h:(h['athlete_id'],h['provider'],h['external_id']))
    if rows[0]!=expected:raise ValueError('Merged source histories differ')
    byid={x['id']:x for x in rows[1]}
    if byid[keep]['profile_visibility']!='public' or byid[drop]['profile_visibility']!='private' or byid[drop]['parent_athlete_id']!=keep:raise ValueError('Merged profile status differs')
    slug=next(x['slug'] for x in m['profiles'] if x['id']==keep)
    if len(rows[2])!=len(m['redirectSlugs']) or any(x['entity_id']!=keep or x['current_slug']!=slug for x in rows[2]):raise ValueError('Redirect differs')
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    for key in ['connection','manifest','receipt']:ap.add_argument('--'+key,type=pathlib.Path,required=True)
    ap.add_argument('--branch',required=True);ap.add_argument('--publish',action='store_true');ap.add_argument('--rehearsal',type=pathlib.Path);run(ap.parse_args())
