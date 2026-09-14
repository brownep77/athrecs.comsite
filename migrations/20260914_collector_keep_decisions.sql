-- Retention is independent of reconciliation and publication approval.
-- Existing findings, source evidence, aliases and dismissal history are preserved.
alter table race_collector_candidates
  add column if not exists kept_at timestamptz,
  add column if not exists kept_by text;
