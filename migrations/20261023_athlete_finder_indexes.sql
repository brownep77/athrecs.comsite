-- Search only stored names. No participant copies, network acquisition or
-- publication changes. Source-capture HTML and original cells are not indexed.
create index if not exists athlete_finder_athlete_names on athletes
  using gin (to_tsvector('simple', regexp_replace(normalize(left(coalesce(display_name, ''), 2000), NFKC), '[^[:alnum:]]+', ' ', 'g')));

create index if not exists athlete_finder_archive_names on result_archive_entries
  using gin (to_tsvector('simple', regexp_replace(normalize(left(coalesce(payload->>'name', ''), 2000), NFKC), '[^[:alnum:]]+', ' ', 'g')));

-- One combined tsvector can exceed PostgreSQL's 1 MB vector limit on a large
-- marathon. Index distinct 1–3 character name-word prefixes instead, then
-- compare the complete name query against each candidate row in the search.
-- Only names are read. The 2,000-character guard prevents malformed name fields
-- from turning a whole original document into an index entry.
create or replace function athlete_finder_capture_name_keys(document jsonb)
returns text[] language sql immutable parallel safe as $$
  select coalesce(array_agg(distinct left(word, prefix_length)), '{}'::text[])
  from jsonb_array_elements(
    case when jsonb_typeof(document->'rows')='array' then document->'rows' else '[]'::jsonb end
  ) item
  cross join lateral unnest(tsvector_to_array(to_tsvector('simple',
    regexp_replace(normalize(left(coalesce(item->>'name', ''), 2000), NFKC), '[^[:alnum:]]+', ' ', 'g')
  ))) word
  cross join lateral generate_series(1,least(length(word),3)) prefix_length
$$;

create index if not exists athlete_finder_capture_names on result_archive_source_captures
  using gin (athlete_finder_capture_name_keys(payload))
  where payload->>'publication' = 'staff_only';

create index if not exists athlete_finder_capture_latest on result_archive_source_captures
  (provider, source_key, captured_at desc, id desc);
