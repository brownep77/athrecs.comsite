-- Source performances retain their original precision and annotations. They are
-- private staff archives and do not participate in canonical PB/achievement totals.
create table if not exists athlete_source_histories (
  athlete_id integer not null references athletes(id),
  provider text not null,
  external_id text not null,
  source_url text not null check (source_url like 'https://%'),
  captured_at timestamptz not null,
  complete boolean not null default false,
  years_expected integer[] not null,
  years_captured integer[] not null,
  performances jsonb not null check (jsonb_typeof(performances) = 'array'),
  primary key (athlete_id, provider, external_id),
  unique (provider, external_id)
);

