-- Staff name-variant review: keep recorded racing-name lookup indexed.
-- This only indexes stored aliases; it never creates aliases or merges athletes.
create index if not exists athlete_identity_alias_names
  on athletes using gin (to_tsvector('simple',regexp_replace(
    normalize(left(coalesce(profile_details->'aliases','[]'::jsonb)::text,2000),NFKC),
    '[^[:alnum:]]+',' ','g')));
