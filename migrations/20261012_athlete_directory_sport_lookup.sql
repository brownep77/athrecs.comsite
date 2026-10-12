-- Candidate matching only: current publication and owner permissions are still
-- checked by the directory on every request. This index stores no visibility.
create index if not exists searchable_athlete_name_lookup
  on athletes (lower(display_name),id)
  where profile_visibility='public' or profile_type='Public figure';
create index if not exists searchable_athlete_letter_name_lookup
  on athletes (upper(left(display_name,1)),lower(display_name),id)
  where profile_visibility='public' or profile_type='Public figure';

create or replace function athlete_history_sports(provider text, performances jsonb)
returns text[] language sql immutable parallel safe as $function$
  select coalesce(array_agg(distinct case
    when p->>'discipline' ~* '(^|[^[:alnum:]_])triathlon([^[:alnum:]_]|$)' then 'Triathlon'
    when p->>'discipline' ~* '(^|[^[:alnum:]_])duathlon([^[:alnum:]_]|$)' then 'Duathlon'
    when provider='DUV Ultra Marathon Statistics'
      or trim(p->>'discipline') ~* '^(marathon|half( marathon)?|[0-9]+([.][0-9]+)?[[:space:]]*k(m)?|[0-9]+([.][0-9]+)?[[:space:]]*(mi|mile|miles))$'
      then 'Running'
    else 'Athletics' end),array[]::text[])
  from jsonb_array_elements(performances) p
  where coalesce(p->>'profileExcluded','false')<>'true'
$function$;

create index if not exists published_source_history_sports_lookup
  on athlete_source_histories using gin (athlete_history_sports(provider,performances))
  where published_at is not null;
analyze athlete_source_histories;
