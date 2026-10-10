-- Private acquisition inbox before race/athlete identity matching.
-- No canonical events, athletes, results, claims or publication are written.
create table result_archive_capture_approvals (
  id text primary key,
  provider text not null,
  approved_by text not null,
  approval_basis text not null check (approval_basis in ('owner_private_import','provider_export')),
  scope text not null default 'staff_only' check (scope='staff_only'),
  evidence jsonb not null check (jsonb_typeof(evidence)='object'),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create table result_archive_capture_runs (
  id uuid primary key,
  approval_id text not null references result_archive_capture_approvals(id),
  provider text not null,
  inventory jsonb not null check (jsonb_typeof(inventory)='array'),
  summary jsonb not null default '{}'::jsonb,
  status text not null default 'processing' check (status in ('processing','completed','partial','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table result_archive_source_captures (
  id bigserial primary key,
  run_id uuid not null references result_archive_capture_runs(id),
  approval_id text not null references result_archive_capture_approvals(id),
  provider text not null,
  source_key text not null,
  source_url text not null check (source_url ~ '^https://'),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  html_sha256 text not null check (html_sha256 ~ '^[a-f0-9]{64}$'),
  source_html_gzip bytea not null,
  payload jsonb not null check (jsonb_typeof(payload)='object'),
  row_count integer not null check (row_count>=0),
  source_check text not null check (source_check in ('compared','held','empty')),
  audit jsonb not null check (jsonb_typeof(audit)='object'),
  captured_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  unique(provider,source_key,payload_hash),
  check (jsonb_array_length(payload->'rows')=row_count)
);
create index result_archive_captures_source on result_archive_source_captures(provider,source_key,last_seen_at desc);
create index result_archive_captures_run on result_archive_source_captures(run_id);
create index result_archive_captures_payload on result_archive_source_captures using gin (payload jsonb_path_ops);
-- Only the database owner can access these tables until an explicit staff policy
-- is added. In particular, anonymous/Data API roles receive no row policy.
alter table result_archive_capture_approvals enable row level security;
alter table result_archive_capture_runs enable row level security;
alter table result_archive_source_captures enable row level security;
revoke all on result_archive_capture_approvals,result_archive_capture_runs,result_archive_source_captures from public;
comment on table result_archive_source_captures is 'Private original source captures, including unresolved rows. Never used directly for public profiles, results, rankings or ownership. All source versions are retained.';
