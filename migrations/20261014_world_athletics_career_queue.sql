-- Owner requested all available World Athletics career seasons and original biographies.
-- These are staff-only work records. Publication still uses the existing evidence/audit rules.
CREATE TABLE IF NOT EXISTS world_athletics_career_queue (
  external_id text PRIMARY KEY CHECK (external_id ~ '^[1-9][0-9]*$'),
  athlete_id integer REFERENCES athletes(id),
  source_url text NOT NULL CHECK (source_url LIKE 'https://%worldathletics.org/athletes/%'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN
    ('pending','collecting','source_partial','ready_for_review','published','identity_review','blocked')),
  priority integer NOT NULL DEFAULT 100,
  attempts integer NOT NULL DEFAULT 0,
  expected_years integer[] NOT NULL DEFAULT '{}',
  captured_years integer[] NOT NULL DEFAULT '{}',
  performance_count integer NOT NULL DEFAULT 0,
  source_complete boolean NOT NULL DEFAULT false,
  source_evidence jsonb,
  biography text,
  last_error text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  checked_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS world_athletics_career_queue_next
  ON world_athletics_career_queue (status,priority,external_id);
ALTER TABLE world_athletics_career_queue ADD COLUMN IF NOT EXISTS lease_owner text;
ALTER TABLE world_athletics_career_queue ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz;

CREATE TABLE IF NOT EXISTS world_athletics_discovery_progress (
  source_key text PRIMARY KEY,
  source_url text NOT NULL,
  scope jsonb NOT NULL,
  next_cursor jsonb NOT NULL DEFAULT '{}',
  profiles_discovered integer NOT NULL DEFAULT 0,
  source_reported_total integer,
  complete boolean NOT NULL DEFAULT false,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Reuse explicit source identities; never name-match or create people in a migration.
WITH source_ids AS (
  SELECT ltrim(i.external_id,'0') AS external_id,
    min(i.athlete_id) AS athlete_id, min(i.source_url) AS source_url,
    count(DISTINCT i.athlete_id) AS matches
  FROM athlete_source_identities i
  WHERE i.provider='worldathletics' AND i.external_id ~ '^[0-9]+$'
    AND ltrim(i.external_id,'0') <> ''
    AND i.source_url LIKE 'https://%worldathletics.org/athletes/%'
  GROUP BY ltrim(i.external_id,'0')
)
INSERT INTO world_athletics_career_queue(external_id,athlete_id,source_url,status,priority,last_error)
SELECT i.external_id,CASE WHEN i.matches=1 THEN i.athlete_id END,i.source_url,
  CASE WHEN i.matches=1 THEN 'pending' ELSE 'identity_review' END,
  CASE WHEN NOT EXISTS(SELECT 1 FROM results r WHERE r.athlete_id=i.athlete_id)
    AND NOT EXISTS(SELECT 1 FROM athlete_source_histories h WHERE h.athlete_id=i.athlete_id)
    THEN 0 ELSE 100 END,
  CASE WHEN i.matches<>1 THEN 'One source identity links to multiple local athletes.' END
FROM source_ids i ON CONFLICT(external_id) DO NOTHING;

INSERT INTO world_athletics_discovery_progress(source_key,source_url,scope)
VALUES('all-athletes','https://worldathletics.org/athletes-home',
  '{"request":"All publicly listed World Athletics athletes, all disciplines, countries and available career seasons","requestedOn":"2026-10-14","completion":"Only after source directory pagination and all listed seasons have been checked; no claim to unlisted competitions"}'::jsonb)
ON CONFLICT(source_key) DO NOTHING;
