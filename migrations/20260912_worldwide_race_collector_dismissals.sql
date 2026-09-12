-- Dismissal only changes the staff queue. Keep duplicate identities for future scans and exports.
alter table race_collector_candidates
  add column if not exists dismissed_at timestamptz,
  add column if not exists dismissed_by text;
