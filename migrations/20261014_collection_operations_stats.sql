-- New-row dates are unknown for existing editions/results. Never backdate them.
alter table editions add column stats_created_at timestamptz;
alter table editions alter column stats_created_at set default now();
alter table results add column stats_created_at timestamptz;
alter table results alter column stats_created_at set default now();
create index editions_stats_created on editions(stats_created_at) where stats_created_at is not null;
create index results_stats_created on results(stats_created_at) where stats_created_at is not null;

create table collection_stats_tracking (
  singleton boolean primary key default true check(singleton),
  started_at timestamptz not null default now()
);
insert into collection_stats_tracking(singleton) values(true);

-- One changed record per UK calendar day; no names, source payloads or private data.
create table collection_stats_changes (
  entity text not null check(entity in ('events','editions','athletes','results')),
  record_id integer not null,
  day date not null,
  primary key(entity,record_id,day)
);
create index collection_stats_changes_day on collection_stats_changes(day,entity);
create function record_collection_stats_change() returns trigger language plpgsql as $$
begin
  if (to_jsonb(old)-array['updated_at','stats_created_at']) is distinct from
     (to_jsonb(new)-array['updated_at','stats_created_at']) then
    insert into collection_stats_changes(entity,record_id,day)
    values(tg_table_name,new.id,(now() at time zone 'Europe/London')::date)
    on conflict do nothing;
  end if;
  return new;
end $$;
create trigger collection_stats_events after update on events for each row when (old.* is distinct from new.*) execute function record_collection_stats_change();
create trigger collection_stats_editions after update on editions for each row when (old.* is distinct from new.*) execute function record_collection_stats_change();
create trigger collection_stats_athletes after update on athletes for each row when (old.* is distinct from new.*) execute function record_collection_stats_change();
create trigger collection_stats_results after update on results for each row when (old.* is distinct from new.*) execute function record_collection_stats_change();
alter table collection_stats_changes enable row level security;
alter table collection_stats_tracking enable row level security;
revoke all on collection_stats_changes,collection_stats_tracking from public;
