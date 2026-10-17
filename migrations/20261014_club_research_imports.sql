-- Private club research imports. This migration does not publish or overwrite clubs.
CREATE TABLE IF NOT EXISTS public.club_research_batches (
  id text PRIMARY KEY,
  source_page_id text NOT NULL,
  source_page_url text NOT NULL,
  expected_profiles integer NOT NULL CHECK (expected_profiles > 0),
  source_checked_on date NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  import_note text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.club_research_profiles (
  id text PRIMARY KEY,
  batch_id text NOT NULL REFERENCES public.club_research_batches(id),
  source_record_key text NOT NULL,
  source_local_club_id text,
  club_id integer REFERENCES public.clubs(id),
  club_name text NOT NULL,
  location_text text NOT NULL,
  sports text[] NOT NULL CHECK (cardinality(sports) > 0),
  official_website text,
  biography text NOT NULL CHECK (length(btrim(biography)) > 0),
  search_title text NOT NULL,
  meta_description text NOT NULL CHECK (length(meta_description) <= 160),
  conversational_answer text NOT NULL,
  notable_people jsonb NOT NULL CHECK (jsonb_typeof(notable_people) = 'array'),
  historical_moments jsonb NOT NULL CHECK (jsonb_typeof(historical_moments) = 'array'),
  sources jsonb NOT NULL CHECK (jsonb_typeof(sources) = 'array' AND jsonb_array_length(sources) > 0),
  competition_notes text NOT NULL,
  editorial_notes text NOT NULL,
  match_status text NOT NULL CHECK (match_status IN ('matched_existing', 'needs_review')),
  match_evidence text NOT NULL,
  publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status = 'draft'),
  original_payload jsonb NOT NULL CHECK (jsonb_typeof(original_payload) = 'object'),
  imported_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, source_record_key),
  CHECK ((match_status = 'matched_existing' AND club_id IS NOT NULL)
      OR (match_status = 'needs_review' AND club_id IS NULL))
);

CREATE INDEX IF NOT EXISTS club_research_profiles_club_idx ON public.club_research_profiles(club_id);
CREATE INDEX IF NOT EXISTS club_research_profiles_match_idx ON public.club_research_profiles(match_status);

-- Draft research is stored for staff use; public club routes do not select these tables.
ALTER TABLE public.club_research_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_research_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.club_research_batches, public.club_research_profiles FROM PUBLIC;

COMMENT ON TABLE public.club_research_profiles IS
  'Imported club research drafts with provenance. Import is separate from public club publication, athlete identity verification and result verification.';
COMMENT ON COLUMN public.club_research_profiles.source_local_club_id IS
  'Identifier from the research workbook/SQLite file; not an AthRecs clubs.id value.';
