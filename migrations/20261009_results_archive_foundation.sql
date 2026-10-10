-- Source observations are independent of athlete identity and publication.
-- Existing canonical results remain the source read by profiles and claims.
create table result_archive_datasets (
  id uuid primary key,
  edition_id integer not null references editions(id) on delete restrict,
  provider text not null check (length(provider) between 1 and 160),
  source_race_key text not null check (length(source_race_key) between 1 and 300),
  source_url text not null check (source_url ~ '^https://'),
  permission_note text not null check (length(permission_note) between 12 and 2000),
  expected_rows integer check (expected_rows >= 0),
  created_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index result_archive_dataset_identity
  on result_archive_datasets(edition_id, lower(provider), source_race_key);

create table result_archive_athlete_identifiers (
  provider text not null,
  external_id text not null,
  athlete_id integer not null references athletes(id) on delete cascade,
  reviewed_by text references "user"(id) on delete set null,
  note text not null,
  primary key(provider,external_id)
);
create index result_archive_identity_athlete on result_archive_athlete_identifiers(athlete_id);

create table result_archive_batches (
  id uuid primary key,
  dataset_id uuid not null references result_archive_datasets(id) on delete restrict,
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  actor_id text references "user"(id) on delete set null,
  receipt jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index result_archive_batches_dataset on result_archive_batches(dataset_id, created_at desc);

create table result_archive_entries (
  id bigserial primary key,
  dataset_id uuid not null references result_archive_datasets(id) on delete restrict,
  source_key text not null check (length(source_key) between 1 and 300),
  revision integer not null default 1 check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  canonical_result_id integer references results(id) on delete restrict,
  applied_revision integer check (applied_revision > 0 and applied_revision <= revision),
  applied_history_id bigint not null default 0,
  review_state text not null default 'unmatched' check (review_state in ('unmatched','linked','held')),
  review_note text,
  reviewed_by text references "user"(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(dataset_id, source_key),
  check ((canonical_result_id is null and applied_revision is null) or
    (canonical_result_id is not null and applied_revision is not null))
);
create index result_archive_entries_queue on result_archive_entries(dataset_id, review_state, id);
create index result_archive_entries_result on result_archive_entries(canonical_result_id) where canonical_result_id is not null;
create index result_archive_entries_changed on result_archive_entries(id) where revision > applied_revision;
create index result_archive_entries_name on result_archive_entries(lower(payload->>'name'));
create index result_archive_entries_search on result_archive_entries using gin
  (to_tsvector('simple', coalesce(payload->>'name','') || ' ' || coalesce(payload->>'bib','') || ' ' || coalesce(payload->>'club','')));

create table result_archive_revisions (
  entry_id bigint not null references result_archive_entries(id) on delete restrict,
  revision integer not null,
  batch_id uuid not null references result_archive_batches(id) on delete restrict,
  payload jsonb not null,
  payload_hash text not null,
  created_at timestamptz not null default now(),
  primary key(entry_id, revision)
);

-- Decisions record before/after values, including link and hold changes.
create table result_archive_decisions (
  id bigserial primary key,
  entry_id bigint not null references result_archive_entries(id) on delete restrict,
  revision integer not null,
  action text not null check (action in ('link','correct','hold','reopen')),
  actor_id text references "user"(id) on delete set null,
  note text not null,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);
create index result_archive_decisions_entry on result_archive_decisions(entry_id,id desc);

create table result_archive_match_requests (
  entry_id bigint not null references result_archive_entries(id) on delete restrict,
  user_id text not null references "user"(id) on delete cascade,
  revision integer not null,
  note text not null check (length(note) between 12 and 2000),
  created_at timestamptz not null default now(),
  primary key(entry_id,user_id)
);
create index result_archive_requests_user on result_archive_match_requests(user_id,created_at desc);

-- Audit updates from ALL existing result writers, not only the archive service.
-- No seed/import is run by this migration and no existing visibility is changed.
create table result_change_history (
  id bigserial primary key,
  result_id integer not null,
  operation text not null check (operation in ('UPDATE','DELETE')),
  before_value jsonb not null,
  after_value jsonb,
  actor_id text,
  note text,
  created_at timestamptz not null default now()
);
create index result_change_history_result on result_change_history(result_id,id desc);
create function record_result_change() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and to_jsonb(old) = to_jsonb(new) then return new; end if;
  insert into result_change_history(result_id, operation, before_value, after_value, actor_id, note)
  values(old.id, tg_op, to_jsonb(old), case when tg_op='UPDATE' then to_jsonb(new) else null end,
    nullif(current_setting('athrecs.archive_actor',true),''),
    nullif(current_setting('athrecs.archive_note',true),''));
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
create trigger record_result_change after update or delete on results
  for each row execute function record_result_change();

comment on table result_archive_entries is 'Private source observations. Identity, source verification and publication are separate decisions. Missing rows in later uploads are never deleted.';
comment on table result_archive_revisions is 'Original normalized values and source cells for each observed revision. New revisions do not overwrite canonical results.';

-- Staff/member server functions perform the application authorization checks.
-- Direct database/Data API roles must not expose private source identities or
-- historical before/after values. The server's database owner retains access.
alter table result_archive_datasets enable row level security;
alter table result_archive_athlete_identifiers enable row level security;
alter table result_archive_batches enable row level security;
alter table result_archive_entries enable row level security;
alter table result_archive_revisions enable row level security;
alter table result_archive_decisions enable row level security;
alter table result_archive_match_requests enable row level security;
alter table result_change_history enable row level security;
revoke all on result_archive_datasets,result_archive_athlete_identifiers,
  result_archive_batches,result_archive_entries,result_archive_revisions,
  result_archive_decisions,result_archive_match_requests,result_change_history from public;
