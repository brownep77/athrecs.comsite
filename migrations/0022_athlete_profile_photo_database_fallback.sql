-- Private Athlete Profile photo storage fallback.
--
-- A private Vercel Blob store remains the preferred backend. Until one is
-- connected, an already-cropped 512 × 512 WebP can be stored in persistent
-- Postgres so the signed-in upload journey is usable immediately. The API keeps
-- the bytes private and can later migrate these rows to Blob without changing
-- the athlete-facing URL.

alter table athlete_profile_photos
  add column if not exists photo_bytes bytea;

alter table athlete_profile_photos
  add column if not exists storage_backend text;

update athlete_profile_photos
set storage_backend = 'blob'
where storage_backend is null and blob_pathname is not null;

alter table athlete_profile_photos
  alter column storage_backend set default 'database';

alter table athlete_profile_photos
  alter column storage_backend set not null;

alter table athlete_profile_photos
  alter column blob_pathname drop not null;

alter table athlete_profile_photos
  add constraint athlete_profile_photos_storage_backend_check
  check (storage_backend in ('blob', 'database'));

alter table athlete_profile_photos
  add constraint athlete_profile_photos_storage_payload_check
  check (
    (storage_backend = 'blob' and blob_pathname is not null and photo_bytes is null)
    or
    (storage_backend = 'database' and blob_pathname is null and photo_bytes is not null)
  );

comment on column athlete_profile_photos.photo_bytes is
  'Private optimized profile-photo bytes used only while no private Blob store is connected.';
comment on column athlete_profile_photos.storage_backend is
  'Current private storage backend. Database rows can be migrated to Blob non-destructively.';
