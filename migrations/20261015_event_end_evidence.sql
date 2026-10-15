-- Optional, source-backed ending information. No inferred same-day backfill.
alter table editions add column if not exists end_date date;
alter table editions add column if not exists end_time text;
alter table editions add column if not exists end_source_url text;
alter table editions add column if not exists end_checked_at date;
