alter table athlete_private_profiles add column if not exists profile_details jsonb not null default '{}'::jsonb;
alter table athletes add column if not exists profile_details jsonb not null default '{}'::jsonb;

create table if not exists athlete_upcoming_events (
  id integer generated always as identity primary key,
  user_id text references "user"("id") on delete cascade,
  athlete_id integer references athletes(id) on delete cascade,
  sport text not null,
  event_name text not null,
  event_date date not null,
  distance text not null default '',
  city text not null default '',
  country text not null default '',
  event_url text not null default '',
  status text not null default 'Planned' check (status in ('Planned', 'Entered', 'Confirmed', 'Cancelled')),
  updated_at timestamptz not null default now(),
  check ((user_id is null) <> (athlete_id is null))
);
create index if not exists upcoming_user_date on athlete_upcoming_events(user_id, event_date);
create index if not exists upcoming_athlete_date on athlete_upcoming_events(athlete_id, event_date);
create unique index if not exists upcoming_user_unique on athlete_upcoming_events(user_id, lower(event_name), event_date, lower(distance), lower(sport));
create unique index if not exists upcoming_athlete_unique on athlete_upcoming_events(athlete_id, lower(event_name), event_date, lower(distance), lower(sport));

-- Store the details Paul supplied. Publication follows after the privacy-aware UI is live.
update athletes set profile_details = profile_details ||
  '{"nationality":"British","birthCountry":"United Kingdom","previousClub":"Norfolk Gazelle","coach":"Paul Evans","birthdayVisibility":"hidden","runningAgeCategory":"M45","acceptContact":false}'::jsonb
where slug = 'paul-browne';

update athlete_private_profiles p set nationality='British', club_or_team='Unattached',
  profile_details=p.profile_details || a.profile_details, updated_at=now()
from athlete_account_links l join athletes a on a.id=l.athlete_id
where p.user_id=l.user_id and l.status='active' and a.slug='paul-browne';
update athlete_sport_profiles s set coach_name='Paul Evans'
where s.sport_code='Running' and s.user_id in (
  select l.user_id from athlete_account_links l join athletes a on a.id=l.athlete_id
  where l.status='active' and a.slug='paul-browne'
);
