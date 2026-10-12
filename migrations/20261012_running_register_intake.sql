-- Private discovery inventory. Source observations are not public catalogue
-- editions, verified performances, or evidence that a race has ceased.
create table if not exists event_register_sources (
  source_key text primary key,
  name text not null,
  url text not null default '',
  host text not null default '',
  country text not null default '',
  source_type text not null default '',
  sports text not null default '',
  collection_status text not null default 'Not assessed',
  rights_status text not null default 'Not assessed',
  checked_on text not null default '',
  provenance jsonb not null default '[]',
  cursors jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
create index if not exists event_register_sources_host_idx on event_register_sources(host);
create table if not exists event_register_source_records (
  record_key text primary key,
  origin text not null,
  provider text not null,
  source_url text not null default '',
  source_host text not null default '',
  event_key text not null,
  event_name text not null,
  programme text not null default '',
  sport text not null check (sport in ('Running','Parkrun')),
  country text not null default '',
  location text not null default '',
  surface text not null default '',
  organiser text not null default '',
  edition_year integer check (edition_year between 1800 and 2200),
  event_date date,
  distance_km double precision,
  record_status text not null default 'Collected; review required',
  result_observations integer not null default 0 check (result_observations>=0),
  catalogue_event_id integer references events(id),
  catalogue_edition_id integer references editions(id),
  evidence jsonb not null default '{}',
  captured_at timestamptz,
  updated_at timestamptz not null default now(),
  check (event_date is null or edition_year = extract(year from event_date)::int)
);
create index if not exists event_register_records_provider_idx on event_register_source_records(provider);
create index if not exists event_register_records_host_idx on event_register_source_records(source_host);
create index if not exists event_register_records_event_idx on event_register_source_records(event_key,edition_year);
create index if not exists event_register_records_year_idx on event_register_source_records(edition_year,event_date);
create index if not exists event_register_records_catalogue_idx on event_register_source_records(catalogue_event_id);
alter table event_register_sources enable row level security;
alter table event_register_source_records enable row level security;
revoke all on event_register_sources,event_register_source_records from public;
comment on table event_register_source_records is 'Staff-only event/programme/year source observations. Different providers can describe the same race. Counts are not globally unique races or verified finishers. Missing dates, organiser, contacts and lifecycle remain unknown.';
