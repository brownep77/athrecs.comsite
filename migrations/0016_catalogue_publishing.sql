-- Transactional staging and publication for routine catalogue updates.

create table if not exists catalogue_import_batches (
  id text primary key,
  source_key text not null,
  source_url text,
  payload_hash text not null,
  payload jsonb not null,
  mode text not null default 'append_only'
    check (mode in ('append_only')),
  status text not null default 'staged'
    check (status in (
      'staged',
      'validating',
      'invalid',
      'ready',
      'publishing',
      'published',
      'rolled_back',
      'failed'
    )),
  submitted_by text not null,
  submitted_at timestamptz not null default now(),
  validated_at timestamptz,
  published_at timestamptz,
  validation_summary jsonb,
  publish_summary jsonb,
  error text
);

create unique index if not exists catalogue_import_batches_source_hash_idx
  on catalogue_import_batches (source_key, payload_hash)
  where status <> 'rolled_back';

create index if not exists catalogue_import_batches_status_idx
  on catalogue_import_batches (status, submitted_at desc);

create table if not exists catalogue_staged_rows (
  batch_id text not null references catalogue_import_batches (id) on delete cascade,
  row_type text not null check (row_type in ('event', 'edition')),
  row_number int not null,
  natural_key text not null,
  payload jsonb not null,
  validation_errors jsonb not null default '[]'::jsonb,
  primary key (batch_id, row_type, row_number)
);

create index if not exists catalogue_staged_rows_natural_key_idx
  on catalogue_staged_rows (batch_id, row_type, natural_key);

create table if not exists catalogue_revisions (
  id bigserial primary key,
  batch_id text not null unique references catalogue_import_batches (id),
  previous_revision_id bigint references catalogue_revisions (id),
  status text not null default 'published'
    check (status in ('published', 'rolled_back')),
  summary jsonb not null default '{}'::jsonb,
  published_by text not null,
  published_at timestamptz not null default now(),
  rolled_back_by text,
  rolled_back_at timestamptz
);

create table if not exists catalogue_change_log (
  id bigserial primary key,
  revision_id bigint not null references catalogue_revisions (id) on delete cascade,
  entity_type text not null check (entity_type in ('event', 'edition')),
  entity_key text not null,
  operation text not null check (operation in ('insert', 'update')),
  before_json jsonb,
  after_json jsonb not null,
  unique (revision_id, entity_type, entity_key)
);

create index if not exists catalogue_change_log_revision_idx
  on catalogue_change_log (revision_id, id);

create table if not exists catalogue_publish_state (
  id int primary key check (id = 1),
  current_revision_id bigint references catalogue_revisions (id),
  updated_at timestamptz not null default now()
);

insert into catalogue_publish_state (id)
values (1)
on conflict (id) do nothing;
