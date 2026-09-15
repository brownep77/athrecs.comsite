-- One number pool prevents account and imported-athlete references colliding.
-- Source references remain aliases when ownership is confirmed; the account's
-- reference stays fixed as names and linked source identities change.
create table if not exists athlete_identifiers (
  number bigint generated always as identity primary key,
  athlete_id integer unique references athletes(id) on delete cascade,
  user_id text unique references "user"("id") on delete cascade,
  constraint athlete_identifier_owner check (
    (athlete_id is not null and user_id is null)
    or (athlete_id is null and user_id is not null)
  )
);

create or replace function assign_source_athlete_identifier() returns trigger
language plpgsql as $$
begin
  insert into athlete_identifiers (athlete_id) values (new.id)
    on conflict (athlete_id) do nothing;
  return new;
end;
$$;

create or replace function assign_account_athlete_identifier() returns trigger
language plpgsql as $$
begin
  insert into athlete_identifiers (user_id) values (new."id")
    on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists assign_source_athlete_identifier on athletes;
create trigger assign_source_athlete_identifier after insert on athletes
  for each row execute function assign_source_athlete_identifier();

drop trigger if exists assign_account_athlete_identifier on "user";
create trigger assign_account_athlete_identifier after insert on "user"
  for each row execute function assign_account_athlete_identifier();

insert into athlete_identifiers (athlete_id)
  select id from athletes order by id
  on conflict (athlete_id) do nothing;
insert into athlete_identifiers (user_id)
  select "id" from "user" order by "id"
  on conflict (user_id) do nothing;

-- This view does not grant visibility. Public readers must still restrict
-- profiles and results using their existing privacy rules.
create or replace view athlete_resolved_ids as
select athlete.id as athlete_id,
  coalesce(account_ref.number, source_ref.number) as athlete_number,
  source_ref.number as source_number
from athletes athlete
join athlete_identifiers source_ref on source_ref.athlete_id = athlete.id
left join athlete_account_links link
  on link.athlete_id = athlete.id and link.status = 'active'
left join athlete_identifiers account_ref on account_ref.user_id = link.user_id;
