-- One stable profile reference per Athlete Account. Existing ownership links
-- remain the authority for which source athlete records belong to that person.
alter table athlete_private_profiles
  add column if not exists athlete_profile_id uuid not null default gen_random_uuid();
create unique index if not exists athlete_private_profiles_reference_idx
  on athlete_private_profiles (athlete_profile_id);

create table if not exists athlete_profile_connections (
  user_id text not null references "user" ("id") on delete cascade,
  platform text not null check (platform in ('instagram', 'x', 'facebook', 'linkedin')),
  url text not null check (url ~ '^https://'),
  share_publicly boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, platform)
);

-- A dismissal is private to this account and never deletes a race result.
create table if not exists athlete_match_dismissals (
  user_id text not null references "user" ("id") on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, athlete_id)
);

-- Verified source mappings are supplied by staff imports, never name guesses.
create table if not exists athlete_source_identities (
  provider text not null check (provider in ('worldathletics', 'powerof10', 'parkrun', 'athleticsurn')),
  external_id text not null,
  athlete_id int not null references athletes (id) on delete cascade,
  source_url text,
  created_at timestamptz not null default now(),
  primary key (provider, external_id)
);
create index if not exists athlete_source_identities_athlete_idx
  on athlete_source_identities (athlete_id);

-- Backfill only identifiers that resolve to a single existing athlete.
insert into athlete_source_identities (provider, external_id, athlete_id, source_url)
select 'worldathletics', external_id, min(id), min(source_url)
from (
  select id, source_url,
    substring(source_url from '^https?://(?:www[.])?worldathletics[.]org/athletes/[^?#]+-([0-9]+)/?(?:[?#].*)?$') as external_id
  from athletes
) known where external_id is not null
group by external_id having count(distinct id) = 1
on conflict do nothing;

insert into athlete_source_identities (provider, external_id, athlete_id, source_url)
select 'powerof10', external_id, min(id), min(source_url)
from (
  select id, source_url,
    substring(lower(source_url) from '^https?://(?:www[.])?thepowerof10[.]info/athletes/profile[.]aspx[?]athleteid=([0-9]+)(?:&.*)?$') as external_id
  from athletes
) known where external_id is not null
group by external_id having count(distinct id) = 1
on conflict do nothing;

insert into athlete_source_identities (provider, external_id, athlete_id)
select 'athleticsurn', lower(trim(ea_number)), min(id)
from athletes where nullif(trim(ea_number), '') is not null
group by lower(trim(ea_number)) having count(distinct id) = 1
on conflict do nothing;

-- Retain every imported source even when it describes an existing performance.
create table if not exists result_source_references (
  result_id int not null references results (id) on delete cascade,
  source_url text not null check (source_url ~ '^https://'),
  source_name text not null default '',
  recorded_at timestamptz not null default now(),
  primary key (result_id, source_url)
);
