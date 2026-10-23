-- Private derived search data only. This does not create results, link an
-- athlete, verify a performance or change source publication/approval.
-- Keep deployment cheap: historical captures are backfilled separately in
-- resumable transactions, while the existing search remains the fallback.
create table athlete_finder_capture_search_rows (
  capture_id bigint not null references result_archive_source_captures(id) on delete cascade,
  row_ordinal integer not null check (row_ordinal > 0),
  name_vector tsvector not null,
  primary key (capture_id, row_ordinal)
);

create index athlete_finder_capture_search_names
  on athlete_finder_capture_search_rows using gin (name_vector);

create table athlete_finder_capture_search_state (
  capture_id bigint primary key references result_archive_source_captures(id) on delete cascade,
  index_version smallint not null check (index_version > 0),
  staff_only boolean not null,
  expected_rows integer not null check (expected_rows >= 0),
  indexed_rows integer not null check (indexed_rows >= 0),
  indexed_at timestamptz not null default now()
);

alter table athlete_finder_capture_search_rows enable row level security;
alter table athlete_finder_capture_search_state enable row level security;
revoke all on athlete_finder_capture_search_rows,athlete_finder_capture_search_state from public;

create function athlete_finder_refresh_capture_search(target_capture_id bigint)
returns integer language plpgsql security invoker set search_path = pg_catalog,public as $$
declare
  document jsonb;
  private_capture boolean;
  expected_count integer := 0;
  inserted_rows integer := 0;
begin
  -- Serialize backfill with source corrections. Rows and completion metadata
  -- commit together, so a reader can never observe a partially rebuilt index.
  select payload into document from public.result_archive_source_captures
    where id=target_capture_id for update;
  if not found then return 0; end if;
  private_capture := coalesce(document->>'publication'='staff_only',false);
  if private_capture and jsonb_typeof(document->'rows')='array' then
    expected_count := jsonb_array_length(document->'rows');
  end if;

  delete from public.athlete_finder_capture_search_rows where capture_id=target_capture_id;
  if private_capture then
    insert into public.athlete_finder_capture_search_rows(capture_id,row_ordinal,name_vector)
      select target_capture_id,item.ordinality::integer,
        to_tsvector('simple',regexp_replace(
          normalize(left(coalesce(item.value->>'name',''),2000),NFKC),
          '[^[:alnum:]]+',' ','g'))
      from jsonb_array_elements(case when jsonb_typeof(document->'rows')='array'
        then document->'rows' else '[]'::jsonb end) with ordinality item(value,ordinality);
    get diagnostics inserted_rows = row_count;
  end if;

  insert into public.athlete_finder_capture_search_state
    (capture_id,index_version,staff_only,expected_rows,indexed_rows,indexed_at)
    values(target_capture_id,1,private_capture,expected_count,inserted_rows,now())
    on conflict(capture_id) do update set index_version=excluded.index_version,
      staff_only=excluded.staff_only,expected_rows=excluded.expected_rows,indexed_rows=excluded.indexed_rows,
      indexed_at=excluded.indexed_at;
  return inserted_rows;
end
$$;

create function athlete_finder_capture_search_changed()
returns trigger language plpgsql security invoker set search_path = pg_catalog,public as $$
begin
  if tg_op='UPDATE' and new.payload is not distinct from old.payload then return new; end if;
  perform public.athlete_finder_refresh_capture_search(new.id);
  return new;
end
$$;

create trigger athlete_finder_capture_search_changed
  after insert or update of payload on result_archive_source_captures
  for each row execute function athlete_finder_capture_search_changed();

revoke all on function athlete_finder_refresh_capture_search(bigint) from public;
revoke all on function athlete_finder_capture_search_changed() from public;

comment on table athlete_finder_capture_search_rows is
  'Private derived participant-name vectors and source row locators. No original cells, source HTML, athlete links or verification.';
comment on table athlete_finder_capture_search_state is
  'Atomic per-capture search-index completion marker. Version 1 uses the same PostgreSQL normalization as the athlete finder.';
