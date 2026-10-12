-- Run deliberately against the selected database after reviewing the source
-- inventory. All writes are private; no athlete rows or publication flags change.
-- Each provider is a separate statement so large archives can be resumed.

-- WMM result IDs may recur across ranking/age-group captures. Count them once
-- per named race and year. Nationality is never used as the race country.
with latest as materialized (
 select distinct on(provider,source_key) id,source_url,payload,captured_at
 from result_archive_source_captures where provider='Abbott World Marathon Majors'
 order by provider,source_key,captured_at desc,id desc
), rows as (
 select c.id,c.source_url,c.captured_at,r->'_source' r from latest c
 cross join lateral jsonb_array_elements(c.payload->'rows') r
), grouped as (
 select coalesce(nullif(r->>'event_title',''),r->>'race_title') name,
 coalesce(r->>'race_title','') programme,(r->>'result_year')::int yr,
 min(source_url) url,count(distinct coalesce(nullif(r->>'result_id',''),r::text))::int n,
 array_agg(distinct id) capture_ids,max(captured_at) captured_at
 from rows where r->>'result_year' ~ '^20[0-9]{2}$'
 and coalesce(nullif(r->>'event_title',''),r->>'race_title','')<>'' group by 1,2,3
)
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,edition_year,record_status,result_observations,evidence,captured_at)
select 'wmm:'||md5(jsonb_build_array(name,programme,yr)::text),'captured-results','Abbott World Marathon Majors',url,
 lower(regexp_replace(split_part(url,'/',3),'^www\.','')),'wmm:'||md5(name),name,programme,'Running',yr,
 'Collected results; exact date and catalogue match need review',n,
 jsonb_build_object('capture_ids',capture_ids,'date_precision','year','count_basis','distinct source result IDs; not verified finishers'),captured_at from grouped
on conflict(record_key) do update set result_observations=excluded.result_observations,evidence=excluded.evidence,captured_at=excluded.captured_at,updated_at=now();

-- UTMB's runner captures overlap; count distinct source runners for each race
-- identifier. This is partial result coverage, not the race finisher total.
with latest as materialized (
 select distinct on(provider,source_key) id,source_url,payload,captured_at,source_key
 from result_archive_source_captures where provider='utmb'
 order by provider,source_key,captured_at desc,id desc
), rows as (
 select c.id,c.source_url,c.captured_at,c.source_key,r->'raw' r from latest c
 cross join lateral jsonb_array_elements(c.payload->'rows') r
), grouped as (
 select r->>'raceYearId' race_id,r->>'eventName' name,r->>'raceName' programme,
 (r->>'eventYear')::int yr,
 min(case when r->>'dateIso' ~ '^\d{4}-\d{2}-\d{2}$' then (r->>'dateIso')::date end) event_date,
 min(coalesce(r->>'country','')) country,
 min(case when r->>'distance' ~ '^\d+(\.\d+)?$' then (r->>'distance')::float end) distance_km,
 min(source_url) url,count(distinct source_key)::int n,array_agg(distinct id) capture_ids,max(captured_at) captured_at
 from rows where nullif(r->>'raceYearId','') is not null and r->>'eventYear' ~ '^20[0-9]{2}$'
 and nullif(r->>'eventName','') is not null group by 1,2,3,4
)
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,country,edition_year,event_date,distance_km,record_status,result_observations,evidence,captured_at)
select 'utmb:'||md5(jsonb_build_array(race_id,name,programme,yr)::text),'captured-results','utmb',url,
 lower(regexp_replace(split_part(url,'/',3),'^www\.','')),'utmb:'||md5(name),name,coalesce(programme,''),'Running',country,yr,event_date,distance_km,
 'Collected runner histories; partial results; catalogue match needs review',n,
 jsonb_build_object('capture_ids',capture_ids,'race_year_id',race_id,'count_basis','distinct source runner histories; not total finishers'),captured_at from grouped
on conflict(record_key) do update set result_observations=excluded.result_observations,evidence=excluded.evidence,captured_at=excluded.captured_at,updated_at=now();

-- DUV archives are secondary statistics: retain that qualification. Distances
-- such as 6h stay labels rather than being coerced into kilometres.
with latest as (
 select distinct on(provider,source_key) * from result_archive_source_captures
 where provider='DUV Ultra Marathon Statistics' order by provider,source_key,captured_at desc,id desc
)
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,location,edition_year,event_date,record_status,result_observations,evidence,captured_at)
select 'duv:'||source_key,'captured-results',provider,source_url,
 lower(regexp_replace(split_part(source_url,'/',3),'^www\.','')),
 'duv:'||md5(payload#>>'{index,name}'),payload#>>'{index,name}',coalesce(payload#>>'{index,distance}',''),'Running',coalesce(payload#>>'{index,location}',''),
 extract(year from (payload#>>'{index,date}')::date)::int,(payload#>>'{index,date}')::date,
 'Collected secondary results; catalogue match needs review',row_count,
 jsonb_build_object('capture_ids',jsonb_build_array(id),'source_key',source_key,'count_basis','rows in latest saved result page; secondary provider'),captured_at
from latest where nullif(payload#>>'{index,name}','') is not null and payload#>>'{index,date}' ~ '^\d{4}-\d{2}-\d{2}$'
on conflict(record_key) do update set result_observations=excluded.result_observations,evidence=excluded.evidence,captured_at=excluded.captured_at,updated_at=now();

-- TRT capture tables retain explicit running labels and no multisport stages.
with latest as materialized (
 select distinct on(provider,source_key) id,provider,source_key,source_url,captured_at,
 payload->'rows' rows,payload#>>'{index,name}' event_name,payload#>>'{index,location}' event_location
 from result_archive_source_captures where provider='Total Race Timing'
 order by provider,source_key,captured_at desc,id desc
), grouped as (
 select c.id,c.source_key,c.source_url,c.captured_at,c.event_name name,
 coalesce(c.event_location,'') location,r->>'date' date,
 coalesce(r->>'distanceLabel','') programme,coalesce(r->>'tableKey','') table_key,count(*)::int n
 from latest c cross join lateral jsonb_array_elements(c.rows) r
 where r->>'date' ~ '^\d{4}-\d{2}-\d{2}$'
 and coalesce(c.event_name,'')<>''
 and concat_ws(' ',c.event_name,r->>'distanceLabel') !~* '(triathlon|duathlon|aquathlon|swim|cycling|cycle|sportive|walk)'
 group by 1,2,3,4,5,6,7,8,9
)
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,location,edition_year,event_date,record_status,result_observations,evidence,captured_at)
select 'trt:'||md5(jsonb_build_array(source_key,table_key,date,programme)::text),'captured-results','Total Race Timing',source_url,
 lower(regexp_replace(split_part(source_url,'/',3),'^www\.','')),'trt:'||md5(name),name,programme,'Running',location,extract(year from date::date)::int,date::date,
 'Collected timing table; catalogue match needs review',n,
 jsonb_build_object('capture_ids',jsonb_build_array(id),'source_key',source_key,'table_key',table_key,'count_basis','rows in latest saved timing table'),captured_at from grouped
on conflict(record_key) do update set result_observations=excluded.result_observations,evidence=excluded.evidence,captured_at=excluded.captured_at,updated_at=now();

-- Running observations in the remaining normalised histories. Providers above
-- use their original archive instead, avoiding a second count of those rows.
with observations as (
 select h.provider,h.source_url,h.captured_at,p,
 coalesce(nullif(p->>'meeting',''),p->>'event') name,
 coalesce(p->>'discipline','') programme,
 case when p->>'date' ~ '^\d{4}-\d{2}-\d{2}$' then (p->>'date')::date end event_date,
 case when p->>'year' ~ '^\d{4}$' then (p->>'year')::int
 when p->>'date' ~ '^\d{4}-\d{2}-\d{2}$' then substring(p->>'date',1,4)::int end yr
 from athlete_source_histories h cross join lateral jsonb_array_elements(h.performances) p
 where h.provider not in ('Abbott World Marathon Majors','utmb','DUV Ultra Marathon Statistics','Total Race Timing')
), grouped as (
 select provider,name,programme,yr,event_date,
 min(coalesce(p->'sourceUrls'->>0,source_url,'')) url,
 min(coalesce(p->>'venue','')) location,count(*)::int n,max(captured_at) captured_at
 from observations where nullif(name,'') is not null and yr between 1800 and 2200
 and programme ~* '(marathon|parkrun|cross.country|trail|road|mile|^[0-9]+(\.[0-9]+)?\s*(m|km|k|h|hr)(\s|$)|^[0-9]+mh$|steeple|hurdle)'
 and programme !~* '(walk|swim|triathlon|duathlon|jump|throw|shot|discus|hammer|javelin|vault)'
 group by 1,2,3,4,5
)
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,location,edition_year,event_date,record_status,result_observations,evidence,captured_at)
select 'history:'||md5(jsonb_build_array(provider,name,programme,yr,event_date)::text),'athlete-histories',provider,url,
 lower(regexp_replace(split_part(url,'/',3),'^www\.','')),'history:'||md5(jsonb_build_array(provider,name)::text),name,programme,
 case when programme ~* 'parkrun' or provider ~* 'parkrun' then 'Parkrun' else 'Running' end,location,yr,event_date,
 'Collected history observations; identity and catalogue match not implied',n,
 jsonb_build_object('storage','athlete_source_histories','count_basis','saved performance observations; may overlap other providers'),captured_at from grouped
on conflict(record_key) do update set result_observations=excluded.result_observations,evidence=excluded.evidence,captured_at=excluded.captured_at,updated_at=now();

-- Candidates keep their existing review/rights/identity holds unchanged.
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,country,location,surface,organiser,edition_year,event_date,distance_km,record_status,catalogue_event_id,evidence,captured_at)
select 'candidate:'||md5(jsonb_build_array(c.id,d.ordinality)::text),'fixture-candidates',c.source_id,c.source_url,
 lower(regexp_replace(split_part(c.source_url,'/',3),'^www\.','')),'candidate:'||md5(jsonb_build_array(c.source_id,c.event_slug)::text),c.event_name,coalesce(d.value->>'code',''),
 case when lower(c.payload->>'sport')='parkrun' then 'Parkrun' else 'Running' end,coalesce(c.payload->>'country',''),coalesce(c.payload->>'city',''),coalesce(c.payload->>'surface',''),coalesce(c.payload->>'organiser',''),
 case when c.event_date ~ '^\d{4}-\d{2}-\d{2}$' then substring(c.event_date,1,4)::int end,
 case when c.event_date ~ '^\d{4}-\d{2}-\d{2}$' then c.event_date::date end,
 case when d.value->>'km' ~ '^\d+(\.\d+)?$' then (d.value->>'km')::float end,
 concat_ws('; ',c.status,c.review_status),c.catalogue_event_id,
 jsonb_build_object('candidate_id',c.id,'batch_id',c.batch_id,'block_reasons',c.block_reasons,'review_status',c.review_status),c.created_at
from fixture_candidates c left join lateral jsonb_array_elements(c.payload->'distances') with ordinality d(value,ordinality) on true
where lower(c.payload->>'sport') in ('running','parkrun')
on conflict(record_key) do update set record_status=excluded.record_status,catalogue_event_id=excluded.catalogue_event_id,evidence=excluded.evidence,updated_at=now();

-- The existing catalogue supplies publication-linked source coverage, including
-- RunABC and parkrun. No new catalogue events or dates are created here.
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,country,location,surface,organiser,edition_year,event_date,distance_km,record_status,catalogue_event_id,catalogue_edition_id,evidence)
select 'catalogue:'||ed.id,'catalogue',lower(regexp_replace(split_part(ed.source_url,'/',3),'^www\.','')),ed.source_url,
 lower(regexp_replace(split_part(ed.source_url,'/',3),'^www\.','')),'catalogue:'||e.id,e.name,ed.distance_code,e.sport,e.country,e.city,e.surface,e.organiser,
 extract(year from ed.event_date)::int,ed.event_date,ed.distance_km,'In catalogue; '||ed.status,e.id,ed.id,
 jsonb_build_object('storage','editions','edition_id',ed.id,'result_link',ed.results_official_url)
from running_register_editions ed join events e on e.id=ed.event_id
where e.sport in ('Running','Parkrun') and coalesce(ed.source_url,'')<>''
on conflict(record_key) do update set record_status=excluded.record_status,evidence=excluded.evidence,updated_at=now();

-- Normalised uploaded result sheets and Run Norwich archive pages. Keep exact
-- dates only when supplied by a result row or the captured event index.
with latest as materialized (
 select distinct on(provider,source_key) id,provider,source_key,source_url,captured_at,
 coalesce(payload#>>'{index,name}',payload->>'event') name,
 coalesce(payload#>>'{index,year}',payload->>'year') yr,
 payload#>>'{index,date}' index_date,payload->'rows' rows
 from result_archive_source_captures
 where provider not in ('Abbott World Marathon Majors','utmb','DUV Ultra Marathon Statistics','Total Race Timing')
 and row_count>0 order by provider,source_key,captured_at desc,id desc
), grouped as (
 select c.id,c.provider,c.source_key,c.source_url,c.captured_at,c.name,c.yr,
 coalesce(nullif(r->>'date',''),c.index_date) date,
 coalesce(r->>'distanceLabel','') programme,count(*)::int n
 from latest c cross join lateral jsonb_array_elements(c.rows) r
 where nullif(c.name,'') is not null and c.yr ~ '^\d{4}$'
 and concat_ws(' ',c.name,r->>'distanceLabel') !~* '(triathlon|duathlon|aquathlon|swim|cycling|walk|jump|throw|shot|discus|hammer|javelin|vault)'
 group by 1,2,3,4,5,6,7,8,9
)
insert into event_register_source_records(record_key,origin,provider,source_url,source_host,event_key,event_name,programme,sport,edition_year,event_date,record_status,result_observations,evidence,captured_at)
select 'sheet:'||md5(jsonb_build_array(provider,source_key,programme,date)::text),'captured-results',provider,source_url,
 lower(regexp_replace(split_part(source_url,'/',3),'^www\.','')),'sheet:'||md5(jsonb_build_array(provider,name)::text),name,programme,'Running',yr::int,
 case when date ~ '^\d{4}-\d{2}-\d{2}$' then date::date end,
 'Collected result sheet; catalogue match needs review',n,
 jsonb_build_object('capture_ids',jsonb_build_array(id),'source_key',source_key,'count_basis','saved source table observations; not identity verification'),captured_at from grouped
on conflict(record_key) do update set result_observations=excluded.result_observations,evidence=excluded.evidence,captured_at=excluded.captured_at,updated_at=now();
