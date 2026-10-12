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
 row_count,id,provider,source_check,captured_at,extraction
 from latest
), unique_items as (
 select distinct on(host,item_key) * from source_items where host<>'' order by host,item_key,captured_at desc,id desc
)
insert into event_register_extraction_items(source_host,item_key,source_url,kind,state,result_rows,evidence,checked_at)
select host,item_key,source_url,'results',state,row_count,
 jsonb_build_object('capture_id',id,'provider',provider,'source_check',source_check,'extraction',extraction,
 'basis','latest saved source document/table; extraction is separate from identity and publication'),captured_at
from unique_items
on conflict(source_host,item_key) do update set kind=excluded.kind,state=excluded.state,
 result_rows=excluded.result_rows,evidence=excluded.evidence,checked_at=excluded.checked_at,updated_at=now();
