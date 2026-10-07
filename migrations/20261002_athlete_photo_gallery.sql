-- Separate from the existing single profile picture; all photos remain private.
create table if not exists athlete_gallery_photos (
  id uuid primary key,
  user_id text not null references "user" ("id") on delete cascade,
  slot smallint not null check (slot between 1 and 30),
  blob_pathname text,
  photo_bytes bytea,
  storage_backend text not null check (storage_backend in ('blob', 'database')),
  content_type text not null check (content_type in ('image/webp', 'image/jpeg', 'image/png')),
  byte_size integer not null check (byte_size between 1 and 2097152),
  uploaded_at timestamptz not null default now(),
  unique (user_id, slot),
  check (
    (storage_backend = 'blob' and blob_pathname is not null and photo_bytes is null)
    or (storage_backend = 'database' and blob_pathname is null and photo_bytes is not null)
  )
);

comment on table athlete_gallery_photos is
  'Private athlete photo gallery. Every list, read and delete must check authenticated ownership. Slots enforce a maximum of 30 photos per account.';
