-- Guide pages have stable public identities but need not have a matching event row.
-- Separate migration so previews that applied the initial table also upgrade safely.
alter table race_edit_suggestions alter column event_id drop not null;
alter table race_edit_suggestions add column if not exists page_type text not null default 'catalogue'
  check (page_type in ('catalogue', 'road', 'ultra'));
alter table race_edit_suggestions add column if not exists race_path text not null default '';
update race_edit_suggestions set race_path='/races/' || race_slug where race_path='';
