-- Private Athlete Profile photographs.
--
-- Binary image data is deliberately kept out of Postgres. This table stores
-- only the private Vercel Blob pathname and metadata required to retrieve the
-- image through an authenticated ATHRECS route.

create table if not exists athlete_profile_photos (
  user_id text primary key references "user" ("id") on delete cascade,
  blob_pathname text not null check (length(trim(blob_pathname)) between 5 and 1024),
  content_type text not null check (content_type in ('image/webp', 'image/jpeg', 'image/png')),
  byte_size integer not null check (byte_size between 1 and 2097152),
  width integer not null default 512 check (width between 64 and 2048),
  height integer not null default 512 check (height between 64 and 2048),
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table athlete_profile_photos is
  'Private Athlete Account photo metadata. The blob is served only after authenticated ownership checks.';
comment on column athlete_profile_photos.blob_pathname is
  'Private Vercel Blob pathname; never expose the underlying storage token or private blob URL.';
