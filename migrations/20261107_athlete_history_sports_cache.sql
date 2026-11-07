-- Stored sport classification for each imported athlete history, so the staff
-- collection statistics no longer re-run the regular-expression classifier over
-- ~1 million histories on every refresh (about 12 minutes of database time,
-- which made the five-minute worker time out). Triggers keep it current; the
-- worker backfills existing histories in batches.
create table if not exists athlete_history_sports (
  provider text not null,
  external_id text not null,
  athlete_id int not null,
  sports text[] not null default array[]::text[],
  updated_at timestamptz not null default now(),
  primary key (provider, external_id)
);
create index if not exists athlete_history_sports_athlete on athlete_history_sports (athlete_id);

create or replace function athlete_history_sports_sync() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    delete from athlete_history_sports where provider = old.provider and external_id = old.external_id;
    return old;
  end if;
  if tg_op = 'UPDATE' and (old.provider, old.external_id) is distinct from (new.provider, new.external_id) then
    delete from athlete_history_sports where provider = old.provider and external_id = old.external_id;
  end if;
  insert into athlete_history_sports (provider, external_id, athlete_id, sports, updated_at)
  values (new.provider, new.external_id, new.athlete_id,
    athlete_history_sports_v5(new.provider, new.performances), now())
  on conflict (provider, external_id) do update
    set athlete_id = excluded.athlete_id, sports = excluded.sports, updated_at = now();
  return new;
end $$;

drop trigger if exists athlete_history_sports_sync on athlete_source_histories;
create trigger athlete_history_sports_sync
  after insert or update of provider, external_id, athlete_id, performances or delete
  on athlete_source_histories
  for each row execute function athlete_history_sports_sync();
