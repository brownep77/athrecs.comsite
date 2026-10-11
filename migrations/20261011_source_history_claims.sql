-- A claim reference is separate from canonical race results: no invented edition,
-- date, PB eligibility or second public result. Original source rows stay intact.
create table if not exists source_history_claim_results (
  id serial primary key,
  athlete_id integer not null references athletes(id),
  provider text not null,
  external_id text not null,
  source_key text not null,
  source_url text not null,
  performance jsonb not null,
  available boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(provider, external_id, source_key)
);
create index if not exists source_claim_athlete_idx on source_history_claim_results(athlete_id);

create table athlete_profile_hidden_source_results (
  user_id text not null references "user"(id) on delete cascade,
  source_result_id integer not null references source_history_claim_results(id),
  hidden_at timestamptz not null default now(),
  primary key(user_id,source_result_id)
);

alter table result_claims alter column result_id drop not null;
alter table result_claims add column source_evidence jsonb;
alter table result_claims add column source_result_id integer references source_history_claim_results(id);
alter table result_claims add column claim_key integer generated always as (coalesce(result_id, -source_result_id)) stored;
alter table result_claims add constraint result_claim_one_source check (num_nonnulls(result_id,source_result_id)=1);
create unique index result_claim_source_user_idx on result_claims(source_result_id,claimant_user_id);

alter table athlete_claim_invitations alter column result_id drop not null;
alter table athlete_claim_invitations add column source_result_id integer references source_history_claim_results(id);
alter table athlete_claim_invitations add column claim_key integer generated always as (coalesce(result_id,-source_result_id)) stored;
alter table athlete_claim_invitations add constraint invitation_one_result_source check (num_nonnulls(result_id,source_result_id)=1);

create function sync_run_norwich_claim_results() returns trigger language plpgsql as $$
begin
  if coalesce(new.provider,old.provider) <> 'Run Norwich official results' then
    return null;
  end if;
  -- Withdrawn/removed evidence remains in the private claim audit, unavailable
  -- for a new claim. A source edit never transfers an existing claim identity.
  update source_history_claim_results set available=false,updated_at=now()
    where provider=coalesce(new.provider,old.provider)
      and external_id=coalesce(new.external_id,old.external_id);
  if tg_op='DELETE' then return null; end if;
  insert into source_history_claim_results(athlete_id,provider,external_id,source_key,source_url,performance,available)
  select new.athlete_id,new.provider,new.external_id,p#>>'{archiveReference,sourceRow}',new.source_url,p,
    new.published_at is not null and coalesce(p->>'profileExcluded','false')<>'true'
  from jsonb_array_elements(new.performances)p
  where nullif(p#>>'{archiveReference,sourceRow}','') is not null
    and nullif(p->>'meeting','') is not null
    and p->>'performance' ~ '^([0-9]+:)?[0-9]+:[0-5][0-9]$'
    and p->>'place' ~ '^[1-9][0-9]*$'
    and p->>'verificationStatus' in ('source_verified','verified_by_administrator','unverified')
  on conflict(provider,external_id,source_key) do update set
    source_url=case when source_history_claim_results.athlete_id=excluded.athlete_id then excluded.source_url else source_history_claim_results.source_url end,
    performance=case when source_history_claim_results.athlete_id=excluded.athlete_id then excluded.performance else source_history_claim_results.performance end,
    available=excluded.available and source_history_claim_results.athlete_id=excluded.athlete_id,
    updated_at=now();
  return null;
end $$;
create trigger run_norwich_claim_results_sync
  after insert or update or delete on athlete_source_histories
  for each row execute function sync_run_norwich_claim_results();

-- The same authenticated claim API handles positive canonical IDs and negative
-- source IDs. Both have real foreign keys; no ownership is created by this view.
create function claim_time_seconds(value text) returns integer language sql immutable as $$
  select case when value ~ '^([0-9]+:)?[0-9]+:[0-5][0-9]$' then
    case array_length(string_to_array(value, ':'),1)
      when 2 then split_part(value,':',1)::integer*60+split_part(value,':',2)::integer
      when 3 then split_part(value,':',1)::integer*3600+split_part(value,':',2)::integer*60+split_part(value,':',3)::integer
    end end
$$;

create view athlete_claimable_results as
select r.id,r.athlete_id,r.edition_id,e.name event_name,e.slug event_slug,e.sport event_sport,
  d.event_date::text event_date,d.distance_code,d.distance_km,e.surface,e.country event_country,e.city event_city,
  r.finish_time_seconds,r.chip_time_seconds,r.gun_time_seconds,r.overall_place,r.gender_place,r.category_place,
  r.bib,r.category,r.source_url,r.result_source,r.result_details,r.status,
  coalesce(nullif(r.result_details->>'clubAtRace',''),c.name,a.source_club_name) club_name,
  null::text age_at_race,
  r.status='finished' and coalesce(r.result_details->>'profileExcluded','false')<>'true'
    and a.parent_athlete_id is null available
from results r join athletes a on a.id=r.athlete_id
join editions d on d.id=r.edition_id join events e on e.id=d.event_id left join clubs c on c.id=a.club_id
union all
select -s.id,s.athlete_id,0,s.performance->>'meeting',coalesce(s.performance->>'eventSlug',''),'Running',
  coalesce(nullif(s.performance->>'date',''),nullif(s.performance->>'dateLabel',''),s.performance->>'year'),
  s.performance->>'discipline',10::numeric,
  case when s.performance->>'discipline' ilike '%virtual%' then 'Virtual' else 'Road' end,'','',
  claim_time_seconds(s.performance->>'performance'),
  case when s.performance->>'discipline' not ilike '%virtual%' then claim_time_seconds(s.performance->>'performance') end,
  case when s.performance#>>'{archiveReference,original,Gun Time}' ~ '^([0-9]+:)?[0-9]+:[0-5][0-9]$' then claim_time_seconds(s.performance#>>'{archiveReference,original,Gun Time}') end,
  (s.performance->>'place')::integer,
  (s.performance#>>'{places,gender}')::integer,(s.performance#>>'{places,category}')::integer,
  nullif(s.performance#>>'{archiveReference,original,Bib}',''),nullif(s.performance->>'ageGroup',''),
  s.source_url,coalesce(s.performance->>'verificationStatus','unverified'),s.performance,'finished',
  (select regexp_replace(l,'^Club( at race)?: ','') from jsonb_array_elements_text(coalesce(s.performance->'labels','[]'))l where l ~ '^Club( at race)?: ' limit 1),
  nullif(s.performance#>>'{archiveReference,original,Age}',''),
  s.available and a.parent_athlete_id is null
    and not exists(select 1 from results r join editions d on d.id=r.edition_id
      where r.athlete_id=s.athlete_id and d.event_date::text=s.performance->>'date'
      and r.source_url=s.source_url and r.finish_time_seconds=claim_time_seconds(s.performance->>'performance'))
from source_history_claim_results s join athletes a on a.id=s.athlete_id;

comment on table source_history_claim_results is 'Private claim references to approved Run Norwich source histories; preserves original precision and evidence without a canonical race copy.';
