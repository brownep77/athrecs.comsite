-- Match the existing publication checks without caching private profile data.
create index if not exists audit_athlete_bulk_publication_lookup
  on network_audit_log (entity_id)
  where action='athlete.bulk_publish' and after_value->>'profile_visibility'='public';
create index if not exists audit_athlete_history_publication_lookup
  on network_audit_log (entity_id, (after_value->>'athleteId'))
  where action='athlete.history_admin_published';
create index if not exists published_source_history_athlete_lookup
  on athlete_source_histories (athlete_id, provider, external_id)
  where published_at is not null;
create index if not exists active_athlete_owner_lookup
  on athlete_account_links (athlete_id, user_id) where status='active';
create index if not exists public_athlete_name_lookup
  on athletes (lower(display_name), id) where profile_visibility='public';
