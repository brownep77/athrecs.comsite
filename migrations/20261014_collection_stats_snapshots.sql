-- Staff-only aggregate counts, never an athlete export or a public API.
create table if not exists collection_stats_snapshots (
  key text primary key,
  generated_at timestamptz not null,
  payload jsonb not null
);
