-- Keep publication decisions live while avoiding reads of large audit payloads.
-- The generated value changes atomically with its original evidence; it is not
-- an approval flag and cannot independently grant publication.
set local lock_timeout = '5s';
alter table network_audit_log add column if not exists publication_athlete_key text
  generated always as (
    case when action = 'athlete.history_admin_published'
      then after_value->>'athleteId' end
  ) stored;
create index if not exists audit_history_publication_covering
  on network_audit_log (entity_id, publication_athlete_key)
  where action = 'athlete.history_admin_published';

-- Public identity fields only: never include birth dates, account data or evidence.
create index if not exists public_athlete_discovery_covering
  on athletes (id)
  include (slug, display_name, profile_roles, country, city, club_id)
  where profile_visibility = 'public';
