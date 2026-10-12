-- Merge known cursor URLs without regressing work already completed. Navigation
-- links remain unclassified and outside the extraction percentage denominator.
insert into event_register_extraction_items(source_host,item_key,source_url,kind,state,evidence)
select distinct s.host,regexp_replace(c->>'url','[#].*$',''),c->>'url','unclassified','pending',
 jsonb_build_object('basis','saved discovery cursor; classification required')
from event_register_sources s cross join lateral jsonb_array_elements(s.cursors) c
where c->>'url' ~ '^https?://' and s.host<>''
on conflict(source_host,item_key) do nothing;

-- A source may list the same URL in multiple saved versions. Use the latest
-- capture, and attribute hosted documents to their actual discovery website.
with latest as materialized (
 select distinct on(provider,source_key) id,provider,source_key,source_url,row_count,source_check,captured_at,
 payload->'discovery' discovery,payload->'extraction' extraction
 from result_archive_source_captures order by provider,source_key,captured_at desc,id desc
), source_items as (
 select lower(regexp_replace(split_part(coalesce(nullif(discovery->>'pageUrl',''),source_url),'/',3),'^www\.','')) host,
 regexp_replace(source_url,'[#].*$','') item_key,source_url,
 case when extraction->>'state' in ('extracted','partial','held','failed','excluded') then extraction->>'state'
      when discovery is not null then 'pending'
      when source_check='compared' and row_count>0 then 'extracted'
      when row_count>0 then 'partial' else 'held' end state,
 row_count,id,provider,source_check,captured_at,extraction,discovery
 from latest
), unique_items as (
 select distinct on(host,item_key) * from source_items where host<>'' order by host,item_key,captured_at desc,id desc
)
insert into event_register_extraction_items(source_host,item_key,source_url,kind,state,result_rows,evidence,checked_at)
select host,item_key,source_url,'results',state,row_count,
 jsonb_build_object('capture_id',id,'provider',provider,'source_check',source_check,'extraction',extraction,'discovery_url',discovery->>'pageUrl',
 'basis','latest saved source document/table; extraction is separate from identity and publication'),captured_at
from unique_items
on conflict(source_host,item_key) do update set kind=excluded.kind,state=excluded.state,
 result_rows=excluded.result_rows,evidence=excluded.evidence,checked_at=excluded.checked_at,updated_at=now();

-- Hosted documents can belong to an organiser absent from the original source
-- directory. Keep that discovery website visible alongside its CDN file URLs.
insert into event_register_sources(source_key,name,url,host,source_type,sports,collection_status,rights_status,provenance)
select 'extraction-host:'||md5(i.source_host),
 coalesce(min(nullif(i.evidence->>'provider','')),i.source_host),
 min(coalesce(nullif(i.evidence->>'discovery_url',''),nullif(i.evidence->>'index_url',''),i.source_url)),
 i.source_host,'Saved source extraction inventory','Scope retained from original source; running records only',
 'Known work tracked; full archive total unknown','Existing source-specific permissions and holds apply',
 jsonb_build_array(jsonb_build_object('storage','event_register_extraction_items','scope','known source material'))
from event_register_extraction_items i
where i.source_host<>'' and i.kind<>'unclassified'
and not exists(select 1 from event_register_sources s where s.host=i.source_host and s.name=coalesce(i.evidence->>'provider',i.source_host))
group by i.source_host
on conflict(source_key) do update set updated_at=now();
