-- Source archives remain private until staff explicitly publishes the profile.
alter table athlete_source_histories add column if not exists published_at timestamptz;
