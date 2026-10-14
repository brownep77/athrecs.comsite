-- Private collection configuration and operational evidence. No athlete seeds.
create table if not exists club_collection_plans (
 club_id integer primary key references clubs(id), config jsonb not null,
 enabled boolean not null default false, revision integer not null default 1,
 next_check_at timestamptz not null default now(), last_started_at timestamptz,
 last_finished_at timestamptz, last_run_id uuid references club_scan_runs(id),
 last_error text, research_checked_at timestamptz, research_checkpoint jsonb not null default '{}',
 updated_by text not null, updated_at timestamptz not null default now()
);
alter table club_scan_runs add column if not exists collection_club_id integer references club_collection_plans(club_id);
create index if not exists club_scan_collection_runs on club_scan_runs(collection_club_id,created_at desc);
create table if not exists club_collection_reviews (
 id uuid primary key, club_id integer not null references clubs(id), actor text not null,
 action text not null, before_value jsonb, after_value jsonb, created_at timestamptz not null default now()
);
create table if not exists club_collection_source_cache (
 url text primary key, compressed_body text not null, fetched_at timestamptz not null default now(),
 expires_at timestamptz not null, bytes integer not null, hits integer not null default 0
);
create index if not exists club_collection_cache_expiry on club_collection_source_cache(expires_at);
-- Match the scanner's exact/initial-and-surname comparison without transferring
-- the entire athlete directory for every result sheet.
create index if not exists club_scan_name_identity on athletes
 ((regexp_replace(normalize(lower(display_name), NFKD),'[^a-z0-9]','','g')));
create index if not exists club_scan_name_block on athletes
 ((left(regexp_replace(normalize(lower(display_name), NFKD),'[^a-z0-9]','','g'),1) || ':' ||
 regexp_replace(normalize(lower(regexp_replace(btrim(display_name),'^.*[[:space:]]','')), NFKD),'[^a-z0-9]','','g')));
