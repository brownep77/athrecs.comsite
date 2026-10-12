-- Link saved IDs only when the current catalogue agrees on event, date and
-- programme. Workbook IDs alone are not evidence of a match.
with matched as (
 select r.record_key,e.id event_id,ed.id edition_id
 from event_register_source_records r
 join editions ed on ed.id::text=r.evidence->>'saved_edition_id'
 join events e on e.id=ed.event_id and e.id::text=r.evidence->>'saved_event_id'
 where r.origin='saved-fixtures' and e.sport=r.sport and ed.event_date=r.event_date
 and lower(trim(e.name))=lower(trim(r.event_name))
 and (lower(trim(ed.distance_code))=lower(trim(r.programme)) or (r.distance_km>0 and abs(ed.distance_km-r.distance_km)<0.00001))
)
update event_register_source_records r set catalogue_event_id=m.event_id,catalogue_edition_id=m.edition_id,
 record_status='Saved fixture; catalogue edition matched',evidence=r.evidence||jsonb_build_object('catalogue_match','saved IDs, exact name, date and distance'),updated_at=now()
from matched m where r.record_key=m.record_key;

-- Exact result/fixture source URL + date + programme, with a single candidate
-- edition. Never fuzzy-match athlete names or invent missing dates.
with possible as (
 select r.record_key,ed.id edition_id,ed.event_id
 from event_register_source_records r join editions ed on ed.event_date=r.event_date
 and (ed.source_url=r.source_url or ed.results_official_url=r.source_url)
 and (lower(trim(ed.distance_code))=lower(trim(r.programme)) or (r.distance_km>0 and abs(ed.distance_km-r.distance_km)<0.00001))
 join events e on e.id=ed.event_id and e.sport=r.sport
 where r.origin<>'catalogue' and r.catalogue_event_id is null and r.source_url<>''
 and (r.country='' or lower(trim(r.country))=lower(trim(e.country)))
), unique_matches as (
 select record_key,min(edition_id) edition_id,min(event_id) event_id from possible group by record_key having count(distinct edition_id)=1
)
update event_register_source_records r set catalogue_event_id=m.event_id,catalogue_edition_id=m.edition_id,
 evidence=r.evidence||jsonb_build_object('catalogue_match','unique exact source URL, date and programme'),updated_at=now()
from unique_matches m where r.record_key=m.record_key;

-- Keep otherwise unlisted provider hosts visible as discovery leads. These are
-- observed record URLs, not a claim that a full archive index has been scanned.
insert into event_register_sources(source_key,name,url,host,source_type,sports,collection_status,rights_status,provenance)
select 'observed-host:'||md5(r.source_host),min(r.provider),min(r.source_url),r.source_host,
 'Observed event source; index pending','Running / parkrun observations',
 'Records stored; full source coverage not assessed','Not assessed',jsonb_build_array(jsonb_build_object('storage','event_register_source_records','scope','observed source host'))
from event_register_source_records r where r.source_host<>'' and not exists(select 1 from event_register_sources s where s.host=r.source_host)
group by r.source_host on conflict(source_key) do nothing;
