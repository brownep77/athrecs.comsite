-- Athrecs core schema (events, clubs, athletes, results)
create table if not exists clubs (
  id serial primary key,
  slug text not null unique,
  name text not null,
  city text not null default '',
  county text not null default 'Norfolk',
  country text not null default 'England',
  sports text not null default '',
  website text,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id serial primary key,
  slug text not null unique,
  name text not null,
  sport text not null,
  country text not null default 'England',
  county text not null default 'Norfolk',
  city text not null default '',
  area text not null default '',
  surface text not null default 'Road',
  summary text not null default '',
  description text not null default '',
  organiser text not null default '',
  website text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists event_distances (
  event_id int not null references events (id) on delete cascade,
  distance_code text not null,
  primary key (event_id, distance_code)
);

create table if not exists editions (
  id serial primary key,
  event_id int not null references events (id) on delete cascade,
  event_date date not null,
  distance_code text not null,
  distance_km double precision not null default 0,
  status text not null default 'TBC',
  entry_url text,
  source_url text,
  start_time text,
  unique (event_id, event_date, distance_code)
);

create table if not exists athletes (
  id serial primary key,
  slug text not null unique,
  display_name text not null,
  gender text not null default 'U',
  club_id int references clubs (id) on delete set null,
  city text,
  county text not null default 'Norfolk',
  country text not null default 'England',
  bio text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists results (
  id serial primary key,
  edition_id int not null references editions (id) on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  status text not null default 'finished',
  finish_time_seconds int,
  overall_place int,
  category text,
  unique (edition_id, athlete_id)
);

create table if not exists app_meta (
  key text primary key,
  value text not null
);

create index if not exists events_sport_idx on events (sport);
create index if not exists editions_event_date_idx on editions (event_date);
create index if not exists athletes_club_id_idx on athletes (club_id);
create index if not exists results_edition_id_idx on results (edition_id);
