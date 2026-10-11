import { Directory } from './identity.mjs';

// All pages, account aliases and DUV associations come from one snapshot.
// The writer still checks this snapshot's identity revision under its lock.
const pageSize=5000;
const athleteSql=`SELECT id,display_name,given_name,family_name,gender,race_entry_name,parent_athlete_id,source_url,
 extract(year from date_of_birth)::int AS birth_year,
 jsonb_build_object('aliases',profile_details->'aliases','nameAliases',profile_details->'nameAliases','previous_names',profile_details->'previous_names',
  'research_name_variants',profile_details->'research_name_variants','canonicalName',profile_details->'canonicalName','sourceName',profile_details->'sourceName','requestedName',profile_details->'requestedName',
  'duvSourceObservation',profile_details->'duvSourceObservation','sourceIdentities',profile_details->'sourceIdentities') AS profile_details
 FROM athletes WHERE ($1::int IS NULL OR id>$1) ORDER BY id LIMIT $2`;

export async function loadDirectory(client,{deadline,now=Date.now}={}){
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try{
  const version=(await client.query('SELECT version::text FROM result_archive_identity_clock WHERE singleton')).rows[0].version;
  const dir=new Directory([],[],[],version);
  let cursor=null;
  while(true){
   if(Number.isFinite(deadline)&&now()>=deadline-12000){await client.query('ROLLBACK');return null;}
   const rows=(await client.query(athleteSql,[cursor,pageSize])).rows;
   for(const row of rows)dir.addAthlete(row);
   if(rows.length<pageSize)break;
   cursor=rows.at(-1).id;
  }
  if(Number.isFinite(deadline)&&now()>=deadline-12000){await client.query('ROLLBACK');return null;}
  const accounts=(await client.query(`SELECT u.name,p.full_name,p.display_name,p.previous_names FROM "user" u LEFT JOIN athlete_private_profiles p ON p.user_id=u.id`)).rows;
  dir.addAccounts(accounts);
  if(Number.isFinite(deadline)&&now()>=deadline-12000){await client.query('ROLLBACK');return null;}
  const histories=(await client.query(`SELECT athlete_id,provider,external_id,source_url FROM athlete_source_histories WHERE provider ILIKE '%duv%' OR source_url LIKE '%statistik.d-u-v.org/getresultperson%'`)).rows;
  dir.addHistories(histories);
  if(Number.isFinite(deadline)&&now()>=deadline-12000){await client.query('ROLLBACK');return null;}
  await client.query('COMMIT');
  return dir;
 }catch(e){await client.query('ROLLBACK');throw e;}
}
