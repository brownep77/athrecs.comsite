-- Original certificates are private evidence, never public profile assets.
-- Signed result IDs cover both canonical and imported source-history results.
create table if not exists athlete_result_certificates (
  id uuid primary key,
  user_id text not null references "user" (id) on delete cascade,
  athlete_id integer not null references athletes (id) on delete cascade,
  result_id integer not null check (result_id <> 0),
  filename text not null check (length(filename) between 1 and 180),
  content_type text not null check (content_type in ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')),
  byte_size integer not null check (byte_size between 1 and 2097152),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  storage_backend text not null check (storage_backend in ('blob', 'database')),
  blob_pathname text,
  file_bytes bytea,
  uploaded_at timestamptz not null default now(),
  unique (user_id, result_id, sha256),
  check ((storage_backend = 'blob' and blob_pathname is not null and file_bytes is null)
    or (storage_backend = 'database' and blob_pathname is null and file_bytes is not null))
);
create index if not exists athlete_result_certificates_result_idx
  on athlete_result_certificates (result_id, athlete_id);
comment on table athlete_result_certificates is
  'Private original race certificates. Owner-only writes; reads require ownership or authorised staff access. Uploading does not verify a result. API serialises account uploads and limits to 100 files per account and 5 per result.';
